# Refactoring Authentication Architecture - Design Specification

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Date:** 2026-03-31
**Status:** Approved
**Author:** Claude (Brainstorming session)

---

## Executive Summary

**Goal:** Séparer complètement l'authentification client (NextAuth + Google OAuth) de l'authentification admin (credentials simples env vars) pour éliminer la confusion actuelle où Google OAuth donne accès uniquement à "Mes Commandes" au lieu de l'espace admin.

**Current Problem:**
- NextAuth + Google OAuth configuré → redirige vers `/profil` (espace client)
- `/admin` protégé par système custom mais vérifie session NextAuth
- Résultat : utilisateurs connectés via Google ne peuvent pas accéder à `/admin`
- Confusion totale entre auth client et auth admin

**Solution:** Deux systèmes d'authentification complètement indépendants avec routes, sessions et cookies séparés.

**Architecture:** NextAuth pour clients (Google OAuth optionnel) + système custom léger pour admin (email/password en env vars)

**Tech Stack:**
- NextAuth v5 (existant, aucun changement)
- Cookies HTTP-only signés pour admin
- Crypto native Node.js (signatures, tokens)
- Zod pour validation
- Playwright pour tests e2e (optionnel)

---

## Table of Contents

1. [Architecture Générale](#1-architecture-générale)
2. [Composants et Routes](#2-composants-et-routes)
3. [Data Flow](#3-data-flow)
4. [Error Handling](#4-error-handling)
5. [Testing Strategy](#5-testing-strategy)
6. [Security Considerations](#6-security-considerations)
7. [Migration Plan](#7-migration-plan)

---

## 1. Architecture Générale

### 1.1 Deux systèmes indépendants

#### Système CLIENT (NextAuth - existant, à conserver)

**Provider:** Google OAuth + Resend Magic Link (déjà configuré)

**Routes:**
- `/connexion` → Page de connexion (Google OAuth + Magic Link)
- `/profil` → Page profil utilisateur (Mes commandes, infos compte)
- `/deconnexion` → Déconnexion NextAuth
- `/api/auth/*` → Routes NextAuth (callback, session, signout, etc.)

**Session:**
- Gérée par NextAuth
- Cookie `authjs.session-token` (HTTP-only, Secure, SameSite=Lax)
- Durée : 30 jours
- Refresh automatique

**Utilisateurs:**
- Stockés en base de données PostgreSQL
- Tables : `users`, `accounts`, `sessions`, `verification_tokens`
- Schéma Drizzle ORM existant

**Usage:**
- Optionnel pour checkout (checkout invité possible)
- Obligatoire pour accéder à "Mes commandes" (futur)
- Permet de sauvegarder infos pour futurs achats

#### Système ADMIN (Custom simple - à créer)

**Credentials:**
```bash
# Variables d'environnement
ADMIN_EMAIL=admin@ville.fr
ADMIN_PASSWORD=mot-de-passe-sécurisé-généré
```

**Routes:**
- `/admin/login` → Page login admin (formulaire email/password)
- `/admin/*` → Espace admin protégé (dashboard, produits, commandes, pickup)
- `/api/admin/auth/login` → POST endpoint vérification credentials
- `/api/admin/auth/logout` → POST endpoint déconnexion

**Session:**
- Cookie HTTP-only signé `admin-token`
- Durée : 8 heures
- Pas de refresh automatique (reconnexion manuelle après expiration)
- Signature HMAC-SHA256 avec secret `AUTH_SECRET`

**Utilisateurs:**
- Aucune table en base de données
- Un seul compte admin défini par env vars
- Extension future possible (multi-admins) mais hors scope MVP

**Protection:**
- Helper `requireAdminAuth()` vérifie cookie dans routes API
- Layout `/admin` vérifie cookie avant render
- Pas de middleware global (protection granulaire)

### 1.2 Checkout Invité (sans authentification)

**Flow:**
- Aucune authentification requise pour commander
- Collecte email + infos livraison/retrait
- Lien unique envoyé par email avec token sécurisé
- QR code généré pour retrait clic & collect
- Proposition de création de compte après achat

### 1.3 Séparation claire

```
┌─────────────────────────────────────────────────┐
│              PARTIE CLIENT                      │
│   NextAuth (Google OAuth + Magic Link)         │
│   Routes: /connexion → /profil                  │
│   Cookie: authjs.session-token                  │
│   DB: users, accounts, sessions                 │
│   Usage: Optionnel (compte client)              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              PARTIE ADMIN                       │
│   Auth Custom (email/password env vars)         │
│   Routes: /admin/login → /admin/*               │
│   Cookie: admin-token (HTTP-only signé)         │
│   DB: Aucune table auth                         │
│   Usage: Obligatoire pour espace admin          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│            CHECKOUT INVITÉ                      │
│   Aucune authentification requise               │
│   Collecte: email + infos livraison/retrait     │
│   Token unique envoyé par email                 │
│   QR code pour clic & collect                   │
└─────────────────────────────────────────────────┘
```

**Principe clé:** Aucune intersection. Un utilisateur connecté via Google OAuth ne peut pas accéder à `/admin`. Un admin ne peut pas accéder aux fonctionnalités client via son cookie admin.

---

## 2. Composants et Routes

### 2.1 Nouveaux fichiers à créer

#### Routes et pages admin

```
src/app/admin/login/
├── page.tsx                    # Page login admin (formulaire email/password)
```

**Contenu `page.tsx`:**
- Formulaire simple : email + password
- Validation Zod côté client
- POST vers `/api/admin/auth/login`
- Affichage erreurs (identifiants invalides, session expirée)
- Redirect vers `/admin/dashboard` après succès
- Design cohérent avec le reste de l'admin (glass-love style)

#### Routes API admin auth

```
src/app/api/admin/auth/
├── login/
│   └── route.ts               # POST - Vérification credentials + création cookie
├── logout/
│   └── route.ts               # POST - Suppression cookie admin
```

**`login/route.ts` - Responsabilités:**
1. Valider payload (email, password)
2. Comparer avec `process.env.ADMIN_EMAIL` et `process.env.ADMIN_PASSWORD`
3. Si match : générer token signé + créer cookie `admin-token` (8h)
4. Si erreur : return 401 avec message générique
5. Rate limiting : 5 tentatives max par IP/15 min (Upstash Redis)

**`logout/route.ts` - Responsabilités:**
1. Supprimer cookie `admin-token`
2. Redirect vers `/admin/login`

#### Helpers d'authentification admin

```
src/lib/auth/
├── admin-auth.ts              # Nouveau système auth admin
│   ├── verifyAdminCredentials(email: string, password: string): boolean
│   ├── createAdminToken(): string
│   ├── verifyAdminToken(token: string): { valid: boolean, expired: boolean }
│   └── requireAdminAuth(request: NextRequest): Promise<void>
│
├── admin-check.ts             # À SUPPRIMER (utilise NextAuth)
└── config.ts                  # NextAuth (existant, aucun changement)
```

**Implémentation `admin-auth.ts`:**

```typescript
import { cookies } from 'next/headers'
import { createHmac, randomBytes } from 'crypto'

const SECRET = process.env.AUTH_SECRET!
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!

/**
 * Vérifie les credentials admin contre les env vars
 */
export function verifyAdminCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}

/**
 * Crée un token admin signé (payload: timestamp + random)
 * Format: {timestamp}.{random}.{signature}
 */
export function createAdminToken(): string {
  const timestamp = Date.now()
  const random = randomBytes(16).toString('hex')
  const payload = `${timestamp}.${random}`
  const signature = createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex')

  return `${payload}.${signature}`
}

/**
 * Vérifie un token admin (signature + expiration)
 */
export function verifyAdminToken(token: string): { valid: boolean, expired: boolean } {
  try {
    const [timestamp, random, signature] = token.split('.')

    // Vérifier signature
    const payload = `${timestamp}.${random}`
    const expectedSig = createHmac('sha256', SECRET)
      .update(payload)
      .digest('hex')

    if (signature !== expectedSig) {
      return { valid: false, expired: false }
    }

    // Vérifier expiration (8h = 28800000ms)
    const age = Date.now() - parseInt(timestamp)
    if (age > 28800000) {
      return { valid: false, expired: true }
    }

    return { valid: true, expired: false }
  } catch {
    return { valid: false, expired: false }
  }
}

/**
 * Middleware pour protéger les routes admin
 * Throw si non autorisé (utilisé dans API routes + layouts)
 */
export async function requireAdminAuth(): Promise<void> {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin-token')?.value

  if (!adminToken) {
    throw new Error('Unauthorized: No admin token')
  }

  const { valid, expired } = verifyAdminToken(adminToken)

  if (expired) {
    throw new Error('Unauthorized: Session expired')
  }

  if (!valid) {
    throw new Error('Unauthorized: Invalid token')
  }
}
```

### 2.2 Fichiers à modifier

#### Layout admin

```typescript
// src/app/admin/layout.tsx

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAdminToken } from '@/lib/auth/admin-auth'

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin-token')?.value

  // Vérifier authentification
  if (!adminToken) {
    redirect('/admin/login')
  }

  const { valid, expired } = verifyAdminToken(adminToken)

  if (expired) {
    redirect('/admin/login?error=session_expired')
  }

  if (!valid) {
    redirect('/admin/login?error=invalid_session')
  }

  // Render admin layout si authentifié
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar + Navigation existante */}
      <div className="fixed inset-y-0 left-0 w-64 bg-card border-r">
        {/* ... navigation items ... */}

        {/* Logout button */}
        <form action="/api/admin/auth/logout" method="POST">
          <Button type="submit">Déconnexion</Button>
        </form>
      </div>

      <div className="pl-64">
        {children}
      </div>
    </div>
  )
}
```

#### Routes API admin existantes

**Toutes les routes `src/app/api/admin/**/route.ts`:**

```typescript
// AVANT
import { isAdmin } from '@/lib/auth/admin-check' // ❌ Utilise NextAuth

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ...
}

// APRÈS
import { requireAdminAuth } from '@/lib/auth/admin-auth' // ✅ Nouveau système

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ...
}
```

**Fichiers concernés:**
- `src/app/api/admin/products/route.ts`
- `src/app/api/admin/products/[id]/route.ts`
- `src/app/api/admin/products/[id]/upload/route.ts`
- `src/app/api/admin/products/[id]/stock/route.ts`
- `src/app/api/admin/orders/[id]/mark-shipped/route.ts`
- `src/app/api/admin/orders/[id]/resend-email/route.ts`
- `src/app/api/admin/pickup/redeem/route.ts`

#### Header principal (ajout bouton "Mon compte")

```typescript
// src/components/layout/header.tsx

import { auth } from '@/lib/auth/config'
import Link from 'next/link'
import { User } from 'lucide-react'

export default async function Header() {
  const session = await auth()

  return (
    <header>
      {/* ... logo, navigation, panier ... */}

      {/* Bouton Mon compte */}
      <Link
        href={session?.user ? '/profil' : '/connexion'}
        className="flex items-center gap-2"
      >
        <User className="h-5 w-5" />
        <span>{session?.user ? 'Mon profil' : 'Se connecter'}</span>
      </Link>
    </header>
  )
}
```

### 2.3 Fichiers à supprimer

```
src/lib/auth/admin-check.ts    # ❌ Obsolète (utilise NextAuth pour admin)
```

### 2.4 Structure finale des routes

```
CLIENT (NextAuth) :
  /connexion                     → Google OAuth + Magic Link
  /profil                        → Page profil (Mes commandes à venir)
  /deconnexion                   → Déconnexion NextAuth
  /api/auth/*                    → Routes NextAuth (callback, session, etc.)

ADMIN (Custom) :
  /admin/login                   → Formulaire email/password
  /admin/dashboard               → Dashboard admin
  /admin/products                → Gestion produits
  /admin/orders                  → Gestion commandes
  /admin/pickup                  → Scanner QR retrait
  /api/admin/auth/login          → POST - Vérification credentials
  /api/admin/auth/logout         → POST - Déconnexion

INVITÉ (Aucune auth) :
  /                              → Catalogue produits
  /panier                        → Panier + Checkout
  /commande/[id]?token=xxx       → Suivi commande (lien unique)
```

---

## 3. Data Flow

### 3.1 Flow Connexion Admin

```
1. Admin visite /admin/dashboard (non connecté)
   → Layout vérifie cookie admin-token
   → Absent → Redirect /admin/login

2. Admin remplit formulaire
   - Email: admin@ville.fr
   - Password: *****************
   → Submit (POST /api/admin/auth/login)

3. API vérifie credentials
   - Compare email avec process.env.ADMIN_EMAIL
   - Compare password avec process.env.ADMIN_PASSWORD

   Si MATCH ✅ :
   ├─ Génère token signé (timestamp + random + HMAC)
   ├─ Crée cookie "admin-token" :
   │  ├─ HTTP-only: true
   │  ├─ Secure: true (production)
   │  ├─ SameSite: Lax
   │  ├─ MaxAge: 28800 (8h)
   │  └─ Path: /admin
   └─ Return { success: true }

   Si ERREUR ❌ :
   └─ Return { error: "Email ou mot de passe incorrect" } (401)

4. Redirect → /admin/dashboard
   → Layout lit cookie admin-token
   → Vérifie signature HMAC
   → Vérifie expiration (< 8h)
   → Accès autorisé ✅

5. Admin navigue dans /admin/*
   → Chaque route API vérifie requireAdminAuth()
   → Cookie valide → Continue
   → Cookie invalide/expiré → 401
```

### 3.2 Flow Connexion Client (optionnelle)

```
1. Client clique "Mon compte" dans header
   → Redirect /connexion

2. Client choisit "Continuer avec Google"
   → NextAuth initie OAuth flow
   ├─ Redirect vers Google
   ├─ User consent Google
   └─ Callback /api/auth/callback/google

3. NextAuth traite callback
   ├─ Récupère user info depuis Google
   ├─ Vérifie si user existe en DB (users table)
   │  ├─ Si oui : récupère account existant
   │  └─ Si non : crée user + account
   ├─ Crée session en DB (sessions table)
   └─ Crée cookie authjs.session-token

4. Redirect → /profil
   → Page vérifie session NextAuth
   → Affiche infos user (name, email, avatar)
   → Bouton "Mes commandes" (futur)
   → Bouton "Se déconnecter"

5. Client peut commander avec compte
   → Email pré-rempli au checkout
   → Commande associée à user.id (optionnel)
   → Historique accessible dans /profil
```

### 3.3 Flow Checkout Invité

```
1. Client ajoute produits au panier
   → Zustand store (localStorage)
   → Aucune authentification

2. Client clique "Commander" (/panier)
   → Affiche formulaire checkout :

   Champs communs :
   ├─ Email (required)
   ├─ Mode fulfillment (radio) :
   │  ├─ Livraison (La Poste)
   │  └─ Retrait (Clic & Collect)
   └─ Checkbox RGPD (required)

   Si Livraison :
   ├─ Nom (required)
   ├─ Prénom (required)
   ├─ Adresse (required)
   ├─ Code postal (required)
   └─ Ville (required)

   Si Retrait :
   ├─ Nom (required)
   ├─ Prénom (required)
   └─ Téléphone (required, pour SMS confirmation)

3. Validation formulaire (Zod)
   → POST /api/checkout

   API crée :
   ├─ Order en DB (status: pending)
   ├─ Order items (snapshot prix + produits)
   ├─ GDPR consent record
   └─ Transaction PayFip

   Return :
   └─ { redirectUrl: 'https://payfip.gouv.fr/...' }

4. Redirect vers PayFip
   → Client paye sur portail PayFip
   → PayFip callback /api/payfip/callback

   Webhook PayFip :
   ├─ Vérifie signature PayFip
   ├─ Update order (status: paid, paid_at: now())
   │
   ├─ Si fulfillmentMode === "pickup" :
   │  ├─ Génère token retrait (32 bytes random)
   │  ├─ Hash token (SHA-256)
   │  ├─ Stocke dans pickup_tokens (expires_at: +30 jours)
   │  ├─ Génère QR code (URL: /admin/pickup?token=xxx)
   │  └─ Email "Commande prête à retirer" :
   │     ├─ QR code (base64 inline)
   │     ├─ Lien backup : /commande/[orderId]?token=xxx
   │     └─ Bouton "Créer un compte"
   │
   └─ Si fulfillmentMode === "delivery" :
      └─ Email "Commande confirmée" :
         ├─ Récap commande
         ├─ Délai livraison estimé
         └─ Bouton "Créer un compte"

5. Client clique lien dans email
   → Page /commande/[orderId]?token=xxx

   Vérifie :
   ├─ orderId valide (UUID)
   ├─ token valide (compare hash)
   └─ token non expiré

   Affiche :
   ├─ Détails commande (produits, total, statut)
   ├─ QR code (si retrait)
   ├─ Tracking livraison (si delivery + shipped)
   └─ Encart "Créer un compte pour suivre vos commandes"
```

### 3.4 Flow Création Compte Post-Achat

```
1. Client clique "Créer un compte" (dans email ou page commande)
   → Redirect /connexion?postCheckout=true&email=xxx

2. Page /connexion affiche :
   - Message : "Créez un compte pour suivre cette commande"
   - Bouton "Continuer avec Google" (email pré-rempli si possible)
   - Ou formulaire Magic Link (email pré-rempli)

3. Client se connecte via Google
   → NextAuth flow classique
   → Création user + session
   → Redirect /profil?firstLogin=true

4. Page /profil affiche :
   - Message : "Compte créé avec succès !"
   - Suggestion : "Lier vos commandes passées ?" (futur)
   - Bouton "Mes commandes"
```

### 3.5 Flow Scan QR Code Retrait

```
1. Client présente QR code à La Fabrik
   → Admin scanne QR (app ou scanner physique)
   → QR contient : /admin/pickup?token=xxx

2. Page /admin/pickup vérifie :
   ├─ Admin authentifié (cookie admin-token)
   ├─ Token fourni en query param
   └─ POST /api/admin/pickup/redeem { token }

3. API vérifie token :
   ├─ Hash token
   ├─ Cherche dans pickup_tokens
   │
   ├─ Token introuvable → 404
   ├─ Token expiré (> 30 jours) → 410
   ├─ Token déjà utilisé (used_at != null) → 409
   │
   └─ Token valide ✅ :
      ├─ Update pickup_token :
      │  ├─ used_at = now()
      │  └─ used_by = admin email
      ├─ Update order :
      │  ├─ status = fulfilled
      │  └─ fulfilled_at = now()
      └─ Return order details (customer, items)

4. Page /admin/pickup affiche :
   - ✅ "Retrait validé avec succès"
   - Détails commande (items, client)
   - Bouton "Scanner un autre QR"
```

---

## 4. Error Handling

### 4.1 Erreurs d'authentification Admin

#### Identifiants invalides
```typescript
// POST /api/admin/auth/login
if (!verifyAdminCredentials(email, password)) {
  return NextResponse.json(
    { error: "Email ou mot de passe incorrect" },
    { status: 401 }
  )
}
```

**UI:**
- Message d'erreur sous le formulaire (rouge)
- Pas de détail (ne pas révéler si email ou password est faux)
- Suggestion : "Vérifiez vos identifiants"

#### Session expirée
```typescript
// Layout /admin
const { valid, expired } = verifyAdminToken(adminToken)

if (expired) {
  redirect('/admin/login?error=session_expired')
}
```

**UI:**
- Banner en haut de page login : "Votre session a expiré, reconnectez-vous"
- Couleur orange (warning)

#### Cookie manquant ou invalide
```typescript
if (!adminToken || !valid) {
  redirect('/admin/login?error=invalid_session')
}
```

**UI:**
- Message : "Session invalide, veuillez vous reconnecter"
- Effacer cookie côté client (si présent)

#### Rate limiting (5 tentatives / 15 min)
```typescript
// Rate limit check avec Upstash Redis
const { success } = await adminLoginLimiter.limit(ip)

if (!success) {
  return NextResponse.json(
    { error: "Trop de tentatives. Réessayez dans 15 minutes." },
    { status: 429 }
  )
}
```

### 4.2 Erreurs d'authentification Client (NextAuth)

NextAuth gère automatiquement :
- Erreurs OAuth → `/auth/error?error=OAuthAccountNotLinked`
- Session expirée → refresh token auto
- Callback failures → page d'erreur

**Personnalisation page `/auth/error`:**
```typescript
const errorMessages = {
  OAuthAccountNotLinked: "Ce compte est déjà utilisé avec une autre méthode",
  EmailSignin: "Erreur lors de l'envoi du magic link",
  AccessDenied: "Accès refusé",
  Verification: "Le lien de vérification a expiré",
  Default: "Une erreur est survenue lors de la connexion"
}
```

### 4.3 Erreurs de suivi de commande

#### Token invalide ou expiré
```typescript
// Page /commande/[orderId]?token=xxx
const order = await getOrderByIdAndToken(orderId, token)

if (!order) {
  return (
    <ErrorPage
      title="Commande introuvable"
      message="Le lien a expiré ou est invalide."
      action={
        <Link href="/faq">
          Consultez notre FAQ ou contactez-nous
        </Link>
      }
    />
  )
}
```

#### OrderId invalide
```typescript
if (!orderId || !isValidUUID(orderId)) {
  notFound() // 404 page
}
```

### 4.4 Erreurs de checkout

#### Validation formulaire (client)
```typescript
const checkoutSchema = z.object({
  email: z.string().email("Email invalide"),
  fulfillmentMode: z.enum(['delivery', 'pickup']),
  gdprConsent: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter les CGV" })
  }),
  // ... autres champs conditionnels
})

// Affichage erreurs sous chaque champ
{errors.email && <p className="text-red-500">{errors.email}</p>}
```

#### Stock insuffisant (serveur)
```typescript
// POST /api/checkout
if (product.stock < qty) {
  return NextResponse.json(
    {
      error: `Stock insuffisant pour ${product.name}`,
      available: product.stock
    },
    { status: 409 }
  )
}
```

**UI:**
- Modal d'erreur avec détail du produit
- Bouton "Mettre à jour le panier"

#### Erreur PayFip
```typescript
// Callback PayFip échoue
if (!payFipResponse.success) {
  // Update order status: 'payment_failed'
  await updateOrder(orderId, { status: 'payment_failed' })

  redirect(`/panier?error=payment_failed&orderId=${orderId}`)
}
```

**UI:**
- Banner rouge : "Le paiement a échoué"
- Détail erreur si fourni par PayFip
- Bouton "Réessayer" → reprend le checkout

### 4.5 Erreurs QR code retrait

#### QR code déjà utilisé
```typescript
// POST /api/admin/pickup/redeem
if (pickupToken.used_at) {
  return NextResponse.json(
    {
      error: "QR code déjà utilisé",
      usedAt: pickupToken.used_at,
      usedBy: pickupToken.used_by
    },
    { status: 409 }
  )
}
```

**UI Admin:**
- Alert jaune : "⚠️ Ce QR code a déjà été scanné"
- Détails : "Le [date] par [admin email]"
- Bouton "Voir la commande" (pour vérification)

#### QR code expiré
```typescript
if (new Date() > pickupToken.expires_at) {
  return NextResponse.json(
    { error: "QR code expiré (> 30 jours)" },
    { status: 410 }
  )
}
```

**UI Admin:**
- Alert rouge : "❌ QR code expiré"
- Message : "Contactez le client pour générer un nouveau QR"
- Lien vers commande pour renvoyer email

### 4.6 Logging et monitoring

**Logs à enregistrer :**
- ✅ Toutes tentatives de connexion admin (succès + échecs)
- ✅ Scans QR code (succès + échecs + doublons)
- ✅ Erreurs checkout (validation, stock, PayFip)
- ✅ Erreurs systèmes (500, DB down, etc.)

**Sentry (optionnel mais recommandé) :**
```typescript
import * as Sentry from "@sentry/nextjs"

try {
  await dangerousOperation()
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      component: 'admin-auth',
      action: 'login'
    },
    user: {
      ip_address: request.ip
    }
  })
  throw error
}
```

---

## 5. Testing Strategy

### 5.1 Tests unitaires (priorité haute)

#### Auth admin helpers
```typescript
// src/lib/auth/admin-auth.test.ts

describe('verifyAdminCredentials', () => {
  it('accepte credentials valides', () => {
    expect(verifyAdminCredentials(
      process.env.ADMIN_EMAIL,
      process.env.ADMIN_PASSWORD
    )).toBe(true)
  })

  it('rejette email invalide', () => {
    expect(verifyAdminCredentials(
      'fake@test.com',
      process.env.ADMIN_PASSWORD
    )).toBe(false)
  })

  it('rejette password invalide', () => {
    expect(verifyAdminCredentials(
      process.env.ADMIN_EMAIL,
      'wrong-password'
    )).toBe(false)
  })
})

describe('createAdminToken + verifyAdminToken', () => {
  it('génère et vérifie token valide', () => {
    const token = createAdminToken()
    const result = verifyAdminToken(token)

    expect(result.valid).toBe(true)
    expect(result.expired).toBe(false)
  })

  it('rejette token avec signature invalide', () => {
    const token = 'fake.token.signature'
    const result = verifyAdminToken(token)

    expect(result.valid).toBe(false)
  })

  it('détecte token expiré', () => {
    // Mock token vieux de 9h
    const oldTimestamp = Date.now() - (9 * 60 * 60 * 1000)
    const token = createTokenWithTimestamp(oldTimestamp)
    const result = verifyAdminToken(token)

    expect(result.valid).toBe(false)
    expect(result.expired).toBe(true)
  })
})

describe('requireAdminAuth', () => {
  it('throw si cookie absent', async () => {
    const request = createMockRequest({ cookies: {} })

    await expect(requireAdminAuth(request))
      .rejects.toThrow('Unauthorized: No admin token')
  })

  it('throw si token invalide', async () => {
    const request = createMockRequest({
      cookies: { 'admin-token': 'invalid' }
    })

    await expect(requireAdminAuth(request))
      .rejects.toThrow('Unauthorized: Invalid token')
  })

  it('ne throw pas si token valide', async () => {
    const validToken = createAdminToken()
    const request = createMockRequest({
      cookies: { 'admin-token': validToken }
    })

    await expect(requireAdminAuth(request)).resolves.toBeUndefined()
  })
})
```

### 5.2 Tests d'intégration routes API (priorité haute)

#### Route login admin
```typescript
// src/app/api/admin/auth/login/route.test.ts

describe('POST /api/admin/auth/login', () => {
  it('crée session avec credentials valides', async () => {
    const response = await POST({
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      })
    })

    expect(response.status).toBe(200)

    const cookie = response.cookies.get('admin-token')
    expect(cookie).toBeDefined()
    expect(cookie.httpOnly).toBe(true)
    expect(cookie.secure).toBe(true)
    expect(cookie.maxAge).toBe(28800) // 8h
  })

  it('rejette credentials invalides', async () => {
    const response = await POST({
      body: JSON.stringify({
        email: 'fake@test.com',
        password: 'wrong'
      })
    })

    expect(response.status).toBe(401)
    expect(await response.json()).toMatchObject({
      error: 'Email ou mot de passe incorrect'
    })
  })

  it('rate limit après 5 tentatives', async () => {
    const ip = '192.168.1.1'

    // 5 tentatives échouées
    for (let i = 0; i < 5; i++) {
      await POST({
        body: JSON.stringify({ email: 'fake', password: 'wrong' }),
        ip
      })
    }

    // 6ème tentative bloquée
    const response = await POST({
      body: JSON.stringify({ email: 'fake', password: 'wrong' }),
      ip
    })

    expect(response.status).toBe(429)
  })
})
```

#### Protection routes admin
```typescript
// src/app/api/admin/products/route.test.ts

describe('GET /api/admin/products', () => {
  it('retourne 401 sans cookie admin', async () => {
    const response = await GET({ cookies: {} })
    expect(response.status).toBe(401)
  })

  it('retourne 401 avec cookie invalide', async () => {
    const response = await GET({
      cookies: { 'admin-token': 'invalid' }
    })
    expect(response.status).toBe(401)
  })

  it('retourne produits avec cookie valide', async () => {
    const validToken = createAdminToken()
    const response = await GET({
      cookies: { 'admin-token': validToken }
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('products')
    expect(Array.isArray(data.products)).toBe(true)
  })
})
```

### 5.3 Tests e2e (optionnel, Playwright)

#### Scénario 1 : Login admin complet
```typescript
// tests/e2e/admin-login.spec.ts

test('admin peut se connecter et accéder au dashboard', async ({ page }) => {
  // Aller sur page login
  await page.goto('/admin/login')

  // Remplir formulaire
  await page.fill('input[name="email"]', process.env.ADMIN_EMAIL)
  await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD)
  await page.click('button[type="submit"]')

  // Vérifier redirect dashboard
  await expect(page).toHaveURL('/admin/dashboard')

  // Vérifier éléments visibles
  await expect(page.locator('text=Dashboard')).toBeVisible()
  await expect(page.locator('text=Produits')).toBeVisible()

  // Cookie admin-token présent
  const cookies = await page.context().cookies()
  const adminToken = cookies.find(c => c.name === 'admin-token')
  expect(adminToken).toBeDefined()
  expect(adminToken.httpOnly).toBe(true)
})

test('admin ne peut pas accéder sans connexion', async ({ page }) => {
  await page.goto('/admin/dashboard')

  // Redirect vers login
  await expect(page).toHaveURL('/admin/login')
})

test('erreur affichée pour credentials invalides', async ({ page }) => {
  await page.goto('/admin/login')

  await page.fill('input[name="email"]', 'fake@test.com')
  await page.fill('input[name="password"]', 'wrong')
  await page.click('button[type="submit"]')

  // Message d'erreur visible
  await expect(page.locator('text=Email ou mot de passe incorrect'))
    .toBeVisible()

  // Toujours sur page login
  await expect(page).toHaveURL('/admin/login')
})
```

#### Scénario 2 : Checkout invité + QR code
```typescript
// tests/e2e/checkout-guest.spec.ts

test('client invité peut commander en retrait', async ({ page }) => {
  // Ajouter au panier
  await page.goto('/')
  await page.click('button:has-text("Ajouter au panier")')

  // Aller au checkout
  await page.goto('/panier')

  // Remplir formulaire retrait
  await page.fill('input[name="email"]', 'test@example.com')
  await page.check('input[value="pickup"]')
  await page.fill('input[name="name"]', 'Jean')
  await page.fill('input[name="firstname"]', 'Dupont')
  await page.fill('input[name="phone"]', '0612345678')
  await page.check('input[name="gdprConsent"]')

  // Soumettre
  await page.click('button:has-text("Commander")')

  // Mock PayFip success
  await page.route('**/payfip/**', route => {
    route.fulfill({
      status: 302,
      headers: {
        Location: `/api/payfip/callback?success=true&orderId=xxx`
      }
    })
  })

  // Vérifier email envoyé (mock)
  const email = await getLastSentEmail('test@example.com')
  expect(email.subject).toContain('prête à retirer')
  expect(email.attachments).toContainQRCode()

  // Vérifier lien commande fonctionne
  const orderLink = extractOrderLink(email.html)
  await page.goto(orderLink)

  await expect(page.locator('text=Détails de votre commande')).toBeVisible()
  await expect(page.locator('img[alt="QR Code retrait"]')).toBeVisible()
})
```

#### Scénario 3 : Connexion client Google OAuth
```typescript
// tests/e2e/client-login.spec.ts

test('client peut se connecter via Google', async ({ page, context }) => {
  await page.goto('/')

  // Cliquer "Mon compte" (header)
  await page.click('text=Se connecter')

  // Page connexion
  await expect(page).toHaveURL('/connexion')

  // Cliquer Google OAuth (mock)
  await page.click('button:has-text("Continuer avec Google")')

  // Mock callback Google OAuth
  await context.route('**/api/auth/callback/google**', route => {
    route.fulfill({
      status: 302,
      headers: { Location: '/profil' },
      body: JSON.stringify({
        user: { email: 'client@test.com', name: 'Test Client' }
      })
    })
  })

  // Vérifier redirect profil
  await expect(page).toHaveURL('/profil')
  await expect(page.locator('text=client@test.com')).toBeVisible()
  await expect(page.locator('text=Mes commandes')).toBeVisible()
})

test('utilisateur Google ne peut pas accéder admin', async ({ page }) => {
  // Se connecter via Google (mock session)
  await loginAsGoogleUser(page, 'client@test.com')

  // Tenter d'accéder admin
  await page.goto('/admin/dashboard')

  // Redirect vers admin login (pas de session admin)
  await expect(page).toHaveURL('/admin/login')
})
```

### 5.4 Tests à ne PAS oublier

**Sécurité :**
- ✅ Cookie admin-token est HTTP-only (pas accessible JS)
- ✅ Cookie admin-token est Secure en production
- ✅ Signature HMAC ne peut pas être forgée
- ✅ Token expiré après 8h
- ✅ Rate limiting fonctionne (5 tentatives / 15 min)

**Isolation systèmes :**
- ✅ Session NextAuth ne donne pas accès à /admin
- ✅ Cookie admin-token ne donne pas accès à /profil
- ✅ Deux cookies distincts (pas de collision)

**Flows métier :**
- ✅ Checkout invité fonctionne sans compte
- ✅ QR code généré pour retrait
- ✅ QR code ne peut être scanné qu'une fois
- ✅ QR code expire après 30 jours
- ✅ Lien email fonctionne pour suivi commande

### 5.5 Stratégie de tests (phases)

**Phase 1 - MVP (avant merge) :**
- Tests unitaires auth admin (100% coverage)
- Tests routes API admin login/logout
- Tests protection routes API existantes
- Tests manuels checkout + QR code

**Phase 2 - Post-MVP :**
- Tests e2e complets (Playwright)
- Tests de charge checkout (k6)
- Tests sécurité (OWASP Top 10)
- Tests accessibilité (a11y)

---

## 6. Security Considerations

### 6.1 Authentification Admin

**Stockage credentials :**
- ✅ Variables d'environnement (jamais en code)
- ✅ Secrets Vercel chiffrés
- ✅ Rotation régulière du password (tous les 6 mois)

**Cookie admin-token :**
```typescript
{
  httpOnly: true,        // Pas accessible via JavaScript
  secure: true,          // HTTPS uniquement (production)
  sameSite: 'lax',       // Protection CSRF
  maxAge: 28800,         // 8h (pas de refresh auto)
  path: '/admin'         // Scope restreint
}
```

**Signature HMAC :**
- Algorithme : HMAC-SHA256
- Secret : `process.env.AUTH_SECRET` (32+ bytes)
- Format token : `{timestamp}.{random}.{signature}`
- Impossible à forger sans connaître le secret

**Rate limiting :**
```typescript
// 5 tentatives max par IP / 15 minutes
const adminLoginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "ratelimit:admin-login"
})
```

### 6.2 Protection des routes

**Admin routes :**
- Toutes les routes `/api/admin/*` vérifient `requireAdminAuth()`
- Layout `/admin` vérifie cookie avant render
- Pas de bypass possible (pas de NODE_ENV=development)

**Client routes :**
- `/profil` vérifie session NextAuth
- Routes publiques : `/`, `/panier`, `/connexion`
- Route commande : vérifie token unique

### 6.3 QR Code retrait

**Génération token :**
```typescript
import { randomBytes, createHash } from 'crypto'

// Token clair (envoyé dans email)
const token = randomBytes(32).toString('hex') // 64 chars

// Hash stocké en DB
const tokenHash = createHash('sha256')
  .update(token)
  .digest('hex')

await db.insert(pickup_tokens).values({
  order_id: orderId,
  token_hash: tokenHash,
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
})
```

**Vérification token :**
```typescript
// Hash token reçu du QR
const receivedHash = createHash('sha256')
  .update(receivedToken)
  .digest('hex')

// Chercher en DB
const pickupToken = await db
  .select()
  .from(pickup_tokens)
  .where(eq(pickup_tokens.token_hash, receivedHash))
  .limit(1)

if (!pickupToken) {
  throw new Error('Token invalide')
}
```

**Protections :**
- ✅ Token stocké hashé (pas en clair)
- ✅ Token usage unique (flag `used_at`)
- ✅ Token expiration (30 jours)
- ✅ Longueur 32 bytes (bruteforce impossible)

### 6.4 GDPR & Données personnelles

**Consentement obligatoire :**
```typescript
// Checkbox au checkout
<input type="checkbox" name="gdprConsent" required />
<label>
  J'accepte que mes données soient utilisées pour traiter ma commande
  (voir <Link href="/politique-confidentialite">politique de confidentialité</Link>)
</label>
```

**Données collectées :**
- Email (required)
- Nom, prénom (required pour livraison/retrait)
- Adresse complète (si livraison)
- Téléphone (si retrait)
- IP + User-Agent (RGPD consent proof)

**Conservation :**
- Commandes : 3 ans (obligation comptable)
- Logs : 1 an
- Tokens retrait : 30 jours puis supprimés

**Droits utilisateurs :**
- Accès : via email support (pas d'interface auto MVP)
- Rectification : via email support
- Suppression : après délai légal (3 ans)

### 6.5 Sécurité PayFip

**Vérification callback :**
```typescript
// Vérifier signature PayFip
const receivedSignature = request.headers.get('x-payfip-signature')
const computedSignature = createHmac('sha256', PAYFIP_SECRET)
  .update(rawBody)
  .digest('hex')

if (receivedSignature !== computedSignature) {
  throw new Error('Invalid PayFip signature')
}
```

**Montants recalculés :**
```typescript
// JAMAIS faire confiance au payload client
const itemsTotal = items.reduce((sum, item) => {
  const product = getProductById(item.id) // DB lookup
  return sum + (product.price * item.qty)
}, 0)

const shippingTotal = fulfillmentMode === 'delivery'
  ? calculateShipping(items)
  : 0

const grandTotal = itemsTotal + shippingTotal

// Vérifier avec PayFip
if (payFipTotal !== grandTotal) {
  throw new Error('Amount mismatch')
}
```

### 6.6 Headers de sécurité

```typescript
// middleware.ts ou next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY' // Pas d'iframe
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff' // Pas de MIME sniffing
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]
```

### 6.7 Audit de sécurité

**Checklist avant prod :**
- [ ] Tous secrets en env vars (pas de hardcoded)
- [ ] AUTH_SECRET >= 32 bytes
- [ ] ADMIN_PASSWORD forte (16+ chars, complexe)
- [ ] Cookies HTTP-only + Secure
- [ ] Rate limiting actif
- [ ] HTTPS forcé (Vercel auto)
- [ ] Validation Zod tous inputs
- [ ] Pas de SQL injection (Drizzle ORM)
- [ ] Pas de XSS (React escape auto)
- [ ] CSP configuré (Content Security Policy)
- [ ] Sentry configuré (monitoring erreurs)

---

## 7. Migration Plan

### 7.1 Étapes de migration

**Étape 1 : Créer nouveau système admin**
1. Créer `src/lib/auth/admin-auth.ts`
2. Créer route `/api/admin/auth/login`
3. Créer route `/api/admin/auth/logout`
4. Créer page `/admin/login`
5. Tests unitaires helpers auth

**Étape 2 : Migrer protection routes admin**
1. Modifier layout `/admin` pour utiliser nouveau système
2. Modifier toutes routes `/api/admin/*` (7 fichiers)
3. Supprimer `src/lib/auth/admin-check.ts`
4. Tests routes API avec nouveau système

**Étape 3 : Ajouter bouton "Mon compte" header**
1. Modifier `src/components/layout/header.tsx`
2. Vérifier session NextAuth
3. Afficher "Mon profil" si connecté, sinon "Se connecter"

**Étape 4 : Vérifier isolation systèmes**
1. Tester : Google OAuth → ne donne pas accès `/admin`
2. Tester : Cookie admin → ne donne pas accès `/profil`
3. Vérifier deux cookies distincts
4. Tests e2e isolation

**Étape 5 : Améliorer UX checkout**
1. Ajouter proposition "Créer un compte" dans email confirmation
2. Ajouter encart "Créer un compte" sur page `/commande/[id]`
3. Pré-remplir email si vient de checkout

**Étape 6 : Documentation & déploiement**
1. Mettre à jour README
2. Documenter nouvelles variables env (ADMIN_EMAIL, ADMIN_PASSWORD)
3. Configurer secrets Vercel
4. Déployer sur preview
5. Tests complets preview
6. Merge et déploiement production

### 7.2 Rollback plan

**Si problème en production :**

1. **Connexion admin impossible :**
   - Vérifier env vars Vercel (ADMIN_EMAIL, ADMIN_PASSWORD)
   - Vérifier AUTH_SECRET présent
   - Logs Vercel : erreurs signature/token ?
   - Quick fix : bypass auth en ajoutant flag `ADMIN_BYPASS=true` (temporaire)

2. **Performance dégradée :**
   - Vérifier rate limiting Upstash (trop restrictif ?)
   - Logs Sentry : slow queries ?
   - Rollback si critique : `git revert` + redeploy

3. **Utilisateurs perdus :**
   - Banner "Changement connexion admin : utiliser /admin/login"
   - Email aux admins avec nouvelles instructions

### 7.3 Variables d'environnement

**Nouvelles variables requises :**
```bash
# Admin Authentication
ADMIN_EMAIL=admin@ville.fr
ADMIN_PASSWORD=générer-avec-openssl-rand-base64-32

# Déjà existantes (à conserver)
AUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Configuration Vercel :**
1. Dashboard → Settings → Environment Variables
2. Ajouter `ADMIN_EMAIL` (Production + Preview)
3. Ajouter `ADMIN_PASSWORD` (Production + Preview, secret)
4. Ne PAS commiter ces valeurs dans Git

### 7.4 Timeline estimé

| Phase | Durée | Description |
|-------|-------|-------------|
| Développement | 2-3 jours | Implémentation + tests unitaires |
| Tests e2e | 1 jour | Playwright scenarios complets |
| Review + fixes | 1 jour | Code review + ajustements |
| Déploiement preview | 0.5 jour | Deploy + tests manuels |
| Production | 0.5 jour | Merge + deploy + monitoring |
| **Total** | **5-6 jours** | Estimation incluant buffers |

---

## Conclusion

Cette refonte sépare complètement l'authentification client (NextAuth + Google OAuth optionnel) de l'authentification admin (credentials simples), résolvant la confusion actuelle et offrant une architecture claire, sécurisée et maintenable.

**Points clés :**
- ✅ Deux systèmes totalement indépendants (cookies, routes, sessions)
- ✅ Admin ultra-simple (1 compte, email/password en env vars)
- ✅ Client flexible (Google OAuth optionnel, checkout invité possible)
- ✅ Sécurité renforcée (HMAC, HTTP-only cookies, rate limiting)
- ✅ Tests complets (unitaires + intégration + e2e)
- ✅ Migration progressive sans breaking changes

**Prochaine étape :** Créer le plan d'implémentation détaillé (task-by-task) avec le skill `writing-plans`.
