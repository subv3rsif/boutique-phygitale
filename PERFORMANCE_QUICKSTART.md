# ⚡ Performance Optimization - Quick Start Guide

**5-Minute Setup** pour améliorer immédiatement les performances de votre application.

---

## 🎯 Quick Wins (30 minutes)

### 1️⃣ Activer la Configuration Optimisée (5 min)

```bash
# Remplacer next.config.js par la version optimisée
mv next.config.js next.config.old.js
mv next.config.optimized.js next.config.js

# Rebuild
npm run build
```

**Impact**: ⬇️ 73% de réduction du polyfill (110KB → 30KB)

---

### 2️⃣ Ajouter Bundle Analyzer (2 min)

```bash
# Installer
npm install --save-dev @next/bundle-analyzer webpack-bundle-analyzer

# Analyser
ANALYZE=true npm run build

# Ouvre automatiquement le rapport dans le navigateur
```

**Résultat**: Visualisation interactive de votre bundle

---

### 3️⃣ Tester les Performances (5 min)

```bash
# Lancer le script de vérification
./scripts/performance-check.sh

# Ou manuellement
npm run build
du -sh .next/static/chunks/*.js | sort -hr | head -10
```

**Résultat**: Rapport détaillé avec recommandations

---

### 4️⃣ Implémenter Dynamic Imports (15 min)

Modifier `src/app/page.tsx` :

```tsx
import dynamic from 'next/dynamic';

// ✅ Lazy load heavy components
const HeroCinematic = dynamic(
  () => import('@/components/layout/hero-cinematic').then(m => ({ default: m.HeroCinematic })),
  {
    ssr: false,
    loading: () => <div className="h-screen bg-gradient-to-br from-primary/10 to-background animate-pulse" />
  }
);

const BentoProductGrid = dynamic(
  () => import('@/components/product/bento-product-grid').then(m => ({ default: m.BentoProductGrid })),
  {
    loading: () => <div className="h-96 bg-muted animate-pulse rounded-xl" />
  }
);

export default function HomePage() {
  return (
    <>
      <HeroCinematic />
      <BentoProductGrid />
      {/* ... */}
    </>
  );
}
```

**Impact**: ⬇️ 33% de réduction du bundle initial (600KB → 400KB)

---

## 📊 Vérification Rapide

### Avant Optimisation
```bash
npm run build

# Vérifier la taille
du -sh .next/static/chunks/ .next/server/
# Résultat typique: 1.3MB chunks, 24MB server
```

### Après Optimisation
```bash
npm run build

# Vérifier la taille
du -sh .next/static/chunks/ .next/server/
# Résultat attendu: 800KB chunks, 18MB server
```

---

## 🧪 Tester avec Lighthouse

```bash
# 1. Lancer le serveur production
npm run build
npm start

# 2. Dans un autre terminal, lancer Lighthouse
npx lighthouse http://localhost:3000 \
  --output=html \
  --output-path=./lighthouse-report.html \
  --view

# Ouvre automatiquement le rapport
```

**Métriques à surveiller**:
- **Performance Score**: Objectif > 90
- **First Contentful Paint**: < 1.8s
- **Largest Contentful Paint**: < 2.5s
- **Total Blocking Time**: < 200ms

---

## 📈 Monitoring en Production

### Option 1: Vercel Analytics (Gratuit)

```bash
npm install @vercel/analytics
```

```tsx
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics /> {/* ← Ajouter */}
      </body>
    </html>
  );
}
```

Deploy sur Vercel → Analytics activé automatiquement.

---

### Option 2: Web Vitals API (DIY)

```tsx
// src/app/layout.tsx
export function reportWebVitals(metric: any) {
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metric),
  }).catch(console.error);
}
```

```tsx
// src/app/api/analytics/web-vitals/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json();
  console.log('[Web Vital]', data);
  return NextResponse.json({ success: true });
}
```

---

## 🎯 Checklist

### Quick Wins Complétés ✅
- [ ] Configuration optimisée activée
- [ ] Bundle analyzer installé
- [ ] Performance check exécuté
- [ ] Dynamic imports implémentés
- [ ] Rebuild effectué
- [ ] Lighthouse audit > 85

### Monitoring Activé ✅
- [ ] Vercel Analytics installé OU
- [ ] Web Vitals API implémenté
- [ ] Métriques visibles en production

### Tests Validés ✅
- [ ] Build réussi sans warnings
- [ ] Chunks < 200KB chacun
- [ ] Total First Load JS < 400KB
- [ ] LCP < 2.5s (Lighthouse)
- [ ] Pas d'erreurs console

---

## 📚 Documentation Complète

Pour aller plus loin :

| Document | Contenu | Durée |
|----------|---------|-------|
| `PERFORMANCE_AUDIT_REPORT.md` | Audit complet + analyse | 30 min |
| `performance-fixes/WEEK_1_CRITICAL.md` | Fixes critiques détaillés | 6-8h |
| `next.config.optimized.js` | Configuration commentée | Référence |
| `scripts/performance-check.sh` | Script de vérification | 2 min |

---

## 🆘 Problèmes Courants

### Build échoue après next.config.js
```bash
# Vérifier la syntaxe
node -c next.config.js

# Revenir à l'ancienne config
mv next.config.js next.config.new.js
mv next.config.old.js next.config.js
```

### Dynamic imports causent des erreurs
```tsx
// Ajouter ssr: false pour les composants client-only
const Component = dynamic(() => import('./Component'), {
  ssr: false, // ← Important pour animations
});
```

### Lighthouse score toujours bas
```bash
# 1. Vérifier que le build production est utilisé
npm run build
npm start # PAS npm run dev

# 2. Désactiver extensions navigateur
# 3. Utiliser mode incognito
# 4. Vérifier connexion internet stable
```

---

## 🚀 Déploiement

```bash
# 1. Commit les changements
git add .
git commit -m "perf: optimize bundle size and enable monitoring"

# 2. Push vers Vercel
git push origin main

# 3. Vérifier le déploiement
# Vercel Dashboard > Deployment > Performance Tab

# 4. Activer Vercel Analytics
# Vercel Dashboard > Analytics > Enable
```

---

## ✅ Résultats Attendus

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| **First Load JS** | 600KB | 400KB | ⬇️ 33% |
| **Polyfill** | 110KB | 30KB | ⬇️ 73% |
| **LCP** | 3.2s | 2.3s | ⬇️ 28% |
| **Performance Score** | 65 | 85 | ⬆️ +20 |

---

## 💡 Next Steps

Après ces quick wins, continuez avec :
1. **Week 2**: Tree-shaking Lucide icons
2. **Week 3**: Vercel Analytics + Sentry
3. **Week 4**: Performance budgets + CI/CD checks

---

**Temps total**: 30 minutes
**Impact**: Amélioration immédiate de 30% des performances
**Coût**: Gratuit

**Commencer maintenant** → `./scripts/performance-check.sh`
