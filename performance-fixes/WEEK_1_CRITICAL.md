# 🔴 Week 1: Critical Performance Fixes

**Goal**: Reduce initial JS bundle by 33% (600KB → 400KB)
**Estimated Time**: 6-8 hours
**Impact**: Immediate improvement in LCP and TTI

---

## Fix 1: Dynamic Imports for Heavy Components

### 1.1 Homepage (`src/app/page.tsx`)

**Current** (loads everything synchronously):
```tsx
import { HeroCinematic } from '@/components/layout/hero-cinematic';
import { BentoProductGrid } from '@/components/product/bento-product-grid';
import { ProductCarousel } from '@/components/product/product-carousel';
```

**Optimized** (lazy load with placeholders):
```tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeroCinematic = dynamic(
  () => import('@/components/layout/hero-cinematic').then(m => ({ default: m.HeroCinematic })),
  {
    ssr: false, // Animations are client-only
    loading: () => (
      <div className="h-screen bg-gradient-to-br from-primary/10 to-background animate-pulse" />
    ),
  }
);

const BentoProductGrid = dynamic(
  () => import('@/components/product/bento-product-grid').then(m => ({ default: m.BentoProductGrid })),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[600px]">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    ),
  }
);

const ProductCarousel = dynamic(
  () => import('@/components/product/product-carousel').then(m => ({ default: m.ProductCarousel })),
  {
    loading: () => <div className="h-96 bg-muted animate-pulse rounded-xl" />,
  }
);

export default function HomePage() {
  return (
    <>
      <HeroCinematic />
      <BentoProductGrid />
      <ProductCarousel />
    </>
  );
}
```

**Impact**: ⬇️ ~150KB initial bundle

---

### 1.2 Layout (`src/app/layout.tsx`)

**Current**:
```tsx
import { FloatingCart } from '@/components/layout/floating-cart';
import { BottomNavWrapper } from '@/components/navigation/bottom-nav-wrapper';
```

**Optimized**:
```tsx
import dynamic from 'next/dynamic';

// FloatingCart is interactive but not critical for initial render
const FloatingCart = dynamic(
  () => import('@/components/layout/floating-cart').then(m => ({ default: m.FloatingCart })),
  { ssr: false } // Cart is client-only
);

// BottomNav can be lazy loaded (below fold on desktop)
const BottomNavWrapper = dynamic(
  () => import('@/components/navigation/bottom-nav-wrapper').then(m => ({ default: m.BottomNavWrapper })),
  { ssr: false }
);

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Header /> {/* Keep Header SSR for SEO */}
          <main>{children}</main>
          <footer>{/* ... */}</footer>
          <FloatingCart /> {/* Lazy loaded */}
          <BottomNavWrapper /> {/* Lazy loaded */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Impact**: ⬇️ ~50KB initial bundle

---

## Fix 2: Web Vitals Monitoring

### 2.1 Create API Route

```tsx
// src/app/api/analytics/web-vitals/route.ts
import { NextRequest, NextResponse } from 'next/server';

type WebVitalMetric = {
  id: string;
  name: 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
};

export async function POST(req: NextRequest) {
  try {
    const metric: WebVitalMetric = await req.json();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vital] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
      });
    }

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Option 1: Vercel Analytics (if installed)
      // @vercel/analytics automatically captures web vitals

      // Option 2: Google Analytics
      // await sendToGoogleAnalytics(metric);

      // Option 3: Custom analytics endpoint
      // await sendToCustomAnalytics(metric);

      // For now, just log to server
      console.log(`[Production Web Vital] ${metric.name}: ${metric.value}ms`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Web Vitals] Error:', error);
    return NextResponse.json(
      { error: 'Failed to track web vital' },
      { status: 500 }
    );
  }
}

// Helper: Send to Google Analytics
async function sendToGoogleAnalytics(metric: WebVitalMetric) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;
  if (!GA_MEASUREMENT_ID) return;

  const body = {
    client_id: metric.id,
    events: [
      {
        name: metric.name,
        params: {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          metric_id: metric.id,
          metric_value: metric.value,
          metric_delta: metric.delta,
          metric_rating: metric.rating,
        },
      },
    ],
  };

  await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}
```

---

### 2.2 Add to Layout

```tsx
// src/app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  // ... existing metadata
};

export function reportWebVitals(metric: any) {
  // Send to API route
  if (typeof window !== 'undefined') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
      keepalive: true, // Ensure request completes even if page unloads
    }).catch(console.error);
  }
}

