# Guide de Tests - Boutique Phygitale

Ce guide détaille la stratégie de tests, les commandes disponibles, et les bonnes pratiques.

## 🧪 Stack de Tests

- **Tests Unitaires** : Vitest + Testing Library
- **Tests E2E** : Playwright
- **Mocking** : Playwright Routes, Vitest mocks
- **Coverage** : Vitest coverage (optionnel)

## 📦 Installation

Toutes les dépendances de test sont déjà installées. Si nécessaire :

```bash
npm install
```

Pour installer les navigateurs Playwright (première fois uniquement) :

```bash
npx playwright install
```

## 🚀 Commandes de Test

### Tests Unitaires (Vitest)

```bash
# Lancer tous les tests unitaires
npm run test

# Mode watch (relance automatiquement)
npm run test:watch

# Avec coverage
npm run test -- --coverage
```

### Tests E2E (Playwright)

```bash
# Lancer tous les tests E2E
npm run test:e2e

# Mode UI interactif (recommandé pour développement)
npm run test:e2e:ui

# Mode headed (voir le navigateur)
npm run test:e2e:headed

# Mode debug (pause sur chaque action)
npm run test:e2e:debug

# Voir le rapport HTML
npm run test:report
```

### Autres Vérifications

```bash
# Vérification TypeScript
npm run type-check

# Linter
npm run lint

# Build production (inclut type-check)
npm run build
```

## 📂 Structure des Tests

```
tests/
├── e2e/                          # Tests End-to-End (Playwright)
│   ├── checkout-delivery.spec.ts # Parcours checkout livraison
│   ├── checkout-pickup.spec.ts   # Parcours checkout retrait
│   └── admin.spec.ts             # Interface admin
│
src/
└── components/
    └── **/__tests__/             # Tests unitaires (collocated)
        └── *.test.tsx
```

## 🔍 Tests E2E - Détails

### Checkout Delivery (`checkout-delivery.spec.ts`)

**Tests couverts** :
- ✅ Affichage catalogue produits
- ✅ Ajout produit au panier
- ✅ Modification quantité (1-10 max)
- ✅ Suppression item du panier
- ✅ Sélection mode livraison
- ✅ Calcul frais de port
- ✅ Checkbox RGPD obligatoire
- ✅ Création session Stripe
- ✅ Persistence panier (localStorage)
- ✅ Gestion panier vide

**Durée estimée** : 2-3 minutes

**Prérequis** :
- Serveur dev qui tourne (`npm run dev`)
- Catalogue avec 3 produits minimum

### Checkout Pickup (`checkout-pickup.spec.ts`)

**Tests couverts** :
- ✅ Sélection mode retrait
- ✅ Affichage info La Fabrik (adresse, horaires)
- ✅ Frais de port = 0€ en pickup
- ✅ Switch delivery ↔ pickup
- ✅ Persistence mode fulfillment
- ✅ Génération QR code (mocked)
- ✅ Validation token (valide, expiré, utilisé, invalide)
- ✅ Téléchargement QR

**Durée estimée** : 2-3 minutes

**Prérequis** :
- Variables d'environnement `PICKUP_LOCATION_*` configurées

### Admin (`admin.spec.ts`)

**Tests couverts** :
- ✅ Authentification admin
- ✅ Redirection login si non authentifié
- ✅ Login avec credentials valides/invalides
- ✅ Dashboard avec statistiques
- ✅ Liste des commandes avec filtres
- ✅ Détail commande
- ✅ Marquer commande expédiée
- ✅ Renvoyer email confirmation
- ✅ Scanner QR : validation token
- ✅ Scanner QR : gestion erreurs (404, 410, 409, 400)
- ✅ Scanner QR : auto-focus, Enter key, help section

**Durée estimée** : 3-4 minutes

**Prérequis** :
- Mock auth configuré (cookie `admin-session`)
- API endpoints mockés

## 🎯 Tests Unitaires

### Composants UI

