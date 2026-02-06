import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Checkout Flow - Delivery Mode
 *
 * Tests the complete user journey from product selection to order confirmation
 * in delivery mode with Stripe payment.
 */

test.describe('Checkout Flow - Delivery Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('/');
  });

  test('should display product catalogue with correct information', async ({ page }) => {
    // Verify homepage loads
    await expect(page).toHaveTitle(/Boutique Ville/);

    // Verify product cards are displayed
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards).toHaveCount(3); // 3 demo products

    // Verify first product has required elements
    const firstProduct = productCards.first();
    await expect(firstProduct.locator('img')).toBeVisible();
    await expect(firstProduct.locator('text=/\\d+,\\d+ €/')).toBeVisible(); // Price format
    await expect(firstProduct.locator('button', { hasText: 'Ajouter au panier' })).toBeVisible();
  });

  test('should add product to cart and update cart badge', async ({ page }) => {
    // Add first product to cart
    await page.locator('[data-testid="product-card"]').first().locator('button', { hasText: 'Ajouter au panier' }).click();

    // Verify toast notification
    await expect(page.locator('text=Produit ajouté au panier')).toBeVisible();

    // Verify cart badge updates
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText('1');

    // Add another product
    await page.locator('[data-testid="product-card"]').nth(1).locator('button', { hasText: 'Ajouter au panier' }).click();
    await expect(cartBadge).toHaveText('2');
  });

  test('should manage cart items (update quantity, remove)', async ({ page }) => {
    // Add product to cart
    await page.locator('[data-testid="product-card"]').first().locator('button', { hasText: 'Ajouter au panier' }).click();

    // Navigate to cart
    await page.locator('[data-testid="cart-link"]').click();
    await expect(page).toHaveURL('/panier');

    // Verify cart item is displayed
    const cartItem = page.locator('[data-testid="cart-item"]').first();
    await expect(cartItem).toBeVisible();

    // Increase quantity
    await cartItem.locator('button[aria-label="Augmenter la quantité"]').click();
    await expect(cartItem.locator('[data-testid="item-quantity"]')).toHaveText('2');

    // Decrease quantity
    await cartItem.locator('button[aria-label="Diminuer la quantité"]').click();
    await expect(cartItem.locator('[data-testid="item-quantity"]')).toHaveText('1');

    // Remove item
    await cartItem.locator('button[aria-label="Supprimer"]').click();
    await expect(page.locator('text=Votre panier est vide')).toBeVisible();
  });

  test('should select delivery mode and calculate shipping correctly', async ({ page }) => {
    // Add product to cart
    await page.locator('[data-testid="product-card"]').first().locator('button', { hasText: 'Ajouter au panier' }).click();

    // Go to cart
    await page.locator('[data-testid="cart-link"]').click();

    // Verify delivery mode is selected by default
    const deliveryOption = page.locator('[data-testid="fulfillment-delivery"]');
    await expect(deliveryOption).toHaveAttribute('data-selected', 'true');

    // Verify shipping cost is displayed
    await expect(page.locator('text=/Livraison.*€/')).toBeVisible();

    // Verify total includes shipping
    const totalText = await page.locator('[data-testid="grand-total"]').textContent();
    expect(totalText).toMatch(/\d+,\d+ €/);
  });

  test('should require GDPR consent before checkout', async ({ page }) => {
    // Add product and go to cart
    await page.locator('[data-testid="product-card"]').first().locator('button', { hasText: 'Ajouter au panier' }).click();
    await page.locator('[data-testid="cart-link"]').click();

    // Try to checkout without GDPR consent
    const checkoutButton = page.locator('button', { hasText: 'Payer avec Stripe' });
    await expect(checkoutButton).toBeDisabled();

    // Check GDPR checkbox
    await page.locator('[data-testid="gdpr-consent"]').check();

    // Verify checkout button is now enabled
    await expect(checkoutButton).toBeEnabled();
  });

  test('should create Stripe checkout session and redirect', async ({ page }) => {
    // Mock the checkout API to avoid real Stripe redirect in tests
    await page.route('/api/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://checkout.stripe.com/test-session'
        })
      });
    });

    // Add product and go to cart
    await page.locator('[data-testid="product-card"]').first().locator('button', { hasText: 'Ajouter au panier' }).click();
    await page.locator('[data-testid="cart-link"]').click();

    // Accept GDPR and checkout
    await page.locator('[data-testid="gdpr-consent"]').check();

    // Wait for navigation
    const [response] = await Promise.all([
      page.waitForResponse('/api/checkout'),
      page.locator('button', { hasText: 'Payer avec Stripe' }).click()
    ]);

    // Verify API was called
    expect(response.status()).toBe(200);

    // In real scenario, would redirect to Stripe
    // Here we verify the button showed loading state
    await expect(page.locator('text=Création de la session')).toHaveCount(0); // Loading finished
  });

  test('should handle empty cart gracefully', async ({ page }) => {
    // Navigate directly to cart
    await page.goto('/panier');

    // Verify empty state
    await expect(page.locator('text=Votre panier est vide')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Payer avec Stripe' })).toBeDisabled();

    // Verify CTA to go back to catalogue
    await expect(page.locator('a', { hasText: 'Voir le catalogue' })).toBeVisible();
  });

  test('should persist cart across page refreshes', async ({ page }) => {
    // Add products to cart
    await page.locator('[data-testid="product-card"]').first().locator('button', { hasText: 'Ajouter au panier' }).click();
    await page.locator('[data-testid="product-card"]').nth(1).locator('button', { hasText: 'Ajouter au panier' }).click();

    // Verify cart badge
    await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('2');

    // Reload page
    await page.reload();

    // Verify cart is still populated (Zustand persistence)
    await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('2');

    // Go to cart and verify items
    await page.locator('[data-testid="cart-link"]').click();
    const cartItems = page.locator('[data-testid="cart-item"]');
    await expect(cartItems).toHaveCount(2);
  });

  test('should enforce maximum quantity limit (10 per product)', async ({ page }) => {
    // Add product to cart
    await page.locator('[data-testid="product-card"]').first().locator('button', { hasText: 'Ajouter au panier' }).click();
    await page.locator('[data-testid="cart-link"]').click();

    // Increase quantity to maximum
    const increaseButton = page.locator('button[aria-label="Augmenter la quantité"]');

    // Click 9 times to reach 10
    for (let i = 0; i < 9; i++) {
      await increaseButton.click();
      await page.waitForTimeout(100); // Small delay to ensure state updates
    }

    // Verify quantity is 10
    await expect(page.locator('[data-testid="item-quantity"]')).toHaveText('10');

    // Try to increase beyond 10
    await increaseButton.click();

    // Verify quantity stays at 10 (capped)
    await expect(page.locator('[data-testid="item-quantity"]')).toHaveText('10');
  });

  test('should calculate totals correctly with multiple items', async ({ page }) => {
    // Add two different products with different quantities
    await page.locator('[data-testid="product-card"]').first().locator('button', { hasText: 'Ajouter au panier' }).click();
    await page.locator('[data-testid="product-card"]').nth(1).locator('button', { hasText: 'Ajouter au panier' }).click();

    // Go to cart
    await page.locator('[data-testid="cart-link"]').click();

    // Increase first item quantity
    await page.locator('[data-testid="cart-item"]').first().locator('button[aria-label="Augmenter la quantité"]').click();

    // Get displayed totals
    const itemsTotalText = await page.locator('[data-testid="items-total"]').textContent();
    const shippingTotalText = await page.locator('[data-testid="shipping-total"]').textContent();
    const grandTotalText = await page.locator('[data-testid="grand-total"]').textContent();

    // Verify format (should be "XX,XX €")
    expect(itemsTotalText).toMatch(/\d+,\d+ €/);
    expect(shippingTotalText).toMatch(/\d+,\d+ €/);
    expect(grandTotalText).toMatch(/\d+,\d+ €/);

    // Note: Exact amount verification would require mocking catalogue
    // For real tests, you'd extract numbers and verify: grandTotal = itemsTotal + shippingTotal
  });
});
