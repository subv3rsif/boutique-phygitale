# Configuration Variables d'Environnement Vercel

## 🚨 Problème Actuel

La page `/admin/login` a une boucle de redirection infinie car **NextAuth ne peut pas fonctionner sans `NEXTAUTH_URL`**.

## ✅ Variables à Configurer sur Vercel

### 1. NextAuth (OBLIGATOIRE)

```bash
NEXTAUTH_URL=https://boutique-phygitale.vercel.app
AUTH_SECRET=VOTRE_AUTH_SECRET_ICI
```

⚠️ **Générez un AUTH_SECRET** avec : `openssl rand -base64 32`

### 2. Google OAuth (OBLIGATOIRE pour NextAuth)

```bash
GOOGLE_CLIENT_ID=VOTRE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-VOTRE_SECRET
```

⚠️ **Remplacez avec vos vraies credentials** depuis https://console.cloud.google.com/

### 3. Database (OBLIGATOIRE)

```bash
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/postgres?sslmode=require
```

⚠️ **Utilisez votre vraie DATABASE_URL** depuis Supabase

### 4. Admin Auth (OBLIGATOIRE)

```bash
ADMIN_EMAIL=admin@test.local
ADMIN_PASSWORD=admin123
ADMIN_EMAILS=germain.lefranc@gmail.com,admin@ville.fr
```

### 5. Supabase Storage (OBLIGATOIRE)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=VOTRE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=VOTRE_SERVICE_ROLE_KEY
```

⚠️ **Récupérez vos clés** depuis Supabase Dashboard → Settings → API

### 6. App Config

```bash
NEXT_PUBLIC_APP_URL=https://boutique-phygitale.vercel.app
NODE_ENV=production
```

### 7. Pickup Location (public)

```bash
NEXT_PUBLIC_PICKUP_LOCATION_NAME=La Fabrik
NEXT_PUBLIC_PICKUP_LOCATION_ADDRESS=123 Rue de la République, 75001 Paris
NEXT_PUBLIC_PICKUP_LOCATION_HOURS=Lundi-Vendredi 9h-18h
```

### 8. PayFiP (si utilisé)

```bash
PAYFIP_USE_MOCK=false
PAYFIP_NUMCLI=VOTRE_NUMCLI
PAYFIP_EXER=2026
PAYFIP_URL=https://url-payfip-production
PAYFIP_MODE=P
```

## 📋 Comment Configurer sur Vercel

### Méthode 1 : Dashboard Vercel (Recommandé)

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet `boutique-phygitale`
3. Aller dans **Settings** → **Environment Variables**
4. Cliquer sur **Add New**
5. Pour chaque variable ci-dessus :
   - Nom : `NEXTAUTH_URL`
   - Value : `https://boutique-phygitale.vercel.app`
   - Environment : Cocher **Production**, **Preview**, **Development**
   - Cliquer **Save**

### Méthode 2 : CLI Vercel (si installée)

```bash
# Installer la CLI
npm i -g vercel

# Login
vercel login

# Lier le projet
vercel link

# Ajouter les variables
vercel env add NEXTAUTH_URL production
# Entrer la valeur : https://boutique-phygitale.vercel.app

# Répéter pour chaque variable
```

## 🔄 Après Configuration

1. **Redéployer** l'application :
   - Soit en poussant un nouveau commit
   - Soit via le dashboard Vercel : **Deployments** → **Redeploy**

2. **Tester** : https://boutique-phygitale.vercel.app/admin/login

## ✅ Vérification

Une fois les variables configurées et le déploiement terminé :

1. La page `/admin/login` devrait se charger normalement
2. Pas de boucle de redirection
3. Le formulaire de connexion devrait s'afficher

## 🔍 Debug

Si le problème persiste :

1. Vérifier les logs Vercel : **Deployments** → votre déploiement → **Functions**
2. Vérifier que toutes les variables sont bien configurées : **Settings** → **Environment Variables**
3. Forcer un redéploiement : **Deployments** → **Redeploy**

## ⚠️ Note Importante

Le middleware est actuellement désactivé (voir `MIDDLEWARE_DISABLED_README.md`). Les routes admin ne sont donc protégées que par le layout admin (`src/app/admin/layout.tsx`) qui vérifie l'authentification via `requireAdminAuth()`.

Une fois NextAuth configuré correctement, le middleware pourra être réactivé :
```bash
mv src/middleware.ts.disabled src/middleware.ts
git add src/middleware.ts
git commit -m "Re-enable middleware after NextAuth configuration"
git push
```
