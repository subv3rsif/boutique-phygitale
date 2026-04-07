# 🗄️ Configuration de la Base de Données

## ⚠️ Erreur : `relation "orders" does not exist`

Cette erreur signifie que **les tables de la base de données n'ont pas été créées**. Vous devez exécuter les migrations Drizzle.

---

## 🚀 Solution Rapide (Recommandée)

### Étape 1 : Ouvrir Supabase SQL Editor

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet
3. Cliquer sur **SQL Editor** dans le menu de gauche
4. Cliquer sur **New query**

### Étape 2 : Exécuter le script de migration

Copier **tout le contenu** du fichier `scripts/setup-database.sql` et le coller dans l'éditeur SQL.

**Raccourci :**
```bash
cat scripts/setup-database.sql | pbcopy
# (Le contenu est maintenant dans votre presse-papier)
```

Puis coller dans Supabase SQL Editor et cliquer sur **Run**.

### Étape 3 : Vérifier que les tables sont créées

Aller dans **Table Editor** et vérifier que ces tables existent :
- ✅ `orders`
- ✅ `order_items`
- ✅ `products`
- ✅ `pickup_tokens`
- ✅ `email_queue`
- ✅ `gdpr_consents`
- ✅ `stripe_events`
- ✅ `users`
- ✅ `accounts`
- ✅ `sessions`

### Étape 4 : Redéployer sur Vercel

```bash
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

Ou dans Vercel Dashboard : **Deployments** > **Redeploy**

---

## 🛠️ Solution Alternative : Via CLI locale

Si vous préférez exécuter les migrations depuis votre machine :

### Prérequis

Votre fichier `.env.local` doit contenir :
```bash
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Commande

```bash
npm run db:push
```

**Note :** Cette commande pousse le schéma Drizzle directement vers la base de données.

---

## 📊 Tables Créées

Voici toutes les tables qui seront créées :

| Table | Description |
|-------|-------------|
| `products` | Catalogue des produits |
| `orders` | Commandes clients |
| `order_items` | Articles de chaque commande |
| `pickup_tokens` | Tokens QR code pour retrait |
| `email_queue` | File d'attente emails avec retry |
| `gdpr_consents` | Consentements RGPD |
| `stripe_events` | Événements Stripe (idempotence) |
| `users` | Utilisateurs (NextAuth) |
| `accounts` | Comptes OAuth (NextAuth) |
| `sessions` | Sessions utilisateur (NextAuth) |
| `verification_tokens` | Tokens de vérification email |

---

## ✅ Vérification

Après avoir exécuté les migrations, tester :

1. **Local :** `npm run dev` puis aller sur `http://localhost:3000/admin`
2. **Production :** Aller sur `https://votre-app.vercel.app/admin`

Si vous voyez le dashboard sans erreur → **Migration réussie** ✅

---

## 🆘 En cas de problème

### Erreur : "permission denied for schema public"

Aller dans Supabase SQL Editor et exécuter :
```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

### Erreur : "database does not exist"

Vérifier que :
1. Votre `DATABASE_URL` dans `.env.local` est correcte
2. La base de données Supabase est bien créée
3. Vous utilisez le bon projet Supabase

### Les tables existent mais sont vides

C'est normal ! Les migrations créent juste la structure. Pour ajouter des produits :
1. Exécuter `scripts/import-products.sql` (23 produits du catalogue)
2. Ou ajouter des produits via l'interface admin `/admin/products/new`

---

**Dernière mise à jour :** 7 avril 2026