**Exemple** : `src/components/cart/cart-item.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CartItem } from './cart-item';

describe('CartItem', () => {
  it('should render product information', () => {
    const mockProduct = {
      id: 'mug-1',
      name: 'Mug Ville',
      priceCents: 1200,
      qty: 2,
    };

    render(<CartItem item={mockProduct} onUpdate={vi.fn()} onRemove={vi.fn()} />);

    expect(screen.getByText('Mug Ville')).toBeInTheDocument();
    expect(screen.getByText('12,00 €')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should call onUpdate when quantity changes', () => {
    const mockUpdate = vi.fn();

    render(<CartItem item={mockProduct} onUpdate={mockUpdate} onRemove={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Augmenter la quantité'));

    expect(mockUpdate).toHaveBeenCalledWith('mug-1', 3);
  });
});
```

### Store Zustand

**Exemple** : `src/store/cart.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useCart } from './cart';

describe('Cart Store', () => {
  beforeEach(() => {
    useCart.getState().clear();
  });

  it('should add item to cart', () => {
    useCart.getState().addItem('product-1', 2);

    const items = useCart.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({ id: 'product-1', qty: 2 });
  });

  it('should enforce max quantity 10', () => {
    useCart.getState().addItem('product-1', 12);

    const items = useCart.getState().items;
    expect(items[0].qty).toBe(10); // Capped at 10
  });

  it('should calculate total items', () => {
    useCart.getState().addItem('product-1', 2);
    useCart.getState().addItem('product-2', 3);

    expect(useCart.getState().totalItems()).toBe(5);
  });
});
```

### Validations Zod

**Exemple** : `src/lib/validations.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { checkoutInputSchema } from './validations';

describe('Checkout Validation', () => {
  it('should validate correct payload', () => {
    const validPayload = {
      items: [{ id: 'mug-1', qty: 2 }],
      fulfillmentMode: 'delivery',
      gdprConsent: true,
    };

    const result = checkoutInputSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should reject invalid quantity', () => {
    const invalidPayload = {
      items: [{ id: 'mug-1', qty: 0 }], // qty must be >= 1
      fulfillmentMode: 'delivery',
      gdprConsent: true,
    };

    const result = checkoutInputSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('should reject missing GDPR consent', () => {
    const invalidPayload = {
      items: [{ id: 'mug-1', qty: 2 }],
      fulfillmentMode: 'delivery',
      gdprConsent: false, // Must be true
    };

    const result = checkoutInputSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
```

## 🔧 Configuration

### Vitest (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: false, // Skip CSS parsing for speed
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Playwright (`playwright.config.ts`)

Déjà configuré avec :
- ✅ 5 projets (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari)
- ✅ Serveur dev auto-start
- ✅ Screenshots on failure
- ✅ Video on retry
- ✅ HTML reporter

## 📸 Debugging Tests E2E

### Mode UI Interactif

Le mode le plus pratique pour développer :

```bash
npm run test:e2e:ui
```

**Fonctionnalités** :
- Voir tous les tests
- Lancer tests individuellement
- Timeline visuelle de chaque action
- Inspector de locators
- Screenshots avant/après
- Logs réseau

### Mode Debug

Pour debugger un test spécifique :

```bash
npx playwright test tests/e2e/checkout-delivery.spec.ts:42 --debug
```

Cela ouvre Playwright Inspector avec :
- Pause sur chaque action
- Console interactive
- Éditeur de locators
- Step-by-step execution

### Capture d'Écran Manuelle

Dans vos tests, ajoutez :

```typescript
await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
```

### Logs Réseau

Capturer toutes les requêtes :

```typescript
page.on('request', request => console.log('>>', request.method(), request.url()));
page.on('response', response => console.log('<<', response.status(), response.url()));
```

## 🎭 Bonnes Pratiques

### Tests E2E

1. **Utiliser data-testid** pour les sélecteurs critiques :
   ```tsx
   <button data-testid="checkout-button">Payer</button>
   ```

