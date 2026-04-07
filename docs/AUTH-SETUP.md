# 🔐 Configuration de l'Authentification

## ⚠️ État Actuel

**En développement :** L'authentification est **bypassée** pour permettre le test local sans configuration OAuth.

**En production :** Vous **devez** configurer NextAuth correctement avant de déployer.

---

## 🚀 Solution Temporaire (Actuelle)

Pour permettre le développement local rapide, un bypass a été mis en place :

**Fichier :** `src/lib/auth/admin-check.ts`

```typescript
export async function isAdmin(): Promise<boolean> {
  // En développement, bypass pour test local
  if (process.env.NODE_ENV === 'development') {
    return true; // ✅ Accès admin automatique
  }

  // En production, vérification réelle
  const session = await auth();
  return allowedEmails.includes(session.user.email);
}
```

**Routes API affectées :**
- ✅ `/api/admin/products/[id]/stock` - Gestion du stock
- ✅ `/api/admin/products/[id]/upload` - Upload d'images
- ✅ Toutes les autres routes `/api/admin/*`

**Résultat :** En local, vous pouvez utiliser l'interface admin sans vous connecter.

---

## 🔧 Configuration Complète pour Production

### Étape 1 : Générer AUTH_SECRET

```bash
openssl rand -base64 32
```

Copiez le résultat dans `.env.local` ET dans Vercel :

```bash
AUTH_SECRET=votre_secret_généré
```

### Étape 2 : Configurer Google OAuth

1. **Aller sur [Google Cloud Console](https://console.cloud.google.com/)**
2. **Créer un projet** (ou sélectionner un existant)
3. **Activer Google+ API**
4. **Créer des identifiants OAuth 2.0** :
   - Type : Application web
   - Origines autorisées :
     - `http://localhost:3000` (dev)
     - `https://votre-domaine.vercel.app` (prod)
   - URIs de redirection :
     - `http://localhost:3000/api/auth/callback/google` (dev)
     - `https://votre-domaine.vercel.app/api/auth/callback/google` (prod)

5. **Copier les identifiants** :

```bash
GOOGLE_CLIENT_ID=123456789-xxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx
```

### Étape 3 : Configurer Resend (Email Magic Links)

1. **Aller sur [Resend.com](https://resend.com)**
2. **Créer un compte** et vérifier un domaine
3. **Générer une clé API**

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@votre-domaine.com
```

### Étape 4 : Variables d'environnement complètes

Ajouter dans `.env.local` :

```bash
# Auth
AUTH_SECRET=votre_secret_généré_32_chars
AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=123456789-xxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx

# Resend (Magic Links)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@votre-domaine.com

# Admin Access
ADMIN_EMAILS=admin@ville.fr,marie@ville.fr
```

### Étape 5 : Configurer sur Vercel

1. **Aller dans Settings > Environment Variables**
2. **Ajouter toutes les variables ci-dessus**
3. **⚠️ Important :** `AUTH_URL` doit être `https://votre-app.vercel.app` en production

### Étape 6 : Retirer le bypass de développement

Une fois NextAuth configuré, vous pouvez retirer le bypass :

**Fichier :** `src/lib/auth/admin-check.ts`

```typescript
export async function isAdmin(): Promise<boolean> {
  // Supprimer ce bloc pour forcer l'authentification
  /*
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  */

  const session = await auth();
  if (!session?.user?.email) {
    return false;
  }

  const allowedEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return allowedEmails.includes(session.user.email);
}
```

---

## 🔒 Sécurité Production

### ⚠️ Risques du Bypass Actuel

Le bypass actuel est **dangereux en production** car :
- ❌ N'importe qui peut accéder à `/admin` sur Vercel
- ❌ Pas de traçabilité des actions admin
- ❌ Pas de protection contre les abus

### ✅ Checklist Avant Production

- [ ] `AUTH_SECRET` configuré sur Vercel
- [ ] Google OAuth configuré avec domaine prod
- [ ] `ADMIN_EMAILS` contient les vrais emails autorisés
- [ ] Bypass de dev **retiré** ou conditionné strictement
- [ ] Tester la connexion sur Vercel Staging
- [ ] Vérifier que `/admin` redirige vers login si non connecté

---

## 📝 Flow d'Authentification

### Connexion Admin

1. **User visite `/admin`**
2. **Middleware vérifie la session** (quand configuré)
3. **Si pas connecté → Redirect `/connexion`**
4. **User se connecte via :**
   - Google OAuth
   - Magic Link (email Resend)
5. **NextAuth crée une session** (stockée en DB via Drizzle)
6. **Vérification email dans `ADMIN_EMAILS`**
7. **Si OK → Accès admin autorisé**

### Routes Protégées

Toutes les routes `/api/admin/*` vérifient :

```typescript
const admin = await isAdmin();
if (!admin) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## 🆘 Dépannage

### "Unauthorized" en local malgré le bypass

**Vérifier :**
```bash
echo $NODE_ENV
# Doit être vide ou "development"
```

**Si production en local :**
```bash
# Forcer dev mode
NODE_ENV=development npm run dev
```

### "Unauthorized" sur Vercel après config

**1. Vérifier les logs Vercel :**
- Chercher `[AUTH]` dans les Function Logs
- Vérifier que `session.user.email` est bien présent

**2. Vérifier `ADMIN_EMAILS` :**
```bash
# Sur Vercel
echo $ADMIN_EMAILS
# Doit contenir l'email connecté, séparé par virgules
```

**3. Session non créée :**
- Vérifier que `DATABASE_URL` pointe vers Supabase
- Vérifier que les tables `users`, `sessions`, `accounts` existent

---

## 📚 Resources

- [NextAuth.js v5 Docs](https://authjs.dev/getting-started)
- [Google OAuth Setup](https://console.cloud.google.com/)
- [Resend Documentation](https://resend.com/docs)
- [Drizzle Adapter](https://authjs.dev/reference/adapter/drizzle)

---

**Dernière mise à jour :** 7 avril 2026
