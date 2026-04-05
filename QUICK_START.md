# Quick Start Guide - Product Catalog Admin

## For Administrators

### 1. First Time Setup (5 minutes)

#### Create Supabase Storage Bucket
1. Go to Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to Storage → Create bucket
4. Name: `products`
5. Toggle "Public bucket" to ON
6. Click "Create bucket"

#### Verify Environment Variables
Check `.env.local` has these set:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_EMAILS=your-email@domain.com
```

#### Apply Database Migrations
```bash
npm run db:push
```

You should see:
```
✓ Applying migrations...
✓ Success
```

### 2. Access Admin Interface (1 minute)

1. Start dev server: `npm run dev`
2. Open: http://localhost:3000/admin/products
3. Login with admin email (must be in ADMIN_EMAILS)

### 3. Create Your First Product (3 minutes)

1. Click "Nouveau produit" button
2. Fill required fields:
   - **ID**: Use lowercase-with-dashes (e.g., `mug-ville-2024`)
   - **Nom**: Display name (e.g., "Mug Ville Edition 2024")
   - **Description**: Full product description
   - **Prix**: Price in cents (e.g., `1200` for 12€)
   - **Frais de port**: Shipping cost in cents (e.g., `450` for 4,50€)

3. Upload images:
   - Drag & drop or click to select
   - Up to 5 images per product
   - Recommended: 600×750px (ratio 4:5)
   - Max size: 5MB per image
   - Formats: JPG, PNG, WebP

4. Set stock:
   - **Quantité en stock**: Initial quantity (e.g., `50`)
   - **Seuil d'alerte**: Low stock warning (e.g., `10`)

5. Check "Actif" to make product visible
6. Click "Créer le produit"

✅ Product created! It now appears on the homepage.

### 4. Manage Stock (30 seconds)

From product list page:

1. Click "Ajuster le stock" on any product
2. Choose action:
   - **Ajouter** - Restock (e.g., +50 units)
   - **Retirer** - Manual removal (e.g., -5 damaged)
   - **Définir** - Set exact quantity (e.g., inventory count)
3. Enter quantity
4. Add reason (optional but recommended)
5. Click "Enregistrer"

Stock updated! History saved automatically.

### 5. Email Alerts (Automatic)

You'll receive emails when:

**Low Stock**
- Triggered when stock reaches alert threshold
- Email: "Alerte stock faible: [Product Name]"
- Action: Consider reordering

**Out of Stock**
- Triggered when stock reaches 0
- Product automatically deactivated (not visible to customers)
- Email: "Rupture de stock: [Product Name]"
- Action: Restock to reactivate

**Back in Stock**
- Triggered when adding stock to inactive product
- Product automatically reactivated
- Email: "Produit réactivé: [Product Name]"
- Customers can now purchase again

**Configure recipients:**
```bash
# .env.local
ADMIN_EMAILS=admin1@domain.com,admin2@domain.com,webmaster@domain.com
```

## Common Tasks

### Update Product Price
1. Go to `/admin/products`
2. Click "Modifier" on product
3. Update "Prix (centimes)"
4. Save
5. New price immediately applied to checkout

### Add More Images
1. Edit product
2. Upload additional images (up to 5 total)
3. Drag to reorder (first = primary display)
4. Save

### Temporarily Hide Product
1. Edit product
2. Uncheck "Actif"
3. Save
4. Product hidden from homepage

### Delete Product
1. Click "Supprimer" on product card
2. Confirm deletion
3. Product and all images deleted permanently

⚠️ **Warning:** Cannot be undone! Product will be removed from database and images deleted from storage.

## View Stock History

Currently in product edit form (future: dedicated page).

Shows:
- Date/time of change
- Movement type (sale, adjustment, restock)
- Quantity change
- Reason (if provided)
- Who performed action

Useful for:
- Auditing stock changes
- Debugging discrepancies
- Understanding sales velocity

## Troubleshooting

### Images Not Uploading
**Problem:** Upload fails or hangs

**Check:**
1. Supabase Storage bucket "products" exists
2. Bucket is public
3. File size < 5MB
4. File type is JPG, PNG, or WebP
5. `SUPABASE_SERVICE_ROLE_KEY` set correctly

**Fix:**
```bash
# Verify env var
echo $SUPABASE_SERVICE_ROLE_KEY

