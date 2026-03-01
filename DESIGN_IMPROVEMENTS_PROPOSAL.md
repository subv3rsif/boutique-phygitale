# 🎨 Design Improvements & Auth Integration - Proposition

**Date**: 2026-03-01
**Objectif**: Refinement design + Intégration authentification

---

## 🔍 Problèmes Identifiés

### 1. ❌ Desktop Header - Asymétrique
```
Actuel:
[☰]         Boutique 1885              [🔍] [🛍️] [👤]
↑                   ↑                         ↑
Gauche         Centré absolu              Droite

Problème: Logo centré absolument créé déséquilibre visuel
```

### 2. ❌ DrawerMenu - Couleur Trop Flashy
```css
bg-purple-950/95  /* Trop saturé, pas premium */
```

### 3. ⚠️ Mobile Header - Peu Utile
```
Actuel:
[☰]         Boutique 1885         [spacer]

Problème: Occupe espace sans apporter valeur (BottomNav suffit)
```

### 4. ❌ BottomNav Cart - Couleur Dénote
```css
bg-fuchsia-600  /* Trop flashy vs Love Symbol */
```

### 5. 🔐 Auth Manquante
Pas de système d'authentification Google/Email

---

## 💡 Solutions Proposées

## Solution 1: Desktop Header Équilibré

### Concept
```
┌──────────────────────────────────────────────────────┐
│ [☰] Boutique 1885        [🔍]  [🛍️ 3]  [👤]          │
│  ↑         ↑                        ↑                │
│ Menu     Logo left              Actions right         │
└──────────────────────────────────────────────────────┘
```

### Design
- Logo **aligné à gauche** (après hamburger)
- Actions **groupées à droite**
- **Équilibre visuel** : gauche = menu+logo, droite = actions

### Code
```tsx
<div className="container flex items-center justify-between">
  {/* Left: Hamburger + Logo */}
  <div className="flex items-center gap-3 md:gap-4">
    <Button onClick={() => setMenuOpen(true)}>
      <Menu />
    </Button>
    <Link href="/" className="font-display text-2xl">
      Boutique 1885
    </Link>
  </div>

  {/* Right: Desktop Actions */}
  <div className="hidden md:flex items-center gap-2">
    <SearchButton />
    <CartButton />
    <ProfileButton />
  </div>

  {/* Mobile: Spacer */}
  <div className="md:hidden w-10" />
</div>
```

---

## Solution 2: DrawerMenu Premium

### Concept
Remplacer `purple-950` par **Love Symbol avec opacity subtile**

### Avant
```css
bg-purple-950/95      /* Flashy */
bg-gradient-to-br from-purple-900/20 via-transparent to-purple-600/10
```

### Après
```css
/* Fond Love Symbol premium */
bg-[#503B64]/90       /* Love Symbol avec opacity */
backdrop-blur-2xl     /* Blur fort pour premium feel */

/* Gradient subtil Cloud Dancer */
bg-gradient-to-br from-[#F3EFEA]/5 via-transparent to-[#503B64]/20
```

### Code
```tsx
<motion.div
  className="fixed inset-0 bg-[#503B64]/90 backdrop-blur-2xl z-50"
  onClick={onClose}
>
  {/* Subtle gradient Love Symbol × Cloud Dancer */}
  <div className="absolute inset-0 bg-gradient-to-br from-[#F3EFEA]/5 via-transparent to-[#503B64]/20" />

  {/* Subtle grain texture (premium) */}
  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
</motion.div>
```

### Résultat
- ✅ Premium, élégant
- ✅ Cohérent avec design system
- ✅ Moins flashy, plus sophistiqué

---

## Solution 3: Mobile Header Redesign

### Concept A: "Floating Command" (Recommandé)

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              [Logo Badge Rond]                       │
│                                                      │
└──────────────────────────────────────────────────────┘

     ┌──────────────────────────────────┐
     │ BottomNav Pill                   │
     └──────────────────────────────────┘

 ┌────┐
 │ ☰  │  ← Floating hamburger (top-left)
 └────┘
```

**Features**:
- Header sticky minimal (logo badge centré, petit)
- Hamburger **floating button** (top-left, glass effect)
- BottomNav reste navigation principale

**Code**:
```tsx
// Mobile Header
<header className="md:hidden sticky top-4 z-30 px-4">
  <div className="flex justify-center">
    <Link href="/">
      <div className="h-12 w-12 rounded-full glass-love flex items-center justify-center">
        <span className="font-display font-bold text-lg">18</span>
      </div>
    </Link>
  </div>
