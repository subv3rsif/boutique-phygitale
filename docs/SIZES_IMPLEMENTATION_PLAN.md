# Plan d'implémentation : Gestion des tailles

## ✅ Fait (Partie 1/5)

### Base de données
- [x] Ajout champ `sizes` JSONB à table `products`
- [x] Ajout champ `size_selected` VARCHAR(10) à table `order_items`
- [x] Migration SQL créée : `migrations/add-product-sizes.sql`
- [x] Types TypeScript `ProductSize` créé
- [x] Schéma Drizzle mis à jour

## 🔄 À faire (Parties 2-5)

### Partie 2/5 : Admin - Formulaire produit
**Fichier** : `src/components/admin/product-form.tsx`

1. Ajouter toggle "Tailles disponibles" après `showInCollectionPage`
2. Si toggle activé :
   - Masquer champs `stockQuantity` et `stockAlertThreshold` (stock global)
   - Afficher checkboxes tailles : S, M, L, XL, XXL
   - Pour chaque taille cochée, afficher 2 inputs :
     - Stock (number, required)
     - Seuil alerte (number, default 5)
3. Validation :
   - Si tailles activées, au moins 1 taille cochée
   - Chaque taille doit avoir stock >= 0
4. Au submit :
   - Construire array `sizes: [{ size: 'M', stock: 15, stockAlertThreshold: 5 }, ...]`
   - Envoyer dans payload API

**Composant à créer** :
```tsx
// src/components/admin/size-stock-manager.tsx
<SizeStockManager
  sizes={formData.sizes}
  onChange={(sizes) => setFormData({ ...formData, sizes })}
/>
```

### Partie 3/5 : Store Panier
**Fichier** : `src/store/cart.ts`

1. Modifier type `CartItem` :
   ```ts
   type CartItem = {
     id: string;      // product ID
     size?: string;   // 'M', 'L', etc. (optional)
     qty: number;
   };
   ```

2. Modifier `addItem(id, qty, size?)` :
   - Si produit a des tailles ET pas de size fournie → erreur
   - Si même produit + même taille existe → incrémenter qty
   - Si même produit + taille différente → nouvelle ligne

3. Clé unique : `${id}-${size || 'no-size'}`

4. Modifier `getItem`, `updateQty`, `removeItem` pour gérer la clé composite

### Partie 4/5 : Page produit - Sélecteur de taille
**Fichier** : `src/app/produits/[slug]/page.tsx` ou composant dédié

1. Détecter si `product.sizes` existe et n'est pas vide
2. Si oui, afficher select :
   ```tsx
   <Label>Taille</Label>
   <Select value={selectedSize} onValueChange={setSelectedSize}>
     <SelectTrigger>
       <SelectValue placeholder="Choisir une taille" />
     </SelectTrigger>
     <SelectContent>
       {product.sizes.map(({ size, stock }) => (
         <SelectItem
           key={size}
           value={size}
           disabled={stock === 0}
         >
           {size} {stock === 0 && '(Rupture)'}
         </SelectItem>
       ))}
     </SelectContent>
   </Select>
   ```

3. Bouton "Ajouter au panier" :
   - Disabled si tailles ET pas de taille sélectionnée
   - Au clic : `addItem(product.id, 1, selectedSize)`

4. Message stock :
   - Si taille sélectionnée, afficher stock de cette taille
   - Si pas de tailles, afficher `product.stockQuantity`

### Partie 5/5 : Panier & Commandes
**Fichiers** :
- `src/components/cart/cart-drawer.tsx`
- `src/app/api/checkout/route.ts`
- `src/app/api/stripe/webhook/route.ts`

#### Affichage panier
1. Grouper items par produit (optionnel, ou laisser lignes séparées)
2. Afficher : "Produit (Taille M) × 2"
3. Stock check :
   - Charger produit complet
   - Vérifier stock de la taille spécifique
   - Warning si rupture

#### API Checkout
1. Pour chaque item avec taille :
   - Vérifier `product.sizes.find(s => s.size === item.size).stock >= item.qty`
   - Erreur 400 si stock insuffisant

2. Payload Stripe metadata :
   ```json
   {
     "items": [
       { "id": "abc", "qty": 2, "size": "M" },
       { "id": "def", "qty": 1 }  // pas de taille
     ]
   }
   ```

#### Webhook (paiement confirmé)
1. Créer `order_items` avec `size_selected` :
   ```ts
   await db.insert(orderItems).values({
     orderId,
     productId: item.id,
     qty: item.qty,
     sizeSelected: item.size || null,
     // ...
   });
   ```