# Should output key starting with "eyJhbGc..."
```

### Images Not Displaying
**Problem:** Broken image icons on homepage

**Check:**
1. Browser console for errors
2. Supabase bucket is public (not private)
3. Image URLs in database start with `https://`
4. `NEXT_PUBLIC_SUPABASE_URL` set correctly

**Fix:**
```bash
# Check env var is public (NEXT_PUBLIC_ prefix)
echo $NEXT_PUBLIC_SUPABASE_URL
```

### Stock Not Decrementing
**Problem:** Order completed but stock unchanged

**Check:**
1. PayFiP webhook is firing (check Vercel logs)
2. Order status is "paid"
3. Product IDs match between database and order
4. Stock movements table has entries

**Fix:**
1. Go to Vercel Dashboard → Logs
2. Filter for `/api/payfip/webhook`
3. Check for errors

### Email Alerts Not Sending
**Problem:** No emails received when stock low/out

**Check:**
1. `RESEND_API_KEY` set
2. `EMAIL_FROM` domain verified in Resend
3. `ADMIN_EMAILS` format correct (comma-separated, no spaces)
4. Email queue table (check for failed attempts)

**Fix:**
```bash
# Check env vars
echo $ADMIN_EMAILS
# Should be: admin@domain.com,other@domain.com
# NOT: admin@domain.com, other@domain.com (no spaces!)
```

### Cannot Access Admin Page
**Problem:** Redirected to login or 403 error

**Check:**
1. Logged in with correct email
2. Email is in `ADMIN_EMAILS` list
3. Auth session valid

**Fix:**
```bash
# Add your email to ADMIN_EMAILS
ADMIN_EMAILS=youremail@domain.com
```

## Migration from catalogue.ts

If you have products in `src/lib/catalogue.ts`:

1. **For each product in catalogue.ts:**
   - Create via admin UI
   - Use SAME product ID
   - Copy exact prices (in cents)
   - Copy exact shipping costs
   - Upload images from `/public/images/products/`
   - Set initial stock

2. **Verify migration:**
   - Homepage shows database products
   - Prices match exactly
   - Images display correctly
   - Can complete test order

3. **After 100% confident:**
   - See `MIGRATION_GUIDE.md` for removal steps
   - Keep backup of catalogue.ts

**Do NOT rush removal!** Test thoroughly first.

## Quick Reference

### Product ID Format
- Lowercase letters, numbers, hyphens only
- Example: `mug-ville-2024`
- Must be unique
- Used in URLs

### Price Format
- Always in CENTS (no decimal)
- 12€ → `1200`
- 4.50€ → `450`
- 0.50€ → `50`

### Image Specs
- **Recommended size:** 600×750px (ratio 4:5)
- **Max file size:** 5MB
- **Formats:** JPG, PNG, WebP
- **Count:** 1-5 images per product
- **First image:** Primary display (drag to reorder)

### Stock Adjustment Types
- **Ajouter (+)** - Restock, found inventory
- **Retirer (-)** - Damaged, stolen, sample
- **Définir (=)** - Physical inventory count

### URLs
- **Admin:** `/admin/products`
- **Create:** `/admin/products/new`
- **Edit:** `/admin/products/[id]`
- **Public API:** `/api/products`
- **Homepage:** `/`

## Need Help?

**Documentation:**
- `VERIFICATION_CHECKLIST.md` - Detailed testing steps (150+ items)
- `MIGRATION_GUIDE.md` - Migrate from catalogue.ts
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- `README.md` - General project documentation

**Logs:**
- **Browser console:** F12 → Console tab
- **Network tab:** F12 → Network tab
- **Vercel logs:** Dashboard → Project → Logs
- **Database:** `npm run db:studio`

**Common Issues:**
1. Images not uploading → Check Supabase bucket
2. Stock not decrementing → Check webhook logs
3. Emails not sending → Check Resend API key
4. Cannot access admin → Check ADMIN_EMAILS

**Questions?** Check documentation files first, then contact project maintainer.

---

**Ready?** Start with step 1 (Supabase bucket setup) and you'll have your first product live in 10 minutes!