</header>

// Floating Hamburger
<motion.button
  className="md:hidden fixed top-4 left-4 z-40 h-12 w-12 rounded-full glass-purple shadow-premium"
  onClick={() => setMenuOpen(true)}
>
  <Menu className="h-5 w-5" />
</motion.button>
```

### Concept B: "Headerless Mobile"

```
Pas de header du tout sur mobile
Just BottomNav + Floating Hamburger
```

**Avantages**:
- ✅ Espace écran maximal
- ✅ Focus sur contenu
- ✅ BottomNav = seule navigation

**Code**:
```tsx
// Header desktop-only
<header className="hidden md:block sticky top-0 z-40">
  {/* Desktop header content */}
</header>

// Floating Hamburger mobile-only
<motion.button className="md:hidden fixed top-4 left-4 z-40">
  <Menu />
</motion.button>
```

---

## Solution 4: BottomNav Cart - Love Symbol

### Avant
```css
bg-fuchsia-600  /* Magenta flashy */
```

### Après
```css
bg-primary      /* Love Symbol #503B64 */
bg-gradient-to-br from-primary to-primary/80  /* Gradient subtil */
```

### Code
```tsx
<motion.div
  className={cn(
    "h-14 w-14 rounded-full",
    // Love Symbol gradient au lieu de fuchsia
    "bg-gradient-to-br from-primary to-primary/80",
    "shadow-premium-purple",
    // ...
  )}
>
  <ShoppingBag className="text-white" />
</motion.div>
```

### Résultat
- ✅ Cohérent avec design system
- ✅ Premium, pas flashy
- ✅ Badge reste rouge (urgence visuelle OK)

---

## Solution 5: Google Auth Integration 🔐

### Stack Recommandée
- **NextAuth.js v5** (Auth.js)
- **Google OAuth Provider**
- **Supabase** (user data storage)
- **Session management** (JWT)

### Architecture

```
User clicks "Connexion"
    ↓
Google OAuth popup
    ↓
Callback /api/auth/callback/google
    ↓
Create/Update user in Supabase
    ↓
Session JWT stored (httpOnly cookie)
    ↓
Redirect to /profil
```

### Installation

```bash
npm install next-auth@beta @auth/core @auth/drizzle-adapter
npm install @supabase/supabase-js
```

### Configuration

#### 1. Google Cloud Console Setup

```
1. Aller sur https://console.cloud.google.com
2. Créer projet "Boutique 1885"
3. APIs & Services > Credentials
4. Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs:
     - http://localhost:3000/api/auth/callback/google (dev)
     - https://boutique1885.vercel.app/api/auth/callback/google (prod)
5. Copier Client ID + Client Secret
```

#### 2. Environment Variables

```bash
# .env.local
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# Supabase (déjà configuré)
DATABASE_URL=postgresql://...
```

#### 3. Auth Configuration

```typescript
// src/lib/auth/config.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
  },
})
```

#### 4. API Routes

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth/config"
export const { GET, POST } = handlers
```

#### 5. Database Schema (Drizzle)

```typescript
// src/lib/db/schema.ts
import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const accounts = pgTable("accounts", {
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: timestamp("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => ({
  compoundKey: primaryKey({
    columns: [account.provider, account.providerAccountId],
  }),
}))

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
})

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires").notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}))
```

#### 6. Migration

```bash
# Générer migration
npx drizzle-kit generate

# Appliquer migration
npx drizzle-kit push
```

#### 7. Login Page

```tsx
// src/app/login/page.tsx
import { signIn } from "@/lib/auth/config"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8 glass-love rounded-3xl">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold">Connexion</h1>
          <p className="text-muted-foreground mt-2">
            Connectez-vous pour accéder à votre profil
          </p>
        </div>

        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/profil" })
          }}
        >
          <Button
            type="submit"
            className="w-full h-12 bg-white text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              {/* Google icon SVG */}
            </svg>
            Continuer avec Google
          </Button>
        </form>
      </div>
    </div>
  )
}
```

#### 8. Protected Profile Page

