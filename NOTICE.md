# Notice d'Installation et de Fonctionnement
## Boutique Phygitale Municipale

**Version** : 1.0
**Date** : Février 2026
**Auteur** : Équipe Technique Municipale

---

## 📑 Table des Matières

1. [Présentation Générale](#présentation-générale)
2. [Installation Technique](#installation-technique)
3. [Guide Utilisateur - Clients](#guide-utilisateur---clients)
4. [Guide Utilisateur - Administrateurs](#guide-utilisateur---administrateurs)
5. [Fonctionnement Technique](#fonctionnement-technique)
6. [Maintenance & Support](#maintenance--support)
7. [FAQ](#faq)
8. [Glossaire](#glossaire)

---

## 📖 Présentation Générale

### Qu'est-ce que la Boutique Phygitale ?

La **Boutique Phygitale** est une plateforme de vente en ligne de goodies municipaux qui combine l'expérience numérique (achat en ligne) et physique (retrait sur place). Elle permet aux habitants et visiteurs de commander facilement des produits officiels de la ville.

### Fonctionnalités Principales

#### Pour les Clients
- 🛒 **Catalogue en ligne** : Consultation et achat de goodies municipaux
- 💳 **Paiement sécurisé** : Via Stripe (carte bancaire)
- 📦 **Deux modes de livraison** :
  - **Livraison à domicile** : Via La Poste (5-7 jours)
  - **Retrait gratuit** : À La Fabrik avec QR code
- 📧 **Confirmation automatique** : Email avec détails de commande
- 📱 **100% responsive** : Fonctionne sur mobile, tablette et ordinateur

#### Pour les Administrateurs
- 📊 **Dashboard** : Statistiques en temps réel (CA, commandes)
- 📋 **Gestion des commandes** : Liste, détails, filtres
- 🚚 **Suivi des expéditions** : Marquage envoyé + numéro de suivi
- 📲 **Scanner QR** : Validation des retraits sur place
- 📧 **Gestion des emails** : Renvoi des confirmations si besoin

### Architecture Technique

```
┌─────────────────┐
│   Clients Web   │ (Navigateurs, mobiles)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Next.js App   │ (Serveur Vercel)
│   (Frontend +   │
│    API Routes)  │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼
┌─────────┐ ┌─────┐ ┌────────┐ ┌────────┐
│Supabase │ │Stripe│ │ Resend │ │Upstash │
│   DB    │ │  💳  │ │   📧   │ │ Redis  │
└─────────┘ └─────┘ └────────┘ └────────┘
```

---

## 🔧 Installation Technique

### Prérequis Système

#### Matériel Minimum
- Processeur : 2 cœurs
- RAM : 4 GB
- Espace disque : 500 MB

#### Logiciels Requis
- **Node.js** : version 18.x ou supérieure ([télécharger](https://nodejs.org))
- **npm** : version 9.x ou supérieure (inclus avec Node.js)
- **Git** : pour cloner le repository ([télécharger](https://git-scm.com))
- **Éditeur de code** : VS Code recommandé ([télécharger](https://code.visualstudio.com))

#### Comptes Services Externes
- [Vercel](https://vercel.com) : Hébergement (gratuit pour petits volumes)
- [Supabase](https://supabase.com) : Base de données PostgreSQL (gratuit jusqu'à 500 MB)
- [Stripe](https://stripe.com) : Paiements (2,9% + 0,25€ par transaction)
- [Resend](https://resend.com) : Emails (gratuit jusqu'à 3000/mois)
- [Upstash](https://upstash.com) : Redis pour rate limiting (gratuit jusqu'à 10K requêtes/jour)

### Installation Pas à Pas

#### Étape 1 : Cloner le Projet

```bash
# Ouvrir un terminal et cloner le repository
git clone https://github.com/votre-municipalite/boutique-phygitale.git

# Entrer dans le dossier
cd boutique-phygitale
```

#### Étape 2 : Installer les Dépendances

```bash
npm install
```

⏱️ **Durée** : 2-3 minutes selon votre connexion Internet

#### Étape 3 : Configurer les Variables d'Environnement

1. **Copier le fichier d'exemple** :
   ```bash
   cp .env.example .env.local
   ```

2. **Éditer `.env.local`** avec vos credentials :

```bash
# Base de données (Supabase)
DATABASE_URL=postgresql://postgres:MOT_DE_PASSE@db.xxx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:MOT_DE_PASSE@db.xxx.supabase.co:6543/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (mode test au début)
STRIPE_SECRET_KEY=sk_test_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_... (configuré à l'étape 5)

# Email (Resend)
RESEND_API_KEY=re_...

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYCxxx...

# Configuration application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Admin (emails autorisés, séparés par des virgules)
ADMIN_EMAILS=admin@ville.fr,marie@ville.fr,pierre@ville.fr

# Lieu de retrait (La Fabrik)
PICKUP_LOCATION_NAME=La Fabrik
PICKUP_LOCATION_ADDRESS=123 Rue de la République, 75001 Paris
PICKUP_LOCATION_HOURS=Lundi-Vendredi 9h-18h, Samedi 10h-16h

# Sécurité cron (générer avec: openssl rand -hex 32)
CRON_SECRET=votre_secret_aleatoire_32_caracteres

# Monitoring (optionnel)
SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz
NEXT_PUBLIC_SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz
```

#### Étape 4 : Initialiser la Base de Données

```bash
# Générer les fichiers de migration
npm run db:generate

# Appliquer le schéma à la base de données
npm run db:push

# Optionnel : Ouvrir Drizzle Studio pour visualiser
npm run db:studio
```

#### Étape 5 : Configurer Stripe Webhook (Local)

Dans un **terminal séparé** :

```bash
# Installer Stripe CLI si pas déjà fait
# macOS/Linux:
brew install stripe/stripe-cli/stripe

# Windows: télécharger depuis https://stripe.com/docs/stripe-cli

# Se connecter
stripe login

# Écouter les webhooks
npm run stripe:listen
```

**Important** : Copier le webhook secret affiché (`whsec_...`) et l'ajouter dans `.env.local` :

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Étape 6 : Personnaliser le Catalogue

Éditer `src/lib/catalogue.ts` avec vos produits :

```typescript
export const catalogue: Product[] = [
  {
    id: 'mug-ville-2024',
    name: 'Mug Ville Edition 2024',
    description: 'Mug céramique blanc avec logo de la ville',
    priceCents: 1200, // 12,00 €
    shippingCents: 450, // 4,50 € (Lettre Suivie La Poste)
    image: '/images/products/mug-ville.jpg',
    active: true,
    weightGrams: 350,
    tags: ['vaisselle', 'collection'],
    stockQuantity: 50
  },
  // Ajouter vos autres produits...
];
```

**N'oubliez pas** : Ajouter les images dans `public/images/products/`

#### Étape 7 : Démarrer le Serveur de Développement

```bash
npm run dev
```

Ouvrir votre navigateur : **http://localhost:3000**

✅ Vous devriez voir la page d'accueil avec le catalogue !

#### Étape 8 : Tester le Parcours Complet

1. **Ajouter un produit au panier**
2. **Sélectionner le mode livraison/retrait**
3. **Accepter le consentement RGPD**
4. **Cliquer sur "Payer avec Stripe"**
5. **Utiliser une carte test** : `4242 4242 4242 4242`, date future, CVC 123
6. **Vérifier l'email de confirmation** (logs dans terminal si Resend en mode dev)

### Vérifications Post-Installation

#### Checklist Rapide

- [ ] Page d'accueil s'affiche (`http://localhost:3000`)
- [ ] 3 produits visibles dans le catalogue
- [ ] Ajout au panier fonctionne (badge compte)
- [ ] Page panier accessible (`/panier`)
- [ ] Calculs totaux corrects
- [ ] Webhook Stripe écoute (terminal séparé)
- [ ] Paiement test réussit
- [ ] Email de confirmation visible (logs ou inbox)
- [ ] Base de données a une commande (`npm run db:studio`)

#### En Cas de Problème

**Erreur "Cannot connect to database"**
- Vérifier `DATABASE_URL` dans `.env.local`
- Vérifier que Supabase projet est bien créé
- Tester la connexion : `npm run db:studio`

**Erreur "Stripe webhook not found"**
- Vérifier que `npm run stripe:listen` tourne dans un terminal séparé
- Vérifier `STRIPE_WEBHOOK_SECRET` dans `.env.local`

**Images produits ne s'affichent pas**
- Vérifier que les images sont dans `public/images/products/`
- Vérifier les chemins dans `catalogue.ts` (commencent par `/images/`)

---

## 👤 Guide Utilisateur - Clients

### Comment Acheter des Produits ?

#### Étape 1 : Parcourir le Catalogue

1. Aller sur **https://boutique.ville-example.fr**
2. Consulter les produits disponibles
3. Cliquer sur un produit pour voir les détails (optionnel)

#### Étape 2 : Ajouter au Panier

1. Cliquer sur **"Ajouter au panier"** sous le produit désiré
2. Une notification verte confirme l'ajout
3. Le badge du panier (🛒) s'incrémente
4. Répéter pour plusieurs produits si besoin

#### Étape 3 : Accéder au Panier

1. Cliquer sur l'icône panier en haut à droite
2. Vous voyez la liste de vos produits
3. Vous pouvez :
   - **Modifier la quantité** : Boutons **+** / **-** (max 10 par produit)
   - **Supprimer un article** : Icône 🗑️ rouge

#### Étape 4 : Choisir le Mode de Livraison

**Option A : Livraison à Domicile** 📦
- Délai : 5-7 jours ouvrés
- Frais : Calculés selon le poids (environ 4,50€ par produit)
- Suivi : Numéro de tracking La Poste envoyé par email

**Option B : Retrait à La Fabrik** 📍
- Délai : Commande prête sous 24h
- Frais : **GRATUIT**
- Lieu : La Fabrik, 123 Rue de la République, 75001 Paris
- Horaires : Lundi-Vendredi 9h-18h, Samedi 10h-16h
- Méthode : QR code envoyé par email

**Sélectionner** votre option dans le panier.

#### Étape 5 : Accepter les Conditions

1. **Lire** la politique de confidentialité (lien cliquable)
2. **Cocher** la case RGPD obligatoire
3. Le bouton **"Payer avec Stripe"** devient actif

#### Étape 6 : Paiement Sécurisé

1. Cliquer sur **"Payer avec Stripe"**
2. Vous êtes redirigé vers la page sécurisée Stripe
3. Renseigner :
   - Email de contact
   - Informations de carte bancaire
   - Adresse de livraison (si mode livraison)
4. Cliquer sur **"Payer"**

**Sécurité** : Aucune information de carte n'est stockée sur nos serveurs. Tout est géré par Stripe (certification PCI-DSS niveau 1).

#### Étape 7 : Confirmation

1. **Redirection automatique** vers la page de confirmation
2. Message : "Nous traitons votre paiement..."
3. **Email de confirmation** reçu sous 1-2 minutes

**Contenu de l'email** :
- Récapitulatif de la commande
- Numéro de commande
- Montant total payé
- Mode de livraison choisi
- **Si retrait** : QR code à présenter à La Fabrik
- **Si livraison** : Délai estimé

### Retrait en Magasin avec QR Code

#### Comment Récupérer ma Commande ?

1. **Recevoir l'email** avec le QR code (sous 2 minutes après paiement)
2. **Se rendre à La Fabrik** aux horaires d'ouverture
3. **Présenter** le QR code au comptoir (depuis votre téléphone ou imprimé)
4. Le staff scanne le code avec leur appareil
5. **Récupérer** vos produits immédiatement

#### QR Code Perdu ?

**Solution 1** : Chercher dans votre boîte email (expéditeur : `noreply@boutique.ville-example.fr`)

**Solution 2** : Accéder directement via le lien dans l'email de confirmation (`/ma-commande/[id]`)

**Solution 3** : Contacter le support avec votre numéro de commande

#### Validité du QR Code

- **Durée** : 30 jours après la commande
- **Usage** : Une seule fois (après scan, le code est invalidé)
- **Alerte** : Un email de rappel est envoyé 7 jours avant expiration

### Livraison à Domicile

#### Délais

- **Préparation** : 2-3 jours ouvrés
- **Expédition** : Email avec numéro de suivi La Poste
- **Livraison** : 3-5 jours ouvrés après expédition
- **Total** : 5-7 jours ouvrés environ

#### Suivi de Commande

1. **Email "Colis expédié"** : Reçu dès que le colis est remis à La Poste
2. **Numéro de suivi** : Lien cliquable vers le tracking La Poste
3. **Suivi en temps réel** : Sur le site laposte.fr

#### Problème de Livraison ?

**Colis non reçu** : Contacter support@ville.fr avec votre numéro de suivi

**Adresse incorrecte** : Contacter immédiatement le support (possible de modifier avant expédition)

**Produit endommagé** : Photos + email sous 7 jours → remboursement ou renvoi

---

## 👨‍💼 Guide Utilisateur - Administrateurs

### Accès à l'Interface Admin

#### Se Connecter

1. Aller sur **https://boutique.ville-example.fr/login**
2. Renseigner :
   - **Email** : Votre email autorisé (configuré dans `ADMIN_EMAILS`)
   - **Mot de passe** : Fourni par l'administrateur système
3. Cliquer sur **"Se connecter"**
4. Redirection automatique vers le dashboard

**Sécurité** : Seuls les emails listés dans la configuration peuvent se connecter. Session valable 7 jours.

#### En Cas d'Oubli du Mot de Passe

Contacter l'administrateur technique pour réinitialisation.

### Dashboard Principal

#### Vue d'Ensemble

Le dashboard affiche les statistiques en temps réel :

📊 **Statistiques Clés** :
- **Total Commandes** : Nombre de commandes depuis le lancement
- **Chiffre d'Affaires** : Montant total TTC encaissé
- **Commandes en Attente** : Statut "pending" (paiement non confirmé)
- **À Expédier** : Commandes payées en mode livraison
- **À Retirer** : Commandes payées en mode retrait (pas encore retirées)

#### Navigation

**Menu Latéral** (Desktop) ou **Hamburger** (Mobile) :
- 🏠 **Dashboard** : Vue d'ensemble
- 📋 **Commandes** : Liste et détails
- 📲 **Scanner QR** : Validation retraits
- 🚪 **Déconnexion** : Fermer la session

### Gestion des Commandes

#### Liste des Commandes

**Accès** : Menu → **Commandes**

**Tableau** avec colonnes :
- **#ID** : Identifiant unique (8 premiers caractères)
- **Date** : Date et heure de création
- **Client** : Email du client
- **Mode** : 📦 Livraison ou 📍 Retrait
- **Montant** : Total TTC
- **Statut** : Badge coloré (pending, paid, fulfilled, canceled)

**Filtres Disponibles** :
- Par **statut** : Tous / En attente / Payé / Expédié / Annulé
- Par **mode** : Tous / Livraison / Retrait
- Par **date** : Plage de dates (from/to)

**Tri** : Cliquer sur les en-têtes de colonne (par défaut : date décroissante)

#### Détail d'une Commande

**Accès** : Cliquer sur une ligne du tableau

**Informations Affichées** :
- **Identité Client** :
  - Email
  - Téléphone (si mode retrait)
- **Détails Commande** :
  - Liste des produits (nom, quantité, prix unitaire)
  - Sous-total articles
  - Frais de port
  - Total TTC
- **Statuts & Dates** :
  - Créée le : Date de création
  - Payée le : Date de confirmation paiement (webhook Stripe)
  - Expédiée le / Retirée le : Date de fulfillment
- **Informations Techniques** :
  - ID session Stripe
  - ID payment intent Stripe
  - Token retrait (hash, si mode pickup)
- **Historique Emails** :
  - Type d'email envoyé
  - Statut (sent/pending/failed)
  - Date d'envoi
  - Nombre de tentatives

**Actions Disponibles** :

🚚 **Marquer comme Expédié** (si mode livraison + statut paid)
- Bouton en haut à droite
- Popup : Saisir numéro de suivi + URL tracking (optionnel)
- Clic "Confirmer" → Statut devient "fulfilled" + email client

📧 **Renvoyer l'Email de Confirmation**
- Bouton sous les détails
- Réinitialise la queue email
- Renvoi immédiat (ou au prochain cron)
- Limité à 3 renvois/heure pour éviter spam

### Scanner QR - Validation des Retraits

#### Accès

**Accès** : Menu → **Scanner QR**

**Appareil Recommandé** : Smartphone ou tablette (interface optimisée mobile-first)

#### Interface

**Éléments** :
- 📥 **Champ de saisie** : Large, tactile (44px+ hauteur)
- 🔍 **Bouton "Valider le retrait"** : Pleine largeur, bouton principal
- ❓ **Section d'aide** : Collapsible, codes d'erreur courants

#### Méthodes de Validation

**Méthode 1 : Coller le Token** (la plus rapide)
1. Client montre son QR code
2. Scanner avec l'appareil photo du téléphone (app scanner QR native)
3. Copier l'URL obtenue
4. Coller dans le champ de saisie
5. Validation automatique si token > 20 caractères

**Méthode 2 : Saisie Manuelle**
1. Client dicte le code affiché sous le QR
2. Taper dans le champ
3. Appuyer sur "Valider" ou touche Entrée

#### Résultats de Validation

**✅ Succès (Carte Verte)** :
- Message : "Retrait validé avec succès"
- Détails affichés :
  - Numéro de commande
  - Montant total
  - Email du client
  - Date de commande
  - Liste des produits (si disponible)
- **Action** : Remettre les produits au client
- Auto-clear après 3 secondes (champ se vide pour le prochain)

**❌ Erreur (Carte Rouge)** :
- Message d'erreur explicite
- Code d'erreur (404, 410, 409, 400)
- Détails supplémentaires si disponibles

**Codes d'Erreur** :

| Code | Signification | Action |
|------|---------------|--------|
| **404** | Token invalide | Vérifier que le client a le bon QR code (pas expiré, pas d'un autre site) |
| **410** | Token expiré | Le QR code a plus de 30 jours. Demander au client de repasser commande ou contacter support |
| **409** | Déjà utilisé | Le retrait a déjà été effectué. Affiche date et utilisateur ayant validé. Vérifier doublon |
| **400** | Commande non payée | Le paiement n'a pas été confirmé. Vérifier statut dans liste commandes |

#### Conseils d'Utilisation

- **Auto-focus** : Le champ est automatiquement sélectionné au chargement
- **Entrée** : Appuyer sur Entrée valide immédiatement
- **Paste** : Coller un token > 20 caractères déclenche validation automatique
- **Help** : Cliquer sur "Besoin d'aide ?" pour voir les codes d'erreur

### Actions Courantes

#### Expédier une Commande (Livraison)

1. **Préparer le colis** avec les produits commandés
2. **Remettre à La Poste** ou transporteur
3. **Noter le numéro de suivi** (sur le ticket de dépôt)
4. **Aller dans** Commandes → Détail de la commande
5. **Cliquer** "Marquer comme Expédié"
6. **Remplir** :
   - Numéro de suivi : `FR123456789FR` (exemple)
   - URL de tracking : `https://www.laposte.fr/outils/suivre-vos-envois?code=FR123456789FR`
7. **Confirmer**
8. ✅ Le client reçoit automatiquement un email avec le tracking

#### Gérer un Client qui a Perdu son QR Code

**Scénario** : Le client se présente à La Fabrik mais n'a plus l'email avec le QR code.

**Solution** :
1. **Demander son email** ou numéro de commande
2. **Rechercher la commande** dans la liste (filtre par email si possible, sinon chercher manuellement)
3. **Ouvrir le détail** de la commande
4. **Vérifier** :
   - Statut = "paid" (payée)
   - Mode = "pickup" (retrait)
   - Token présent (hash affiché)
5. **Option A** : Cliquer sur "Renvoyer l'email" → Client reçoit un nouvel email
6. **Option B** : Valider manuellement le retrait (noter le numéro de commande pour traçabilité)

#### Annuler une Commande

**Cas d'usage** : Client demande annulation, erreur de commande, stock insuffisant

**Procédure** :
1. **Vérifier le statut** : Seules les commandes "pending" ou "paid" (non fulfilled) peuvent être annulées
2. **Aller dans** Commandes → Détail
3. **Contacter l'équipe technique** : L'annulation nécessite un remboursement Stripe manuel (pas d'interface UI pour ça pour éviter erreurs)
4. **Après remboursement** : Le statut passera automatiquement à "refunded"

**Important** : Les remboursements Stripe prennent 5-10 jours ouvrés pour apparaître sur le compte du client.

---

## ⚙️ Fonctionnement Technique

### Architecture des Paiements

#### Flow de Paiement Complet

```
1. Client ajoute au panier (localStorage, côté navigateur)
   ↓
2. Client clique "Payer" (POST /api/checkout)
   ↓
3. Serveur recalcule les montants depuis le catalogue
   ↓
4. Serveur crée la commande en DB (statut: pending)
   ↓
5. Serveur crée une Stripe Checkout Session
   ↓
6. Client redirigé vers Stripe (page hébergée sécurisée)
   ↓
7. Client saisit CB et valide
   ↓
8. Stripe traite le paiement
   ↓
9. Stripe envoie webhook checkout.session.completed
   ↓
10. Serveur vérifie signature webhook
    ↓
11. Serveur met à jour commande (statut: paid)
    ↓
12. Si pickup: génération token + QR code
    ↓
13. Ajout email à la queue
    ↓
14. Cron traite la queue (toutes les 5 min)
    ↓
15. Email envoyé via Resend
    ↓
16. Client reçoit confirmation
```

**Source de Vérité** : Le webhook Stripe (étape 9) est la **SEULE** source confirmant le paiement. La page success (étape 12) est informative uniquement.

### Système de QR Codes

#### Génération Sécurisée

**Lors du paiement réussi (webhook)** :

1. **Génération** : `crypto.randomBytes(32)` → 64 caractères hexadécimaux (256 bits)
   - Exemple : `a3f2e9b8c4d1a2f5e8b3c9d2a7f1e4b8c3d9a2f7e1b4c8d3a9f2e5b1c7d4a8f3`

2. **Hash** : SHA-256 du token
   - Stocké en DB : `e4a2f8b3c9d1a5f2e7b4c8d3a9f1e5b2c7d4a8f3e1b9c5d2a7f4e8b1c6d3a9f2`
   - **Jamais le token en clair** dans la base

3. **QR Code** : Généré avec l'URL complète
   - URL : `https://boutique.ville-example.fr/retrait/a3f2e9b8c4d1a2f5...`
   - Format : PNG 300x300px, correction d'erreur niveau H
   - Encodé en base64 pour inclusion email

4. **Stockage DB** :
   ```sql
   INSERT INTO pickup_tokens (order_id, token_hash, expires_at)
   VALUES (
     'order-uuid',
     'e4a2f8b3c9d1a5f2...',
     NOW() + INTERVAL '30 days'
   );
   ```

#### Validation au Scanner

**Lors du scan (POST /api/admin/pickup/redeem)** :

1. **Réception** : Token en clair depuis l'URL scannée
2. **Hash** : SHA-256 du token reçu
3. **Recherche DB** : `SELECT * FROM pickup_tokens WHERE token_hash = ?`
4. **Vérifications** :
   - Token existe ? (sinon 404)
   - Pas expiré ? `expires_at > NOW()` (sinon 410)
   - Pas utilisé ? `used_at IS NULL` (sinon 409)
   - Commande payée ? `status = 'paid'` (sinon 400)
5. **Marquage** :
   ```sql
   UPDATE pickup_tokens
   SET used_at = NOW(), used_by = 'admin@ville.fr'
   WHERE token_hash = ?;

   UPDATE orders
   SET status = 'fulfilled', fulfilled_at = NOW()
   WHERE id = order_id;
   ```
6. **Réponse** : Détails commande + succès

**Sécurité** :
- Impossible de deviner un token (2^256 possibilités)
- Même si la DB est compromise, pas de token en clair (hash only)
- Usage unique (flag `used_at`)
- Expiration 30 jours

### Système d'Emails avec Retry

#### Queue d'Emails

**Table `email_queue`** :
```sql
CREATE TABLE email_queue (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  email_type VARCHAR(50), -- 'pickup_confirmation', 'delivery_confirmation', 'shipped_notification'
  recipient_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  next_retry_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Ajout à la Queue

Après paiement confirmé (webhook) :

```javascript
await db.insert(email_queue).values({
  order_id: order.id,
  email_type: order.fulfillmentMode === 'pickup' ? 'pickup_confirmation' : 'delivery_confirmation',
  recipient_email: order.customerEmail,
  status: 'pending',
  next_retry_at: new Date(), // Immédiatement
  attempts: 0
});
```

#### Traitement de la Queue (Cron)

**Cron Vercel** : Exécution toutes les 5 minutes

**Route** : `GET /api/cron/process-email-queue` (sécurisée avec `CRON_SECRET`)

**Logique** :
```javascript
// 1. Récupérer les emails pending (max 10 par exécution)
const pending = await db
  .select()
  .from(email_queue)
  .where(
    and(
      eq(email_queue.status, 'pending'),
      lte(email_queue.next_retry_at, new Date()),
      lt(email_queue.attempts, 5) // Max 5 tentatives
    )
  )
  .limit(10);

// 2. Pour chaque email
for (const job of pending) {
  try {
    // Envoyer via Resend
    await resend.emails.send({
      from: 'noreply@boutique.ville-example.fr',
      to: job.recipient_email,
      subject: getSubject(job.email_type),
      react: getTemplate(job.email_type, order)
    });

    // Marquer comme envoyé
    await db.update(email_queue)
      .set({ status: 'sent', sent_at: new Date() })
      .where(eq(email_queue.id, job.id));

  } catch (error) {
    // Incrémenter tentatives
    const newAttempts = job.attempts + 1;

    // Calculer prochain retry (backoff exponentiel)
    const delays = [5, 15, 60, 240, 1440]; // minutes
    const delayMinutes = delays[newAttempts - 1] || 1440;
    const nextRetry = new Date(Date.now() + delayMinutes * 60 * 1000);

    // Mettre à jour
    await db.update(email_queue)
      .set({
        attempts: newAttempts,
        last_error: error.message,
        next_retry_at: nextRetry,
        status: newAttempts >= 5 ? 'failed' : 'pending'
      })
      .where(eq(email_queue.id, job.id));
  }
}
```

**Backoff Exponentiel** :
- Tentative 1 : Immédiat
- Tentative 2 : +5 minutes
- Tentative 3 : +15 minutes
- Tentative 4 : +1 heure
- Tentative 5 : +4 heures
- Après 5 échecs : Marqué "failed" (alerte admin)

### Rate Limiting

**Objectif** : Prévenir l'abus des endpoints (spam, attaques)

**Implémentation** : Upstash Redis + `@upstash/ratelimit`

**Limiters Configurés** :

1. **Checkout** : 10 sessions/heure par IP
   ```javascript
   const checkoutLimiter = new Ratelimit({
     redis,
     limiter: Ratelimit.slidingWindow(10, "1 h"),
   });
   ```

2. **Order View** : 3 requêtes/heure par IP
   ```javascript
   const orderViewLimiter = new Ratelimit({
     redis,
     limiter: Ratelimit.slidingWindow(3, "1 h"),
   });
   ```

**Application** :
```javascript
// Dans /api/checkout/route.ts
const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
const { success, remaining } = await checkoutLimiter.limit(ip);

if (!success) {
  return NextResponse.json(
    { error: 'Trop de requêtes, réessayez plus tard' },
    { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
  );
}
```

**Monitoring** : Dashboard Upstash affiche le nombre de hits/rejets par endpoint

---

## 🛠️ Maintenance & Support

### Tâches de Maintenance Régulières

#### Quotidiennes (5 minutes)

- [ ] **Vérifier le dashboard admin** : Nouvelles commandes ?
- [ ] **Traiter les commandes payées** : Préparer les colis/retraits
- [ ] **Vérifier les emails failed** : Y a-t-il des emails bloqués dans la queue ?

#### Hebdomadaires (15 minutes)

- [ ] **Analyser les stats** : Produits les plus vendus, CA hebdomadaire
- [ ] **Vérifier les logs Vercel** : Erreurs 500 répétées ?
- [ ] **Contrôler le stock** : Produits en rupture ?
- [ ] **Tester un achat** : Parcours complet avec carte test

#### Mensuelles (30 minutes)

- [ ] **Audit sécurité** : Vérifier les accès admin, changer mots de passe
- [ ] **Mise à jour dépendances** : `npm outdated` puis `npm update` (tester après !)
- [ ] **Backup base de données** : Télécharger export Supabase
- [ ] **Analyser Core Web Vitals** : Vercel Analytics → Performance
- [ ] **Revoir les emails failed** : Supprimer les jobs > 30 jours

### Sauvegardes

#### Base de Données

**Automatique (Supabase)** :
- Backup quotidien (rétention 7 jours sur plan gratuit)
- Backup hebdomadaire (rétention 4 semaines)

**Manuel** :
```bash
# Se connecter via psql
psql "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# Exporter
pg_dump -Fc -v -h db.xxx.supabase.co -U postgres > backup-$(date +%Y%m%d).dump
```

**Restauration** :
```bash
pg_restore -v -h db.xxx.supabase.co -U postgres -d postgres backup-20260206.dump
```

#### Code Source

**Git** : Tous les commits sont sauvegardés sur GitHub/GitLab

**Vercel** : Garde l'historique de tous les déploiements (rollback possible)

### Support Utilisateurs

#### Contact Support

**Email** : support@ville.fr
**Horaires** : Lundi-Vendredi 9h-17h
**Délai de réponse** : 24-48h ouvrées

#### Questions Fréquentes

Voir section [FAQ](#faq) ci-dessous.

### Monitoring & Alertes

#### Vercel Dashboard

**URL** : https://vercel.com/[your-team]/boutique-phygitale

**À surveiller** :
- **Deployments** : Erreurs de build ?
- **Functions** : Erreurs API routes (> 5% ?)
- **Analytics** : Trafic, Core Web Vitals
- **Cron Jobs** : Email queue exécutée avec succès ?

#### Stripe Dashboard

**URL** : https://dashboard.stripe.com

**À surveiller** :
- **Payments** : Paiements réussis/échoués
- **Webhooks** : Événements reçus, erreurs ?
- **Disputes** : Contestations clients (rares)

#### Upstash Dashboard

**URL** : https://console.upstash.com

**À surveiller** :
- **Requests** : Nombre de hits rate limiter
- **Storage** : Utilisation mémoire Redis (< 80%)

### Résolution des Problèmes Courants

#### "Le webhook Stripe ne fonctionne plus"

**Symptômes** : Commandes restent en "pending", clients ne reçoivent pas d'email

**Diagnostic** :
1. Aller dans Stripe Dashboard → Developers → Webhooks
2. Vérifier l'endpoint : URL correcte ? Statut actif ?
3. Cliquer sur l'endpoint → Onglet "Attempts"
4. Voir les erreurs (500, 401, timeout ?)

**Solutions** :
- **401 Unauthorized** : `STRIPE_WEBHOOK_SECRET` incorrect dans Vercel
- **500 Error** : Bug dans le code → Voir logs Vercel Functions
- **Timeout** : Traitement trop long (> 30s) → Optimiser le code

**Test** :
```bash
# Déclencher un événement test
stripe trigger checkout.session.completed
```

#### "Les emails ne partent pas"

**Symptômes** : Clients ne reçoivent pas les confirmations

**Diagnostic** :
1. Vérifier la queue : `npm run db:studio` → Table `email_queue`
2. Voir les status : Combien en "pending" ? Combien en "failed" ?
3. Lire `last_error` pour les jobs failed

**Solutions** :
- **"Invalid API key"** : `RESEND_API_KEY` incorrect
- **"Domain not verified"** : Aller sur Resend Dashboard → Vérifier les DNS
- **"Rate limit exceeded"** : Quota Resend dépassé (3000/mois sur gratuit) → Upgrade plan
- **"Recipient refused"** : Email client invalide (typo) → Contacter client

**Forcer retry** :
```sql
-- Réinitialiser les jobs failed pour retry
UPDATE email_queue
SET status = 'pending', attempts = 0, next_retry_at = NOW()
WHERE status = 'failed';
```

#### "Un client ne peut pas scanner son QR code"

**Symptômes** : Scanner retourne "Token invalide" (404)

**Diagnostic** :
1. Demander au client de montrer le QR code
2. Scanner avec votre téléphone → Vérifier l'URL
3. Copier le token depuis l'URL
4. Tester manuellement dans l'admin

**Causes possibles** :
- **QR code d'un autre site** : Vérifier que l'URL commence bien par `https://boutique.ville-example.fr/retrait/`
- **Email ancien** : Token expiré (> 30 jours) → 410 Gone
- **Déjà utilisé** : Quelqu'un d'autre a déjà scanné → 409 Conflict (voir qui et quand)
- **Bug génération** : Token pas créé lors du webhook → Vérifier table `pickup_tokens`

**Solution** :
- Si token manquant/expiré : Créer manuellement un nouveau token (contacter équipe technique)
- Si déjà utilisé par erreur : Vérifier identité client, marquer fulfilled manuellement

---

## ❓ FAQ

### Clients

**Q : Puis-je modifier ma commande après paiement ?**
R : Non, une fois le paiement validé, la commande ne peut plus être modifiée. Contactez le support si vous avez fait une erreur (annulation possible avant expédition/retrait).

**Q : Puis-je payer par chèque ou virement ?**
R : Non, seuls les paiements par carte bancaire (via Stripe) sont acceptés.

**Q : Combien de temps mon QR code est-il valable ?**
R : 30 jours à partir de la date de commande. Un email de rappel est envoyé 7 jours avant expiration.

**Q : Puis-je me faire livrer à une autre adresse que la mienne ?**
R : Oui, vous pouvez saisir n'importe quelle adresse lors du paiement Stripe (adresse de livraison).

**Q : Je n'ai pas reçu l'email de confirmation**
R : Vérifiez vos spams. Si toujours rien, accédez directement via le lien sur la page de confirmation ou contactez le support avec votre email et numéro de commande.

**Q : Puis-je annuler ma commande ?**
R : Oui, si elle n'a pas encore été expédiée/retirée. Contactez le support rapidement.

**Q : Le site accepte-t-il les cartes étrangères ?**
R : Oui, Stripe accepte toutes les cartes Visa, Mastercard, American Express internationales.

### Administrateurs

**Q : Comment ajouter un nouvel admin ?**
R : Modifier la variable d'environnement `ADMIN_EMAILS` dans Vercel → Settings → Environment Variables → Ajouter l'email séparé par une virgule → Redéployer.

**Q : Peut-on modifier les prix des produits ?**
R : Oui, éditer `src/lib/catalogue.ts`, modifier les `priceCents`, commit + push → Vercel redéploie automatiquement.

**Q : Comment ajouter un nouveau produit ?**
R : Ajouter un objet dans le tableau `catalogue` dans `src/lib/catalogue.ts`, ajouter l'image dans `public/images/products/`, commit + push.

**Q : Peut-on désactiver temporairement un produit ?**
R : Oui, mettre `active: false` dans le catalogue. Le produit n'apparaîtra plus côté public (mais reste en base si déjà commandé).

**Q : Comment voir les logs techniques ?**
R : Vercel Dashboard → Project → Deployments → Cliquer sur le dernier déploiement → Onglet "Functions" → Voir les logs en temps réel.

**Q : Peut-on changer l'adresse de La Fabrik ?**
R : Oui, modifier `PICKUP_LOCATION_ADDRESS` et `PICKUP_LOCATION_HOURS` dans les variables d'environnement Vercel → Redéployer.

**Q : Comment faire un remboursement ?**
R : Aller dans Stripe Dashboard → Payments → Rechercher le paiement → Bouton "Refund" → Confirmer. Le statut de la commande passera automatiquement à "refunded".

---

## 📚 Glossaire

**Admin** : Utilisateur autorisé à accéder à l'interface de gestion (dashboard, commandes, scanner).

**Checkout** : Page de paiement Stripe hébergée où le client saisit sa CB.

**Fulfillment** : Processus de traitement de la commande (expédition ou retrait).

**Hash** : Empreinte cryptographique d'une donnée. Impossible de retrouver la donnée d'origine depuis le hash.

**Idempotence** : Propriété garantissant qu'une action peut être répétée plusieurs fois avec le même résultat (pas de duplication).

**Pickup** : Mode retrait sur place (à La Fabrik).

**QR Code** : Code-barres 2D scannable contenant l'URL de validation du retrait.

**Rate Limiting** : Limitation du nombre de requêtes pour éviter les abus.

**Token** : Code unique aléatoire généré pour identifier un retrait.

**Webhook** : Notification automatique envoyée par Stripe au serveur après un événement (paiement réussi, session expirée).

**Session Stripe** : Session temporaire de paiement (expire après 24h si non utilisée).

**Cron** : Tâche planifiée qui s'exécute automatiquement à intervalles réguliers (ex: toutes les 5 minutes).

**Zustand** : Bibliothèque de gestion d'état côté client (panier).

**Drizzle ORM** : Outil pour interagir avec la base de données en TypeScript.

---

## 📞 Contacts & Support

### Équipe Technique

**Email** : tech@ville.fr
**Pour** : Problèmes techniques, bugs, maintenance

### Support Utilisateurs

**Email** : support@ville.fr
**Pour** : Questions clients, commandes, livraisons

### Urgences

**Téléphone** : +33 1 XX XX XX XX (heures ouvrées)
**Pour** : Site inaccessible, paiements bloqués, problème critique

---

## 📄 Annexes

### Liens Utiles

- **Site Public** : https://boutique.ville-example.fr
- **Admin** : https://boutique.ville-example.fr/admin
- **Repository Git** : https://github.com/votre-municipalite/boutique-phygitale
- **Documentation Technique** : Voir `README.md`, `DEPLOYMENT.md`, `TESTING.md`

### Versions & Changelog

**Version 1.0** (Février 2026)
- ✅ Lancement initial
- ✅ Mode livraison + retrait
- ✅ QR codes sécurisés
- ✅ Interface admin mobile-first
- ✅ Tests E2E complets

---

**Fin de la Notice - Version 1.0**

*Pour toute suggestion d'amélioration de cette notice, contactez tech@ville.fr*
