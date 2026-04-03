# Product Catalog Admin Interface - Design Specification

**Date:** 2026-03-31
**Author:** Claude (brainstorming avec utilisateur)
**Status:** Approved for implementation

---

## Overview

Interface d'administration complète pour gérer le catalogue de produits via formulaire CRUD, avec upload d'images multi-photos vers Supabase Storage et gestion automatique du stock.

**Objectif :** Permettre au webmaster d'ajouter/modifier/supprimer des produits sans toucher au code, directement via l'interface admin.

**Approche retenue :** Remplacement direct du fichier statique `catalogue.ts` par une base de données (pas de cohabitation car catalogue actuellement vide/placeholder).

---

## Architecture

### Base de données

#### Table `products`

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifiant unique (slug)
  slug VARCHAR(100) UNIQUE NOT NULL,

  -- Informations produit
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,

  -- Prix (en centimes)
  price_cents INTEGER NOT NULL,
  shipping_cents INTEGER NOT NULL,

  -- Galerie d'images (JSONB array)
  images JSONB DEFAULT '[]'::jsonb,
  -- Format: [
  --   { url: "https://...", path: "products/abc.jpg", order: 0, isPrimary: true },
  --   { url: "https://...", path: "products/def.jpg", order: 1, isPrimary: false }
  -- ]

  -- Stock
  stock_quantity INTEGER DEFAULT 0,
  stock_alert_threshold INTEGER DEFAULT 5,

  -- Métadonnées
  weight_grams INTEGER,
  tags TEXT[], -- Array PostgreSQL
  payfip_product_code VARCHAR(10) DEFAULT '11',

  -- Édition limitée
  edition_number INTEGER,
  edition_total INTEGER,

  -- État
  active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_slug ON products(slug);
CREATE INDEX idx_active ON products(active);
CREATE INDEX idx_stock ON products(stock_quantity);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Table `stock_movements` (historique)

```sql
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,

  -- Type de mouvement
  type VARCHAR(20) NOT NULL, -- 'sale', 'restock', 'adjustment', 'return'

  -- Quantité (négatif pour vente, positif pour réassort)
  quantity INTEGER NOT NULL,

  -- Lien avec commande si applicable
  order_id UUID REFERENCES orders(id),

  -- Note/raison
  note TEXT,

  -- Qui a fait le mouvement
  created_by VARCHAR(255), -- Email admin
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_movements ON stock_movements(product_id);
CREATE INDEX idx_order_movements ON stock_movements(order_id);
```

---

## Routes API

### Routes Admin (protégées)

```
GET    /api/admin/products              → Liste tous les produits (avec filtres)
GET    /api/admin/products/[id]         → Détails d'un produit
POST   /api/admin/products              → Créer un produit
PUT    /api/admin/products/[id]         → Modifier un produit
DELETE /api/admin/products/[id]         → Supprimer un produit
POST   /api/admin/products/[id]/upload  → Upload image vers Supabase Storage
POST   /api/admin/products/[id]/stock   → Ajuster stock manuellement
GET    /api/admin/products/[id]/movements → Historique mouvements stock
```

**Authentification :** Toutes les routes vérifient que l'utilisateur est connecté (NextAuth) et que son email est dans `ADMIN_EMAILS`.

### Routes Publiques

```
GET /api/products              → Liste produits actifs (remplace catalogue.ts)
GET /api/products/[slug]       → Détails produit par slug
```

### Validation Zod

```typescript
export const productSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug invalide (minuscules, chiffres, tirets)'),
  name: z.string().min(1, 'Nom requis').max(255),
  description: z.string().min(1, 'Description requise'),
  priceCents: z.number().int().min(0, 'Prix doit être >= 0'),
  shippingCents: z.number().int().min(0, 'Frais de port >= 0'),
  stockQuantity: z.number().int().min(0, 'Stock >= 0').default(0),
  stockAlertThreshold: z.number().int().min(0).default(5),
  weightGrams: z.number().int().min(0).optional(),
  tags: z.string().optional(), // "tag1, tag2, tag3"
  payfipProductCode: z.string().max(10).default('11'),
  editionNumber: z.number().int().min(1).optional(),
  editionTotal: z.number().int().min(1).optional(),
  active: z.boolean().default(true),
});

export const stockAdjustmentSchema = z.object({
  type: z.enum(['add', 'remove', 'set']),
  quantity: z.number().int().min(0),
  note: z.string().optional(),
});

export const imageUploadSchema = z.object({
  file: z.instanceof(File),
  isPrimary: z.boolean().default(false),
});
```

