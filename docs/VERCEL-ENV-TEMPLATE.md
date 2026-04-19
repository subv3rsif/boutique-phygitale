# 🚀 Variables d'Environnement Vercel - Template

⚠️ **Ne commitez jamais vos vrais credentials dans Git !**

## Variables à configurer sur Vercel

Allez sur : **Vercel Dashboard > Settings > Environment Variables**

### Auth Configuration - Admin (Custom)

```bash
# Clé secrète pour signer les sessions admin (générer avec: openssl rand -base64 32)
AUTH_SECRET=<openssl rand -base64 32>

# Credentials administrateur (unique compte pour MVP)
ADMIN_EMAIL=admin@ville.fr
ADMIN_PASSWORD=<openssl rand -base64 32>
```

**Important :** Ces credentials sont utilisés pour `/admin/login`. Générez un mot de passe fort (32+ caractères).

### Auth Configuration - Client (NextAuth + Google OAuth)

Obtenez ces valeurs sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

```bash
GOOGLE_CLIENT_ID=<votre-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-<votre-secret>

# URL d'authentification NextAuth
AUTH_URL=https://votre-domaine.vercel.app
```

**Note :** Google OAuth est optionnel. Les clients peuvent commander sans créer de compte.

### Database & Storage

Obtenez ces valeurs sur [Supabase Dashboard](https://supabase.com/dashboard)

```bash
DATABASE_URL=postgres://postgres.<ref>:<password>@<host>:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### PayFiP (Paiement Public)

Obtenez ces valeurs auprès de votre DGFiP (Direction Générale des Finances Publiques)

```bash
# Configuration PayFiP
PAYFIP_USE_MOCK=false  # true pour développement, false pour production
PAYFIP_NUMCLI=<votre-numero-client>  # Numéro client fourni par la DGFiP
PAYFIP_EXER=2026  # Année d'exercice
PAYFIP_URL=<url-production-payfip>  # URL du service PayFiP production
PAYFIP_MODE=P  # P pour Production, T pour Test
```

### Emails & Infrastructure

```bash
# Resend (emails transactionnels)
RESEND_API_KEY=re_...

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

## 📋 Configuration par Environnement

Marquez ces variables comme **Secret** sur Vercel pour chaque environnement (Production, Preview, Development) :
- `AUTH_SECRET`
- `ADMIN_PASSWORD`
- `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL`
- `PAYFIP_NUMCLI`
- `RESEND_API_KEY`
- `UPSTASH_REDIS_REST_TOKEN`

## ⚠️ Sécurité & Bonnes Pratiques

1. **Pas de credentials en Git** : Utilisez Vercel Environment Variables, jamais `.env.local`
2. **Rotation régulière** : Changez les passwords/tokens tous les 6 mois
3. **AUTH_SECRET >= 32 bytes** : Généralement `base64` de 32 bytes = 43 caractères
4. **Secrets uniques par env** : Production, Preview et Development doivent avoir des valeurs différentes
5. **Logs sécurisés** : N'exposez jamais les credentials dans les logs Vercel

## 🔑 Genération des Secrets

```bash
# Générer AUTH_SECRET ou ADMIN_PASSWORD
openssl rand -base64 32

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
