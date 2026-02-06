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

Le catalogue est défini dans `src/lib/catalogue.ts` avec 3 produits de démonstration.

Pour ajouter/modifier des produits, éditer ce fichier (migration vers DB possible plus tard).

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

- [ ] Variables d'environnement configurées (production)
- [ ] Webhook Stripe configuré et testé
- [ ] Emails testés (inbox + spam)
- [ ] Stripe en mode live (clés production)
- [ ] Mentions légales, CGV, politique de confidentialité complétées
- [ ] Admin emails configurés
- [ ] QR codes testés avec scanner réel
- [ ] Tests E2E passés (delivery + pickup)
- [ ] Rate limiting vérifié
- [ ] Responsive mobile testé

## 🤝 Support

Pour toute question ou problème, contacter l'équipe technique de la municipalité.

## 📝 License

Propriété de la municipalité.