---

## Interface Admin

### Page `/admin/products` - Liste produits

**Layout :**
- Tableau responsive avec colonnes :
  - Image miniature (principale)
  - Nom
  - Prix (€)
  - Stock (avec indicateur visuel)
  - Statut (Actif/Inactif)
  - Actions (Modifier, Supprimer)

**Filtres :**
- Statut : Tous / Actifs / Inactifs
- Stock : Tous / Stock OK / Stock faible / Rupture
- Recherche : Par nom ou slug

**Indicateurs visuels stock :**
- 🟢 Vert : Stock > seuil (OK)
- 🟡 Jaune : Stock ≤ seuil (Alerte)
- 🔴 Rouge : Stock = 0 (Rupture)
- ⚪ Gris : Inactif

**Bouton principal :**
- "➕ Ajouter un produit" (en haut à droite)

---

### Formulaire Produit (`/admin/products/new` et `/admin/products/[id]/edit`)

**Sections du formulaire :**

#### 1. Informations générales
- **Nom*** (max 255 caractères)
- **Slug*** (auto-généré depuis le nom, modifiable)
  - Format: minuscules-avec-tirets
  - Validation temps réel (unicité)
- **Description*** (textarea, markdown supporté)

#### 2. Prix et livraison
- **Prix TTC (€)*** (converti en centimes côté serveur)
- **Frais de port (€)*** (par unité)
- **Poids (grammes)** (optionnel)

#### 3. Images (galerie multi-photos)

**Format conseillé :** 600×750px (ratio 4:5 portrait)

**Fonctionnalités :**
- Upload multiple (max 5 images)
- Drag & drop pour réorganiser
- Marquer comme "image principale" (★)
- Preview immédiate
- Formats acceptés : JPG, PNG, WebP (max 5MB/image)
- Validation ratio 4:5 recommandée (warning si différent)

**Affichage :**
```
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Image 1 │ │ Image 2 │ │  [+]    │
│ 600×750 │ │ 600×750 │ │ Ajouter │
│ ★ Princ │ │ ⭐ Faire│ │         │
│ 🗑️ ↑↓   │ │ principal│         │
└─────────┘ └─────────┘ └─────────┘

[  Drag & Drop ou Cliquer pour upload   ]

• Glisser-déposer pour réorganiser
• ★ = Image principale (miniatures)
• Images affichées en galerie sur fiche produit
```

**Stockage Supabase Storage :**
```
Bucket: products (public read)
Structure:
  products/
    └── {product-slug}/
        ├── image-1-{timestamp}.jpg  (principale)
        ├── image-2-{timestamp}.jpg
        └── image-3-{timestamp}.jpg
```

#### 4. Stock et disponibilité
- **Stock actuel*** (nombre entier ≥ 0)
- **Seuil d'alerte** (défaut: 5)
- **Produit actif** (checkbox)

#### 5. Métadonnées
- **Tags** (texte libre, séparation par virgules)
  - Exemple : "vaisselle, nouveau, best-seller"
- **Code produit PayFiP** (défaut: "11")

#### 6. Édition limitée (optionnel)
- **Édition limitée** (checkbox)
- Si coché :
  - **Numéro** (ex: 12)
  - **Total** (ex: 50)
  - Affichage : "12 / 50"

**Boutons :**
- Annuler (retour à liste)
- Enregistrer (validation + sauvegarde)

---

### Modal Ajustement Stock

Accessible depuis la liste (bouton "Ajuster stock" sur chaque ligne).

```
┌──────────────────────────────┐
│ Ajuster le stock             │
├──────────────────────────────┤
│ Produit: Mug Love Symbol     │
│ Stock actuel: 12             │
│                              │
│ ○ Ajouter du stock (réassort)│
│ ○ Retirer du stock           │
│ ● Définir un nouveau stock   │
│                              │
│ Quantité: [____]             │
│                              │
│ Note (optionnel):            │
│ [_________________________]  │
│                              │
│     [Annuler] [Valider]      │
└──────────────────────────────┘
```

**Comportement :**
- INSERT dans `stock_movements`
- UPDATE `products.stock_quantity`
- Si nouveau stock > 0 et produit inactif → Réactivation auto
- Toast confirmation

---

## Workflows

### 1. Création produit

```
Admin clique "Ajouter un produit"
  ↓
Formulaire vierge s'affiche
  ↓
Admin remplit les champs + upload 1-5 images
  ↓
Auto-génération du slug depuis le nom
  ↓
Sélection de l'image principale (★)
  ↓
Clique "Enregistrer"
  ↓
Validation Zod côté serveur
  ↓
Upload images vers Supabase Storage
  ↓
Génération URLs publiques
  ↓
INSERT INTO products
  ↓
Redirection vers /admin/products
  ↓
Toast: "Produit créé avec succès ✓"
```

