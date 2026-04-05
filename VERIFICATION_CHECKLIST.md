# Product Catalog System - Verification Checklist

## Database Setup

### Tables Created
- [ ] `products` table exists with all columns (id, name, description, price_cents, shipping_cents, images JSONB, active, stock_quantity, stock_alert_threshold, created_at, updated_at)
- [ ] `stock_movements` table exists (id, product_id, movement_type, quantity, reason, performed_by, created_at)
- [ ] Indexes created on product_id in stock_movements
- [ ] Foreign key constraint on stock_movements.product_id

**How to verify:**
```bash
npm run db:studio
# Check tables in Drizzle Studio
```

## Supabase Storage

### Bucket Configuration
- [ ] Bucket named "products" created in Supabase Storage
- [ ] Bucket is public (allows image display on frontend)
- [ ] Upload permissions configured (service role key can upload)
- [ ] Can access images via URL: `https://[project].supabase.co/storage/v1/object/public/products/[filename]`

**How to verify:**
1. Go to Supabase Dashboard → Storage
2. Check "products" bucket exists
3. Verify "Public bucket" toggle is ON
4. Try uploading test image via admin interface

## Environment Variables

### Required Variables Set
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configured
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configured (for uploads)
- [ ] `ADMIN_EMAILS` configured (for stock alerts)
- [ ] `RESEND_API_KEY` configured (for email alerts)
- [ ] `EMAIL_FROM` configured

**How to verify:**
```bash
# Check .env.local has all required variables
cat .env.local | grep -E '(SUPABASE|ADMIN_EMAILS|RESEND)'
```

## Admin Interface Access

### Authentication
- [ ] Admin can access `/admin/products` route
- [ ] Non-admin users are redirected to login
- [ ] Admin email is in ADMIN_EMAILS list

**How to verify:**
1. Navigate to `/admin/products` while logged out → should redirect
2. Login with admin email → should access successfully
3. Try with non-admin email → should be denied

## Product CRUD Operations

### Create Product
- [ ] Can access `/admin/products/new` form
- [ ] Can fill all required fields (name, description, price, shipping)
- [ ] Can upload 1-5 images
- [ ] Image preview displays correctly
- [ ] Can set stock quantity and alert threshold
- [ ] Save button creates product in database
- [ ] Redirects to product list after save
- [ ] Product appears in list

**How to verify:**
1. Go to `/admin/products/new`
2. Fill form with test product
3. Upload 2-3 test images
4. Set stock to 50, alert threshold to 10
5. Click "Créer le produit"
6. Verify redirect to `/admin/products`
7. Verify product appears in list

### Read/List Products
- [ ] Product list displays at `/admin/products`
- [ ] Shows all products with first image thumbnail
- [ ] Displays stock quantity badge
- [ ] Shows price and active status
- [ ] Can filter active/inactive products
- [ ] Pagination works (if many products)

**How to verify:**
1. Navigate to `/admin/products`
2. Check product cards display correctly
3. Verify stock badges show correct numbers
4. Toggle active/inactive filter

### Update Product
- [ ] Can click "Modifier" on product card
- [ ] Edit form loads with existing data
- [ ] Can modify all fields
- [ ] Can add/remove images (max 5)
- [ ] Save button updates product
- [ ] Changes reflected in list

**How to verify:**
1. Click "Modifier" on test product
2. Change name, price, stock
3. Add/remove an image
4. Save
5. Verify changes in list view

### Delete Product
- [ ] Can click "Supprimer" on product card
- [ ] Confirmation dialog appears
- [ ] Confirming deletes product from database
- [ ] Images removed from Supabase Storage
- [ ] Product removed from list

**How to verify:**
1. Create test product
2. Click "Supprimer"
3. Confirm deletion
4. Verify product gone from list
5. Check Supabase Storage - images should be deleted

## Image Upload System

### Upload Functionality
- [ ] Can select multiple images (up to 5)
- [ ] File size validation works (max 5MB per image)
- [ ] File type validation (only jpg, jpeg, png, webp)
- [ ] Images upload to Supabase Storage bucket "products"
- [ ] Unique filenames generated (timestamp + random)
- [ ] Upload progress indicator displays
- [ ] Error handling for failed uploads

**How to verify:**
1. Try uploading 6 images → should block/warn
2. Try uploading 10MB file → should reject
3. Try uploading .txt file → should reject
4. Upload valid images → should succeed with progress bar

### Image Display
- [ ] Uploaded images display in preview grid
- [ ] Can remove image before saving
- [ ] Images display on product cards (list view)
- [ ] Images display on public homepage
- [ ] Images load from Supabase CDN URL
- [ ] Broken image fallback works

**How to verify:**
1. Upload images in product form
2. Check preview grid displays thumbnails
3. Save product
4. View product in list → image displays
5. View homepage → product image displays
6. Check browser network tab → images load from Supabase URL

## Stock Management