2. **Attendre les états stables** :
   ```typescript
   await page.waitForLoadState('networkidle');
   await page.waitForSelector('[data-testid="cart-item"]');
   ```

3. **Mocker les APIs externes** (Stripe, emails) :
   ```typescript
   await page.route('/api/checkout', async route => {
     await route.fulfill({ status: 200, body: JSON.stringify({...}) });
   });
   ```

4. **Isoler les tests** : Chaque test doit être indépendant
   ```typescript
   test.beforeEach(async ({ page }) => {
     await page.goto('/');
     // Reset state if needed
   });
   ```

5. **Assertions explicites** :
   ```typescript
   // ❌ Éviter
   expect(page.locator('text=Success')).toBeTruthy();

   // ✅ Préférer
   await expect(page.locator('text=Success')).toBeVisible();
   ```

### Tests Unitaires

1. **Un test = un comportement**
2. **Mock les dépendances externes**
3. **Tester les edge cases** (valeurs nulles, limites, erreurs)
4. **Nommer les tests clairement** : `should [action] when [condition]`

## 🚨 Tests Critiques (Priorité 1)

Ces tests **DOIVENT** passer avant tout déploiement :

### E2E
- [ ] **Checkout delivery complet** : Ajout panier → Paiement → Confirmation
- [ ] **Checkout pickup complet** : Ajout panier → Paiement → QR code
- [ ] **Admin - Scanner QR** : Validation token valide/invalide/expiré
- [ ] **Admin - Marquer expédié** : Update statut + email tracking

### Unitaires
- [ ] **Catalogue** : Calculs prix/totaux corrects
- [ ] **Validations Zod** : Rejette payloads invalides
- [ ] **Store Cart** : Actions add/remove/update fonctionnent
- [ ] **Token Generator** : Unicité, hash, expiration

## 📊 Coverage (Optionnel)

Pour générer un rapport de couverture :

```bash
npm run test -- --coverage
```

**Cibles recommandées** :
- **Statements** : > 70%
- **Branches** : > 60%
- **Functions** : > 70%
- **Lines** : > 70%

**Fichiers critiques** (priorité coverage) :
- `src/lib/db/helpers.ts`
- `src/lib/email/queue.ts`
- `src/store/cart.ts`
- `src/lib/validations.ts`
- `src/app/api/checkout/route.ts`
- `src/app/api/stripe/webhook/route.ts`

## 🔄 CI/CD Integration

### GitHub Actions (exemple)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test

      - name: Run type check
        run: npm run type-check

      - name: Run linter
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:3000

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## 🐛 Troubleshooting

### Problème : "Cannot find module '@testing-library/react'"

**Solution** :
```bash
npm install -D @testing-library/react @testing-library/jest-dom
```

### Problème : Tests Playwright timeout

**Causes possibles** :
1. Serveur dev pas démarré → Vérifier `webServer` dans `playwright.config.ts`
2. Locator trop strict → Utiliser `.toBeVisible()` avec `timeout`
3. Animation CSS lente → Désactiver animations en mode test

**Solution** :
```typescript
// Augmenter timeout individuellement
await expect(page.locator('...')).toBeVisible({ timeout: 10000 });
```

### Problème : Tests unitaires ne trouvent pas les alias `@/*`

**Solution** : Vérifier `vitest.config.ts` :
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Problème : Playwright ne détecte pas les changements CSS

**Solution** : Forcer rebuild CSS :
```bash
rm -rf .next
npm run dev
```

## 📝 TODO Tests (Améliorations Futures)

- [ ] Tests API routes avec Supertest
- [ ] Tests webhook Stripe avec mocks avancés
- [ ] Tests email templates (snapshots)
- [ ] Tests performance (Lighthouse CI)
- [ ] Tests accessibilité (axe-core)
- [ ] Visual regression tests (Percy, Chromatic)

## 🎓 Ressources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)

---

**💡 Conseil** : Lancer `npm run test:e2e:ui` régulièrement pendant le développement pour détecter les régressions rapidement.