```tsx
// src/app/profil/page.tsx
import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="container py-12">
      <h1 className="font-display text-4xl">Mon Profil</h1>
      <div className="mt-8 space-y-4">
        <p>Nom: {session.user.name}</p>
        <p>Email: {session.user.email}</p>
        {session.user.image && (
          <img
            src={session.user.image}
            alt={session.user.name || "Avatar"}
            className="h-20 w-20 rounded-full"
          />
        )}
      </div>
    </div>
  )
}
```

#### 9. Header Profile Button Logic

```tsx
// src/components/layout/header.tsx
import { auth } from "@/lib/auth/config"

export async function Header() {
  const session = await auth()

  return (
    <header>
      {/* ... */}

      {/* Profile Button */}
      {session?.user ? (
        // Logged in: show avatar + dropdown
        <ProfileDropdown user={session.user} />
      ) : (
        // Not logged in: redirect to login
        <Link href="/login">
          <Button>
            <User />
          </Button>
        </Link>
      )}
    </header>
  )
}
```

#### 10. Middleware Protection

```typescript
// src/middleware.ts
import { auth } from "@/lib/auth/config"

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Protect /profil, /admin, /ma-commande
  if (pathname.startsWith("/profil") || pathname.startsWith("/admin")) {
    if (!req.auth) {
      return Response.redirect(new URL("/login", req.url))
    }
  }

  // Admin-only routes
  if (pathname.startsWith("/admin")) {
    const allowedEmails = process.env.ADMIN_EMAILS?.split(",") || []
    if (!allowedEmails.includes(req.auth.user?.email || "")) {
      return Response.redirect(new URL("/", req.url))
    }
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

---

## 🎯 Plan d'Implémentation

### Phase 1: Design Improvements (2h)
1. ✅ Desktop header équilibré (logo left)
2. ✅ DrawerMenu Love Symbol premium
3. ✅ Mobile header redesign (floating hamburger)
4. ✅ BottomNav cart Love Symbol

### Phase 2: Auth Setup (3-4h)
1. ✅ Google Cloud Console OAuth
2. ✅ NextAuth v5 installation
3. ✅ Database schema + migration
4. ✅ Login page
5. ✅ Protected routes
6. ✅ Profile page
7. ✅ Middleware

### Phase 3: Integration (1h)
1. ✅ Header profile button logic
2. ✅ Logout functionality
3. ✅ Session persistence
4. ✅ Tests

**Total estimé**: 6-7h

---

## 🎨 Moodboard Design

### Desktop Header
```
┌─────────────────────────────────────────────────────────┐
│ [☰] Boutique 1885            [🔍]  [🛍️ 3]  [Avatar]    │
│  ↑         ↑                           ↑                │
│ Menu     Logo                      Actions              │
└─────────────────────────────────────────────────────────┘
Équilibré, professional, premium
```

### DrawerMenu
```
Love Symbol (#503B64) /90
+ Cloud Dancer gradient subtil
+ Grain texture (0.02 opacity)
= Premium, élégant, cohérent
```

### Mobile
```
    ┌────┐
    │ ☰  │  ← Floating (glass-purple)
    └────┘

       [1885]  ← Logo badge (optional)

     ┌──────────────────┐
     │ BottomNav        │
     │ Cart: Love Symbol│
     └──────────────────┘
```

---

## 📊 Résultats Attendus

### Design
- ✅ Desktop header équilibré
- ✅ Couleurs cohérentes (Love Symbol)
- ✅ Premium feel (DrawerMenu subtil)
- ✅ Mobile minimaliste

### Auth
- ✅ Google OAuth fonctionnel
- ✅ Session persistante
- ✅ Protected routes
- ✅ Admin roles

### Performance
- ✅ NextAuth optimisé
- ✅ Session serverless (Edge)
- ✅ Pas d'impact bundle (server components)

---

## 🚀 Validation Requise

**Souhaitez-vous que j'implémente** :

1. **Design improvements** (Phase 1) ?
   - Desktop header équilibré
   - DrawerMenu Love Symbol
   - Mobile floating hamburger
   - BottomNav cart Love Symbol

2. **Google Auth** (Phase 2) ?
   - NextAuth v5 setup
   - Database schema
   - Login/Profile pages
   - Protected routes

3. **Les deux** (Phase 1 + 2) ?

**Ou préférez-vous** :
- Ajustements sur les designs proposés ?
- Autre provider auth (GitHub, Email magic link) ?

---

**Document créé**: 2026-03-01
**Status**: En attente de validation
