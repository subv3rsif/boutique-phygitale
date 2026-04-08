# Migration Guide: catalogue.ts → Database

## Current Status

The product catalog system now supports **dual mode**:
- ✅ **Database-driven** (new system) - Products managed via `/admin/products`
- ⚠️ **File-based** (legacy) - Products from `src/lib/catalogue.ts`

Many components still reference `catalogue.ts`. This is **intentional** and serves as a fallback during the migration period.

## Why Keep catalogue.ts for Now?

1. **Backward compatibility** - Existing orders may reference product IDs from catalogue.ts
2. **Gradual migration** - Allows testing database system while keeping shop operational
3. **Fallback safety** - If database products not available, homepage can still display products
4. **Reference data** - Original product specs preserved for validation

## Migration Strategy

### Phase 1: Database Setup ✅ COMPLETED
- [x] Create products and stock_movements tables
- [x] Setup Supabase Storage bucket
- [x] Build admin interface at `/admin/products`
- [x] Implement stock management system
- [x] Add email alert system

### Phase 2: Data Migration 🔄 IN PROGRESS

#### Step 1: Create Products in Database

For each product in `src/lib/catalogue.ts`:

1. Go to `/admin/products/new`
2. Fill in product details:
   - **ID**: Use SAME ID as catalogue.ts (important for order compatibility)
   - **Name**: Copy exact name
   - **Description**: Copy exact description
   - **Price**: Enter price in cents (e.g., 1200 for 12€)
   - **Shipping**: Enter shipping cost in cents
   - **Stock**: Set initial stock quantity
   - **Alert Threshold**: Set low stock warning level (e.g., 10)
   - **Active**: Check to enable product

3. Upload images:
   - Find images in `/public/images/products/`
   - Upload up to 5 images per product
   - First image becomes primary display image

4. Save product

#### Step 2: Verify Migration

Use the checklist in `VERIFICATION_CHECKLIST.md`:

- [ ] All 10 products from catalogue.ts created in database
- [ ] Product IDs match exactly
- [ ] Prices match (verify cents conversion)
- [ ] Shipping costs match
- [ ] Images uploaded and display correctly
- [ ] Stock quantities set
- [ ] All products active

#### Step 3: Test End-to-End

1. **Homepage displays database products**
   - Navigate to homepage
   - Verify products load from database API
   - Check browser network tab: `/api/products` called

2. **Cart functions correctly**
   - Add products to cart
   - Verify prices match database
   - Update quantities

3. **Checkout works**
   - Proceed to checkout
   - Complete test payment
   - Verify order created

4. **Stock decrements**
   - Check product stock after order
   - Verify stock_movements entry created
   - Confirm stock alerts trigger if threshold reached

### Phase 3: Code Refactoring 🚧 TODO

Once database migration verified, update components to use database exclusively.

#### Files to Update

**High Priority** (customer-facing):
1. `src/app/page.tsx` - Homepage product display
2. `src/components/product/bento-product-grid.tsx` - Product grid
3. `src/components/product/product-carousel.tsx` - Mobile carousel
4. `src/app/produit/[id]/page.tsx` - Product detail page
5. `src/components/product/product-card.tsx` - Product card component

**Medium Priority** (cart/checkout):
6. `src/app/panier/page.tsx` - Cart page
7. `src/components/cart/cart-item.tsx` - Cart item display
8. `src/app/api/checkout/route.ts` - Checkout API (critical for price validation)

**Low Priority** (order/email):
9. `src/app/ma-commande/[orderId]/page.tsx` - Order detail
10. `src/lib/email/templates/*.tsx` - Email templates

#### Refactoring Pattern

**Before (catalogue.ts import):**
```typescript
import { catalogue, getProductById } from '@/lib/catalogue';

const product = getProductById('mug-ville-2024');
```

**After (database API):**
```typescript
const response = await fetch('/api/products/mug-ville-2024');
const product = await response.json();
```

Or using server-side data fetching:
```typescript
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const product = await db.query.products.findFirst({
  where: eq(products.id, 'mug-ville-2024')
});
```

#### Update Strategy

For each file:
1. Replace `import { catalogue }` with database query
2. Replace `getProductById()` with API call or direct DB query
3. Update product type imports to use database schema types
4. Test component thoroughly
5. Commit changes incrementally

### Phase 4: Remove catalogue.ts ⚠️ FINAL STEP

**ONLY proceed when:**
- [ ] All products migrated to database and verified
- [ ] All components refactored to use database
- [ ] End-to-end tests passing
- [ ] Production tested for 1-2 weeks without issues
- [ ] Backup of catalogue.ts saved externally

**Steps:**
```bash
# 1. Create backup
cp src/lib/catalogue.ts ~/catalogue-backup-$(date +%Y%m%d).ts

# 2. Search for any remaining imports
grep -r "from '@/lib/catalogue'" src/

# 3. If clean, remove file
git rm src/lib/catalogue.ts

# 4. Commit
git commit -m "chore: remove catalogue.ts after complete database migration"

# 5. Deploy and monitor
vercel deploy --prod
```

## Rollback Plan