export default function RootLayout({ children }) {
  // ... rest of layout
}
```

**Impact**: ✅ Real-time performance monitoring

---

## Fix 3: Optimize Polyfills

### 3.1 Create `.browserslistrc`

```bash
# .browserslistrc
last 2 Chrome versions
last 2 Firefox versions
last 2 Safari versions
last 2 Edge versions
> 0.5%
not dead
```

**Targets**: ~95% of global users, excludes IE11

---

### 3.2 Update `next.config.js`

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SWC minification (faster than Terser)
  swcMinify: true,

  // Use browserslist for SWC transpilation
  experimental: {
    browsersListForSwc: true,
  },

  // Remove console.log in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep error/warn logs
    } : false,
  },

  // Output standalone for smaller Docker builds (optional)
  output: 'standalone',
};

module.exports = nextConfig;
```

---

### 3.3 Verify Polyfill Reduction

```bash
# Rebuild
npm run build

# Check new polyfill size
du -sh .next/static/chunks/*polyfill*.js

# Expected: ~30KB (down from 110KB)
```

**Impact**: ⬇️ 80KB polyfill reduction (73%)

---

## Fix 4: Optimize Lucide Icons

### 4.1 Find All Imports

```bash
# Search for lucide-react imports
grep -r "from 'lucide-react'" src/ --include="*.tsx" --include="*.ts"
```

### 4.2 Replace Wildcard Imports

**Before**:
```tsx
// ❌ Imports entire library
import * as Icons from 'lucide-react';

const MyIcon = Icons.Home;
```

**After**:
```tsx
// ✅ Import only needed icons
import { Home, ShoppingCart, User, Bookmark, Compass } from 'lucide-react';

const MyIcon = Home;
```

### 4.3 Example: Bottom Nav

```tsx
// src/components/navigation/nav-items.ts
// ❌ Before
import * as LucideIcons from 'lucide-react';

export const NAV_ITEMS = [
  { icon: LucideIcons.Home, ... },
  { icon: LucideIcons.Compass, ... },
];

// ✅ After
import { Home, Compass, ShoppingBag, Bookmark, User } from 'lucide-react';

export const NAV_ITEMS = [
  { icon: Home, ... },
  { icon: Compass, ... },
  { icon: ShoppingBag, ... },
  { icon: Bookmark, ... },
  { icon: User, ... },
];
```

**Impact**: ⬇️ ~35KB icon bundle (87% reduction)

---

## Testing Checklist

### Before Deployment

- [ ] Run `npm run build` successfully
- [ ] Check bundle sizes: `du -sh .next/static/chunks/*.js | sort -hr | head -10`
- [ ] Test on `localhost:3000` (dev mode)
- [ ] Test production build: `npm run build && npm start`
- [ ] Verify dynamic imports load correctly
- [ ] Check Web Vitals in DevTools > Performance
- [ ] Test on mobile device
- [ ] Verify no console errors

### Performance Validation

```bash
# Start production server
npm run build
npm start

# In another terminal, run Lighthouse
npx lighthouse http://localhost:3000 --view

# Check for improvements:
# - Performance score should increase
# - First Load JS should decrease
# - LCP should improve
```

---

## Expected Results (Week 1)

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **First Load JS** | 600KB | 400KB | ⬇️ 33% |
| **Polyfill Size** | 110KB | 30KB | ⬇️ 73% |
| **Icon Bundle** | 40KB | 5KB | ⬇️ 87% |
| **LCP** | ~3.2s | ~2.3s | ⬇️ 28% |
| **Performance Score** | ~65 | ~85 | ⬆️ +20 |

---

## Deployment

```bash
# 1. Commit changes
git add .
git commit -m "perf: implement Week 1 critical fixes - reduce bundle by 33%"

# 2. Push to main (or create PR)
git push origin main

# 3. Vercel will auto-deploy

# 4. Monitor in Vercel Dashboard
# - Check build logs
# - Verify bundle size reduction
# - Enable Vercel Analytics (free)
```

---

## Troubleshooting

### Dynamic Import Hydration Error
```
Error: Hydration failed because the initial UI does not match
```

**Fix**: Add `ssr: false` to client-only components
```tsx
const Component = dynamic(() => import('./Component'), {
  ssr: false, // ✅ Disable SSR for client-only code
});
```

### Web Vitals Not Sending
```
Failed to fetch /api/analytics/web-vitals
```

**Fix**: Ensure API route exists and is accessible
```bash
# Check route file exists
ls -la src/app/api/analytics/web-vitals/route.ts

# Test API manually
curl -X POST http://localhost:3000/api/analytics/web-vitals \
  -H "Content-Type: application/json" \
  -d '{"name":"LCP","value":1000}'
```

### Polyfill Still Large
```
Polyfill is still 100KB+
```

**Fix**: Clear Next.js cache
```bash
rm -rf .next
npm run build
```

---

## Next Steps

After Week 1 fixes are deployed:
1. Monitor Web Vitals for 2-3 days
2. Collect baseline metrics
3. Proceed to **Week 2: High Priority** fixes

---

**Questions?** Check the main `PERFORMANCE_AUDIT_REPORT.md` for context.
