# Boutique Phygitale Municipale

Une boutique en ligne "phygitale" pour une municipalité française, permettant la vente de goodies avec paiement Stripe et deux modes de fulfillment (livraison La Poste / retrait sur place).

## 🚀 Stack Technique

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Hosting**: Vercel
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Paiement**: Stripe Checkout
- **Email**: Resend avec React Email
- **State Management**: Zustand (panier)
- **Validation**: Zod
- **QR Code**: qrcode library
- **Rate Limiting**: Upstash Redis
- **UI**: Shadcn/ui + Tailwind CSS
- **Testing**: Vitest + Testing Library

## ✨ Fonctionnalités

### Pour les clients
- 🛒 Catalogue de produits avec panier
- 💳 Paiement sécurisé via Stripe
- 📦 Deux modes de livraison :
  - Livraison à domicile (La Poste)
  - Retrait sur place (avec QR code)
- 📧 Emails de confirmation automatiques
- 📱 QR codes pour les retraits
- ✅ Conforme RGPD

### Pour les administrateurs
- 📊 Dashboard avec statistiques
- 📋 Gestion des commandes
- 🚚 Marquage des expéditions avec tracking
- 📲 Scanner QR pour validation des retraits
- 📧 Renvoi des emails de confirmation

## 🛠️ Installation

### Prérequis

- Node.js 18+ et npm
- Compte Supabase (PostgreSQL)
- Compte Stripe (test/production)
- Compte Resend (emails)
- Compte Upstash (Redis pour rate limiting)

### Configuration

1. **Cloner et installer**
```bash
npm install
```

2. **Configurer les variables d'environnement**

Copier `.env.example` vers `.env.local` et remplir les valeurs :

```bash
cp .env.example .env.local
```

Variables requises :
- `DATABASE_URL` : Connexion PostgreSQL Supabase
- `STRIPE_SECRET_KEY` : Clé secrète Stripe
- `RESEND_API_KEY` : Clé API Resend
- `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN` : Credentials Upstash
- `ADMIN_EMAILS` : Emails autorisés pour l'admin (séparés par virgules)

3. **Initialiser la base de données**

```bash
# Générer les migrations
npm run db:generate

# Appliquer les migrations
npm run db:push

# Optionnel : Ouvrir Drizzle Studio pour visualiser la DB
npm run db:studio
```

4. **Configurer Stripe Webhook (développement local)**

Dans un terminal séparé :
```bash
npm run stripe:listen
```

Copier le webhook secret affiché et l'ajouter dans `.env.local` :
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🚦 Commandes

### Développement

```bash
# Démarrer le serveur de développement
npm run dev

# Ouvrir http://localhost:3000
```

### Tests

```bash
# Lancer les tests unitaires
npm run test

# Tests en mode watch
npm run test:watch

# Vérification TypeScript
npm run type-check

# Linter
npm run lint
```

### Production

```bash
# Build production
npm run build

# Démarrer en mode production
npm run start
```

### Base de données

```bash
# Générer les migrations après modification du schema
npm run db:generate

# Appliquer les migrations
npm run db:push

# Ouvrir Drizzle Studio (interface visuelle)
npm run db:studio
```

## 📁 Structure du Projet

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Routes publiques
│   │   ├── page.tsx              # Catalogue produits
│   │   ├── panier/               # Panier et checkout
│   │   ├── commande/             # Confirmation et détails
│   │   └── retrait/              # Validation QR pickup
│   ├── admin/                    # Interface admin
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── products/             # Gestion catalogue
│   │   └── pickup/
│   └── api/                      # API Routes
│       ├── checkout/             # Création session Stripe
│       ├── stripe/webhook/       # Webhooks Stripe
│       ├── admin/                # Endpoints admin
│       └── cron/                 # Tâches planifiées
├── components/                   # Composants React
│   ├── ui/                       # Composants Shadcn
│   ├── cart/                     # Panier
│   ├── product/                  # Produits
│   └── admin/                    # Admin
├── lib/                          # Utilitaires
│   ├── db/                       # Database (schema, clients)
│   ├── stripe/                   # Stripe helpers
│   ├── email/                    # Email queue & templates
│   ├── qr/                       # Génération QR codes
│   ├── catalogue.ts              # Catalogue produits
│   ├── validations.ts            # Schemas Zod
│   └── utils.ts                  # Helpers
├── store/                        # Zustand stores
│   └── cart.ts                   # État du panier
└── middleware.ts                 # Protection routes admin
```

## 🔒 Sécurité

### Principes critiques

1. **Recalcul serveur des montants** : Tous les prix sont recalculés côté serveur depuis le catalogue, jamais depuis le payload client

2. **Webhook comme source de vérité** : La confirmation de paiement vient UNIQUEMENT du webhook Stripe `checkout.session.completed`

3. **Tokens hashés** : Les tokens QR sont stockés hashés (SHA-256) en base de données, jamais en clair

4. **Rate limiting** : Protection contre les abus (10 sessions checkout/heure par IP)

5. **Idempotence** : Les webhooks Stripe sont traités de manière idempotente via la table `stripe_events`

### En-têtes de sécurité

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📧 Système d'Emails

Les emails sont gérés via une queue avec retry automatique :

- **delivery_confirmation** : Confirmation commande en livraison
- **pickup_confirmation** : Confirmation avec QR code pour retrait
- **shipped_notification** : Notification d'expédition avec tracking

La queue traite les emails en arrière-plan avec backoff exponentiel en cas d'échec (5 tentatives max).

## 🔄 Workflow de Commande

### Mode Livraison
1. Client ajoute produits au panier
2. Sélectionne mode "Livraison"
3. Accepte consentement RGPD
4. Paiement via Stripe Checkout
5. Webhook Stripe confirme paiement → statut "paid"
6. Email de confirmation envoyé
7. Admin marque "expédié" avec tracking
8. Email avec numéro de suivi envoyé

### Mode Retrait
1. Client ajoute produits au panier
2. Sélectionne mode "Retrait"
3. Accepte consentement RGPD
4. Paiement via Stripe Checkout (sans frais de port)
5. Webhook Stripe confirme paiement → génération QR code
6. Email avec QR code envoyé
7. Client présente QR à La Fabrik
8. Admin scanne et valide → statut "fulfilled"

## 🎨 Catalogue Produits

### Gestion via Interface Admin

Le catalogue de produits est désormais géré via l'interface admin à `/admin/products` (nécessite authentification admin).

**Fonctionnalités :**
- Créer, modifier, supprimer des produits
- Galerie multi-images (jusqu'à 5 images par produit)
- Gestion du stock avec alertes automatiques
- Historique des mouvements de stock
- Décrémentation automatique du stock lors des ventes

**Format d'image recommandé :** 600×750px (ratio 4:5)

### Variables d'Environnement

Requises pour le catalogue produits :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
ADMIN_EMAILS=admin@example.com,webmaster@example.com
```

