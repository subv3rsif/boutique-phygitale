# ⚠️ Middleware Temporairement Désactivé

**Date** : 2 mars 2026
**Raison** : Incident Vercel affectant les déploiements de Middleware/Proxy
**Status** : https://www.vercel-status.com/

## 🚨 Incident Vercel en cours

Vercel a un incident affectant :
- Déploiements avec Middleware Functions
- Région Dubai (dxb1) impactée
- Déploiements globaux edge middleware échouent avec "Deploying outputs... Error: We encountered an internal error"

## 🔧 Ce qui a été fait

Le fichier `src/middleware.ts` a été **temporairement renommé** en `src/middleware.ts.disabled` pour permettre le déploiement pendant l'incident.

## ⚠️ Impact

**Routes NON protégées temporairement** :
- `/admin/*` - Routes admin accessibles sans authentification
- **IMPORTANT** : Ne pas accéder à l'admin en production pendant cette période

**Security headers** : Toujours appliqués via `next.config.ts`

## ✅ Comment réactiver le middleware

Quand Vercel aura résolu l'incident (vérifiez https://www.vercel-status.com/) :

```bash
# 1. Renommer le fichier
mv src/middleware.ts.disabled src/middleware.ts

# 2. Commit et push
git add src/middleware.ts
git commit -m "Re-enable middleware after Vercel incident resolved"
git push origin main
```

Le middleware sera réactivé et les routes admin seront à nouveau protégées.

## 🔄 Alternative : Migration vers proxy.ts

Si vous voulez migrer vers la nouvelle convention Next.js 16, renommez simplement :
```bash
mv src/middleware.ts src/proxy.ts
```

Les deux conventions fonctionnent, mais `proxy.ts` est recommandée pour Next.js 16+.

---

**Note** : Le build local fonctionne parfaitement. C'est uniquement le déploiement Vercel qui échouait à cause de l'incident middleware global.