### Stock Adjustment Interface
- [ ] "Ajuster le stock" button visible on product card
- [ ] Stock adjustment dialog opens
- [ ] Can select adjustment type (add/remove/set)
- [ ] Can enter quantity
- [ ] Can enter reason (optional)
- [ ] Validation prevents negative stock
- [ ] Save updates stock in database
- [ ] Creates entry in stock_movements table

**How to verify:**
1. Click "Ajuster le stock" on product
2. Select "Ajouter"
3. Enter quantity: 20, reason: "Réapprovisionnement"
4. Save
5. Verify stock increased by 20
6. Check Drizzle Studio → stock_movements has new entry

### Stock Movement History
- [ ] Can view stock history on product detail/edit page
- [ ] Shows all movements (sale, adjustment, restock)
- [ ] Displays quantity change, reason, date, performed by
- [ ] Sorted by date (newest first)

**How to verify:**
1. Make several stock adjustments
2. View product edit page
3. Check history section displays all movements
4. Verify dates and quantities are correct

### Automatic Stock Decrement
- [ ] Order webhook decrements stock for each item
- [ ] Creates stock_movement entry with type "sale"
- [ ] Order ID stored in stock movement
- [ ] Stock prevents going negative (validation)

**How to verify:**
1. Create test product with stock = 5
2. Place test order with 2 units
3. Complete payment (trigger webhook)
4. Check product stock decreased to 3
5. Check stock_movements has "sale" entry with order_id

## Stock Alerts

### Low Stock Alert
- [ ] Email sent when stock reaches alert threshold
- [ ] Email contains product details and current stock
- [ ] Email sent to all ADMIN_EMAILS
- [ ] Alert only sent once per threshold crossing
- [ ] No duplicate alerts

**How to verify:**
1. Set product stock = 11, alert threshold = 10
2. Adjust stock to 10 (triggers alert)
3. Check admin email inbox
4. Verify "Alerte stock faible" email received
5. Adjust to 9 → no new email (already alerted)

### Out of Stock Alert
- [ ] Email sent when stock reaches 0
- [ ] Product automatically set to inactive (active = false)
- [ ] Email contains restock instructions
- [ ] Email sent to all ADMIN_EMAILS

**How to verify:**
1. Set product stock = 1
2. Place order for 1 unit
3. Complete payment
4. Check admin email inbox
5. Verify "Rupture de stock" email received
6. Check product is now inactive (active = false)

### Restock Alert
- [ ] Email sent when stock added to inactive product
- [ ] Product automatically reactivated (active = true)
- [ ] Email confirms product is back online
- [ ] Email sent to all ADMIN_EMAILS

**How to verify:**
1. Product with stock = 0, active = false
2. Adjust stock to 20
3. Check admin email inbox
4. Verify "Produit réactivé" email received
5. Check product is now active (active = true)

## Public Homepage Integration

### Product Display
- [ ] Homepage fetches products from database (not catalogue.ts)
- [ ] Only active products displayed
- [ ] Products sorted by created_at DESC
- [ ] Images load from Supabase Storage
- [ ] Price formatting correct (cents → euros)
- [ ] Shipping cost displayed correctly
- [ ] Out of stock products not shown

**How to verify:**
1. Create product in admin
2. Set active = true, stock > 0
3. View homepage → product displays
4. Set active = false
5. Refresh homepage → product hidden
6. Check browser network → API call to `/api/products`

### Product Card
- [ ] Image displays (first image from array)
- [ ] Product name displays
- [ ] Price displays formatted
- [ ] "Ajouter au panier" button visible
- [ ] Clicking button adds to cart
- [ ] Out of stock badge if stock = 0

**How to verify:**
1. View homepage product card
2. Verify all fields display correctly
3. Click "Ajouter au panier"
4. Check cart has 1 item

## Cart & Checkout Integration

### Add to Cart
- [ ] Adding product fetches latest price from database
- [ ] Stock validation before adding
- [ ] Cannot add more than available stock
- [ ] Cannot add inactive products

**How to verify:**
1. Product with stock = 5
2. Try adding 10 units → should prevent/warn
3. Try adding 3 units → should succeed
4. Check cart quantity = 3

### Checkout Price Validation
- [ ] Checkout API recalculates prices from database
- [ ] Client cannot manipulate prices
- [ ] Shipping costs recalculated
- [ ] Total matches database prices

**How to verify:**
1. Add product to cart
2. Modify product price in database
3. Proceed to checkout
4. Verify checkout uses NEW price (not cached cart price)

### Order Completion
- [ ] Successful payment triggers stock decrement
- [ ] Stock decremented for ALL items in order
- [ ] Stock movement created for each item
- [ ] Order ID linked to stock movements

**How to verify:**
1. Product A stock = 10, Product B stock = 20
2. Order: 2× Product A, 3× Product B
3. Complete payment
4. Check Product A stock = 8
5. Check Product B stock = 17
6. Verify 2 stock_movements entries created with order_id

## Error Handling

### Upload Errors
- [ ] Network error displays user-friendly message
- [ ] Storage bucket full handled gracefully
- [ ] Invalid file type rejected with message
- [ ] File too large rejected with message

