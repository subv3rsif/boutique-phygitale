import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Admin Interface
 *
 * Tests admin authentication, order management, QR scanning, and shipping.
 * Requires authenticated session.
 */

// Helper to create authenticated session
async function loginAsAdmin(page: any) {
  // Mock admin auth (in real scenario, would go through login flow)
  await page.route('/api/auth/session', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          email: 'admin@ville.fr',
          role: 'admin',
        },
      }),
    });
  });

  // Set auth cookie
  await page.context().addCookies([
    {
      name: 'admin-session',
      value: 'mock-session-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
}

test.describe('Admin Interface', () => {
  test.describe('Authentication', () => {
    test('should redirect to login when accessing admin without auth', async ({ page }) => {
      // Try to access admin dashboard
      await page.goto('/admin/dashboard');

      // Should redirect to login
      await page.waitForURL('/login');
      await expect(page).toHaveURL('/login');

      // Verify login form is displayed
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should login with valid credentials', async ({ page }) => {
      // Mock login API
      await page.route('/api/auth/login', async (route) => {
        const request = route.request();
        const postData = JSON.parse(request.postData() || '{}');

        if (postData.email === 'admin@ville.fr' && postData.password === 'correct-password') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true }),
          });
        } else {
          await route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Identifiants invalides' }),
          });
        }
      });

      await page.goto('/login');

      // Fill login form
      await page.locator('input[type="email"]').fill('admin@ville.fr');
      await page.locator('input[type="password"]').fill('correct-password');

      // Submit
      await page.locator('button[type="submit"]').click();

      // Should redirect to admin dashboard
      await page.waitForURL('/admin/dashboard');
      await expect(page).toHaveURL('/admin/dashboard');
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await page.route('/api/auth/login', async (route) => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Identifiants invalides' }),
        });
      });

      await page.goto('/login');

      await page.locator('input[type="email"]').fill('wrong@example.com');
      await page.locator('input[type="password"]').fill('wrong-password');
      await page.locator('button[type="submit"]').click();

      // Verify error message
      await expect(page.locator('text=Identifiants invalides')).toBeVisible();
    });
  });

  test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('should display dashboard with statistics', async ({ page }) => {
      // Mock dashboard stats
      await page.route('/api/admin/stats', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalOrders: 42,
            totalRevenue: 125000, // cents
            pendingOrders: 5,
            toShip: 3,
            toPickup: 2,
          }),
        });
      });

      await page.goto('/admin/dashboard');

      // Verify stats cards are displayed
      await expect(page.locator('text=42')).toBeVisible(); // Total orders
      await expect(page.locator('text=1 250,00 €')).toBeVisible(); // Revenue
      await expect(page.locator('text=5')).toBeVisible(); // Pending
      await expect(page.locator('text=3')).toBeVisible(); // To ship
      await expect(page.locator('text=2')).toBeVisible(); // To pickup
    });

    test('should navigate to orders from dashboard', async ({ page }) => {
      await page.goto('/admin/dashboard');

      // Click on "Voir toutes les commandes"
      await page.locator('a', { hasText: 'Voir toutes les commandes' }).click();

      // Should navigate to orders list
      await expect(page).toHaveURL('/admin/orders');
    });
  });

  test.describe('Orders Management', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('should display orders list with filters', async ({ page }) => {
      // Mock orders list
      await page.route('/api/admin/orders*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            orders: [
              {
                id: 'order-1',
                createdAt: new Date().toISOString(),
                customerEmail: 'client1@example.com',
                fulfillmentMode: 'delivery',
                status: 'paid',
                grandTotalCents: 3450,
              },
              {
                id: 'order-2',
                createdAt: new Date().toISOString(),
                customerEmail: 'client2@example.com',
                fulfillmentMode: 'pickup',
                status: 'paid',
                grandTotalCents: 1200,
              },
            ],
            total: 2,
          }),
        });
      });

      await page.goto('/admin/orders');

      // Verify table headers
      await expect(page.locator('th', { hasText: 'Commande' })).toBeVisible();
      await expect(page.locator('th', { hasText: 'Client' })).toBeVisible();
      await expect(page.locator('th', { hasText: 'Mode' })).toBeVisible();
      await expect(page.locator('th', { hasText: 'Montant' })).toBeVisible();
      await expect(page.locator('th', { hasText: 'Statut' })).toBeVisible();

      // Verify order rows
      await expect(page.locator('text=client1@example.com')).toBeVisible();
      await expect(page.locator('text=client2@example.com')).toBeVisible();
      await expect(page.locator('text=34,50 €')).toBeVisible();
      await expect(page.locator('text=12,00 €')).toBeVisible();
    });

    test('should filter orders by status', async ({ page }) => {
      await page.route('/api/admin/orders*', async (route) => {
        const url = new URL(route.request().url());
        const status = url.searchParams.get('status');

        const orders = status === 'paid'
          ? [{ id: 'paid-order', status: 'paid', customerEmail: 'paid@example.com', grandTotalCents: 1000 }]
          : [];

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ orders, total: orders.length }),
        });
      });

      await page.goto('/admin/orders');

      // Select "Paid" filter
      await page.locator('select[name="status"]').selectOption('paid');

      // Verify filtered results
      await expect(page.locator('text=paid@example.com')).toBeVisible();
    });

    test('should navigate to order detail', async ({ page }) => {
      await page.route('/api/admin/orders', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            orders: [
              { id: 'order-detail-123', customerEmail: 'detail@example.com', status: 'paid', grandTotalCents: 2500 },
            ],
            total: 1,
          }),
        });
      });

      await page.goto('/admin/orders');

      // Click on order row
      await page.locator('tr', { hasText: 'detail@example.com' }).click();

      // Should navigate to detail page
      await expect(page).toHaveURL(/\/admin\/orders\/order-detail-123/);
    });
  });

  test.describe('Order Detail & Actions', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('should display complete order details', async ({ page }) => {
      await page.route('/api/admin/orders/order-456', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'order-456',
            status: 'paid',
            fulfillmentMode: 'delivery',
            customerEmail: 'customer@example.com',
            customerPhone: null,
            items: [
              { productId: 'mug-1', name: 'Mug Ville', qty: 2, unitPriceCents: 1200, shippingCentsPerUnit: 450 },
            ],
            itemsTotalCents: 2400,
            shippingTotalCents: 900,
            grandTotalCents: 3300,
            createdAt: new Date().toISOString(),
            paidAt: new Date().toISOString(),
            fulfilledAt: null,
          }),
        });
      });

      await page.goto('/admin/orders/order-456');

      // Verify order info
      await expect(page.locator('text=order-456')).toBeVisible();
      await expect(page.locator('text=customer@example.com')).toBeVisible();
      await expect(page.locator('text=Mug Ville')).toBeVisible();
      await expect(page.locator('text=33,00 €')).toBeVisible();

      // Verify status badge
      await expect(page.locator('[data-testid="order-status"]', { hasText: 'Payé' })).toBeVisible();
    });

    test('should mark order as shipped', async ({ page }) => {
      await page.route('/api/admin/orders/order-789', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'order-789',
            status: 'paid',
            fulfillmentMode: 'delivery',
            customerEmail: 'ship@example.com',
            grandTotalCents: 2000,
            items: [],
            createdAt: new Date().toISOString(),
          }),
        });
      });

      await page.route('/api/admin/orders/order-789/mark-shipped', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });

      await page.goto('/admin/orders/order-789');

      // Click "Marquer expédié" button
      await page.locator('button', { hasText: 'Marquer expédié' }).click();

      // Fill tracking form in dialog
      await page.locator('input[name="trackingNumber"]').fill('FR123456789');
      await page.locator('input[name="trackingUrl"]').fill('https://laposte.fr/track/FR123456789');

      // Submit
      await page.locator('button', { hasText: 'Confirmer' }).click();

      // Verify success message
      await expect(page.locator('text=Commande marquée comme expédiée')).toBeVisible();
    });

    test('should resend confirmation email', async ({ page }) => {
      await page.route('/api/admin/orders/order-999', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'order-999',
            status: 'paid',
            fulfillmentMode: 'pickup',
            customerEmail: 'resend@example.com',
            grandTotalCents: 1500,
            items: [],
            createdAt: new Date().toISOString(),
          }),
        });
      });

      await page.route('/api/admin/orders/order-999/resend-email', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });

      await page.goto('/admin/orders/order-999');

      // Click "Renvoyer l'email"
      await page.locator('button', { hasText: 'Renvoyer l\'email' }).click();

      // Verify success toast
      await expect(page.locator('text=Email renvoyé')).toBeVisible();
    });
  });

  test.describe('QR Code Scanner (Pickup Validation)', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('should display QR scanner interface', async ({ page }) => {
      await page.goto('/admin/pickup');

      // Verify scanner UI elements
      await expect(page.locator('text=Token de Retrait')).toBeVisible();
      await expect(page.locator('input[type="text"]', { hasText: /token/i })).toBeVisible();
      await expect(page.locator('button', { hasText: 'Valider le retrait' })).toBeVisible();

      // Verify help section
      await expect(page.locator('text=Besoin d\'aide')).toBeVisible();
    });

    test('should validate correct pickup token', async ({ page }) => {
      const validToken = 'valid-pickup-token-abc123def456';

      await page.route('/api/admin/pickup/redeem', async (route) => {
        const postData = JSON.parse(route.request().postData() || '{}');

        if (postData.token === validToken) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              message: 'Retrait validé avec succès',
              order: {
                id: 'order-pickup-valid',
                customerEmail: 'pickup@example.com',
                grandTotalCents: 1200,
                createdAt: new Date().toISOString(),
              },
            }),
          });
        } else {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Token invalide', errorCode: 404 }),
          });
        }
      });

      await page.goto('/admin/pickup');

      // Enter token
      await page.locator('input[type="text"]').fill(validToken);

      // Validate
      await page.locator('button', { hasText: 'Valider le retrait' }).click();

      // Verify success card (green)
      await expect(page.locator('[data-testid="validation-success"]')).toBeVisible();
      await expect(page.locator('text=Retrait validé avec succès')).toBeVisible();
      await expect(page.locator('text=pickup@example.com')).toBeVisible();
      await expect(page.locator('text=12,00 €')).toBeVisible();
    });

    test('should handle invalid token error', async ({ page }) => {
      await page.route('/api/admin/pickup/redeem', async (route) => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Token invalide', errorCode: 404 }),
        });
      });

      await page.goto('/admin/pickup');

      await page.locator('input[type="text"]').fill('invalid-token-xyz');
      await page.locator('button', { hasText: 'Valider le retrait' }).click();

      // Verify error card (red)
      await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
      await expect(page.locator('text=Token invalide')).toBeVisible();
      await expect(page.locator('text=404')).toBeVisible();
    });

    test('should handle expired token error', async ({ page }) => {
      await page.route('/api/admin/pickup/redeem', async (route) => {
        await route.fulfill({
          status: 410,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Token expiré',
            errorCode: 410,
          }),
        });
      });

      await page.goto('/admin/pickup');

      await page.locator('input[type="text"]').fill('expired-token');
      await page.locator('button', { hasText: 'Valider le retrait' }).click();

      // Verify error with code 410
      await expect(page.locator('text=Token expiré')).toBeVisible();
      await expect(page.locator('text=410')).toBeVisible();
    });

    test('should handle already used token error', async ({ page }) => {
      await page.route('/api/admin/pickup/redeem', async (route) => {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Token déjà utilisé',
            errorCode: 409,
            usedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            usedBy: 'admin@ville.fr',
          }),
        });
      });

      await page.goto('/admin/pickup');

      await page.locator('input[type="text"]').fill('used-token');
      await page.locator('button', { hasText: 'Valider le retrait' }).click();

      // Verify error with usage details
      await expect(page.locator('text=déjà utilisé')).toBeVisible();
      await expect(page.locator('text=admin@ville.fr')).toBeVisible();
      await expect(page.locator('text=409')).toBeVisible();
    });

    test('should auto-focus input and support Enter key', async ({ page }) => {
      await page.goto('/admin/pickup');

      const input = page.locator('input[type="text"]');

      // Verify auto-focus
      await expect(input).toBeFocused();

      // Type and press Enter
      await input.fill('test-token-enter');
      await input.press('Enter');

      // Verify validation was triggered (button should show loading)
      await expect(page.locator('text=Validation en cours')).toBeVisible();
    });

    test('should toggle help section', async ({ page }) => {
      await page.goto('/admin/pickup');

      // Verify help is collapsed initially
      await expect(page.locator('text=Token invalide')).not.toBeVisible();

      // Click to expand
      await page.locator('button', { hasText: 'Besoin d\'aide' }).click();

      // Verify help content is visible
      await expect(page.locator('text=Codes d\'erreur courants')).toBeVisible();
      await expect(page.locator('text=404')).toBeVisible();
      await expect(page.locator('text=410')).toBeVisible();
      await expect(page.locator('text=409')).toBeVisible();

      // Click to collapse
      await page.locator('button', { hasText: 'Besoin d\'aide' }).click();

      // Verify content is hidden
      await expect(page.locator('text=Codes d\'erreur courants')).not.toBeVisible();
    });
  });
});