### Schéma Base de Données

Les produits sont stockés dans PostgreSQL avec :
- Table `products` : Catalogue produits avec images JSONB
- Table `stock_movements` : Historique des mouvements de stock

Exécuter les migrations :
```bash
npm run db:push
```

### Configuration Supabase Storage

1. **Créer un bucket "products"** dans Supabase Storage
2. **Rendre le bucket public** pour permettre l'affichage des images
3. **Configurer les permissions** :
   - Lecture publique (pour affichage frontend)
   - Écriture restreinte (via service role key pour upload admin)

### Alertes Stock

Emails automatiques envoyés aux ADMIN_EMAILS lorsque :
- Le stock atteint le seuil d'alerte (avertissement stock faible)
- Le stock atteint zéro (rupture de stock, produit auto-désactivé)
- Produit réactivé lorsque du stock est ajouté

### Migration depuis catalogue.ts

Les produits précédemment dans `src/lib/catalogue.ts` doivent être migrés vers la base de données via l'interface admin.

**Étapes de migration :**
1. Se connecter à `/admin/products`
2. Créer manuellement chaque produit depuis le formulaire
3. Uploader les images depuis `/public/images/products/`
4. Vérifier que tous les produits sont visibles sur la homepage
5. Une fois la migration confirmée, `catalogue.ts` peut être supprimé en toute sécurité

**Note :** Le fichier `catalogue.ts` est conservé temporairement pour référence. Ne pas le supprimer avant d'avoir vérifié que tous les produits sont correctement migrés dans la base de données.

## 📊 Admin

Accès admin restreint aux emails listés dans `ADMIN_EMAILS`.

Routes protégées par middleware + Supabase Auth.

### Fonctionnalités
- Dashboard avec stats (CA, commandes en attente, etc.)
- Liste des commandes avec filtres
- Détails de chaque commande
- Marquer comme expédié (+ tracking)
- Scanner QR pour validation retraits
- Renvoyer emails de confirmation
- **Gestion du catalogue produits** (créer/modifier/supprimer)
- **Gestion du stock** avec historique et alertes automatiques

## 🚀 Déploiement Vercel

1. **Connecter le repo à Vercel**
2. **Configurer les variables d'environnement** (voir `.env.example`)
3. **Configurer le webhook Stripe en production** :
   - Aller dans Stripe Dashboard → Webhooks
   - Ajouter endpoint : `https://votre-domaine.vercel.app/api/stripe/webhook`
   - Sélectionner événements : `checkout.session.completed`, `checkout.session.expired`
   - Copier le signing secret dans `STRIPE_WEBHOOK_SECRET`
4. **Configurer le cron pour la queue emails** :
   - Ajouter dans `vercel.json` (déjà configuré)
5. **Build & Deploy**

## 📋 Checklist Pré-Lancement

### Infrastructure
- [ ] Variables d'environnement configurées (production)
- [ ] Webhook Stripe configuré et testé
- [ ] Supabase Storage bucket "products" créé et public
- [ ] Migrations base de données appliquées (tables products, stock_movements)
- [ ] Admin emails configurés (ADMIN_EMAILS)

### Produits & Catalogue
- [ ] Tous les produits migrés vers la base de données
- [ ] Images produits uploadées (format 600×750px recommandé)
- [ ] Stocks initiaux configurés
- [ ] Seuils d'alerte stock définis
- [ ] Catalogue.ts supprimé (après validation migration)

### Paiement & Emails
- [ ] Emails testés (inbox + spam)
- [ ] Stripe en mode live (clés production)
- [ ] Alertes stock testées (email envoyé aux admins)
- [ ] QR codes testés avec scanner réel
- [ ] Tests E2E passés (delivery + pickup)

### Légal & Sécurité
- [ ] Mentions légales, CGV, politique de confidentialité complétées
- [ ] Rate limiting vérifié
- [ ] Webhook Stripe signature validée

### UX & Testing
- [ ] Homepage affiche produits depuis database
- [ ] Responsive mobile testé
- [ ] Admin peut créer/modifier produits
- [ ] Stock se décrémente automatiquement lors des ventes
- [ ] Email d'alerte reçu quand stock faible/épuisé

## 🤝 Support

Pour toute question ou problème, contacter l'équipe technique de la municipalité.

## 📝 License

Propriété de la municipalité.
