# 🗄️ Instructions Rapides - Configuration Base de Données

## ⚠️ Si vous avez l'erreur : "relation products already exists"

Cela signifie que certaines tables existent déjà. Utilisez le script sécurisé.

---

## ✅ Solution (2 minutes)

### Étape 1 : Copier le script sécurisé

```bash
cat scripts/setup-database-safe.sql | pbcopy
```

*(Le fichier est maintenant dans votre presse-papier)*

### Étape 2 : Exécuter dans Supabase SQL Editor

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard) > **SQL Editor**
2. **New query**
3. **Coller** le script (Cmd+V)
4. **Run** (Cmd+Enter)
5. ✅ Success! (même si certaines tables existaient déjà)

---

## 🔍 Vérifier les tables créées

Dans **Table Editor**, vérifier que ces tables essentielles existent :

**Tables principales :**
- ✅ `products` - Catalogue
- ✅ `orders` - Commandes
- ✅ `order_items` - Articles commandés
- ✅ `pickup_tokens` - QR codes retrait
- ✅ `email_queue` - Emails avec retry

**Tables support :**
- ✅ `gdpr_consents` - Consentements RGPD
- ✅ `stripe_events` - Idempotence Stripe
- ✅ `stock_movements` - Historique stock
- ✅ `invoice_sequences` - Numéros facture

**Tables auth (NextAuth) :**
- ✅ `users`
- ✅ `accounts`
- ✅ `sessions`
- ✅ `verification_tokens`

---

## 🚀 Après avoir exécuté le script

### 1. Redéployer Vercel

**Option A - Via Vercel Dashboard :**
- Aller sur Vercel > **Deployments** > **Redeploy**

**Option B - Via git :**
```bash
git commit --allow-empty -m "trigger redeploy after db setup"
git push origin main
```

### 2. Tester

Aller sur : `https://votre-app.vercel.app/admin`

**Résultat attendu :** Dashboard admin s'affiche ✅

---

## 📝 Ajouter des produits

Une fois les tables créées :

**Option 1 - Via SQL (23 produits catalogue) :**
```bash
cat scripts/import-products.sql | pbcopy
```
Puis exécuter dans Supabase SQL Editor

**Option 2 - Via interface admin :**
Aller sur `/admin/products/new` et ajouter manuellement

---

## 🆘 Problème persistant ?

Si l'erreur persiste après redéploiement :

1. **Vérifier DATABASE_URL sur Vercel :**
   - Settings > Environment Variables
   - `DATABASE_URL` doit pointer vers votre base Supabase

2. **Vérifier que les tables existent :**
   - Supabase > Table Editor
   - La table `orders` doit être visible

3. **Logs Vercel :**
   - Deployments > View Function Logs
   - Chercher des erreurs SQL

---

**Dernière mise à jour :** 7 avril 2026
