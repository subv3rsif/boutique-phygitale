# Migration Stripe → PayFiP - Spécification Technique

> **Date :** 31 mars 2026
> **Auteur :** Claude Sonnet 4.5
> **Statut :** ✅ Validé
> **Version :** 1.0

---

## Sommaire Exécutif

**Objectif :** Migrer le système de paiement de la boutique municipale 1885 de Stripe vers PayFiP (service obligatoire de paiement en ligne pour les collectivités territoriales françaises).

**Approche retenue :** Architecture adaptée au modèle PayFiP avec migration Big Bang (remplacement complet de Stripe).

**Stratégie de développement :** Service Mock PayFiP permettant de développer l'expérience utilisateur complète avant réception des credentials DGFiP.

**Timeline estimée :** 3-5 semaines (dont 2-4 semaines d'attente administrative pour credentials).

---

## Table des Matières

1. [Contexte et Décisions](#1-contexte-et-décisions)
2. [Architecture Générale](#2-architecture-générale)
3. [Composants et Responsabilités](#3-composants-et-responsabilités)
4. [Schéma de Base de Données](#4-schéma-de-base-de-données)
5. [Flow de Paiement Détaillé](#5-flow-de-paiement-détaillé)
6. [Gestion des Erreurs PayFiP](#6-gestion-des-erreurs-payfip)
7. [Service Mock PayFiP](#7-service-mock-payfip)
8. [Migration et Déploiement](#8-migration-et-déploiement)
9. [Annexes](#9-annexes)

---

## 1. Contexte et Décisions

### 1.1 Pourquoi PayFiP ?

**Obligation légale :** Article L. 1611-5-1 du Code général des collectivités territoriales impose aux collectivités d'accepter les paiements en ligne via le service PayFiP de la DGFiP depuis janvier 2022.

**Contexte projet :** Boutique municipale en phase de préparation, sans credentials PayFiP actuellement. L'objectif est de préparer l'infrastructure et l'expérience utilisateur pour être opérationnel dès réception des credentials.

### 1.2 Décisions Stratégiques

| Décision | Choix | Justification |
|----------|-------|---------------|
| **Numérotation factures** | Séquentiel simple avec reset annuel (`2026-001`, `2026-002`) | Simple, clair, conforme PayFiP |
| **Stratégie migration** | Big Bang - Remplacement complet Stripe | PayFiP obligatoire, pas de coexistence nécessaire |
| **Développement sans credentials** | Mock PayFiP complet | Permet de développer UX immédiatement |
| **Code produit PayFiP** | Configurable par produit, défaut "11" (PRODUITS DIVERS) | Flexibilité comptable, validation financière ultérieure |
| **URLs** | Vercel preview environments | Setup professionnel dès le développement |

### 1.3 Différences Clés Stripe vs PayFiP

| Aspect | Stripe | PayFiP |
|--------|--------|---------|
| **Architecture** | REST API JSON | SOAP Web Service XML |
| **Identifiant paiement** | Session ID généré par Stripe | REFDET pré-généré + idop temporaire |
| **Notification** | Webhook asynchrone | Callback synchrone POST |
| **Durée de vie** | Session 24h | idop 15 minutes |
| **Résultats** | `payment_intent.succeeded` | P/V/A/R/Z (codes DGFiP) |
| **Environnement test** | Clés test/production | Paramètre SAISIE (T/X/W) |

---

## 2. Architecture Générale

### 2.1 Vue d'Ensemble

L'architecture PayFiP suit un modèle en 3 phases distinctes :

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1 : PRÉPARATION DU PAIEMENT (Checkout API)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Utilisateur → POST /api/checkout                               │
│      ↓                                                          │
│  1. Validation panier + calcul totaux (serveur)                 │
│  2. Génération REFDET séquentiel (ex: "2026-042")               │
│  3. Création Order (status: 'pending', avec REFDET)             │
│  4. Appel SOAP CreerPaiementSecurise                            │
│      → Envoi : NUMCLI, EXER, REFDET, MONTANT, MEL, URLNOTIF... │
│      → Réception : idop (UUID valide 15 minutes)                │
│  5. Stockage idop en DB (lien avec order)                       │
│  6. Redirect : https://tipi.budget.gouv.fr?idop={idop}          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2 : PAIEMENT UTILISATEUR (Page PayFiP - hors contrôle)   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Page PayFiP affiche récapitulatif                              │
│      ↓                                                          │
│  Utilisateur saisit email                                       │
│      ↓                                                          │
│  Utilisateur choisit : CB (3D Secure) ou Prélèvement SEPA      │
│      ↓                                                          │
│  PayFiP traite le paiement                                      │
│      ↓                                                          │
│  Résultat : P (CB payé), V (prélèvement), A (abandon), R/Z (refus)│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PHASE 3 : NOTIFICATION ET CONFIRMATION (Callback)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PayFiP → POST /api/payfip/notification (SOAP XML)              │
│      ↓                                                          │
│  1. Parse XML (idop + RESULTRANS + métadonnées)                 │
│  2. Validation idop (existe, pas expiré, pas consommé)          │
│  3. Récupération Order via idop                                 │
│  4. Update Order selon RESULTRANS :                             │
│      • P/V → status='paid' + email + QR si pickup               │
│      • A   → status='canceled' (abandon)                        │
│      • R/Z → status='canceled' (refus)                          │
│  5. Marquer idop consommé (single-use)                          │
│  6. Return 200 OK à PayFiP                                      │
│                                                                 │
│  Parallèlement :                                                │
│  PayFiP → Redirect utilisateur vers URLREDIRECT                 │
│      → /commande/resultat?idop={idop}                           │
│      → Affichage résultat + instructions                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Principes Architecturaux

**1. REFDET comme identifiant primaire**
- Numéro de facture pré-généré (obligation PayFiP)
- Séquentiel par année : `2026-001`, `2026-002`...
- Stocké dans `orders.refdet` (unique)

**2. idop comme identifiant temporaire**
- UUID généré par PayFiP (15 min de validité)
- Single-use (consommé après notification)
- Traçabilité dans table `payfip_operations`

**3. Notification synchrone**
- PayFiP envoie notification POST immédiatement après paiement
- Pas de webhook asynchrone comme Stripe
- Callback doit répondre 200 OK rapidement

**4. Gestion expiration stricte**
- idop expire après 15 minutes (vs 24h pour Stripe session)
- Cron cleanup des idop expirés
- Annulation automatique des orders pendants

**5. Activation sélective des modes de paiement**
- PayFiP propose nativement 2 modes : Carte Bancaire + Prélèvement SEPA
- **Problème UX :** Le prélèvement nécessite authentification FranceConnect/impots.gouv.fr (friction utilisateur)
- **Solution :** Activer uniquement le mode CB lors de la phase d'activation
- Résultat : Seul le bouton "Payer par carte bancaire" apparaît sur la page PayFiP
- **Recommandation :** Pour une boutique municipale grand public, désactiver le prélèvement (voir section 8.5)

---

## 3. Composants et Responsabilités

### 3.1 Structure des Fichiers

```
src/lib/payfip/
├── client.ts              # Factory : Mock vs Real service
├── mock-service.ts        # Mock PayFiP pour développement
├── soap-client.ts         # Client SOAP production
├── soap-parser.ts         # Parse XML SOAP requests/responses
├── refdet.ts              # Générateur numéros facture séquentiels
├── idop-manager.ts        # Gestion lifecycle idop (15 min)
└── types.ts               # Types TypeScript PayFiP

src/app/api/payfip/
├── notification/route.ts  # Callback PayFiP (URLNOTIF)
└── mock/
    ├── details/route.ts   # Détails idop pour page mock
    └── ...                # Autres endpoints mock (dev only)

src/app/payfip-mock/
└── [idop]/page.tsx        # Page paiement simulée (dev only)

src/app/commande/
└── resultat/page.tsx      # Page retour après paiement (URLREDIRECT)
```

### 3.2 Nouveaux Composants

#### Client PayFiP (`src/lib/payfip/client.ts`)

**Rôle :** Factory qui retourne Mock ou Real service selon config.

```typescript
export interface PayFipService {
  creerPaiementSecurise(params: PayFipParams): Promise<{ idop: string }>;
  recupererDetailPaiementSecurise(idop: string): Promise<PaymentDetails | null>;
}

function createPayFipService(): PayFipService {
  return process.env.PAYFIP_USE_MOCK === 'true'
    ? new MockPayFipService()
    : new RealPayFipService();
}

export const payfipService = createPayFipService();
```

#### Générateur REFDET (`src/lib/payfip/refdet.ts`)

**Rôle :** Génération séquentielle thread-safe des numéros de facture.

```typescript
export async function generateREFDET(): Promise<string> {
  const year = new Date().getFullYear();

  // Atomic increment via SQL
  const result = await db.execute(`
    INSERT INTO invoice_sequences (year, current_number)
    VALUES (${year}, 1)
    ON CONFLICT (year)
    DO UPDATE SET current_number = invoice_sequences.current_number + 1
    RETURNING current_number
  `);

  const number = result.current_number;
  return `${year}-${number.toString().padStart(3, '0')}`;
  // Exemple: "2026-042"
}
```

#### Gestionnaire idop (`src/lib/payfip/idop-manager.ts`)

**Rôle :** Validation et gestion du lifecycle idop (15 min, single-use).

```typescript
export async function validateIdop(idop: string): Promise<ValidationResult> {
  const operation = await getPayfipOperationByIdop(idop);

  if (!operation) {
    return { valid: false, error: 'P1', message: 'idOp incorrect' };
  }

  if (new Date() > operation.expiresAt) {
    return { valid: false, error: 'P4', message: 'idOp expiré' };
  }

  if (operation.consumedAt) {
    return { valid: false, error: 'P3', message: 'idOp déjà utilisé' };
  }

  return { valid: true, operation };
}

export async function consumeIdop(idop: string, notification: PayFipNotification) {
  await db.update(payfipOperations).set({
    consumedAt: new Date(),
    resultTrans: notification.resultrans,
    numAuto: notification.numauto,
    // ... autres champs
  }).where(eq(payfipOperations.idop, idop));
}
```

### 3.3 Routes API Modifiées

#### `/api/checkout/route.ts` - ⚠️ MODIFIER

**Changements principaux :**

```typescript
// AVANT (Stripe)
const session = await stripe.checkout.sessions.create({...});
return { url: session.url };

// APRÈS (PayFiP)
const refdet = await generateREFDET();
const orderId = await createOrder({ refdet, ... });
const { idop } = await payfipService.creerPaiementSecurise({
  REFDET: refdet,
  MONTANT: grandTotalCents.toString(),
  // ... autres params
});
await storeIdop(idop, orderId);
const redirectUrl = useMock
  ? `${appUrl}/payfip-mock/${idop}`
  : `https://www.tipi.budget.gouv.fr/tpa/paiementws.web?idop=${idop}`;
return { redirectUrl, refdet };
```

#### `/api/payfip/notification/route.ts` - ✅ CRÉER

**Remplace :** `/api/stripe/webhook/route.ts`

**Responsabilités :**
1. Parser SOAP XML notification
2. Valider idop (P1, P3, P4)
3. Traiter RESULTRANS (P/V/A/R/Z)
4. Update order
5. Queue email si succès
6. Générer QR si pickup
7. Return 200 OK

### 3.4 Composants à Supprimer

**Lors de la migration Big Bang :**

```
❌ src/lib/stripe/client.ts
❌ src/lib/stripe/webhook.ts
❌ src/app/api/stripe/webhook/route.ts
❌ npm packages: stripe, @stripe/stripe-js
❌ Table DB: stripe_events
❌ Env vars: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
```

---

## 4. Schéma de Base de Données

### 4.1 Nouvelle Table : invoice_sequences

**Rôle :** Compteur séquentiel pour numérotation REFDET.

```sql
CREATE TABLE invoice_sequences (
  year INTEGER PRIMARY KEY,              -- 2026, 2027...
  current_number INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),

  CHECK (current_number >= 0)
);

CREATE INDEX idx_year ON invoice_sequences(year);
```

**Usage :**
- INSERT ... ON CONFLICT pour atomic increment
- Reset automatique au 1er janvier (nouveau year)

### 4.2 Nouvelle Table : payfip_operations

**Rôle :** Traçabilité complète des opérations PayFiP (remplace `stripe_events`).

```sql
CREATE TABLE payfip_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idop VARCHAR(255) UNIQUE NOT NULL,           -- UUID PayFiP
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  refdet VARCHAR(30) NOT NULL,

  -- Lifecycle
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,               -- +15 min
  consumed_at TIMESTAMP,

  -- Résultat paiement
  result_trans VARCHAR(1),                     -- P/V/A/R/Z
  num_auto VARCHAR(16),                        -- Numéro autorisation
  date_trans VARCHAR(8),                       -- JJMMAAAA
  heure_trans VARCHAR(4),                      -- HHMM

  -- Audit
  notification_received_at TIMESTAMP,
  raw_notification TEXT,                       -- XML SOAP brut

  -- Indexes
  INDEX idx_idop (idop),
  INDEX idx_order (order_id),
  INDEX idx_refdet (refdet),
  INDEX idx_expires (expires_at)
);
```

**Utilité :**
- Idempotence (comme `stripe_events`)
- Audit complet (XML brut conservé)
- Cleanup automatique (cron sur `expires_at`)

### 4.3 Modifications Table orders

```sql
-- Supprimer colonnes Stripe
ALTER TABLE orders
  DROP COLUMN stripe_session_id,
  DROP COLUMN stripe_payment_intent_id;

-- Ajouter colonnes PayFiP
ALTER TABLE orders
  ADD COLUMN refdet VARCHAR(30) UNIQUE NOT NULL,
  ADD COLUMN idop VARCHAR(255),
  ADD COLUMN payfip_result_trans VARCHAR(1),   -- P/V/A/R/Z
  ADD COLUMN payfip_num_auto VARCHAR(16),
  ADD COLUMN payfip_date_trans VARCHAR(8),
  ADD COLUMN payfip_heure_trans VARCHAR(4);

-- Nouveaux indexes
CREATE INDEX idx_refdet ON orders(refdet);
CREATE INDEX idx_idop ON orders(idop);
```

### 4.4 Suppression Table Stripe

```sql
DROP TABLE IF EXISTS stripe_events;
```

### 4.5 Types Drizzle ORM

```typescript
export const invoiceSequences = pgTable('invoice_sequences', {
  year: integer('year').primaryKey(),
  currentNumber: integer('current_number').notNull().default(0),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

export const payfipOperations = pgTable('payfip_operations', {
  id: uuid('id').primaryKey().defaultRandom(),
  idop: varchar('idop', { length: 255 }).notNull().unique(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  refdet: varchar('refdet', { length: 30 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  consumedAt: timestamp('consumed_at'),
  resultTrans: varchar('result_trans', { length: 1 }).$type<'P'|'V'|'A'|'R'|'Z'>(),
  numAuto: varchar('num_auto', { length: 16 }),
  dateTrans: varchar('date_trans', { length: 8 }),
  heureTrans: varchar('heure_trans', { length: 4 }),
  notificationReceivedAt: timestamp('notification_received_at'),
  rawNotification: text('raw_notification'),
});

export const orders = pgTable('orders', {
  // ... champs existants
  refdet: varchar('refdet', { length: 30 }).notNull().unique(),
  idop: varchar('idop', { length: 255 }),
  payfipResultTrans: varchar('payfip_result_trans', { length: 1 }),
  payfipNumAuto: varchar('payfip_num_auto', { length: 16 }),
  payfipDateTrans: varchar('payfip_date_trans', { length: 8 }),
  payfipHeureTrans: varchar('payfip_heure_trans', { length: 4 }),
});
```

---

## 5. Flow de Paiement Détaillé

### 5.1 Chronologie Complète

```
T+0s     : User clique "Commander"
T+0.5s   : API génère REFDET, crée order, appelle PayFiP, reçoit idop
T+1s     : User redirigé vers page PayFiP (ou mock en dev)
T+30s    : User saisit CB et valide
T+32s    : PayFiP traite paiement (3D Secure)
T+34s    : PayFiP POST notification → /api/payfip/notification (200ms)
T+34.2s  : PayFiP redirect user → /commande/resultat?idop={idop}
T+34.3s  : User voit "Paiement confirmé !"
T+35s    : Email envoyé (queue + retry)
```

### 5.2 Étape 1 : Utilisateur Clique "Commander"

**Frontend (`checkout-button.tsx`):**

```typescript
async function handleCheckout() {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({
      items: cartItems,
      fulfillmentMode,
      gdprConsent: true,
    })
  });

  const { redirectUrl } = await response.json();
  window.location.href = redirectUrl;
}
```

### 5.3 Étape 2 : API Checkout (Serveur)

**Backend (`/api/checkout/route.ts`):**

```typescript
1. Validation & rate limiting
2. Calcul totaux serveur (SOURCE OF TRUTH)
3. Génération REFDET
   const refdet = await generateREFDET(); // "2026-042"

4. Création Order
   const orderId = await createOrder({
     status: 'pending',
     refdet,
     itemsTotalCents,
     shippingTotalCents,
     grandTotalCents,
   });

5. Appel SOAP PayFiP
   const { idop } = await payfipService.creerPaiementSecurise({
     NUMCLI: process.env.PAYFIP_NUMCLI,
     EXER: process.env.PAYFIP_EXER,
     REFDET: refdet,
     MONTANT: grandTotalCents.toString(),
     MEL: "temp@temp.fr",
     URLNOTIF: `${appUrl}/api/payfip/notification`,
     URLREDIRECT: `${appUrl}/commande/resultat`,
     SAISIE: process.env.PAYFIP_MODE, // T/X/W
   });

6. Stockage idop
   await db.insert(payfipOperations).values({
     idop,
     orderId,
     refdet,
     expiresAt: new Date(Date.now() + 15 * 60 * 1000),
   });

7. Return URL
   return { redirectUrl: `https://tipi.budget.gouv.fr?idop=${idop}` };
```

### 5.4 Étape 3 : Page PayFiP (Hors Contrôle)

**Interface PayFiP :**
1. Affichage récapitulatif (objet, montant, REFDET)
2. Saisie email utilisateur (obligatoire)
3. Choix mode paiement : CB (3D Secure) ou Prélèvement SEPA
4. Traitement paiement
5. Résultat : P/V/A/R/Z

### 5.5 Étape 4 : Notification Callback (Synchrone)

**Backend (`/api/payfip/notification/route.ts`):**

```typescript
POST /api/payfip/notification

Reçoit XML SOAP :
<soap:Body>
  <return>
    <idop>4b12f6a0-b4aa-11e7-b2ed-01234e12345f</idop>
    <resultrans>P</resultrans>
    <numauto>123456</numauto>
    <dattrans>31032026</dattrans>
    <heurtrans>1442</heurtrans>
    <refdet>2026-042</refdet>
    <montant>1450</montant>
    <mel>client@example.com</mel>
  </return>
</soap:Body>

Traitement :
1. Parse XML
2. Valider idop (P1, P3, P4)
3. Récupérer order
4. Switch RESULTRANS :
   - P/V → status='paid', email, QR si pickup
   - A   → status='canceled' (abandon)
   - R/Z → status='canceled' (refus)
5. Consommer idop
6. Return 200 OK
```

### 5.6 Étape 5 : Page Résultat (Utilisateur)

**Frontend (`/commande/resultat/page.tsx`):**

```typescript
URL: /commande/resultat?idop={idop}

1. Fetch order via idop
2. Affichage selon status :
   - paid → "Paiement confirmé !" + REFDET + lien commande
   - canceled + A → "Paiement abandonné" + retour panier
   - canceled + R/Z → "Paiement refusé" + réessayer
   - pending → "En cours..." (notification pas encore arrivée)
```

---

## 6. Gestion des Erreurs PayFiP

### 6.1 Catégories d'Erreurs

**Type 1 : Erreurs SOAP (Création paiement)**

Lors de `creerPaiementSecurise()` - avant d'avoir un idop.

Codes principaux :
- `M3` : Montant minimum 1€
- `M5` : Montant trop élevé
- `A2` : Email invalide
- `R3` : Format REFDET invalide
- `T1-T10` : Erreurs configuration client

**Gestion :**
```typescript
try {
  const { idop } = await payfipService.creerPaiementSecurise(params);
} catch (error) {
  if (error instanceof PayFipSOAPError) {
    const userMessage = getUserFriendlyMessage(error.code);
    return NextResponse.json({ error: userMessage }, { status: 400 });
  }
  // Erreur technique
  return NextResponse.json(
    { error: 'Service temporairement indisponible' },
    { status: 503 }
  );
}
```

**Type 2 : Erreurs idop (Notification)**

Lors du traitement de la notification PayFiP.

Codes :
- `P1` : idOp inconnu → 404
- `P3` : idOp déjà consommé → 200 OK (idempotence)
- `P4` : idOp expiré (>15 min) → 410 Gone
- `P5` : Transaction en cours → 202 Accepted

**Type 3 : Résultats Paiement (RESULTRANS)**

Messages utilisateur selon code :

| Code | Signification | Message Utilisateur | Action |
|------|---------------|---------------------|--------|
| `P` | Payé CB | "Paiement confirmé !" | Voir commande |
| `V` | Payé prélèvement | "Prélèvement enregistré" | Voir commande |
| `A` | Abandonné | "Paiement annulé" | Retour panier |
| `R` | Refusé CB | "Paiement refusé par votre banque" | Réessayer |
| `Z` | Refusé prélèvement | "Prélèvement rejeté" | Réessayer |

### 6.2 Stratégies de Recovery

**1. Cleanup idop expirés (Cron)**

```typescript
// /api/cron/cleanup-expired-idop
// Vercel cron : tous les 30 minutes

const expiredOps = await db.query.payfipOperations.findMany({
  where: and(
    lt(payfipOperations.expiresAt, new Date()),
    isNull(payfipOperations.consumedAt)
  ),
});

for (const op of expiredOps) {
  // Annuler order si encore pending
  await db.update(orders).set({
    status: 'canceled',
    canceledAt: new Date(),
  }).where(and(
    eq(orders.id, op.orderId),
    eq(orders.status, 'pending')
  ));
}
```

**2. Notification perdue (Polling fallback)**

Si la notification ne parvient pas (rare mais possible) :

```typescript
// Page résultat : si order pending après 2 min
async function checkPaymentStatus(idop: string) {
  const details = await payfipService.recupererDetailPaiementSecurise(idop);
  await processPaymentResult(details);
}
```

**3. Idempotence (Double notification)**

```typescript
if (operation.consumedAt) {
  // Déjà traité, retourner 200 OK pour éviter retry
  return NextResponse.json({ received: true, skipped: true });
}
```

### 6.3 Monitoring

**Alertes Sentry :**
- Erreurs configuration (T1-T10) → level: error
- Taux de refus >20% → alerte
- idop expirés >10/jour → alerte
- Notifications perdues → alerte critique

**Métriques à suivre :**
- Taux succès : (P+V) / total
- Taux abandon : A / total
- Taux refus : (R+Z) / total
- Temps moyen checkout → notification

---

## 7. Service Mock PayFiP

### 7.1 Objectif

Permettre de développer **toute l'expérience utilisateur** sans avoir les credentials PayFiP, avec simulation réaliste du flow SOAP complet.

### 7.2 Architecture Mock

Le mock simule 3 composants PayFiP :

```
┌──────────────────────────────────────────────┐
│ 1. Web Service SOAP                         │
│    mockPayFipService.creerPaiementSecurise() │
│    → Retourne idop simulé                    │
└──────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────┐
│ 2. Page de Paiement                          │
│    /payfip-mock/[idop]                       │
│    → Interface avec boutons P/V/A/R/Z        │
└──────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────┐
│ 3. Notification Callback                     │
│    POST /api/payfip/notification             │
│    → Envoie XML SOAP simulé                  │
└──────────────────────────────────────────────┘
```

### 7.3 Mock Service

**`src/lib/payfip/mock-service.ts` :**

```typescript
export class MockPayFipService implements PayFipService {
  private mockIdops = new Map<string, PaymentData>();

  async creerPaiementSecurise(params: PayFipParams): Promise<{ idop: string }> {
    // Validations (comme PayFiP réel)
    if (parseInt(params.MONTANT) < 100) {
      throw new MockPayFipError('M3', 'Montant minimum 1€');
    }

    // Générer idop
    const idop = randomUUID();

    // Stocker en mémoire (expiration 15 min)
    this.mockIdops.set(idop, {
      refdet: params.REFDET,
      montant: params.MONTANT,
      mel: params.MEL,
      createdAt: new Date(),
    });

    setTimeout(() => this.mockIdops.delete(idop), 15 * 60 * 1000);

    return { idop };
  }
}
```

### 7.4 Page Mock Paiement

**`src/app/payfip-mock/[idop]/page.tsx` :**

Interface utilisateur avec 5 boutons :
- ✅ Simuler paiement CB réussi (P)
- 🏦 Simuler prélèvement réussi (V)
- ⏸️ Abandonner le paiement (A)
- ❌ Simuler refus CB (R)
- ❌ Simuler refus prélèvement (Z)

Chaque bouton :
1. POST `/api/payfip/notification` avec XML SOAP simulé
2. Redirect vers `/commande/resultat?idop={idop}`

### 7.5 Configuration Mock

**`.env.local` (développement) :**

```bash
PAYFIP_USE_MOCK=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYFIP_NUMCLI=MOCK00
PAYFIP_EXER=2026
```

**`.env.production` (avec credentials) :**

```bash
PAYFIP_USE_MOCK=false
NEXT_PUBLIC_APP_URL=https://boutique.ville.fr
PAYFIP_NUMCLI=123456  # Vrai numéro DGFiP
PAYFIP_EXER=2026
PAYFIP_URL=https://www.tipi.budget.gouv.fr/tpa/services/securite
PAYFIP_MODE=W  # W=production
```

### 7.6 Basculement Transparent

**Client PayFiP (`src/lib/payfip/client.ts`) :**

```typescript
function createPayFipService(): PayFipService {
  return process.env.PAYFIP_USE_MOCK === 'true'
    ? new MockPayFipService()      // Mock en dev
    : new RealPayFipService();     // Production
}
```

**Avantages :**
- ✅ Développement immédiat sans credentials
- ✅ Tests de tous les scénarios (P/V/A/R/Z)
- ✅ Basculement en 1 variable d'environnement
- ✅ Code identique mock/production

---

## 8. Migration et Déploiement

### 8.1 Timeline Globale

```
┌─────────────────────────────────────────────────────┐
│ PHASE 1 : Développement Mock (5-7 jours)           │
│ ├─ Infrastructure PayFiP complète                   │
│ ├─ Mock service opérationnel                        │
│ ├─ Tests locaux validés                             │
│ └─ Livrable : Code prêt, attend credentials         │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 2 : Demande credentials (2-4 semaines)       │
│ ├─ Contact bureau CL1C (DR/DDFiP)                   │
│ ├─ Dossier administratif régie                      │
│ ├─ Réception NUMCLI + EXER                          │
│ └─ Livrable : Credentials PayFiP                    │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 3 : Tests API réelle (2-3 jours)             │
│ ├─ Config PAYFIP_USE_MOCK=false                     │
│ ├─ Tests mode SAISIE=T (test)                       │
│ ├─ Validation staging                               │
│ └─ Livrable : Tests PayFiP réussis                  │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 4 : Activation production (1 jour + J+1)     │
│ ├─ Paiement activation SAISIE=X (carte test)        │
│ ├─ Attente J+1 (activation effective)               │
│ ├─ Basculement SAISIE=W (production)                │
│ └─ Livrable : PayFiP actif en production            │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 5 : Go Live (1 jour)                         │
│ ├─ Premier paiement client réel                     │
│ ├─ Monitoring actif                                 │
│ ├─ Support disponible                               │
│ └─ Livrable : Boutique publique opérationnelle      │
└─────────────────────────────────────────────────────┘

TOTAL : 3-5 semaines (dont majorité = attente admin)
```

### 8.2 Phase 1 : Développement Mock (Maintenant)

**Checklist :**

```
Infrastructure
✅ Créer structure src/lib/payfip/
✅ Implémenter MockPayFipService
✅ Créer client factory (mock vs real)
✅ Implémenter générateur REFDET
✅ Créer gestionnaire idop

Base de données
✅ Créer migrations Drizzle :
   - invoice_sequences
   - payfip_operations
   - Modifier orders (colonnes PayFiP)
   - Supprimer stripe_events
✅ Tester migrations en local

Routes API
✅ Modifier /api/checkout (PayFiP)
✅ Créer /api/payfip/notification
✅ Créer /api/payfip/mock/*
✅ Supprimer /api/stripe/webhook

Pages
✅ Créer /payfip-mock/[idop]
✅ Créer /commande/resultat
✅ Adapter composants cart

Tests
✅ Parcours delivery complet (P/V/A/R/Z)
✅ Parcours pickup + QR
✅ Test idop expiré
✅ Test idempotence
✅ Test REFDET séquentiel
✅ Emails confirmation

Cleanup
✅ Supprimer code Stripe
✅ Désinstaller packages npm
✅ Commit migration
```

**Livrable :** Code complet fonctionnel avec Mock.

### 8.3 Phase 2 : Demande Credentials

**Actions :**

1. **Contact DR/DDFiP**
   - Bureau CL1C (correspondant moyens de paiement)
   - Dossier régie municipale
   - Demande accès Web Service PayFiP

2. **Informations à fournir**
   - URLs callback :
     * URLNOTIF : `https://boutique.ville.fr/api/payfip/notification`
     * URLREDIRECT : `https://boutique.ville.fr/commande/resultat`
   - IP serveur Vercel (pour whitelisting PayFiP)
   - Certificat SSL (HTTPS obligatoire)

3. **Réception**
   - NUMCLI (6 caractères)
   - EXER (4 caractères - année fiscale)
   - Accès plateforme de qualification

**Durée :** 2-4 semaines (délais administratifs).

### 8.4 Phase 3 : Tests API Réelle

**Configuration :**

```bash
# .env.production
PAYFIP_USE_MOCK=false
PAYFIP_NUMCLI=123456
PAYFIP_EXER=2026
PAYFIP_URL=https://www.tipi.budget.gouv.fr/tpa/services/securite
PAYFIP_MODE=T  # Mode test
NEXT_PUBLIC_APP_URL=https://boutique-staging.vercel.app
```

**Tests :**
- Créer paiement test (MONTANT=00 accepté en mode test)
- Vérifier idop généré
- Tester page PayFiP réelle
- Valider callback notification
- Tester scénarios P/V/A/R/Z

**Livrable :** Validation staging avec vraie API PayFiP.

### 8.5 Phase 4 : Activation Production

**Étapes :**

1. **Paiement activation CB uniquement (SAISIE=X)** ⚠️ IMPORTANT

   **Contexte UX :** PayFiP propose nativement deux modes de paiement :
   - **Carte Bancaire** : Flow standard, immédiat
   - **Prélèvement SEPA** : Nécessite authentification FranceConnect/impots.gouv.fr

   **Problème :** L'authentification FranceConnect pour le prélèvement crée une friction UX catastrophique pour une boutique municipale grand public (connexion impots.gouv.fr obligatoire).

   **Solution recommandée :** Activer UNIQUEMENT le mode Carte Bancaire.

   **Comment faire :**
   - PayFiP nécessite un paiement d'activation séparé pour chaque mode (CB et prélèvement)
   - En n'effectuant que le paiement d'activation CB, seul le bouton "Payer par carte bancaire" apparaîtra sur la page PayFiP
   - Le bouton "Payer par prélèvement" sera automatiquement masqué

   **Paiement d'activation CB :**
   - Mode : SAISIE="X" (activation)
   - Cartes test acceptées :
     * Visa : `5017674000000002`
     * Mastercard : `5017670000001800`
     * CB/Visa : `4978860713891312`
     * Expiration : postérieure au mois actuel
     * Cryptogramme : libre
   - Montant : libre (sera remboursé)
   - 3D Secure : simulé

   **À NE PAS FAIRE :**
   - ❌ Ne pas effectuer de paiement d'activation pour le prélèvement
   - ❌ Cela désactivera définitivement le mode prélèvement pour vos utilisateurs

   **À confirmer :**
   - Valider cette stratégie avec votre correspondant moyens de paiement DDFiP Val-de-Marne
   - Documenter le choix (masquage prélèvement pour UX optimale)

2. **Attente J+1**
   - Activation CB effective le jour ouvré suivant
   - Confirmation CL1C que mode CB activé
   - Vérification que prélèvement reste inactif

3. **Basculement production (SAISIE=W)**
   ```bash
   PAYFIP_MODE=W
   NEXT_PUBLIC_APP_URL=https://boutique.ville.fr
   ```

4. **Premier paiement réel**
   - Test interne (petit montant)
   - **Vérifier :** Un seul bouton "Payer par carte bancaire" visible
   - Validation workflow complet

**Livrable :** PayFiP actif en production (mode CB uniquement, UX optimisée).

### 8.6 Phase 5 : Go Live

**Checklist finale :**

```
Technique
✅ PAYFIP_MODE=W
✅ SSL/HTTPS actif
✅ Domaine custom configuré
✅ DNS propagé
✅ Emails testés
✅ QR codes opérationnels
✅ Backup DB automatique
✅ Monitoring Sentry

Légal
✅ Mentions légales (PayFiP)
✅ CGV validées
✅ Politique confidentialité
✅ RGPD : DPO informé

Communication
✅ Annonce changement
✅ Guide PayFiP
✅ Support formé
✅ FAQ disponible

Business
✅ Code produit validé
✅ Compte DFT actif
✅ Contact CL1C documenté
✅ Réconciliation bancaire
```

**Livrable :** Boutique publique opérationnelle.

### 8.7 Plan de Rollback

En cas de problème critique :

```bash
# Option 1 : Revert Git
git revert <commit-payfip>
git push origin main

# Option 2 : Rollback Vercel
vercel rollback <deployment-id>

# Option 3 : Mode maintenance
MAINTENANCE_MODE=true
# Message : "Boutique temporairement indisponible"
```

---

## 9. Annexes

### 9.1 Variables d'Environnement

**Développement (Mock) :**

```bash
# Mode
PAYFIP_USE_MOCK=true

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Credentials (mock, non utilisés)
PAYFIP_NUMCLI=MOCK00
PAYFIP_EXER=2026
PAYFIP_URL=http://localhost:3000/api/payfip/mock
```

**Production (Réel) :**

```bash
# Mode
PAYFIP_USE_MOCK=false

# URLs
NEXT_PUBLIC_APP_URL=https://boutique.ville.fr

# Credentials DGFiP
PAYFIP_NUMCLI=123456         # 6 chars
PAYFIP_EXER=2026             # 4 chars
PAYFIP_URL=https://www.tipi.budget.gouv.fr/tpa/services/securite
PAYFIP_MODE=W                # T=test, X=activation, W=production

# Database (Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Email (Resend)
RESEND_API_KEY=re_...

# Auth (NextAuth)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://boutique.ville.fr
ADMIN_EMAILS=admin@ville.fr

# Rate limiting (Upstash)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

### 9.2 Codes Résultat RESULTRANS

| Code | Signification | Action Système | Message Utilisateur |
|------|---------------|----------------|---------------------|
| `P` | Payé par CB | status='paid', email, QR si pickup | "Paiement confirmé !" |
| `V` | Payé par prélèvement SEPA | status='paid', email, QR si pickup | "Prélèvement enregistré, confirmation sous 2-3 jours" |
| `A` | Paiement abandonné | status='canceled' | "Paiement annulé, panier conservé" |
| `R` | Refusé par banque (CB) | status='canceled' | "Paiement refusé, vérifiez vos informations bancaires" |
| `Z` | Refusé (prélèvement) | status='canceled' | "Prélèvement rejeté, vérifiez vos coordonnées" |

### 9.3 Codes Erreur PayFiP Critiques

**Erreurs Configuration (Critiques) :**

| Code | Message | Action |
|------|---------|--------|
| `T1` | Numéro client invalide | Vérifier PAYFIP_NUMCLI |
| `T2` | Client inexistant dans base PayFiP | Contacter CL1C |
| `T4` | Pas d'accès sécurisé | Demander activation Web Service |
| `T9` | Certificat SSL invalide | Installer certificat Certigna |

**Erreurs Validation (Utilisateur) :**

| Code | Message | Action Utilisateur |
|------|---------|-------------------|
| `M3` | Montant < 1€ | Augmenter montant panier |
| `M5` | Montant > limite | Séparer en plusieurs commandes |
| `A2` | Email invalide | Corriger email |

**Erreurs idop (Technique) :**

| Code | Message | Action Système |
|------|---------|---------------|
| `P1` | idOp inconnu | 404 Not Found |
| `P3` | idOp déjà utilisé | 200 OK (idempotence) |
| `P4` | idOp expiré | 410 Gone, annuler order |

### 9.4 Modes de Paiement PayFiP - Activation Sélective

#### Contexte

PayFiP propose nativement **deux modes de paiement** sur la page de paiement :

1. **Payer par carte bancaire** (CB, Visa, Mastercard)
2. **Payer par prélèvement** (SEPA)

#### Problème UX : Prélèvement SEPA

Le mode prélèvement nécessite que l'utilisateur **s'authentifie via FranceConnect / impots.gouv.fr** pour valider son compte bancaire et autoriser le prélèvement.

**Flow prélèvement :**
```
User clique "Payer par prélèvement"
  ↓
Redirect vers FranceConnect
  ↓
Authentification impots.gouv.fr (identifiant fiscal + mot de passe)
  ↓
Autorisation prélèvement SEPA
  ↓
Retour PayFiP → validation
```

**Impact UX :**
- ❌ Friction énorme pour une boutique municipale grand public
- ❌ Nécessite compte impots.gouv.fr (pas tous les citoyens l'ont activé)
- ❌ Parcours long et complexe (5-7 étapes supplémentaires)
- ❌ Taux d'abandon élevé prévisible

**Résultat :** Expérience catastrophique pour des achats simples (goodies municipaux).

#### Solution : Activation Sélective du Mode CB Uniquement

**Bonne nouvelle :** Vous ne pouvez pas désactiver le prélèvement côté API (pas de paramètre dans `creerPaiementSecuriseRequest`), **MAIS** vous pouvez ne pas activer le mode prélèvement lors de la phase d'activation.

**Principe :**

Le guide DGFiP précise :

> "Un paiement d'activation est nécessaire pour la CB et pour le prélèvement."

Les deux modes **s'activent séparément** :

| Mode | Activation | Résultat sur page PayFiP |
|------|-----------|--------------------------|
| CB activée | Paiement test avec carte CB (SAISIE="X") | ✅ Bouton "Payer par carte bancaire" visible |
| Prélèvement activé | Paiement test avec prélèvement (SAISIE="X") | ✅ Bouton "Payer par prélèvement" visible |
| CB activée + Prélèvement NON activé | Paiement test CB uniquement | ✅ Seul bouton CB visible, prélèvement masqué |

**Recommandation pour boutique municipale :**

✅ **Activer uniquement le mode CB** lors de la phase d'activation (section 8.5).

**Procédure :**

1. Lors de la phase d'activation (SAISIE="X") :
   - ✅ Effectuer le paiement d'activation avec une **carte test CB**
   - ❌ **NE PAS** effectuer le paiement d'activation prélèvement

2. Résultat après J+1 (activation effective) :
   - ✅ Le bouton "Payer par carte bancaire" apparaît sur la page PayFiP
   - ✅ Le bouton "Payer par prélèvement" **n'apparaît pas** (mode inactif)

3. Utilisateurs voient uniquement :
   ```
   ┌─────────────────────────────────────┐
   │  Récapitulatif de votre paiement    │
   │  Montant : 14,50 €                  │
   │                                     │
   │  ┌─────────────────────────────┐   │
   │  │ Payer par carte bancaire     │   │ ← Seul bouton visible
   │  └─────────────────────────────┘   │
   └─────────────────────────────────────┘
   ```

**À confirmer :**

Cette stratégie est basée sur le comportement documenté de PayFiP. Il est recommandé de **confirmer avec votre correspondant moyens de paiement à la DR/DDFiP du Val-de-Marne** au moment de la mise en production que :

1. Le mode prélèvement restera bien masqué si non activé
2. Cette configuration est appropriée pour une boutique municipale grand public
3. Aucune obligation réglementaire d'activer le prélèvement

**Avantages activation CB uniquement :**

- ✅ **UX optimale** : Parcours de paiement simple et rapide (comme Stripe)
- ✅ **Taux de conversion** : Pas de friction FranceConnect
- ✅ **Moins de support** : Un seul flow à documenter/expliquer
- ✅ **Adaptation progressive** : Possibilité d'activer le prélèvement plus tard si besoin réel

**Note API :**

L'objet `creerPaiementSecuriseRequest` n'a pas de paramètre pour masquer le prélèvement. C'est uniquement l'**absence d'activation du mode prélèvement** qui le masque automatiquement côté interface PayFiP.

### 9.5 Contacts et Support

**Support DGFiP :**
- Bureau CL1C (correspondant moyens de paiement)
- DR/DDFiP du département
- Documentation : https://www.tipi.budget.gouv.fr

**Support Technique :**
- Vercel : https://vercel.com/support
- Supabase : https://supabase.com/support
- Resend : https://resend.com/support

---

## Conclusion

Cette spécification décrit une architecture complète pour la migration Stripe → PayFiP, optimisée pour le modèle DGFiP et permettant un développement immédiat via Mock Service.

**Points clés :**
- ✅ Architecture adaptée aux spécificités PayFiP (SOAP, REFDET, idop, lifecycle 15 min)
- ✅ Mock complet permettant développement sans credentials
- ✅ Migration Big Bang (remplacement total Stripe)
- ✅ Gestion d'erreurs exhaustive (codes PayFiP spécifiques)
- ✅ Plan de déploiement progressif (Mock → Test → Activation → Production)

**Prochaine étape :** Créer le plan d'implémentation détaillé avec tâches step-by-step.

---

**Document validé le :** 31 mars 2026
**Prêt pour :** Implémentation
