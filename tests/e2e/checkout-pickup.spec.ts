import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Checkout Flow - Pickup Mode
 *
 * Tests the complete user journey for pickup orders with QR code generation
 * and validation at La Fabrik.
 */

test.describe('Checkout Flow - Pickup Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should select pickup mode and display location info', async ({ page }) => {
    // Add product to cart
    await page.locator('[data-testid="product-card"]').first().locator('button', { hasText: 'Ajouter au panier' }).click();

    // Navigate to cart
    await page.locator('[data-testid="cart-link"]').click();

    // Select pickup mode
    const pickupOption = page.locator('[data-testid="fulfillment-pickup"]');
    await pickupOption.click();

    // Verify pickup option is selected
    await expect(pickupOption).toHaveAttribute('data-selected', 'true');

    // Verify La Fabrik location info is displayed
    await expect(page.locator('text=La Fabrik')).toBeVisible();
    await expect(page.locator('text=/Rue de la République/')).toBeVisible();
    await expect(page.locator('text=/Lundi-Vendredi/')).toBeVisible();
  });

  test('should have zero shipping cost in pickup mode', async ({ page }) => {
    // Add product to cart
    await page.locator('[data-testid="product-card"]').first().locator('button', { hasText: 'Ajouter au panier' }).click();

    // Go to cart
    await page.locator('[data-testid="cart-link"]').click();

    // Switch to pickup mode
    await page.locator('[data-testid="fulfillment-pickup"]').click();

    // Verify shipping cost is 0€
    const shippingTotal = await page.locator('[data-testid="shipping-total"]').textContent();
    expect(shippingTotal).toContain('0,00 €');

    // Verify grand total equals items total (no shipping)
    const itemsTotal = await page.locator('[data-testid="items-total"]').textContent();
    const grandTotal = await page.locator('[data-testid="grand-total"]').textContent();

    // Extract numerical values
    const itemsAmount = parseFloat(itemsTotal!.replace(',', '.').replace(' €', ''));
    const grandAmount = parseFloat(grandTotal!.replace(',', '.').replace(' €', ''));

    expect(grandAmount).toBeCloseTo(itemsAmount, 2);
  });

  test('should switch between delivery and pickup modes', async ({ page }) => {
    // Add product to cart
    await page.locator('[data-testid="product-card"]').first().locator('button', { hasText: 'Ajouter au panier' }).click();
    await page.locator('[data-testid="cart-link"]').click();

    // Get initial total (delivery mode)
    const deliveryTotal = await page.locator('[data-testid="grand-total"]').textContent();

    // Switch to pickup
    await page.locator('[data-testid="fulfillment-pickup"]').click();
    await page.waitForTimeout(300); // Wait for state update

    // Get pickup total (should be lower)
    const pickupTotal = await page.locator('[data-testid="grand-total"]').textContent();

    // Extract amounts
    const deliveryAmount = parseFloat(deliveryTotal!.replace(',', '.').replace(' €', ''));
    const pickupAmount = parseFloat(pickupTotal!.replace(',', '.').replace(' €', ''));

    // Pickup should be cheaper (no shipping)
    expect(pickupAmount).toBeLessThan(deliveryAmount);

    // Switch back to delivery
    await page.locator('[data-testid="fulfillment-delivery"]').click();
    await page.waitForTimeout(300);

    // Verify total is back to original
    const finalTotal = await page.locator('[data-testid="grand-total"]').textContent();
    expect(finalTotal).toBe(deliveryTotal);
  });

  test('should persist fulfillment mode selection across refreshes', async ({ page }) => {
    // Add product and select pickup
    await page.locator('[data-testid="product-card"]').first().locator('button', { hasText: 'Ajouter au panier' }).click();
    await page.locator('[data-testid="cart-link"]').click();
    await page.locator('[data-testid="fulfillment-pickup"]').click();

    // Verify pickup selected
    await expect(page.locator('[data-testid="fulfillment-pickup"]')).toHaveAttribute('data-selected', 'true');

    // Reload page
    await page.reload();

    // Verify pickup is still selected (Zustand persistence)
    await expect(page.locator('[data-testid="fulfillment-pickup"]')).toHaveAttribute('data-selected', 'true');

    // Verify shipping is still 0€
    await expect(page.locator('[data-testid="shipping-total"]')).toContainText('0,00 €');
  });

  test('should create pickup order with QR code (mocked)', async ({ page }) => {
    // Mock checkout API for pickup
    await page.route('/api/checkout', async (route) => {
      const request = route.request();
      const postData = JSON.parse(request.postData() || '{}');

      // Verify fulfillmentMode is pickup
      expect(postData.fulfillmentMode).toBe('pickup');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://checkout.stripe.com/test-pickup-session'
        })
      });
    });

    // Add product and go to cart
    await page.locator('[data-testid="product-card"]').first().locator('button', { hasText: 'Ajouter au panier' }).click();
    await page.locator('[data-testid="cart-link"]').click();

    // Select pickup mode
    await page.locator('[data-testid="fulfillment-pickup"]').click();

    // Accept GDPR and checkout
    await page.locator('[data-testid="gdpr-consent"]').check();

    const [response] = await Promise.all([
      page.waitForResponse('/api/checkout'),
      page.locator('button', { hasText: 'Payer avec Stripe' }).click()
    ]);

    // Verify request was made correctly
    expect(response.status()).toBe(200);
  });

  test('should display QR code on order confirmation page (pickup)', async ({ page }) => {
    // Mock order details page with pickup order
    const mockOrderId = 'test-order-pickup-123';

    await page.route(`/api/admin/orders/${mockOrderId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: mockOrderId,
          status: 'paid',
          fulfillmentMode: 'pickup',
          customerEmail: 'test@example.com',
          grandTotalCents: 1200,
          pickupToken: 'abc123def456',
          createdAt: new Date().toISOString(),
        })
      });
    });

    // Navigate to order page
    await page.goto(`/ma-commande/${mockOrderId}`);

    // Verify QR code is displayed
    await expect(page.locator('[data-testid="qr-code"]')).toBeVisible();

    // Verify pickup instructions
    await expect(page.locator('text=Présentez ce QR code')).toBeVisible();
    await expect(page.locator('text=La Fabrik')).toBeVisible();

    // Verify expiration notice
    await expect(page.locator('text=/Valable.*jours/')).toBeVisible();
  });

  test('should allow downloading QR code', async ({ page }) => {
    // Navigate to mocked order page
    const mockOrderId = 'test-order-pickup-789';

    await page.route(`/api/admin/orders/${mockOrderId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: mockOrderId,
          status: 'paid',
          fulfillmentMode: 'pickup',
          customerEmail: 'test@example.com',
          grandTotalCents: 1200,
          pickupToken: 'xyz789uvw456',
          createdAt: new Date().toISOString(),
        })
      });
    });

    await page.goto(`/ma-commande/${mockOrderId}`);

    // Verify download button exists
    const downloadButton = page.locator('button', { hasText: /Télécharger/ });
    await expect(downloadButton).toBeVisible();

    // Click download (would trigger browser download in real scenario)
    // In test, we just verify it's clickable
    await expect(downloadButton).toBeEnabled();
  });

  test('should handle QR token validation on public page', async ({ page }) => {
    // Mock token validation page
    const mockToken = 'valid-token-123456789';

    await page.route(`/api/pickup/validate/${mockToken}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          valid: true,
          order: {
            id: 'order-123',
            items: [
              { name: 'Mug Ville', qty: 2, unitPriceCents: 1200 }
            ],
            grandTotalCents: 2400,
          }
        })
      });
    });

    // Navigate to pickup validation page (public)
    await page.goto(`/retrait/${mockToken}`);

    // Verify order details are displayed
    await expect(page.locator('text=Mug Ville')).toBeVisible();
    await expect(page.locator('text=24,00 €')).toBeVisible();

    // Verify instructions
    await expect(page.locator('text=Présentez cette page au staff')).toBeVisible();
  });

  test('should show expired token message', async ({ page }) => {
    const expiredToken = 'expired-token-999';

    await page.route(`/api/pickup/validate/${expiredToken}`, async (route) => {
      await route.fulfill({
        status: 410,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Token expiré',
          errorCode: 410,
        })
      });
    });

    await page.goto(`/retrait/${expiredToken}`);

    // Verify error message
    await expect(page.locator('text=Token expiré')).toBeVisible();
    await expect(page.locator('text=/30 jours/')).toBeVisible();
  });

  test('should show already used token message', async ({ page }) => {
    const usedToken = 'used-token-888';

    await page.route(`/api/pickup/validate/${usedToken}`, async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Token déjà utilisé',
          errorCode: 409,
          usedAt: new Date().toISOString(),
          usedBy: 'admin@ville.fr',
        })
      });
    });

    await page.goto(`/retrait/${usedToken}`);

    // Verify error message with details
    await expect(page.locator('text=déjà utilisé')).toBeVisible();
    await expect(page.locator('text=admin@ville.fr')).toBeVisible();
  });
});