---

### 2. Décrémentation automatique du stock

**Déclencheur :** Webhook PayFiP (`/api/payfip/notification`)

```
Paiement confirmé (resultrans = 'P' ou 'V')
  ↓
Pour chaque produit commandé:

  1. Décrémenter stock
     UPDATE products
     SET stock_quantity = stock_quantity - qty
     WHERE id = product_id

  2. Enregistrer mouvement
     INSERT INTO stock_movements
     VALUES (
       type: 'sale',
       quantity: -qty,
       order_id: order.id,
       created_by: 'system'
     )

  3. Vérifier seuils

     Si stock ≤ seuil_alerte:
       → Envoyer email admin
         Sujet: "⚠️ Alerte stock faible"
         Corps: "{product_name} - {stock} unités restantes"

     Si stock = 0:
       → UPDATE products SET active = false
       → Envoyer email admin
         Sujet: "🔴 Rupture de stock"
         Corps: "{product_name} désactivé automatiquement"
```

---

### 3. Réajustement manuel stock

```
Admin clique "Ajuster stock" (liste produits)
  ↓
Modal s'ouvre avec 3 options:
  - Ajouter du stock (réassort)
  - Retirer du stock
  - Définir un nouveau stock
  ↓
Admin saisit quantité + note (optionnelle)
  ↓
Clique "Valider"
  ↓
Validation (stock >= 0)
  ↓
UPDATE products.stock_quantity
  ↓
INSERT stock_movements (type: 'adjustment' ou 'restock')
  ↓
Si nouveau stock > 0 ET produit inactif:
  → UPDATE products SET active = true
  → Toast: "Stock ajusté. Produit réactivé ✓"
Sinon:
  → Toast: "Stock ajusté ✓"
```

---

### 4. Gestion des suppressions

**Suppression produit :**

```
Admin clique "Supprimer" (icône 🗑️)
  ↓
Vérification: Produit lié à des commandes ?
  ↓
  OUI → Soft delete
    → Confirmation: "Ce produit est lié à des commandes.
                     Il sera désactivé mais pas supprimé."
    → UPDATE products SET active = false
    → Toast: "Produit désactivé ✓"
  ↓
  NON → Hard delete
    → Confirmation: "Êtes-vous sûr ? Cette action est irréversible."
    → DELETE images Supabase Storage
    → DELETE FROM products WHERE id = ...
    → Toast: "Produit supprimé ✓"
```

**Suppression image (galerie) :**

```
Admin clique icône 🗑️ sur une image
  ↓
Confirmation: "Supprimer cette image ?"
  ↓
DELETE fichier Supabase Storage
  ↓
Retirer de products.images (JSONB)
  ↓
Si c'était l'image principale (isPrimary = true):
  → La première image restante devient principale
  ↓
UPDATE products
  ↓
Toast: "Image supprimée ✓"
```

---

## Sécurité

### Protection routes admin

**Middleware NextAuth :**
```typescript
// Déjà en place pour /admin/*
export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const allowedEmails = process.env.ADMIN_EMAILS?.split(',') || [];

  if (!token || !allowedEmails.includes(token.email as string)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
```

**Vérification dans les API routes :**
```typescript
// api/admin/products/*
const session = await getServerSession(authOptions);

if (!session?.user?.email) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const allowedEmails = process.env.ADMIN_EMAILS?.split(',') || [];
if (!allowedEmails.includes(session.user.email)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

### Validation upload images

**Route:** `POST /api/admin/products/[id]/upload`

**Validations côté serveur :**

1. ✅ Vérifier auth admin
2. ✅ Vérifier taille fichier < 5MB
3. ✅ Vérifier MIME type (image/jpeg, image/png, image/webp uniquement)
4. ✅ Vérifier dimensions (ratio 4:5 recommandé, warning si différent)
5. ✅ Renommer fichier : `{slug}-{timestamp}-{randomId}.{ext}`
6. ✅ Upload vers Supabase Storage (bucket: `products`)
7. ✅ Générer URL publique
8. ✅ Retourner `{ url, path, width, height }`

**Bucket Supabase Storage (à configurer) :**
```sql
-- Configuration RLS pour bucket 'products'
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

CREATE POLICY "Admin upload access"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'products'
    AND auth.uid() IN (SELECT id FROM auth.users WHERE email IN ('admin@example.com'))
  );