**How to verify:**
1. Disconnect internet → try upload → should show error
2. Upload .pdf file → should reject with message
3. Upload 20MB image → should reject with message

### Stock Errors
- [ ] Negative stock prevented
- [ ] Out of stock checkout blocked
- [ ] Stock adjustment validates quantity
- [ ] Database constraint prevents negative stock

**How to verify:**
1. Try setting stock to -5 → should reject
2. Try ordering more units than available → should block
3. Check database constraint prevents negative values

### API Errors
- [ ] 401 for unauthorized admin routes
- [ ] 400 for invalid product data
- [ ] 404 for non-existent products
- [ ] 500 errors logged and displayed gracefully

**How to verify:**
1. Call admin API without auth → 401
2. Submit invalid product (empty name) → 400
3. Request non-existent product ID → 404

## Performance

### Image Loading
- [ ] Images lazy load
- [ ] Thumbnails generated/optimized
- [ ] Images cached by CDN
- [ ] No layout shift during image load

**How to verify:**
1. Open homepage with network throttling
2. Scroll → images load as they enter viewport
3. Check network tab → images served from Supabase CDN
4. Reload → images load from browser cache

### Database Queries
- [ ] Products query indexed
- [ ] Stock movements query indexed
- [ ] Pagination implemented for large lists
- [ ] No N+1 query problems

**How to verify:**
1. Check Drizzle Studio → indexes exist
2. View product list with 50+ products → should paginate
3. Check browser network → reasonable response times

## Migration from catalogue.ts

### Verification Steps
- [ ] All 10 products from catalogue.ts migrated to database
- [ ] Product IDs match (for existing orders compatibility)
- [ ] Prices match exactly (cents)
- [ ] Shipping costs match exactly (cents)
- [ ] Images migrated to Supabase Storage
- [ ] Stock quantities initialized
- [ ] All products set to active

**How to verify:**
1. Open `src/lib/catalogue.ts`
2. Compare each product to database entry
3. Verify IDs, names, prices, shipping match exactly
4. Check images uploaded to Storage
5. Verify homepage shows all 10 products

### Post-Migration
- [ ] Homepage loads products from database
- [ ] Cart functions with database products
- [ ] Checkout uses database prices
- [ ] Orders create successfully
- [ ] Stock decrements on sale
- [ ] No errors in browser console
- [ ] No references to catalogue.ts in active code

**How to verify:**
1. Search codebase for `import.*catalogue`
2. Check homepage doesn't import catalogue.ts
3. Complete test order end-to-end
4. Verify no console errors

### Safe to Delete catalogue.ts
- [ ] All products migrated and verified
- [ ] No code imports catalogue.ts (except tests)
- [ ] Test orders completed successfully
- [ ] Stock system working
- [ ] Email alerts working
- [ ] Backup of catalogue.ts saved externally

**How to delete:**
```bash
# Keep a backup first
cp src/lib/catalogue.ts ~/catalogue-backup.ts

# Remove file
git rm src/lib/catalogue.ts
git commit -m "chore: remove catalogue.ts after database migration"
```

## Final System Test

### End-to-End Flow
1. [ ] Admin creates new product with images
2. [ ] Product appears on homepage
3. [ ] Customer adds product to cart
4. [ ] Customer proceeds to checkout
5. [ ] Payment completes successfully
6. [ ] Stock decrements automatically
7. [ ] Stock movement entry created
8. [ ] Customer receives confirmation email
9. [ ] Admin sees order in dashboard
10. [ ] Admin can fulfill order

### Load Testing (Optional)
- [ ] 10 concurrent users can browse catalog
- [ ] Multiple admins can edit different products simultaneously
- [ ] Image uploads handle concurrent requests
- [ ] Stock decrements handle race conditions safely

## Troubleshooting Common Issues

### Images Not Displaying
- Check bucket is public
- Verify NEXT_PUBLIC_SUPABASE_URL is correct
- Check image URLs in database
- Check browser console for CORS errors

### Stock Not Decrementing
- Verify PayFiP webhook firing
- Check webhook logs in Vercel
- Verify order status = "paid"
- Check stock_movements table for entries

### Email Alerts Not Sending
- Check RESEND_API_KEY configured
- Verify EMAIL_FROM domain verified in Resend
- Check ADMIN_EMAILS format (comma-separated)
- Check email_queue table for failed attempts

### Upload Failing
- Verify SUPABASE_SERVICE_ROLE_KEY configured
- Check Storage bucket exists
- Verify bucket permissions
- Check file size < 5MB

---

## Summary

Total verification items: ~150+

When all items checked:
- ✅ Product catalog system fully functional
- ✅ Stock management operational with alerts
- ✅ Images uploading and displaying correctly
- ✅ Admin interface complete
- ✅ Homepage integrated with database
- ✅ Safe to remove catalogue.ts
- ✅ System ready for production

**Estimated verification time:** 2-3 hours for thorough testing
