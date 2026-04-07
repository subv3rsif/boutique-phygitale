# 🚀 Variables d'Environnement Vercel - NextAuth

## Variables à ajouter sur Vercel

Allez sur : **Vercel Dashboard > Settings > Environment Variables**

Ajoutez ces variables pour **Production, Preview, et Development** :

### Auth Configuration

```bash
AUTH_SECRET=Xw+w7L9xzRgEGfqxF6QZwEL3Do/6STOGfiT9QsrEeLg=
AUTH_URL=https://boutique-phygitale.vercel.app
```

### Google OAuth

```bash
GOOGLE_CLIENT_ID=728193282650-0svqp0hd088k187bsg0r5cmkc79svi7e.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Admin Access

```bash
ADMIN_EMAILS=votre-email@gmail.com
```

⚠️ **Important :** Remplacez `votre-email@gmail.com` par l'adresse email Google que vous utiliserez pour vous connecter.

## Exemple : Email multiple

Si plusieurs administrateurs :

```bash
ADMIN_EMAILS=admin1@gmail.com,admin2@gmail.com,admin3@gmail.com
```

---

## Après avoir ajouté les variables

1. **Redéployez** l'application (Vercel le fait automatiquement)
2. **Testez la connexion** : `https://boutique-phygitale.vercel.app/connexion`
3. **Cliquez "Sign in with Google"**
4. **Autorisez l'application**
5. **Vous devriez être redirigé vers `/admin`**

---

## Vérification

Pour vérifier que ça fonctionne :

```bash
# En local
npm run dev
# Allez sur http://localhost:3000/connexion

# Sur Vercel
# Allez sur https://boutique-phygitale.vercel.app/connexion
```

**Résultat attendu :**
- ✅ Bouton "Sign in with Google" visible
- ✅ Connexion réussie
- ✅ Redirection vers `/admin`
- ✅ Upload images et stock fonctionne