CREATE POLICY "Admin delete access"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products');
```

**Note :** En pratique, la vérification admin sera faite dans l'API route côté Next.js (avec NextAuth), pas via RLS Supabase.

---

### Gestion des erreurs

| Erreur | Code HTTP | Message utilisateur | Action corrective |
|--------|-----------|---------------------|-------------------|
| Slug déjà existant | 409 | "Ce slug existe déjà. Modifiez le nom." | Suggestion auto: `{slug}-2` |
| Stock insuffisant (commande) | 400 | "Stock insuffisant pour {product}" | Afficher stock disponible |
| Image trop lourde | 413 | "Image trop lourde (max 5MB)" | Proposer compression auto |
| Format image invalide | 415 | "Format non supporté. Utilisez JPG, PNG ou WebP" | - |
| Ratio image non 4:5 | 200 (warning) | "⚠️ Ratio non optimal (conseillé: 4:5)" | Continuer avec crop auto |
| Stock négatif | 400 | "Le stock ne peut pas être négatif" | - |
| Suppression impossible | 409 | "Impossible de supprimer: produit lié à des commandes. Désactivez-le." | Proposer désactivation |
| Upload Supabase échoué | 500 | "Erreur d'upload. Réessayez." | Retry auto (3×) + fallback message |
| Nom vide | 400 | "Le nom est requis" | - |
| Prix négatif | 400 | "Le prix doit être >= 0" | - |

---

## Logs et Monitoring

### Événements à logger (console Vercel)

```typescript
// Produits
console.log(`[PRODUCT] Created: ${slug} by ${admin_email}`);
console.log(`[PRODUCT] Updated: ${slug} by ${admin_email}`);
console.log(`[PRODUCT] Deleted: ${slug} by ${admin_email}`);

// Stock
console.log(`[STOCK] Adjusted: ${slug} ${oldStock} → ${newStock} by ${admin_email}`);
console.log(`[STOCK] Low stock alert: ${slug} (${quantity} left)`);
console.log(`[STOCK] Out of stock: ${slug} - product disabled`);
console.log(`[STOCK] Product reactivated: ${slug} (stock > 0)`);

// Images
console.log(`[IMAGE] Uploaded: ${slug} - ${filename} (${sizeKB}KB)`);
console.log(`[IMAGE] Deleted: ${slug} - ${filename}`);
```

### Emails admin (via Resend)

**Destinataire :** Emails dans `ADMIN_EMAILS`

**Types d'emails :**

1. **Alerte stock faible**
   - Déclencheur : stock ≤ seuil_alerte
   - Sujet : `⚠️ Alerte stock faible - {product_name}`
   - Corps :
     ```
     Le produit "{product_name}" a un stock faible.

     Stock actuel : {stock} unités
     Seuil d'alerte : {threshold} unités

     Action recommandée : Réassortir le produit.

     Gérer le stock : {link_admin_products}
     ```

2. **Rupture de stock**
   - Déclencheur : stock = 0
   - Sujet : `🔴 Rupture de stock - {product_name}`
   - Corps :
     ```
     Le produit "{product_name}" est en rupture de stock.

     Le produit a été automatiquement désactivé sur le site.

     Action recommandée : Réapprovisionner et réactiver.

     Gérer le stock : {link_admin_products}
     ```

3. **Réactivation produit**
   - Déclencheur : stock > 0 après avoir été à 0
   - Sujet : `✅ Produit réactivé - {product_name}`
   - Corps :
     ```
     Le produit "{product_name}" a été réactivé.

     Nouveau stock : {stock} unités

     Le produit est à nouveau visible sur le site.
     ```

---

## Migration & Compatibilité Code

### Migration initiale

**Aucune migration nécessaire** car le catalogue est actuellement vide/placeholder.

La table `products` sera créée vide lors du déploiement.

---

### Remplacement du fichier `catalogue.ts`

**Avant (fichier statique) :**
```typescript
// src/lib/catalogue.ts
export const catalogue: Product[] = [...];
export function getProductById(id: string) { ... }
export function getAllActiveProducts() { ... }
```

**Après (base de données) :**
```typescript
// src/lib/products.ts
export async function getProducts() {
  return await db.select().from(products).where(eq(products.active, true));
}

export async function getProductById(id: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  return product ?? null;
}

