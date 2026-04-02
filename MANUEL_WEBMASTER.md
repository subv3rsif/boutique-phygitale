# Manuel Webmaster — Boutique Phygitale 1885

**Version:** 1.0
**Date:** Mars 2026
**Système de paiement:** PayFiP (DGFiP)

---

## 📖 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Variables d'environnement](#variables-denvironnement)
4. [Configuration PayFiP](#configuration-payfip)
5. [Mise en production](#mise-en-production)
6. [Interface Admin](#interface-admin)
7. [Gestion du catalogue](#gestion-du-catalogue)
8. [Gestion des commandes](#gestion-des-commandes)
9. [Emails automatiques](#emails-automatiques)
10. [Maintenance](#maintenance)
11. [Dépannage](#dépannage)
12. [Sécurité](#sécurité)
13. [FAQ](#faq)

---

## Vue d'ensemble

Cette boutique en ligne permet la vente de goodies municipaux avec deux modes de livraison :

- **Livraison** : Envoi par La Poste avec numéro de suivi
- **Retrait** : Retrait sur place à La Fabrik avec QR code sécurisé

**Stack technique :**
- Next.js 15 (hébergé sur Vercel)
- PostgreSQL (Supabase)
- PayFiP pour les paiements (service DGFiP)
- Resend pour les emails
- Upstash Redis pour le rate limiting

---

## Prérequis

### Services à créer avant le déploiement

1. **Compte Vercel** → https://vercel.com
2. **Base de données PostgreSQL** → Supabase (https://supabase.com) ou Neon
3. **Compte Resend** (emails) → https://resend.com
4. **Compte Upstash Redis** → https://upstash.com
5. **Compte Google Cloud** (OAuth admin) → https://console.cloud.google.com
6. **Credentials PayFiP** → Demander à la DGFiP (voir section Configuration PayFiP)

---

## Variables d'environnement

### 🔴 Variables obligatoires

Créer un fichier `.env.local` à la racine du projet et sur Vercel.

#### Base de données

```bash
# URL de connexion PostgreSQL (obtenue depuis Supabase/Neon)
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require

# URL directe (pour Supabase Pooler)
DIRECT_URL=postgresql://user:pass@host:6543/dbname
```

**Où les trouver ?**
- Supabase : Settings → Database → Connection string
- Copier la chaîne "Session pooler" pour DATABASE_URL
- Copier la chaîne "Direct connection" pour DIRECT_URL

#### Supabase (si utilisé)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

**Où les trouver ?** Supabase → Settings → API

#### Email (Resend)

```bash
RESEND_API_KEY=re_123456789...
EMAIL_FROM=noreply@votre-domaine.fr
```

**Où les trouver ?**
- API Key : Resend → API Keys → Create API Key
- EMAIL_FROM : doit correspondre à un domaine vérifié dans Resend

#### Redis (Upstash)

```bash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYC...
```

**Où les trouver ?** Upstash → Database → REST API

#### Application

```bash
# URL publique de votre site
NEXT_PUBLIC_APP_URL=https://votre-domaine.fr

# Environnement
NODE_ENV=production
```

⚠️ **Important :** `NEXT_PUBLIC_APP_URL` doit être l'URL de production (sans slash final)

#### Authentification Admin

```bash
# Emails autorisés à accéder à /admin
ADMIN_EMAILS=marie@ville.fr,pierre@ville.fr

# Mot de passe admin (pour le login simple)
ADMIN_PASSWORD=VotreMotDePasseSecurise123!

# Secret NextAuth (générer avec: openssl rand -base64 32)
NEXTAUTH_SECRET=votre_secret_très_long_et_aléatoire

# URL de l'app (même que NEXT_PUBLIC_APP_URL)
NEXTAUTH_URL=https://votre-domaine.fr
```

#### Google OAuth (pour admin)

```bash
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123...
```

**Comment les obtenir ?**

1. Aller sur https://console.cloud.google.com
2. Créer un nouveau projet ou sélectionner un existant
3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
4. Type : Web application
5. Authorized redirect URIs : `https://votre-domaine.fr/api/auth/callback/google`
6. Copier Client ID et Client Secret

#### Point de retrait

```bash
# Informations affichées sur le site (NEXT_PUBLIC_ = visible côté client)
NEXT_PUBLIC_PICKUP_LOCATION_NAME=La Fabrik
NEXT_PUBLIC_PICKUP_LOCATION_ADDRESS=123 Rue de la République, 75001 Paris
NEXT_PUBLIC_PICKUP_LOCATION_HOURS=Lundi-Vendredi 9h-18h
```

#### Cron / Tâches planifiées

```bash
# Secret pour sécuriser les endpoints cron
# Générer avec: openssl rand -hex 32
CRON_SECRET=votre_secret_cron_très_long
```

---

### 🔵 Configuration PayFiP

**⚠️ ATTENTION : Section critique pour le paiement**

#### Mode développement (avec mock)

```bash
# Active le service de paiement fictif (pour tester sans credentials DGFiP)
PAYFIP_USE_MOCK=true
```

Avec `PAYFIP_USE_MOCK=true`, vous pouvez tester toute la boutique localement sans avoir de credentials PayFiP réels. Les paiements sont simulés via une page `/payfip-mock/[idop]`.

#### Mode production (avec vraie DGFiP)

```bash
# Désactive le mock (utilise le vrai service DGFiP)
PAYFIP_USE_MOCK=false

# Identifiant client PayFiP (fourni par la DGFiP)
PAYFIP_NUMCLI=123456

# Exercice fiscal (année)
PAYFIP_EXER=2026

# URL du service SOAP PayFiP
PAYFIP_SOAP_URL=https://www.tipi.budget.gouv.fr/tpa/services/securite

# Mode de saisie :
# T = Test (environnement de test DGFiP)
# X = Production (environnement réel DGFiP)
# W = Webservice (pas d'interface graphique)
PAYFIP_MODE=T
```

**Comment obtenir les credentials PayFiP ?**

1. Contacter la Direction Générale des Finances Publiques (DGFiP)
2. Faire une demande de raccordement au service PayFiP/TIPI
3. Vous recevrez :
   - **NUMCLI** : Votre numéro de client (6 chiffres généralement)
   - **EXER** : L'exercice fiscal (année courante)
   - **URL SOAP** : L'URL du webservice (test ou production)
   - Documentation technique PayFiP

**📋 Checklist de mise en production PayFiP :**

- [ ] Credentials PayFiP obtenus auprès de la DGFiP
- [ ] Variable `PAYFIP_USE_MOCK=false` définie sur Vercel
- [ ] Variable `PAYFIP_NUMCLI` définie (votre numéro client)
- [ ] Variable `PAYFIP_EXER` définie (année en cours, ex: 2026)
- [ ] Variable `PAYFIP_SOAP_URL` définie (URL fournie par DGFiP)
- [ ] Variable `PAYFIP_MODE` définie (`T` pour test, `X` pour production)
- [ ] Test de paiement réel en mode `T` (test) validé
- [ ] Passage en mode `X` (production) après validation DGFiP

---

### 🟡 Variables optionnelles

#### Monitoring (Sentry)

```bash
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

Recommandé pour suivre les erreurs en production.

---

## Configuration PayFiP

### Comprendre PayFiP

PayFiP est le service de paiement en ligne de la Direction Générale des Finances Publiques (DGFiP). Il permet aux collectivités territoriales et administrations publiques de collecter des paiements sécurisés.

**Workflow PayFiP :**

1. Le client valide son panier → votre serveur crée une commande
2. Votre serveur appelle le webservice PayFiP (SOAP) pour créer un paiement
3. PayFiP renvoie un **idOp** (identifiant d'opération, valide 15 minutes)
4. Le client est redirigé vers la page de paiement DGFiP (ou page mock en dev)
5. Après paiement, PayFiP envoie une notification XML à votre webhook
6. Votre serveur vérifie la notification et met à jour la commande

### REFDET : Numéro de facture séquentiel

Chaque commande génère automatiquement un **REFDET** (référence détail) unique au format `YYYY-NNN` :

- `YYYY` : Année (ex: 2026)
- `NNN` : Numéro séquentiel à 3 chiffres (ex: 042)
- Exemple : `2026-042`

Ce numéro est :
- Généré de manière atomique (thread-safe) en base de données
- Unique par an (redémarre à 001 chaque année)
- Utilisé comme référence de facture PayFiP

**Aucune action manuelle nécessaire** : la séquence est automatique.

### URLNOTIF : Webhook de notification

PayFiP envoie les résultats de paiement à l'URL :

```
https://votre-domaine.fr/api/payfip/notification
```

⚠️ **Cette URL doit être accessible publiquement** (pas de protection par mot de passe).

Le code vérifie automatiquement :
- L'idOp existe et n'a pas expiré (< 15 minutes)
- L'idOp n'a pas déjà été consommé (protection double-paiement)
- Le montant correspond à la commande

### Modes de saisie PayFiP

La variable `PAYFIP_MODE` contrôle l'interface de paiement :

| Mode | Description | Usage |
|------|-------------|-------|
| `T` | **Test** - Interface DGFiP de test | Développement/pré-production |
| `X` | **Production** - Interface DGFiP réelle | Production |
| `W` | **Webservice** - Pas d'interface graphique | Paiements automatisés (non utilisé ici) |

**Recommandation :** commencer en mode `T`, valider avec la DGFiP, puis passer en `X`.

---

## Mise en production

### Étape 1 : Créer les services

1. **Vercel** : Importer le projet depuis GitHub
2. **Supabase** : Créer une base de données PostgreSQL
3. **Resend** : Créer un compte et vérifier votre domaine email
4. **Upstash** : Créer une base Redis
5. **Google Cloud** : Configurer OAuth pour l'admin
6. **DGFiP** : Obtenir les credentials PayFiP

### Étape 2 : Initialiser la base de données

**Sur Supabase :**

1. Aller dans SQL Editor
2. Exécuter le fichier `drizzle/schema.sql` (migration complète)
3. Vérifier que toutes les tables sont créées :
   - `orders`
   - `order_items`
   - `payfip_operations`
   - `invoice_sequences`
   - `pickup_tokens`
   - `email_queue`
   - `gdpr_consents`

**Alternative avec Drizzle CLI :**

```bash
# Installer Drizzle Kit
npm install -g drizzle-kit

# Pousser le schéma
npx drizzle-kit push:pg
```

### Étape 3 : Configurer les variables d'environnement sur Vercel

1. Aller sur Vercel → Votre Projet → Settings → Environment Variables
2. Ajouter **toutes** les variables listées ci-dessus
3. ⚠️ Ne **jamais** commiter le fichier `.env.local` sur Git

**Variables critiques à vérifier :**

- `NEXT_PUBLIC_APP_URL` : doit pointer vers votre domaine Vercel (ex: `https://boutique.vercel.app`)
- `PAYFIP_USE_MOCK=true` au début (test), puis `false` en production
- `DATABASE_URL` et `DIRECT_URL` : vérifier qu'elles sont correctes
- `ADMIN_EMAILS` : emails des personnes autorisées à accéder au backoffice

### Étape 4 : Déployer sur Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

Ou bien : pousser sur la branche `main` de GitHub → déploiement automatique.

### Étape 5 : Configurer le domaine personnalisé

1. Vercel → Settings → Domains
2. Ajouter votre domaine (ex: `boutique.ville.fr`)
3. Configurer les DNS selon les instructions Vercel
4. Attendre la propagation DNS (peut prendre 24h)
5. Mettre à jour `NEXT_PUBLIC_APP_URL` avec le nouveau domaine

### Étape 6 : Configurer les emails (Resend)

1. Resend → Domains → Add Domain
2. Ajouter votre domaine (ex: `ville.fr`)
3. Configurer les enregistrements DNS (SPF, DKIM, DMARC)
4. Vérifier le domaine
5. Mettre à jour `EMAIL_FROM=noreply@ville.fr`

### Étape 7 : Tester le parcours complet

**Mode Mock (avant production PayFiP) :**

1. Aller sur votre site
2. Ajouter des produits au panier
3. Passer commande (mode livraison + retrait)
4. Valider le paiement sur la page mock
5. Vérifier la réception de l'email de confirmation
6. Tester le QR code de retrait (mode pickup)

**Mode Production PayFiP :**

1. Mettre `PAYFIP_USE_MOCK=false` et `PAYFIP_MODE=T` (test DGFiP)
2. Faire un paiement test de 1 centime
3. Vérifier que la redirection vers PayFiP fonctionne
4. Vérifier la réception de la notification webhook
5. Vérifier l'email de confirmation
6. Valider avec la DGFiP
7. Passer en `PAYFIP_MODE=X` (production)

### Étape 8 : Configurer les tâches cron

**Sur Vercel** (nécessite plan Pro) :

1. Créer un fichier `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/cron/process-email-queue",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/cleanup-expired-idops",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Alternative avec cron-job.org** (gratuit) :

1. Créer un compte sur https://cron-job.org
2. Ajouter deux tâches :
   - **Emails** : `https://votre-domaine.fr/api/cron/process-email-queue?secret=VOTRE_CRON_SECRET` (toutes les 5 minutes)
   - **Cleanup** : `https://votre-domaine.fr/api/cron/cleanup-expired-idops?secret=VOTRE_CRON_SECRET` (toutes les heures)

---

## Interface Admin

### Accès à l'admin

**URL :** `https://votre-domaine.fr/admin`

**Authentification :**

1. Cliquer sur "Se connecter avec Google"
2. Choisir un compte Google listé dans `ADMIN_EMAILS`
3. Vous êtes automatiquement redirigé vers le dashboard

⚠️ Seuls les emails listés dans `ADMIN_EMAILS` peuvent accéder.

### Dashboard

**Chemin :** `/admin/dashboard`

Affiche :
- Statistiques des commandes (total, en attente, payées, livrées)
- Graphique des ventes par jour
- Liste des dernières commandes

### Gestion des commandes

**Chemin :** `/admin/orders`

**Fonctionnalités :**

1. **Liste des commandes** avec filtres :
   - Par statut (`pending`, `paid`, `fulfilled`, `canceled`)
   - Par mode (`delivery`, `pickup`)
   - Par date
   - Recherche par email ou REFDET

2. **Détail d'une commande** (`/admin/orders/[id]`) :
   - Informations client (email, téléphone si fourni)
   - Liste des produits commandés
   - Montants (produits, livraison, total)
   - REFDET (référence facture)
   - idOp PayFiP et numéro d'autorisation
   - Statut de paiement
   - Mode de livraison

3. **Actions disponibles :**

   - **Marquer comme expédié** (si `delivery` et `paid`) :
     - Cliquer sur "Marquer comme expédié"
     - Saisir le numéro de suivi La Poste
     - (Optionnel) URL de suivi
     - Valider → Email automatique envoyé au client

   - **Renvoyer l'email de confirmation** :
     - Si le client n'a pas reçu l'email
     - Cliquer sur "Renvoyer l'email"

   - **Rembourser** (si `paid`) :
     - Marquer la commande comme `refunded`
     - ⚠️ Le remboursement PayFiP doit être fait manuellement via l'interface DGFiP
     - Mettre à jour le statut dans l'admin pour suivi

### Validation des retraits (QR Code)

**Chemin :** `/admin/pickup/scan`

**Processus :**

1. Le client présente son QR code (reçu par email)
2. Scanner le QR code avec un smartphone ou tablette
3. Ou saisir manuellement le code
4. Le système vérifie :
   - Le token est valide
   - Il n'a pas expiré (30 jours)
   - Il n'a pas déjà été utilisé
   - La commande est bien payée
5. Affichage des détails de la commande
6. Confirmer la remise des produits
7. La commande passe automatiquement en statut `fulfilled`

**En cas d'erreur :**

- **Token invalide** : vérifier que le QR code est bien scanné (parfois illisible)
- **Token expiré** : contacter le client, générer un nouveau token manuellement
- **Déjà utilisé** : vérifier que les produits n'ont pas déjà été retirés

---

## Gestion du catalogue

### Fichier source

**Chemin :** `src/lib/catalogue.ts`

Le catalogue est géré dans un fichier TypeScript pour simplicité (pas de base de données).

### Ajouter un produit

1. Ouvrir `src/lib/catalogue.ts`
2. Ajouter un objet dans le tableau `catalogue` :

```typescript
{
  id: 'identifiant-unique-produit', // Doit être unique, en minuscules, avec tirets
  name: 'Nom du produit',
  description: 'Description complète du produit',
  priceCents: 1500, // Prix TTC en centimes (ici 15,00€)
  shippingCents: 450, // Frais de port par unité en centimes (4,50€)
  image: 'https://lien-vers-image.jpg', // URL de l'image (ou placeholder)
  active: true, // true = visible, false = caché
  weightGrams: 200, // Poids en grammes (optionnel)
  tags: ['tag1', 'tag2'], // Tags pour filtrage (optionnel)
  stockQuantity: 50, // Stock disponible (optionnel, 0 = rupture)
  payfipProductCode: '11', // Code produit PayFiP (par défaut "11" = marchandise générale)
},
```

3. Sauvegarder le fichier
4. Commit et push sur GitHub → déploiement automatique

**💡 Images de produits :**

Vous pouvez :
- Héberger les images sur un CDN (Cloudinary, ImageKit, etc.)
- Les placer dans `/public/images/products/` et référencer comme `/images/products/mug.jpg`
- Utiliser des placeholders temporaires : `https://placehold.co/600x750?text=Produit`

### Modifier un produit

1. Trouver le produit dans `catalogue.ts` par son `id`
2. Modifier les champs souhaités (prix, description, stock, etc.)
3. Sauvegarder, commit, push

### Désactiver un produit

Mettre `active: false` pour le cacher sans le supprimer :

```typescript
{
  id: 'ancien-produit',
  name: '...',
  active: false, // Plus visible sur le site
  // ... autres champs
},
```

### Gérer les stocks

**Méthode simple (fichier) :**

Modifier `stockQuantity` manuellement dans `catalogue.ts`.

**Méthode automatique (future) :**

Migrer le catalogue en base de données (`product_stock` table déjà créée) et décrémenter automatiquement le stock à chaque vente.

⚠️ **Actuellement, le stock n'est PAS décrémenté automatiquement** → à gérer manuellement.

### Frais de port

Les `shippingCents` sont calculés par produit. Pour les tarifs La Poste :

| Poids | Service | Prix indicatif |
|-------|---------|----------------|
| < 250g | Lettre Suivie | 4,50€ |
| 250g-500g | Colissimo | 6,50€ |
| 500g-1kg | Colissimo | 8,50€ |

**En mode pickup, les frais de port sont toujours à 0€** (retrait gratuit).

---

## Gestion des commandes

### États des commandes

| Statut | Description | Actions possibles |
|--------|-------------|-------------------|
| `pending` | En attente de paiement | Automatique → `paid` ou `canceled` |
| `paid` | Payée, en préparation | Marquer comme expédié (delivery) ou Scanner QR (pickup) |
| `fulfilled` | Livrée ou retirée | Aucune (terminé) |
| `canceled` | Annulée (paiement refusé/expiré) | Aucune |
| `refunded` | Remboursée | Aucune |

### Workflow Livraison

1. Client passe commande → `pending`
2. Client paie via PayFiP → `paid` + email de confirmation
3. Vous préparez le colis
4. Admin : Marquer comme expédié + numéro de suivi → `fulfilled` + email de suivi
5. Client reçoit le colis

### Workflow Retrait

1. Client passe commande → `pending`
2. Client paie via PayFiP → `paid` + email avec QR code
3. Client se présente à La Fabrik avec QR code
4. Staff scanne QR code dans `/admin/pickup/scan`
5. Validation → `fulfilled`

### Annulation de commande

**Si `pending` :**
- La commande s'annule automatiquement après expiration de l'idOp (15 minutes)

**Si `paid` :**
- Contacter manuellement le client
- Rembourser via l'interface DGFiP PayFiP
- Marquer la commande comme `refunded` dans l'admin

⚠️ **Pas de remboursement automatique** : à gérer manuellement avec la DGFiP.

---

## Emails automatiques

### Types d'emails envoyés

| Email | Déclencheur | Contenu |
|-------|-------------|---------|
| **Confirmation retrait** | Paiement validé (mode pickup) | Récap commande + QR code + infos retrait |
| **Confirmation livraison** | Paiement validé (mode delivery) | Récap commande + délai livraison |
| **Notification expédition** | Admin marque comme expédié | Numéro de suivi + lien tracking La Poste |

### Système de retry

Tous les emails passent par une **queue avec retry automatique** :

- **Tentative 1** : Immédiate
- **Tentative 2** : +5 minutes si échec
- **Tentative 3** : +15 minutes
- **Tentative 4** : +1 heure
- **Tentative 5** : +4 heures
- **Abandon** : Après 5 échecs

Les emails en échec sont visibles dans la table `email_queue` (statut `failed`).

### Renvoyer un email manuellement

1. Aller sur `/admin/orders/[id]`
2. Cliquer sur "Renvoyer l'email de confirmation"
3. L'email est réinitialisé dans la queue et renvoyé

### Personnaliser les templates

Les templates emails sont dans `src/emails/` (React Email) :

- `pickup-confirmation.tsx` : Email de confirmation retrait
- `delivery-confirmation.tsx` : Email de confirmation livraison
- `shipped-notification.tsx` : Email de notification d'expédition

Pour modifier :
1. Éditer le fichier `.tsx` correspondant
2. Tester localement avec `npm run email:dev` (si configuré)
3. Commit et push

---

## Maintenance

### Tâches quotidiennes

**Aucune** si les crons fonctionnent correctement.

### Tâches hebdomadaires

- Vérifier le dashboard admin (nouvelles commandes)
- Vérifier la queue d'emails (pas de `failed` en masse)
- Vérifier les logs Vercel pour erreurs

### Tâches mensuelles

- Vérifier les stocks produits (si géré manuellement)
- Vérifier les numéros de séquence REFDET (`invoice_sequences` table)
- Nettoyer les anciennes commandes `canceled` (> 3 mois)

### Sauvegardes base de données

**Supabase** :
- Sauvegarde automatique quotidienne (plan payant)
- Export manuel : Database → Backups → Download

**Recommandation :** exporter la base une fois par mois et stocker localement.

### Mise à jour du code

```bash
# Récupérer les mises à jour
git pull origin main

# Installer les dépendances
npm install

# Déployer
vercel --prod
```

⚠️ Toujours tester en local avant de déployer en production.

---

## Dépannage

### Problème : Les emails ne partent pas

**Causes possibles :**

1. **Credentials Resend invalides**
   - Vérifier `RESEND_API_KEY` sur Vercel
   - Vérifier que le domaine `EMAIL_FROM` est vérifié dans Resend

2. **Queue email bloquée**
   - Aller dans Supabase → Table Editor → `email_queue`
   - Filtrer par `status = 'failed'`
   - Vérifier la colonne `last_error` pour le message d'erreur

3. **Cron ne tourne pas**
   - Vérifier que le cron `/api/cron/process-email-queue` est configuré
   - Tester manuellement : `curl https://votre-domaine.fr/api/cron/process-email-queue?secret=VOTRE_CRON_SECRET`

**Solution :**
- Renvoyer l'email depuis l'admin `/admin/orders/[id]`
- Corriger les credentials Resend
- Relancer le cron manuellement

### Problème : Paiement PayFiP échoue

**Symptômes :**
- Redirection PayFiP ne fonctionne pas
- Erreur "Missing PayFiP credentials"
- Le paiement n'est pas confirmé

**Diagnostic :**

1. **Vérifier les variables PayFiP sur Vercel :**
   ```bash
   PAYFIP_USE_MOCK=false
   PAYFIP_NUMCLI=123456
   PAYFIP_EXER=2026
   PAYFIP_SOAP_URL=https://www.tipi.budget.gouv.fr/tpa/services/securite
   PAYFIP_MODE=T
   ```

2. **Vérifier les logs Vercel :**
   - Vercel → Projet → Logs
   - Chercher "PayFiP" ou "SOAP"
   - Lire les erreurs retournées par le webservice

3. **Vérifier la notification webhook :**
   - Logs → `/api/payfip/notification`
   - Vérifier que PayFiP envoie bien la notification

**Solutions courantes :**

- **Credentials invalides** : vérifier avec la DGFiP
- **URL SOAP incorrecte** : copier-coller depuis la doc DGFiP
- **idOp expiré** : limité à 15 minutes, demander au client de recommencer
- **Webhook non reçu** : vérifier que `NEXT_PUBLIC_APP_URL` est correct

### Problème : QR code invalide

**Symptômes :**
- "Token invalide" lors du scan
- "Token expiré"
- "Déjà utilisé"

**Diagnostic :**

1. **Vérifier l'email du client** : le QR code y est affiché
2. **Tester le token manuellement** :
   - Extraire le code du QR (format : `https://votre-domaine.fr/retrait/ABC123...`)
   - Aller sur `/admin/pickup/scan`
   - Saisir manuellement `ABC123...`

3. **Vérifier en base de données** :
   - Supabase → `pickup_tokens`
   - Filtrer par `order_id` de la commande
   - Vérifier `expires_at` (doit être dans le futur)
   - Vérifier `used_at` (doit être `null`)

**Solutions :**

- **Token expiré** : régénérer manuellement (nécessite un script SQL)
- **Token déjà utilisé** : vérifier que les produits n'ont pas déjà été retirés
- **QR illisible** : renvoyer l'email ou utiliser le lien `/ma-commande/[orderId]`

### Problème : Stock négatif

**Cause :** Stock non décrémenté automatiquement (fonctionnalité future).

**Solution actuelle :** gérer le stock manuellement dans `catalogue.ts`.

**Solution future :** implémenter la décrémentation automatique avec transaction SQL.

### Problème : Build Vercel échoue

**Vérifier :**

1. **Variables d'environnement** : toutes présentes sur Vercel ?
2. **Erreurs TypeScript** : lire les logs Vercel
3. **Base de données** : accessible depuis Vercel ?

**Commandes de debug :**

```bash
# Tester le build localement
npm run build

# Vérifier TypeScript
npm run type-check
```

---

## Sécurité

### Bonnes pratiques

✅ **À faire :**

- Utiliser HTTPS uniquement (Vercel le fait automatiquement)
- Définir des mots de passe forts pour `ADMIN_PASSWORD` et `NEXTAUTH_SECRET`
- Limiter `ADMIN_EMAILS` aux personnes strictement nécessaires
- Changer `CRON_SECRET` régulièrement
- Ne jamais exposer les variables d'environnement côté client (sauf `NEXT_PUBLIC_*`)
- Vérifier régulièrement les logs pour détecter des activités suspectes

❌ **À ne pas faire :**

- Commiter le fichier `.env.local` sur Git
- Partager les credentials PayFiP publiquement
- Désactiver le rate limiting (protège contre les abus)
- Modifier le code de validation des paiements sans comprendre les implications

### Rate limiting

**Protections en place :**

- **Checkout** : 10 tentatives par heure par IP
- **Consultation commande** : 3 tentatives par heure par IP
- **Admin** : Protégé par Google OAuth

Si un utilisateur légitime est bloqué, attendre 1 heure ou le débloquer manuellement dans Upstash Redis.

### RGPD / Données personnelles

**Données collectées :**

- Email client (obligatoire pour PayFiP)
- Téléphone (optionnel, recommandé pour pickup)
- Adresse de livraison (si mode delivery)
- IP et User-Agent (consent RGPD)

**Conservation :**

- Commandes : indéfiniment (comptabilité)
- Tokens pickup : 30 jours puis expiration automatique
- Emails en queue : supprimés après envoi réussi

**Droit d'accès/suppression :**

Les utilisateurs peuvent demander :
- Accès à leurs données : lister leurs commandes par email
- Suppression : anonymiser les commandes (remplacer email par `anonyme@deleted.local`)

**À implémenter manuellement** (pas de UI automatique pour l'instant).

### Conformité PayFiP

⚠️ **Important :**

- Ne jamais stocker les numéros de carte bancaire (PayFiP s'en charge)
- Ne jamais modifier les montants après création de l'idOp
- Toujours vérifier la signature de la notification PayFiP (fait automatiquement)
- Conserver les logs de transaction (table `payfip_operations`)

---

## FAQ

### Puis-je changer les prix après déploiement ?

Oui, modifier `priceCents` dans `catalogue.ts`, commit, push. Les nouvelles commandes utiliseront le nouveau prix. Les anciennes commandes conservent leur prix d'achat (snapshot).

### Comment ajouter un nouveau mode de livraison ?

Cela nécessite des modifications code :
1. Ajouter le mode dans `src/lib/validations.ts` (enum `fulfillmentMode`)
2. Adapter le calcul de shipping dans `src/lib/catalogue.ts`
3. Adapter les templates email
4. Adapter l'interface admin

### Puis-je vendre des produits sans stock limité ?

Oui, ne pas définir `stockQuantity` ou le mettre à `null`. Le produit sera toujours disponible.

### Combien de temps les clients ont-ils pour payer ?

**15 minutes** après création de l'idOp PayFiP. Passé ce délai, la commande expire et passe en `canceled`.

### Puis-je proposer plusieurs points de retrait ?

Oui, mais nécessite des modifications :
1. Créer une table `pickup_locations` en base
2. Afficher une sélection dans le checkout
3. Adapter les emails pour afficher le bon point de retrait

Actuellement : un seul point (La Fabrik) en dur.

### Comment tester les emails sans les envoyer réellement ?

Utiliser **Resend en mode test** :
- Les emails sont "envoyés" mais visibles uniquement dans le dashboard Resend
- Ne sont pas délivrés aux vraies adresses email
- Pratique pour tester les templates

### Puis-je personnaliser le design du site ?

Oui, tout le code frontend est dans `src/app/` et `src/components/`. Le design utilise Tailwind CSS.

Fichiers clés :
- `src/app/globals.css` : Styles globaux
- `src/components/product/` : Cartes produits
- `src/components/layout/` : Header, footer
- Design system : couleurs Love Symbol (#503B64) et Cloud Dancer (#F3EFEA)

### Que faire si un client perd son QR code ?

1. Retrouver sa commande dans `/admin/orders` (rechercher par email)
2. Cliquer sur "Renvoyer l'email de confirmation"
3. Ou donner au client le lien : `https://votre-domaine.fr/ma-commande/[orderId]`

### Comment gérer les remboursements ?

1. Rembourser via l'interface DGFiP PayFiP (hors de cette application)
2. Marquer la commande comme `refunded` dans l'admin
3. Optionnel : envoyer un email manuel au client

### Puis-je migrer le catalogue en base de données ?

Oui, la table `product_stock` existe déjà. Cela nécessite :
1. Créer une table `products`
2. Créer une interface admin CRUD pour les produits
3. Adapter les requêtes pour lire depuis la DB au lieu du fichier

---

## Support

### Ressources

- **Documentation Next.js** : https://nextjs.org/docs
- **Documentation PayFiP** : Fournie par la DGFiP
- **Documentation Vercel** : https://vercel.com/docs
- **Documentation Resend** : https://resend.com/docs

### Contacts

- **Développeur** : [Votre nom/contact]
- **DGFiP** : [Contact technique PayFiP]
- **Hébergement** : support@vercel.com

---

**Version du manuel :** 1.0
**Dernière mise à jour :** Mars 2026
**Système de paiement :** PayFiP (DGFiP)
