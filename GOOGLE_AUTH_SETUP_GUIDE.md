# 🔐 Google Auth Setup Guide - Finalisation

**Status**: Code installé ✅ | Configuration requise ⚠️

---

## 📊 Ce Qui Est Déjà Fait

### ✅ Phase 1 : Design Improvements (Terminé)
- Desktop header équilibré
- DrawerMenu Love Symbol premium
- Mobile floating hamburger
- BottomNav cart Love Symbol

### ✅ Phase 2 : Google Auth Code (Terminé)
- NextAuth v5 installé
- Database schema (users, accounts, sessions)
- Auth config (`src/lib/auth/config.ts`)
- API routes (`/api/auth/[...nextauth]`)
- Login page (`/connexion`)
- Protected profile page (`/profil`)
- Avatar component
- TypeScript types

---

## ⚠️ Configuration Requise

### 1. Google Cloud Console OAuth Setup

#### Étape 1: Créer un Projet Google Cloud
1. Aller sur https://console.cloud.google.com
2. Créer un nouveau projet "Boutique 1885"
3. Sélectionner le projet

#### Étape 2: Activer Google+ API
1. Menu "APIs & Services" > "Library"
2. Rechercher "Google+ API"
3. Cliquer "Enable"

#### Étape 3: Créer OAuth 2.0 Client ID
1. Menu "APIs & Services" > "Credentials"
2. Cliquer "Create Credentials" > "OAuth 2.0 Client ID"
3. Configure consent screen (si demandé) :
   - User Type: External
   - App name: Boutique 1885
   - User support email: votre email
   - Developer contact: votre email
4. Application type: **Web application**
5. Name: "Boutique 1885 Web"
6. Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://votre-domaine.vercel.app
   ```
7. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://votre-domaine.vercel.app/api/auth/callback/google
   ```
8. Cliquer "Create"
9. **COPIER** Client ID et Client Secret

#### Exemple de Credentials
```
Client ID: 123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
Client Secret: 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45
```

---

### 2. Configuration Environment Variables

#### Ajouter dans `.env.local`
```bash
# NextAuth
NEXTAUTH_SECRET=generate_with_command_below
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (coller vos credentials ici)
GOOGLE_CLIENT_ID=votre_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_client_secret
```

#### Générer NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

#### Vérifier DATABASE_URL
```bash
# Assurez-vous que DATABASE_URL est déjà défini
cat .env.local | grep DATABASE_URL
```

---

### 3. Database Migration (Créer les Tables NextAuth)

#### Générer la Migration
```bash
npx drizzle-kit generate
```

#### Vérifier la Migration
```bash
# Check fichier de migration généré
ls drizzle/
```

#### Appliquer la Migration
```bash
npx drizzle-kit push
```

#### Vérification
Les tables suivantes doivent être créées :
- `users`
- `accounts`
- `sessions`
- `verification_tokens`

---

### 4. Test en Développement

#### Lancer le Serveur Dev
```bash
npm run dev
```

#### Tester le Flow OAuth
1. **Aller sur**: http://localhost:3000/connexion
2. **Cliquer**: "Continuer avec Google"
3. **Sélectionner**: votre compte Google
4. **Autoriser**: l'application
5. **Redirect**: vers /profil avec vos infos

#### Vérifier la DB
```sql
-- Vérifier que votre user existe
SELECT * FROM users;
SELECT * FROM accounts;
SELECT * FROM sessions;
```

---

### 5. Déploiement Vercel

#### Ajouter les Variables d'Environnement
1. Vercel Dashboard > votre projet > Settings > Environment Variables
2. Ajouter:
   ```
   NEXTAUTH_SECRET=votre_secret_prod
   NEXTAUTH_URL=https://votre-domaine.vercel.app
   GOOGLE_CLIENT_ID=votre_client_id
   GOOGLE_CLIENT_SECRET=votre_client_secret
   ```

#### Mettre à Jour Redirect URIs
Retour sur Google Cloud Console:
- Authorized redirect URIs : ajouter
  ```
  https://votre-domaine.vercel.app/api/auth/callback/google
  ```

#### Deploy
```bash
git push origin main
# Vercel auto-deploy
```

---

## 🎯 Routes Créées

| Route | Accès | Description |
|-------|-------|-------------|
| `/connexion` | Public | Login Google OAuth |
| `/profil` | Protected | User profile (redirect si pas connecté) |
| `/api/auth/[...nextauth]` | API | NextAuth handlers |
| `/api/auth/callback/google` | API | Google OAuth callback |

---

## 🔧 Intégration Header Profile Button

Le code est prêt mais **commenté** pour éviter build errors sans DATABASE_URL.

### À Activer Plus Tard

Dans `src/components/layout/header.tsx`, le profile button peut être mis à jour pour :

```tsx
// Import auth
import { auth } from "@/lib/auth/config"

// Dans le composant (server component)
export async function Header() {
  const session = await auth()

  return (
    <header>
      {/* ... */}

      {/* Profile Button */}
      {session?.user ? (
        // Logged in: show avatar + dropdown
        <Link href="/profil">
          <Avatar>
            <AvatarImage src={session.user.image || ''} />
            <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
          </Avatar>
        </Link>
      ) : (
        // Not logged in: redirect to login
        <Link href="/connexion">
          <Button>
            <User />
          </Button>
        </Link>
      )}
    </header>
  )
}
```

---

## 🐛 Troubleshooting

### Erreur: "Redirect URI mismatch"
**Solution**: Vérifier que l'URL de redirect dans Google Console correspond EXACTEMENT à celle utilisée

### Erreur: "DATABASE_URL not set" au build
**Solution**: Normal, le build échoue sans DB. Utilisez Vercel qui injectera les env vars en production

### Erreur: "Invalid client" après deploy
**Solution**: Vérifier que GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET sont bien définis dans Vercel

### Session ne persiste pas
**Solution**: Vérifier que les tables `sessions` existent dans la DB

---

## 📝 Prochaines Étapes (Optionnel)

### Amélioration UX
- [ ] Profile dropdown avec logout
- [ ] "Mes commandes" dans /profil
- [ ] Avatar upload
- [ ] Email notifications

### Admin Integration
- [ ] Migrer /login admin vers NextAuth
- [ ] Role-based access (check ADMIN_EMAILS)
- [ ] Admin dashboard avec session NextAuth

### Security
- [ ] Rate limiting sur /api/auth
- [ ] CSRF protection (built-in NextAuth)
- [ ] Session rotation
- [ ] Audit logs

---

## ✅ Checklist Finale

- [ ] Google Cloud Console : OAuth credentials créés
- [ ] `.env.local` : GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET définis
- [ ] Database : Migration appliquée (tables users, accounts, sessions créées)
- [ ] Test local : /connexion fonctionne, redirect vers /profil
- [ ] Vercel : Environment variables configurées
- [ ] Google Console : Production redirect URI ajouté
- [ ] Test prod : Login fonctionne en production

---

**Guide créé**: 2026-03-01
**NextAuth version**: 5.0.0-beta.30
**Status**: Prêt pour configuration finale