export async function getProductBySlug(slug: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  return product ?? null;
}
```

**Impact sur le code existant :**

Fichiers à mettre à jour :
- `src/app/page.tsx` (homepage) → `getProducts()`
- `src/app/api/checkout/route.ts` → `getProductById()`
- Tous les composants produits → fonction async

**Changements requis :**
```typescript
// Avant
import { catalogue } from '@/lib/catalogue';
const products = catalogue;

// Après
import { getProducts } from '@/lib/products';
const products = await getProducts();
```

**Note :** Utiliser Server Components ou API routes pour les appels async.

---

## Type TypeScript

```typescript
export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  shippingCents: number;
  images: Array<{
    url: string;
    path: string;
    order: number;
    isPrimary: boolean;
  }>;
  stockQuantity: number;
  stockAlertThreshold: number;
  weightGrams?: number;
  tags: string[];
  payfipProductCode: string;
  editionNumber?: number;
  editionTotal?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type StockMovement = {
  id: string;
  productId: string;
  type: 'sale' | 'restock' | 'adjustment' | 'return';
  quantity: number;
  orderId?: string;
  note?: string;
  createdBy: string;
  createdAt: Date;
};
```

---

## Tests

### Tests unitaires (Vitest)

**Fichiers à tester :**
- `src/lib/products.ts` (CRUD functions)
- `src/lib/validations.ts` (schemas Zod)
- API routes (mocked DB calls)

**Exemples de tests :**
```typescript
// Test création produit
it('should create product with valid data', async () => {
  const product = await createProduct({
    slug: 'test-product',
    name: 'Test Product',
    description: 'Description',
    priceCents: 1000,
    shippingCents: 500,
    stockQuantity: 10,
  });

  expect(product.slug).toBe('test-product');
  expect(product.active).toBe(true);
});

// Test slug unique
it('should reject duplicate slug', async () => {
  await expect(createProduct({ slug: 'existing-slug', ... }))
    .rejects.toThrow('Slug already exists');
});

// Test décrémentation stock
it('should decrement stock on sale', async () => {
  await decrementStock('product-id', 5, 'order-id');
  const product = await getProductById('product-id');
  expect(product.stockQuantity).toBe(5); // était 10
});
```

### Tests E2E (Playwright)

**Scénarios à tester :**
1. Admin se connecte → Accède à /admin/products
2. Admin crée un produit avec 3 images
3. Admin modifie le stock
4. Admin désactive un produit
5. Admin supprime un produit
6. Produit désactivé n'apparaît pas sur le site public

---

## Checklist de Déploiement

### Avant déploiement

- [ ] Créer bucket Supabase Storage `products` (public read)
- [ ] Configurer RLS policies Supabase (ou désactiver si gestion NextAuth)
- [ ] Ajouter variable `NEXT_PUBLIC_SUPABASE_URL` (déjà fait)
- [ ] Ajouter variable `SUPABASE_SERVICE_ROLE_KEY` (déjà fait)
- [ ] Tester upload image en local
- [ ] Tester décrémentation stock en local (avec webhook mock PayFiP)
- [ ] Migrer schéma DB (tables `products` et `stock_movements`)

### Après déploiement

- [ ] Vérifier accès `/admin/products` (auth OK)
- [ ] Créer 1 produit test via le formulaire
- [ ] Upload 2-3 images test
- [ ] Tester ajustement stock manuel
- [ ] Passer une commande test pour décrémentation auto
- [ ] Vérifier email alerte stock faible
- [ ] Vérifier produit inactif si stock = 0
- [ ] Supprimer produit test

---

## Résumé des Décisions Clés

| Aspect | Décision | Raison |
|--------|----------|--------|
| **Approche** | Remplacement direct (pas de cohabitation) | Catalogue actuellement vide |
| **Images** | Galerie multi-photos (max 5) | Valoriser produits |
| **Upload** | Supabase Storage | Déjà configuré, intégré |
| **Format image** | 600×750px (ratio 4:5) | Cohérence design actuel |
| **Stock** | Décrémentation automatique | Production-ready |
| **Tags** | Champ texte (séparation virgules) | Simple, flexible |
| **Slug** | Auto-généré, modifiable | UX optimale |
| **Suppression** | Soft delete si commandes liées | Intégrité données |
| **Alertes** | Email admin stock faible/rupture | Proactif |

---

## Next Steps

1. ✅ **Spec validée**
2. → **Writing-plans** : Créer plan d'implémentation détaillé
3. → **Implémentation** : DB → API → UI
4. → **Tests** : Unitaires + E2E
5. → **Déploiement** : Vercel + Supabase
6. → **Documentation** : Manuel webmaster (ajout section catalogue admin)

---

**Spec approuvée pour implémentation le 2026-03-31**