If issues arise after removing catalogue.ts:

```bash
# Restore file from backup
cp ~/catalogue-backup-[date].ts src/lib/catalogue.ts

# Revert components to use catalogue.ts
git revert [commit-hash]

# Redeploy
vercel deploy --prod
```

## Current File Usage

### Files Using catalogue.ts (as of last scan)

**Customer-facing:**
- `src/app/page.tsx` - Homepage product display
- `src/app/produit/[id]/page.tsx` - Product detail pages
- `src/components/product/bento-product-grid.tsx` - Product grid
- `src/components/product/product-carousel.tsx` - Mobile carousel
- `src/components/product/product-card.tsx` - Product cards
- `src/components/product/product-card-zara.tsx` - Alternative card style

**Cart/Checkout:**
- `src/app/panier/page.tsx` - Cart page
- `src/components/cart/cart-item.tsx` - Cart items
- `src/components/cart/cart-sticky-mobile.tsx` - Mobile cart
- `src/app/api/checkout/route.ts` - **Critical: Price recalculation**

**Orders/Admin:**
- `src/app/ma-commande/[orderId]/page.tsx` - Order detail
- `src/app/commande/resultat/page.tsx` - Order result page
- `src/app/retrait/[token]/page.tsx` - Pickup validation
- `src/components/admin/product-list.tsx` - Admin product list

**Emails:**
- `src/lib/email/templates/pickup-confirmation.tsx`
- `src/lib/email/templates/delivery-confirmation.tsx`

**Mock/Test:**
- `src/app/payfip-mock/[idop]/page.tsx` - Payment mock

### Critical Files

These files MUST be updated before removing catalogue.ts:

1. **`src/app/api/checkout/route.ts`**
   - Currently recalculates prices from catalogue.ts
   - **Security critical**: Must fetch prices from database to prevent client manipulation
   - This is the MOST IMPORTANT file to update

2. **`src/app/page.tsx`**
   - Homepage displays all products
   - High visibility, customer-facing

3. **`src/app/panier/page.tsx`**
   - Cart displays product details
   - Must show current database prices

## Testing Checklist Before catalogue.ts Removal

- [ ] Homepage loads products from database
- [ ] Product detail pages load from database
- [ ] Cart displays correct product info
- [ ] **Checkout recalculates prices from database** ⚠️ CRITICAL
- [ ] Order confirmation shows correct products
- [ ] Email templates include correct product data
- [ ] Admin can manage all products via UI
- [ ] Stock system working (decrement on sale)
- [ ] Email alerts triggering correctly
- [ ] No console errors in browser
- [ ] No 404s for product images
- [ ] Complete test order end-to-end successful

## Database Schema Reference

Products are stored with this structure:

```typescript
{
  id: string;              // e.g., "mug-ville-2024"
  name: string;            // e.g., "Mug Ville Edition 2024"
  description: string;     // Full product description
  price_cents: number;     // e.g., 1200 (12€)
  shipping_cents: number;  // e.g., 450 (4,50€)
  images: string[];        // Array of Supabase Storage URLs
  active: boolean;         // Whether product is visible
  stock_quantity: number;  // Current stock
  stock_alert_threshold: number; // Low stock warning level
  created_at: Date;
  updated_at: Date;
}
```

## Environment Variables Required

Ensure these are configured:

```bash
# Database
DATABASE_URL=postgresql://...

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Email Alerts
RESEND_API_KEY=...
EMAIL_FROM=noreply@domain.fr
ADMIN_EMAILS=admin1@domain.fr,admin2@domain.fr
```

## Timeline Recommendation

**Week 1: Setup** ✅ Complete
- Database schema created
- Admin interface built
- Stock management implemented

**Week 2: Migration** 🔄 Current
- Create all products in database via admin UI
- Upload images to Supabase Storage
- Set stock quantities
- Test end-to-end flow

**Week 3: Code Refactoring**
- Update customer-facing components
- Update checkout API (critical!)
- Update cart and order pages
- Test thoroughly

**Week 4: Production Testing**
- Deploy to production
- Monitor for issues
- Verify orders processing correctly
- Check stock decrements working

**Week 5: Cleanup**
- Remove catalogue.ts
- Final testing
- Monitor production

## Questions?

If you encounter issues:

1. Check `VERIFICATION_CHECKLIST.md` for detailed testing steps
2. Review `README.md` Product Management section
3. Check Supabase Storage bucket configuration
4. Verify environment variables set correctly
5. Check browser console and network tab for errors

## Summary

**Current State:**
- ✅ Database system fully implemented
- ✅ Admin interface operational
- ⚠️ Components still use catalogue.ts (by design)

**Next Steps:**
1. Migrate products to database via admin UI
2. Verify end-to-end flow works
3. Refactor components to use database
4. Test thoroughly in production
5. Remove catalogue.ts only when 100% confident

**Estimated Time:**
- Migration: 2-4 hours (manual data entry)
- Refactoring: 1-2 days (developer work)
- Testing: 1 week (production validation)

**Do NOT rush the catalogue.ts removal.** It's safer to keep it as a reference during migration.
