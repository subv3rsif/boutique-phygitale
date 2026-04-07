# Guide de Configuration des Variables d'Environnement

Ce guide détaille toutes les variables d'environnement nécessaires pour faire fonctionner la boutique phygitale 1885.

## 📋 Table des matières

- [Configuration Minimale (Développement)](#configuration-minimale-développement)
- [Configuration Complète (Production)](#configuration-complète-production)
- [Guide Détaillé par Service](#guide-détaillé-par-service)

---

## ⚡ Configuration Minimale (Développement)

Pour démarrer en développement local, vous avez besoin **au minimum** de :

```bash
# Base de données (obligatoire)
DATABASE_URL=postgresql://postgres:password@localhost:5432/boutique1885
DIRECT_URL=postgresql://postgres:password@localhost:5432/boutique1885

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Admin (pour accéder au backoffice)
ADMIN_EMAILS=votre-email@example.com
ADMIN_PASSWORD=dev123

# NextAuth
NEXTAUTH_SECRET=votre_secret_genere_avec_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (pour l'authentification admin)
GOOGLE_CLIENT_ID=votre_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_client_secret

# PayFiP en mode mock (pas besoin de vrais credentials)
PAYFIP_USE_MOCK=true
PAYFIP_NUMCLI=999999999999999
PAYFIP_EXER=2026
PAYFIP_URL=https://www.tipi.budget.gouv.fr/tpa/services/securite
PAYFIP_MODE=T
```

---

## 🚀 Configuration Complète (Production)

Pour un déploiement en production sur Vercel, créez un fichier `.env.production` :

```bash
# ============================================================================
# BASE DE DONNÉES
# ============================================================================

# URL de connexion principale (via connection pooler)
# Récupérer depuis Supabase : Settings > Database > Connection Pooling
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# URL de connexion directe (pour les migrations Drizzle)
# Récupérer depuis Supabase : Settings > Database > Connection String
DIRECT_URL=postgresql://postgres.xxx:password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres

# ============================================================================
# SUPABASE
# ============================================================================

# URL du projet Supabase (visible dans Dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Clé anonyme publique (API Settings > Project API keys > anon public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clé service role (pour opérations admin/serveur uniquement)
# API Settings > Project API keys > service_role (⚠️ GARDER SECRÈTE)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================================================
# EMAILS (RESEND)
# ============================================================================

# Clé API Resend
# Récupérer depuis : https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Adresse email expéditeur (doit être vérifiée dans Resend)
EMAIL_FROM=noreply@votre-domaine.fr

# ============================================================================
# UPSTASH REDIS (Rate Limiting)
# ============================================================================

# URL REST de votre instance Redis
# Récupérer depuis : https://console.upstash.com/redis
UPSTASH_REDIS_REST_URL=https://xxxxxxxxx.upstash.io

# Token REST
UPSTASH_REDIS_REST_TOKEN=AYCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================================================
# APPLICATION
# ============================================================================

# URL publique de l'application
NEXT_PUBLIC_APP_URL=https://boutique.ville-alfortville.fr

# Environnement
NODE_ENV=production

# ============================================================================
# AUTHENTIFICATION ADMIN
# ============================================================================

# Emails autorisés à accéder au backoffice (séparés par virgules)
ADMIN_EMAILS=marie.dupont@ville.fr,pierre.martin@ville.fr,admin@ville.fr

# Mot de passe admin simple (pour dev/backup)
ADMIN_PASSWORD=VotreMotDePasseSecurise2026!

# ============================================================================
# NEXTAUTH (Google OAuth)
# ============================================================================

# Secret NextAuth (générer avec : openssl rand -base64 32)
NEXTAUTH_SECRET=VotreSecretGenerePourProduction123456789

# URL de l'application (même valeur que NEXT_PUBLIC_APP_URL)
NEXTAUTH_URL=https://boutique.ville-alfortville.fr

# Google OAuth Client ID
# Obtenir depuis : https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Google OAuth Client Secret
GOOGLE_CLIENT_SECRET=your-client-secret-here

# ============================================================================
# LIEU DE RETRAIT
# ============================================================================

# Nom du point de retrait
NEXT_PUBLIC_PICKUP_LOCATION_NAME=La Fabrik

# Adresse complète
NEXT_PUBLIC_PICKUP_LOCATION_ADDRESS=36 Rue Véron, 94140 Alfortville

# Horaires d'ouverture
NEXT_PUBLIC_PICKUP_LOCATION_HOURS=Lundi-Vendredi 14h-18h, Samedi 10h-12h

# ============================================================================
# CRON (Tâches planifiées)
# ============================================================================

# Secret pour sécuriser les endpoints cron
# Générer avec : openssl rand -hex 32
CRON_SECRET=votre_secret_cron_aleatoire_securise

# ============================================================================
# SENTRY (Monitoring d'erreurs - OPTIONNEL)
# ============================================================================

# DSN public (exposé côté client - utilisé pour capturer les erreurs frontend)
# Récupérer depuis : https://sentry.io/settings/[org]/projects/[project]/keys/
NEXT_PUBLIC_SENTRY_DSN=https://your-public-key@oXXXXXXXXXXXXXXXX.ingest.de.sentry.io/XXXXXXXXXX

# Token d'authentification Sentry (pour upload des source maps)
# Récupérer depuis : https://sentry.io/settings/account/api/auth-tokens/
SENTRY_AUTH_TOKEN=your_sentry_auth_token_here

# Organisation Sentry (nom de votre organisation)
SENTRY_ORG=your-org-name

# Nom du projet Sentry
SENTRY_PROJECT=your-project-name

# Clé publique Sentry (extraite du DSN)
SENTRY_PUBLIC_KEY=your-public-key-here

# URL OTLP pour les traces (OpenTelemetry)
# Récupérer depuis : Sentry > Settings > Developer Settings
SENTRY_OTLP_TRACES_URL=https://oXXXXXXXXXXXXXXXX.ingest.de.sentry.io/api/XXXXXXXXXX/integration/otlp/v1/traces

# URL du log drain Vercel (pour collecter les logs Vercel dans Sentry)
# Récupérer depuis : Sentry > Settings > Integrations > Vercel
SENTRY_VERCEL_LOG_DRAIN_URL=https://oXXXXXXXXXXXXXXXX.ingest.de.sentry.io/api/XXXXXXXXXX/integration/vercel/logs/

# ============================================================================
# PAYFIP (Paiement Tipi Régie)
# ============================================================================

# Mode Mock (true = mode test sans vraie connexion)
PAYFIP_USE_MOCK=false

# Numéro client Tipi (15 chiffres fournis par la DGFiP)
PAYFIP_NUMCLI=123456789012345

# Exercice budgétaire (année fiscale)
PAYFIP_EXER=2026

# URL du service Tipi (production)
PAYFIP_URL=https://www.tipi.budget.gouv.fr/tpa/services/securite

# Mode : T = Test, X = Production
PAYFIP_MODE=X
```

---

## 📖 Guide Détaillé par Service

### 1️⃣ Base de Données (Supabase PostgreSQL)

**Où les obtenir :**
1. Créer un projet sur [Supabase](https://supabase.com)
2. Aller dans `Settings` > `Database`
3. Copier les deux URLs :
   - **Connection Pooling** → `DATABASE_URL` (port 6543)
   - **Connection String** → `DIRECT_URL` (port 5432)

**Variables requises :**
```bash
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

**Notes importantes :**
- `DATABASE_URL` utilise le pooler (port 6543) pour les requêtes Next.js
- `DIRECT_URL` utilise la connexion directe (port 5432) pour Drizzle ORM migrations
- ⚠️ **Ne jamais commiter le mot de passe** dans git

---

### 2️⃣ Supabase Storage & API

**Où les obtenir :**
1. Dans votre projet Supabase : `Settings` > `API`
2. Copier :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

**Variables requises :**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (clé publique, safe)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (⚠️ SECRÈTE - serveur uniquement)
```

**Configuration Storage (obligatoire) :**
1. Aller dans `Storage` > `Create a new bucket`
2. Nom : `products`
3. Public : ✅ **Activé**
4. Policies RLS :
   - **SELECT** : Public (anyone can view)
   - **INSERT/UPDATE/DELETE** : Authenticated users only

---

### 3️⃣ Emails (Resend)

**Où les obtenir :**
1. Créer un compte sur [Resend](https://resend.com)
2. Aller dans `API Keys` > `Create API Key`
3. Vérifier votre domaine dans `Domains` > `Add Domain`

**Variables requises :**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@votre-domaine.fr
```

**Configuration domaine :**
- Ajouter les enregistrements DNS (MX, TXT, CNAME)
- Attendre validation (~24h)
- Si pas de domaine custom : utiliser `onboarding@resend.dev` (100 emails/jour max)

---

### 4️⃣ Rate Limiting (Upstash Redis)

**Où les obtenir :**
1. Créer un compte sur [Upstash](https://console.upstash.com)
2. Créer une base Redis (région : `eu-central-1` recommandée)
3. Copier les credentials REST

**Variables requises :**
```bash
UPSTASH_REDIS_REST_URL=https://xxxxxxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Note :** Plan gratuit = 10,000 commandes/jour (largement suffisant)

---

### 5️⃣ Google OAuth (Authentification Admin)

**Où les obtenir :**
1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un projet (ou utiliser existant)
3. `APIs & Services` > `Credentials` > `Create Credentials` > `OAuth 2.0 Client ID`
4. Type : `Web application`
5. **Authorized redirect URIs** :
   - Development : `http://localhost:3000/api/auth/callback/google`
   - Production : `https://votre-domaine.fr/api/auth/callback/google`

**Variables requises :**
```bash
NEXTAUTH_SECRET=VotreSecretGenereAvecOpenSSL
NEXTAUTH_URL=https://votre-domaine.fr
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

**Générer NEXTAUTH_SECRET :**
```bash
openssl rand -base64 32
```

---

### 6️⃣ PayFiP (Paiement Tipi Régie)

**Mode Développement (Mock) :**
```bash
PAYFIP_USE_MOCK=true
PAYFIP_NUMCLI=999999999999999
PAYFIP_EXER=2026
PAYFIP_URL=https://www.tipi.budget.gouv.fr/tpa/services/securite
PAYFIP_MODE=T
```

**Mode Production (Réel) :**
1. Contacter la DGFiP pour obtenir vos identifiants Tipi
2. Récupérer votre `NUMCLI` (15 chiffres)
3. Configurer :

```bash
PAYFIP_USE_MOCK=false
PAYFIP_NUMCLI=123456789012345  # Fourni par DGFiP
PAYFIP_EXER=2026               # Année fiscale
PAYFIP_URL=https://www.tipi.budget.gouv.fr/tpa/services/securite
PAYFIP_MODE=X                  # X = Production, T = Test
```

---

### 7️⃣ Sentry (Monitoring - OPTIONNEL)

**Où les obtenir :**
1. Créer un compte sur [Sentry.io](https://sentry.io)
2. Créer un projet Next.js
3. Récupérer les credentials :

**Pour le DSN (Client Keys) :**
- Aller dans `Settings` > `Projects` > `[Votre Projet]` > `Client Keys (DSN)`
- Copier le DSN public → `NEXT_PUBLIC_SENTRY_DSN`
- Extraire la clé publique (partie avant le @) → `SENTRY_PUBLIC_KEY`

**Pour l'Auth Token :**
- Aller dans `Settings` > `Account` > `API` > `Auth Tokens`
- Créer un nouveau token avec les permissions :
  - `project:read`
  - `project:releases`
  - `org:read`
- Copier le token → `SENTRY_AUTH_TOKEN`

**Pour l'intégration Vercel :**
- Aller dans `Settings` > `Integrations` > `Vercel`
- Connecter votre compte Vercel
- Copier l'URL du log drain → `SENTRY_VERCEL_LOG_DRAIN_URL`

**Variables requises :**
```bash
# DSN public (frontend error tracking)
NEXT_PUBLIC_SENTRY_DSN=https://your-key@oXXXXXX.ingest.de.sentry.io/XXXXXX

# Auth token (pour upload source maps)
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Organisation et projet
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name

# Clé publique (extraite du DSN)
SENTRY_PUBLIC_KEY=your-public-key

# OTLP Traces URL (OpenTelemetry - optionnel)
SENTRY_OTLP_TRACES_URL=https://oXXXXXX.ingest.de.sentry.io/api/XXXXXX/integration/otlp/v1/traces

# Vercel Log Drain (optionnel - pour collecter les logs Vercel)
SENTRY_VERCEL_LOG_DRAIN_URL=https://oXXXXXX.ingest.de.sentry.io/api/XXXXXX/integration/vercel/logs/
```

**Configuration Vercel :**
1. Dans votre projet Vercel : `Settings` > `Integrations`
2. Installer l'intégration Sentry
3. Sentry configurera automatiquement `SENTRY_VERCEL_LOG_DRAIN_URL`

**Note :**
- Facultatif pour MVP, **fortement recommandé pour production**
- Le plan gratuit inclut 5,000 erreurs/mois (largement suffisant pour démarrer)
- Active le source mapping automatique pour debug les erreurs minified

---

## 🔒 Sécurité

### Variables à JAMAIS exposer publiquement :

❌ **NE PAS COMMITER :**
- `DATABASE_URL` / `DIRECT_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_SECRET`
- `UPSTASH_REDIS_REST_TOKEN`
- `ADMIN_PASSWORD`
- `PAYFIP_NUMCLI`
- `CRON_SECRET`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_PUBLIC_KEY` (peut être reconstruit depuis DSN)
- `SENTRY_VERCEL_LOG_DRAIN_URL`

✅ **Safe pour client-side (NEXT_PUBLIC_*) :**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PICKUP_LOCATION_*`
- `NEXT_PUBLIC_SENTRY_DSN`

---

## 📝 Checklist de Configuration

### Développement Local
- [ ] Créer un fichier `.env.local` à la racine
- [ ] Copier les variables minimales depuis ce guide
- [ ] Générer `NEXTAUTH_SECRET` avec `openssl rand -base64 32`
- [ ] Configurer Google OAuth avec `http://localhost:3000` comme redirect URI
- [ ] Vérifier la connexion DB avec `npm run db:studio`

### Production (Vercel)
- [ ] Aller dans Vercel Dashboard > `Settings` > `Environment Variables`
- [ ] Ajouter TOUTES les variables de production (copier depuis `.env.production`)
- [ ] Vérifier les redirect URIs Google OAuth (ajouter votre domaine Vercel)
- [ ] Configurer le bucket Supabase `products` en public
- [ ] Vérifier le domaine email dans Resend
- [ ] Tester le paiement en mode `PAYFIP_MODE=T` avant de passer en `X`

---

## 🐛 Dépannage

### Erreur : "DATABASE_URL is not set"
→ Vérifier que `.env.local` existe et contient `DATABASE_URL`

### Erreur : "SUPABASE_SERVICE_ROLE_KEY is not defined"
→ Copier la clé `service_role` depuis Supabase API Settings

### Erreur : "Invalid OAuth redirect URI"
→ Ajouter l'URI dans Google Cloud Console :
- Dev : `http://localhost:3000/api/auth/callback/google`
- Prod : `https://votre-domaine.vercel.app/api/auth/callback/google`

### Upload d'images échoue
→ Vérifier que le bucket `products` existe dans Supabase Storage et est public

### Emails ne partent pas
→ Vérifier que le domaine est vérifié dans Resend ou utiliser `onboarding@resend.dev`

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Resend](https://resend.com/docs)
- [Documentation Upstash](https://upstash.com/docs/redis)
- [Documentation NextAuth](https://next-auth.js.org/getting-started)
- [Documentation Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Documentation Tipi PayFiP](https://www.economie.gouv.fr/dgfip/professionnels/tipi-titres-payes-internet)

---

**Dernière mise à jour :** 31 mars 2026
**Version :** 1.0.0