2. Décrémenter stock :
   ```ts
   if (item.size) {
     // Décrémenter product.sizes[x].stock
     const product = await getProductById(item.id);
     const updatedSizes = product.sizes.map(s =>
       s.size === item.size
         ? { ...s, stock: s.stock - item.qty }
         : s
     );
     await updateProduct(item.id, { sizes: updatedSizes });
   } else {
     // Décrémenter product.stockQuantity (comportement actuel)
   }
   ```

#### Emails confirmation
1. Template : inclure taille si présente
   ```
   - Tee-shirt 1885 (Taille M) × 2
   - Mug Love Symbol × 1
   ```

## 🧪 Tests à faire

1. **Admin** :
   - [ ] Créer produit SANS tailles → stock global fonctionne
   - [ ] Créer produit AVEC tailles (S, M, L) → stock par taille enregistré
   - [ ] Modifier produit : activer tailles → stock global préservé ?
   - [ ] Modifier produit : désactiver tailles → revenir à stock global

2. **Page produit** :
   - [ ] Produit sans tailles → pas de select, bouton direct
   - [ ] Produit avec tailles → select obligatoire
   - [ ] Taille rupture → disabled + mention "(Rupture)"

3. **Panier** :
   - [ ] Ajouter 2× M + 1× L → 2 lignes distinctes
   - [ ] Modifier qty d'une ligne → stock check OK
   - [ ] Supprimer une ligne → panier mis à jour

4. **Commande** :
   - [ ] Checkout → vérification stock par taille
   - [ ] Paiement → stock décrémenté sur bonne taille
   - [ ] Email confirmation → taille affichée

## 📁 Fichiers à modifier

### Base de données ✅
- [x] `src/lib/db/schema-products.ts`
- [x] `src/lib/db/schema.ts` (orderItems)
- [x] `src/types/product.ts`
- [x] `migrations/add-product-sizes.sql`

### Admin
- [ ] `src/components/admin/product-form.tsx`
- [ ] `src/components/admin/size-stock-manager.tsx` (nouveau)
- [ ] `src/lib/validations/product.ts` (ajouter validation sizes)

### Frontend
- [ ] `src/store/cart.ts`
- [ ] `src/app/produits/[slug]/page.tsx` ou composant product detail
- [ ] `src/components/cart/cart-drawer.tsx`
- [ ] `src/components/cart/cart-item.tsx`

### API
- [ ] `src/app/api/checkout/route.ts`
- [ ] `src/app/api/stripe/webhook/route.ts`
- [ ] `src/lib/products.ts` (helper décrémenter stock par taille)

### Emails
- [ ] `src/emails/pickup-confirmation.tsx`
- [ ] `src/emails/delivery-confirmation.tsx`

## ⚠️ Points d'attention

1. **Migration progressive** :
   - Produits existants → `sizes: []` (pas de tailles)
   - Nouveaux produits → soit `sizes: []` soit `sizes: [...]`
   - Code doit gérer les 2 cas

2. **Stock global vs stock par taille** :
   - Si `sizes.length > 0` → utiliser `sizes[].stock`
   - Si `sizes.length === 0` → utiliser `stockQuantity`
   - NE PAS mélanger les deux !

3. **Validation côté serveur** :
   - API checkout DOIT revalider stock avant création session Stripe
   - Webhook DOIT vérifier stock avant confirmer commande
   - Si stock insuffisant → annuler commande + rembourser

4. **Affichage admin orders** :
   - Colonne "Taille" dans liste items
   - Filtrer par taille possible ?

## 🚀 Ordre d'implémentation recommandé

1. **Phase 1** : Admin (création/édition produits avec tailles) ✅ DB schema
2. **Phase 2** : Page produit (select taille)
3. **Phase 3** : Panier (gérer tailles dans cart store)
4. **Phase 4** : Checkout (validation stock par taille)
5. **Phase 5** : Webhook (décrémenter stock, enregistrer taille)
6. **Phase 6** : Emails (afficher taille)

## 📊 Estimation temps

- Phase 1 (Admin) : ~2h
- Phase 2 (Page produit) : ~1h
- Phase 3 (Panier) : ~1h30
- Phase 4-5 (Checkout + Webhook) : ~2h
- Phase 6 (Emails) : ~30min

**Total** : ~7h de dev + tests

---

**Status actuel** : Phase 1 DB schema ✅ Prêt pour appliquer migration SQL
