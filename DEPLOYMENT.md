# Guide de Déploiement - Boutique Phygitale

Ce guide détaille le déploiement de l'application sur Vercel avec toutes les intégrations nécessaires.

## 📋 Pré-requis

Avant de déployer, assurez-vous d'avoir :

- [ ] Un compte Vercel
- [ ] Un compte Supabase avec base de données PostgreSQL configurée
- [ ] Un compte Stripe (mode live activé pour production)
- [ ] Un compte Resend avec domaine vérifié
- [ ] Un compte Upstash Redis
- [ ] Accès au repository Git (GitHub, GitLab, ou Bitbucket)

## 🚀 Étape 1 : Préparer la Base de Données

### 1.1 Configuration Supabase

1. **Créer un projet Supabase** sur [supabase.com](https://supabase.com)

2. **Récupérer les credentials** :
   - Project URL : `https://xxx.supabase.co`
   - Anon/Public Key : `eyJhbGc...`
   - Service Role Key : `eyJhbGc...` (⚠️ Secret, ne jamais exposer côté client)
   - Connection String : `postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres`
   - Direct Connection String : `postgresql://postgres:[password]@db.xxx.supabase.co:6543/postgres`

3. **Appliquer le schéma** :

```bash
# En local, avec DATABASE_URL configuré
npm run db:push

# Ou via l'éditeur SQL de Supabase (copier depuis drizzle/migrations)
```

4. **Activer Row Level Security (RLS)** :

```sql
-- Protéger les tables sensibles
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_consents ENABLE ROW LEVEL SECURITY;

-- Politique admin only (via service role key)
CREATE POLICY "Admin read all" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage all" ON orders FOR ALL TO authenticated USING (true);
-- Répéter pour autres tables
```

### 1.2 Sauvegarder les Credentials

Créer un fichier local (⚠️ **NE PAS COMMITER**) avec tous les credentials :

```
CREDENTIALS.txt (gitignored)
===============

Supabase Project URL: https://xxx.supabase.co
Supabase Anon Key: eyJhbGc...
Supabase Service Role Key: eyJhbGc...
Database URL: postgresql://...
Direct URL: postgresql://...
```

## 🔌 Étape 2 : Configurer Stripe

### 2.1 Mode Production

1. **Activer le mode live** dans Stripe Dashboard
2. **Compléter l'activation** :
   - Informations entreprise (municipalité)
   - SIRET / SIREN
   - Compte bancaire pour virements
   - Vérification identité

### 2.2 Récupérer les Clés Production

```
Stripe Dashboard → Developers → API Keys

Publishable Key: pk_live_...
Secret Key: sk_live_... (⚠️ Secret)
```

### 2.3 Créer les Webhooks

⚠️ **IMPORTANT** : Les webhooks doivent être configurés **après** le déploiement Vercel (besoin de l'URL de production).

On reviendra à cette étape plus tard (voir Étape 6).

## 📧 Étape 3 : Configurer Resend

### 3.1 Vérifier le Domaine

1. **Ajouter un domaine** dans Resend Dashboard
2. **Configurer les DNS** :
   - Ajouter les enregistrements SPF, DKIM, DMARC fournis par Resend
   - Utiliser le sous-domaine `noreply@boutique.ville-example.fr`

3. **Attendre la vérification** (peut prendre 24-48h)

### 3.2 Créer l'API Key

```
Resend Dashboard → API Keys → Create API Key

Name: Boutique Phygitale Production
Permission: Sending access
Domain: boutique.ville-example.fr

API Key: re_... (⚠️ Secret)
```

## ⚡ Étape 4 : Configurer Upstash Redis

### 4.1 Créer une Base Redis

1. **Créer un compte** sur [upstash.com](https://upstash.com)
2. **Créer une base** :
   - Type: Regional (choisir région proche de Vercel: eu-west-1 ou us-east-1)
   - Éviction: No eviction (important pour rate limiting)

### 4.2 Récupérer les Credentials

```
Upstash Dashboard → Database Details

REST URL: https://xxx.upstash.io
REST Token: AYC... (⚠️ Secret)
```

## 🌐 Étape 5 : Déployer sur Vercel

### 5.1 Connecter le Repository

1. **Se connecter** à [vercel.com](https://vercel.com)
2. **New Project** → Importer votre repository Git
3. **Configurer le projet** :
   - Framework Preset: **Next.js** (détecté automatiquement)
   - Root Directory: `./` (ou chemin vers boutique-phygitale)
   - Build Command: `npm run build`
   - Output Directory: `.next` (automatique)
   - Install Command: `npm install`

### 5.2 Configurer les Variables d'Environnement

Dans **Vercel Dashboard → Settings → Environment Variables**, ajouter :

```bash
# Database
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[password]@db.xxx.supabase.co:6543/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe (PRODUCTION)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
# STRIPE_WEBHOOK_SECRET sera ajouté à l'étape 6

# Email
RESEND_API_KEY=re_...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYC...

# App
NEXT_PUBLIC_APP_URL=https://boutique.ville-example.fr
NODE_ENV=production

# Admin
ADMIN_EMAILS=marie@ville.fr,pierre@ville.fr,admin@ville.fr

# Pickup Location (pour emails)
PICKUP_LOCATION_NAME=La Fabrik
PICKUP_LOCATION_ADDRESS=123 Rue de la République, 75001 Paris
PICKUP_LOCATION_HOURS=Lundi-Vendredi 9h-18h, Samedi 10h-16h

# Cron Secret (générer avec: openssl rand -hex 32)
CRON_SECRET=votre_secret_genere_ici

# Sentry (optionnel)
SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz
SENTRY_AUTH_TOKEN=sntrys_...
NEXT_PUBLIC_SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz
```

⚠️ **Environnements** : Appliquer ces variables à **Production**, **Preview**, et **Development**.

### 5.3 Déployer

1. **Cliquer sur "Deploy"**
2. **Attendre le build** (2-3 minutes)
3. **Récupérer l'URL de production** : `https://boutique-xxx.vercel.app`

### 5.4 Configurer le Domaine Personnalisé

1. **Vercel Dashboard → Settings → Domains**
2. **Ajouter** : `boutique.ville-example.fr`
3. **Configurer les DNS** :
   - Type: **CNAME**
   - Name: `boutique`
   - Value: `cname.vercel-dns.com`
4. **Attendre la propagation** (quelques minutes)
5. **HTTPS automatique** via Let's Encrypt (géré par Vercel)

## 🪝 Étape 6 : Configurer les Webhooks Stripe

⚠️ **CRITIQUE** : Le webhook est la source de vérité pour les paiements.

### 6.1 Créer le Webhook

1. **Stripe Dashboard → Developers → Webhooks**
2. **Add endpoint** :
   - **URL** : `https://boutique.ville-example.fr/api/stripe/webhook`
   - **Description** : "Boutique Phygitale - Production"
   - **Version** : Latest API version
   - **Events to send** :
     - ✅ `checkout.session.completed`
     - ✅ `checkout.session.expired`

3. **Révéler le Signing Secret** : `whsec_...`

### 6.2 Ajouter le Secret dans Vercel

1. **Vercel Dashboard → Settings → Environment Variables**
2. **Ajouter** :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
3. **Redéployer** l'application (nécessaire pour prendre en compte la nouvelle variable)

### 6.3 Tester le Webhook

1. **Faire un achat test** en production (carte test Stripe : `4242 4242 4242 4242`)
2. **Vérifier** dans Stripe Dashboard → Webhooks :
   - Event `checkout.session.completed` envoyé
   - Status : **Succeeded** (200 OK)
3. **Vérifier** dans la base de données :
   - Order status = `'paid'`
   - Email ajouté à la queue
4. **Vérifier** l'email reçu

## ⏰ Étape 7 : Configurer le Cron Email

Le cron traite la queue d'emails toutes les 5 minutes.

### 7.1 Vérifier la Configuration

Le fichier `vercel.json` contient déjà :

```json
{
  "crons": [
    {
      "path": "/api/cron/process-email-queue",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### 7.2 Sécuriser l'Endpoint

L'endpoint vérifie un header `Authorization` avec le `CRON_SECRET`.

Vercel Cron envoie automatiquement ce header avec la valeur configurée.

### 7.3 Monitoring

**Vercel Dashboard → Cron Jobs** :
- Voir l'historique d'exécution
- Vérifier les erreurs
- Voir les logs

En cas d'échec répété, vérifier :
- Les credentials Resend
- Les quotas Resend (limite d'envois)
- Les logs dans Vercel

## 🔍 Étape 8 : Tests Post-Déploiement

### 8.1 Checklist Fonctionnelle

- [ ] **Homepage** : Catalogue s'affiche correctement
- [ ] **Panier** : Ajout/modification/suppression fonctionne
- [ ] **Checkout Delivery** :
  - [ ] Session Stripe créée
  - [ ] Paiement avec carte test réussit
  - [ ] Redirect vers page success
  - [ ] Webhook traité (order status = paid)
  - [ ] Email confirmation reçu
- [ ] **Checkout Pickup** :
  - [ ] Paiement réussit
  - [ ] QR code généré
  - [ ] Email avec QR reçu
  - [ ] QR code scanne correctement
- [ ] **Admin** :
  - [ ] Login fonctionne
  - [ ] Dashboard affiche les stats
  - [ ] Liste des commandes visible
  - [ ] Détail commande accessible
  - [ ] "Marquer expédié" fonctionne
  - [ ] Scanner QR valide les retraits

### 8.2 Tests de Sécurité

- [ ] **Rate limiting** : 11ème tentative checkout bloquée
- [ ] **Webhook signature** : Requête sans signature rejetée
- [ ] **Admin auth** : Accès sans login redirige vers /login
- [ ] **HTTPS** : Pas d'avertissement navigateur
- [ ] **Headers** : X-Frame-Options, X-Content-Type-Options présents

### 8.3 Tests de Performance

- [ ] **Lighthouse** :
  - Performance : > 85
  - Accessibility : > 95
  - Best Practices : > 90
  - SEO : > 90
- [ ] **Core Web Vitals** (Vercel Analytics) :
  - LCP : < 2.5s
  - FID : < 100ms
  - CLS : < 0.1

### 8.4 Tests Email

- [ ] Email reçu dans inbox (pas spam)
- [ ] QR code s'affiche correctement
- [ ] Liens cliquables fonctionnent
- [ ] Rendu correct sur mobile (Gmail app, Outlook app)

## 📊 Étape 9 : Monitoring & Alertes

### 9.1 Vercel Analytics (inclus)

Activé automatiquement :
- Visites, pages vues
- Core Web Vitals
- Temps de réponse API

### 9.2 Sentry (recommandé)

Si configuré :
- Capture automatique des erreurs
- Alertes par email/Slack
- Performances API routes
- Webhooks Stripe failures

### 9.3 Uptime Monitoring (externe)

Utiliser un service comme **UptimeRobot** ou **BetterUptime** :
- Vérifier `/api/health` toutes les 5 minutes
- Alertes si down > 2 minutes

### 9.4 Alertes Critiques

Configurer des alertes pour :
- ❌ Webhook Stripe échoue > 3 fois
- ❌ Queue emails bloquée > 50 jobs pending
- ❌ Taux d'erreur API > 5%
- ❌ Site inaccessible > 2 minutes

## 🔄 Étape 10 : Mise à Jour & Rollback

### 10.1 Déploiement de Mises à Jour

```bash
# En local
git add .
git commit -m "feat: description de la feature"
git push origin main

# Vercel détecte automatiquement et déploie
```

### 10.2 Preview Deployments

Chaque **Pull Request** crée un déploiement preview :
- URL unique : `https://boutique-xxx-preview.vercel.app`
- Permet de tester avant merge
- Variables d'environnement "Preview" utilisées

### 10.3 Rollback Rapide

Si déploiement cassé :

1. **Vercel Dashboard → Deployments**
2. **Sélectionner** le dernier déploiement fonctionnel
3. **Bouton** "Promote to Production"
4. **Confirmer**

Rollback instantané (< 30 secondes).

## 🛡️ Étape 11 : Sécurité Post-Déploiement

### 11.1 Audit de Sécurité

- [ ] Secrets jamais exposés dans le code source
- [ ] `.env.local` bien dans `.gitignore`
- [ ] Stripe en mode live (pas de clés test)
- [ ] ADMIN_EMAILS restreint aux vrais admins
- [ ] CRON_SECRET fort (32+ caractères)
- [ ] HTTPS forcé (automatique sur Vercel)

### 11.2 Permissions Supabase

- [ ] Service Role Key jamais exposé côté client
- [ ] RLS activé sur toutes les tables
- [ ] Policies restrictives (admin only)

### 11.3 Conformité RGPD

- [ ] Mentions légales accessibles
- [ ] Politique de confidentialité accessible
- [ ] CGV accessibles
- [ ] Checkbox consentement obligatoire
- [ ] Email contact DPO/support disponible
- [ ] Procédure droit d'accès/suppression documentée

## 📞 Support & Maintenance

### Contacts Techniques

- **Vercel** : [vercel.com/support](https://vercel.com/support)
- **Stripe** : [support.stripe.com](https://support.stripe.com)
- **Resend** : [resend.com/support](https://resend.com/support)
- **Supabase** : [supabase.com/support](https://supabase.com/support)

### Logs & Debug

**Vercel Runtime Logs** :
```bash
vercel logs [deployment-url]
```

**Stripe Event History** :
- Dashboard → Developers → Events
- Voir tous les webhooks envoyés/échoués

**Resend Email Logs** :
- Dashboard → Logs
- Voir statut de chaque email (sent/bounced/opened)

## ✅ Checklist Complète

### Avant le Lancement

- [ ] Base de données migrée et sécurisée (RLS)
- [ ] Toutes les variables d'environnement configurées
- [ ] Domaine personnalisé configuré et vérifié
- [ ] Webhook Stripe configuré et testé
- [ ] Email domaine vérifié (Resend)
- [ ] Cron emails fonctionnel
- [ ] Admin emails configurés
- [ ] Tests E2E passés (delivery + pickup)
- [ ] Responsive mobile vérifié
- [ ] Pages légales complétées
- [ ] QR codes testés avec scanner physique
- [ ] Monitoring activé (Vercel + optionnel Sentry)

### Après le Lancement

- [ ] Vérifier transactions réelles (premières commandes)
- [ ] Monitoring quotidien (premiers jours)
- [ ] Collecter feedback utilisateurs
- [ ] Ajuster si nécessaire (stock, shipping costs, etc.)

---

**🎉 Félicitations ! Votre boutique phygitale est maintenant en production.**

Pour toute question, référez-vous à la documentation technique dans `README.md` ou contactez l'équipe de développement.
