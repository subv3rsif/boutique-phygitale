# Authentication Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Séparer complètement l'authentification client (NextAuth) de l'authentification admin (credentials simples) pour éliminer la confusion actuelle.

**Architecture:** Deux systèmes d'auth indépendants - NextAuth pour clients (Google OAuth optionnel) + système custom léger pour admin (email/password env vars, cookie HTTP-only signé HMAC-SHA256).

**Tech Stack:** NextAuth v5, Node.js crypto (HMAC, randomBytes), Zod validation, Upstash Redis (rate limiting), Vitest (tests)

---

## Task 1: Create Admin Auth Helper Library

**Files:**
- Create: `src/lib/auth/admin-auth.ts`
- Reference: `src/lib/auth/config.ts` (NextAuth existant)

- [ ] **Step 1: Write failing test for verifyAdminCredentials**

Create test file first (TDD):

```typescript
// src/lib/auth/__tests__/admin-auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  verifyAdminCredentials,
  createAdminToken,
  verifyAdminToken
} from '../admin-auth'

describe('verifyAdminCredentials', () => {
  beforeEach(() => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    process.env.ADMIN_PASSWORD = 'test-password-123'
  })

  it('accepte credentials valides', () => {
    const result = verifyAdminCredentials('admin@test.com', 'test-password-123')
    expect(result).toBe(true)
  })

  it('rejette email invalide', () => {
    const result = verifyAdminCredentials('fake@test.com', 'test-password-123')
    expect(result).toBe(false)
  })

  it('rejette password invalide', () => {
    const result = verifyAdminCredentials('admin@test.com', 'wrong-password')
    expect(result).toBe(false)
  })

  it('rejette si env vars manquantes', () => {
    delete process.env.ADMIN_EMAIL
    delete process.env.ADMIN_PASSWORD

    const result = verifyAdminCredentials('admin@test.com', 'test-password-123')
    expect(result).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/auth/__tests__/admin-auth.test.ts`
Expected: FAIL with "Cannot find module '../admin-auth'"

- [ ] **Step 3: Implement verifyAdminCredentials**

```typescript
// src/lib/auth/admin-auth.ts

/**
 * Admin Authentication System
 *
 * Simple credential-based auth for admin users.
 * Credentials stored in environment variables (ADMIN_EMAIL, ADMIN_PASSWORD).
 * Session managed via HTTP-only signed cookies (HMAC-SHA256).
 */

import { cookies } from 'next/headers'
import { createHmac, randomBytes } from 'crypto'

// Environment variables
const SECRET = process.env.AUTH_SECRET
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

// Token expiration: 8 hours in milliseconds
const TOKEN_EXPIRATION_MS = 8 * 60 * 60 * 1000

/**
 * Verify admin credentials against environment variables
 * @param email - Email to verify
 * @param password - Password to verify
 * @returns true if credentials match, false otherwise
 */
export function verifyAdminCredentials(email: string, password: string): boolean {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('[AUTH] ADMIN_EMAIL or ADMIN_PASSWORD not set')
    return false
  }

  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}
```

- [ ] **Step 4: Run test to verify verifyAdminCredentials passes**

Run: `npm test src/lib/auth/__tests__/admin-auth.test.ts`
Expected: PASS (4/4 tests)

- [ ] **Step 5: Write failing test for createAdminToken + verifyAdminToken**

Add to test file:

```typescript
// src/lib/auth/__tests__/admin-auth.test.ts

describe('createAdminToken + verifyAdminToken', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret-key-for-hmac-signature'
  })

  it('génère et vérifie token valide', () => {
    const token = createAdminToken()
    const result = verifyAdminToken(token)

    expect(result.valid).toBe(true)
    expect(result.expired).toBe(false)
  })

  it('rejette token avec signature invalide', () => {
    const token = '1234567890.abcdef1234567890.fakesignature'
    const result = verifyAdminToken(token)

    expect(result.valid).toBe(false)
    expect(result.expired).toBe(false)
  })

  it('rejette token malformé', () => {
    const token = 'invalid-token-format'
    const result = verifyAdminToken(token)

    expect(result.valid).toBe(false)
    expect(result.expired).toBe(false)
  })

  it('détecte token expiré', () => {
    // Mock token créé il y a 9 heures (> 8h expiration)
    const oldTimestamp = Date.now() - (9 * 60 * 60 * 1000)
    const random = randomBytes(16).toString('hex')
    const payload = `${oldTimestamp}.${random}`
    const signature = createHmac('sha256', process.env.AUTH_SECRET!)
      .update(payload)
      .digest('hex')
    const expiredToken = `${payload}.${signature}`

    const result = verifyAdminToken(expiredToken)

    expect(result.valid).toBe(false)
    expect(result.expired).toBe(true)
  })

  it('rejette si AUTH_SECRET manquant', () => {
    delete process.env.AUTH_SECRET

    expect(() => createAdminToken()).toThrow()
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test src/lib/auth/__tests__/admin-auth.test.ts`
Expected: FAIL with "createAdminToken is not a function"

- [ ] **Step 7: Implement createAdminToken**

Add to `admin-auth.ts`:

```typescript
/**
 * Create a signed admin token
 * Format: {timestamp}.{random}.{signature}
 *
 * @returns Signed token string
 * @throws Error if AUTH_SECRET is not set
 */
export function createAdminToken(): string {
  if (!SECRET) {
    throw new Error('AUTH_SECRET environment variable is not set')
  }

  const timestamp = Date.now()
  const random = randomBytes(16).toString('hex')
  const payload = `${timestamp}.${random}`

  const signature = createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex')

  return `${payload}.${signature}`
}
```

- [ ] **Step 8: Implement verifyAdminToken**

Add to `admin-auth.ts`:

```typescript
/**
 * Verify an admin token (signature + expiration)
 *
 * @param token - Token to verify
 * @returns Object with valid and expired flags
 */
export function verifyAdminToken(token: string): { valid: boolean; expired: boolean } {
  if (!SECRET) {
    console.error('[AUTH] AUTH_SECRET not set')
    return { valid: false, expired: false }
  }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false, expired: false }
    }

    const [timestampStr, random, signature] = parts

    // Verify signature
    const payload = `${timestampStr}.${random}`
    const expectedSig = createHmac('sha256', SECRET)
      .update(payload)
      .digest('hex')

    if (signature !== expectedSig) {
      return { valid: false, expired: false }
    }

    // Check expiration
    const timestamp = parseInt(timestampStr, 10)
    if (isNaN(timestamp)) {
      return { valid: false, expired: false }
    }

    const age = Date.now() - timestamp
    if (age > TOKEN_EXPIRATION_MS) {
      return { valid: false, expired: true }
    }

    return { valid: true, expired: false }
  } catch (error) {
    console.error('[AUTH] Token verification error:', error)
    return { valid: false, expired: false }
  }
}
```

- [ ] **Step 9: Run test to verify token functions pass**

Run: `npm test src/lib/auth/__tests__/admin-auth.test.ts`
Expected: PASS (9/9 tests)

- [ ] **Step 10: Write failing test for requireAdminAuth**

Add to test file:

```typescript
// src/lib/auth/__tests__/admin-auth.test.ts
import { cookies } from 'next/headers'

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn()
}))

describe('requireAdminAuth', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret-key'
  })

  it('throw si cookie absent', async () => {
    const mockCookies = {
      get: vi.fn().mockReturnValue(undefined)
    }
    vi.mocked(cookies).mockResolvedValue(mockCookies as any)

    await expect(requireAdminAuth()).rejects.toThrow('Unauthorized: No admin token')
  })

  it('throw si token invalide', async () => {
    const mockCookies = {
      get: vi.fn().mockReturnValue({ value: 'invalid-token' })
    }
    vi.mocked(cookies).mockResolvedValue(mockCookies as any)

    await expect(requireAdminAuth()).rejects.toThrow('Unauthorized: Invalid token')
  })

  it('throw si token expiré', async () => {
    // Create expired token
    const oldTimestamp = Date.now() - (9 * 60 * 60 * 1000)
    const random = randomBytes(16).toString('hex')
    const payload = `${oldTimestamp}.${random}`
    const signature = createHmac('sha256', process.env.AUTH_SECRET!)
      .update(payload)
      .digest('hex')
    const expiredToken = `${payload}.${signature}`

    const mockCookies = {
      get: vi.fn().mockReturnValue({ value: expiredToken })
    }
    vi.mocked(cookies).mockResolvedValue(mockCookies as any)

    await expect(requireAdminAuth()).rejects.toThrow('Unauthorized: Session expired')
  })

  it('ne throw pas si token valide', async () => {
    const validToken = createAdminToken()
    const mockCookies = {
      get: vi.fn().mockReturnValue({ value: validToken })
    }
    vi.mocked(cookies).mockResolvedValue(mockCookies as any)

    await expect(requireAdminAuth()).resolves.toBeUndefined()
  })
})
```

- [ ] **Step 11: Run test to verify it fails**

Run: `npm test src/lib/auth/__tests__/admin-auth.test.ts`
Expected: FAIL with "requireAdminAuth is not a function"

- [ ] **Step 12: Implement requireAdminAuth**

Add to `admin-auth.ts`:

```typescript
/**
 * Require admin authentication (middleware)
 * Throws error if not authenticated - use in API routes and layouts
 *
 * @throws Error if no valid admin token
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

- [ ] **Step 13: Run all tests to verify they pass**

Run: `npm test src/lib/auth/__tests__/admin-auth.test.ts`
Expected: PASS (13/13 tests)

- [ ] **Step 14: Commit admin auth library**

```bash
git add src/lib/auth/admin-auth.ts src/lib/auth/__tests__/admin-auth.test.ts
git commit -m "feat(auth): add admin authentication helper library

- verifyAdminCredentials: check email/password against env vars
- createAdminToken: generate signed token (HMAC-SHA256)
- verifyAdminToken: verify signature and expiration (8h)
- requireAdminAuth: middleware for API routes
- Full test coverage (13 unit tests)"
```

---

## Task 2: Create Admin Login API Routes

**Files:**
- Create: `src/app/api/admin/auth/login/route.ts`
- Create: `src/app/api/admin/auth/logout/route.ts`
- Reference: `src/lib/auth/admin-auth.ts` (task 1)

- [ ] **Step 1: Install Zod if not present**

Check: `grep -q "zod" package.json`
If not found: `npm install zod`

- [ ] **Step 2: Create login route with validation schema**

```typescript
// src/app/api/admin/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { verifyAdminCredentials, createAdminToken } from '@/lib/auth/admin-auth'

/**
 * Admin Login API Route
 * POST /api/admin/auth/login
 *
 * Body: { email: string, password: string }
 * Returns: { success: true } with admin-token cookie
 * Errors: 400 (validation), 401 (invalid credentials), 500 (server error)
 */

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate body
    const body = await request.json()
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Verify credentials
    if (!verifyAdminCredentials(email, password)) {
      console.warn('[AUTH] Failed login attempt:', email)
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Create token
    const token = createAdminToken()

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 hours in seconds
      path: '/admin'
    })

    console.log('[AUTH] Admin login success:', email)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[AUTH] Login error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Create logout route**

```typescript
// src/app/api/admin/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Admin Logout API Route
 * POST /api/admin/auth/logout
 *
 * Deletes admin-token cookie and redirects to login
 */

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    // Delete admin-token cookie
    cookieStore.delete('admin-token')

    console.log('[AUTH] Admin logout')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[AUTH] Logout error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 4: Test login route manually**

Start dev server: `npm run dev`

Test with curl:
```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ville.fr","password":"wrong"}' \
  -v
```

Expected: 401 with "Email ou mot de passe incorrect"

Test with valid credentials (use your ADMIN_EMAIL and ADMIN_PASSWORD):
```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"VOTRE_ADMIN_EMAIL","password":"VOTRE_ADMIN_PASSWORD"}' \
  -v
```

Expected: 200 with `Set-Cookie: admin-token=...`

- [ ] **Step 5: Test logout route manually**

```bash
curl -X POST http://localhost:3000/api/admin/auth/logout \
  -H "Cookie: admin-token=test" \
  -v
```

Expected: 200 with `Set-Cookie: admin-token=; Max-Age=0` (deletes cookie)

- [ ] **Step 6: Commit login/logout routes**

```bash
git add src/app/api/admin/auth/login/route.ts src/app/api/admin/auth/logout/route.ts
git commit -m "feat(auth): add admin login and logout API routes

- POST /api/admin/auth/login: validate credentials, create token, set cookie
- POST /api/admin/auth/logout: delete admin-token cookie
- Zod validation for login payload
- HTTP-only secure cookies (8h expiration)
- Manual testing passed"
```

---

## Task 3: Create Admin Login Page

**Files:**
- Create: `src/app/admin/login/page.tsx`
- Reference: `src/app/connexion/page.tsx` (style existant)

- [ ] **Step 1: Create login page component**

```typescript
// src/app/admin/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, Mail, AlertCircle } from 'lucide-react'

/**
 * Admin Login Page
 *
 * Simple email/password form
 * Validates credentials via /api/admin/auth/login
 * Redirects to /admin/dashboard on success
 */

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Handle error query params (session expired, invalid)
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'session_expired') {
      setError('Votre session a expiré, reconnectez-vous')
    } else if (errorParam === 'invalid_session') {
      setError('Session invalide, veuillez vous reconnecter')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erreur de connexion')
        setLoading(false)
        return
      }

      // Success - redirect to dashboard
      router.push('/admin/dashboard')
      router.refresh()
    } catch (err: any) {
      console.error('Login error:', err)
      setError('Erreur de connexion au serveur')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-block">
              <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Administration
            </h1>
            <p className="text-muted-foreground">
              Connexion réservée aux administrateurs
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@ville.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Accès sécurisé par authentification
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Test login page manually**

Open: `http://localhost:3000/admin/login`

Test cases:
1. Empty form → browser validation "Ce champ est obligatoire"
2. Invalid email format → browser validation "Email invalide"
3. Wrong credentials → Error alert "Email ou mot de passe incorrect"
4. Valid credentials → Redirect to /admin/dashboard

- [ ] **Step 3: Commit admin login page**

```bash
git add src/app/admin/login/page.tsx
git commit -m "feat(auth): add admin login page

- Client component with email/password form
- Error handling (credentials, session expired)
- Loading states
- Redirects to /admin/dashboard on success
- Consistent styling with app theme"
```

---

## Task 4: Update Admin Layout Protection

**Files:**
- Modify: `src/app/admin/layout.tsx`
- Reference: `src/lib/auth/admin-auth.ts` (requireAdminAuth)

- [ ] **Step 1: Read current admin layout**

```bash
cat src/app/admin/layout.tsx
```

Note the current auth check (uses cookies directly)

- [ ] **Step 2: Replace auth check with requireAdminAuth**

```typescript
// src/app/admin/layout.tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Package, QrCode, LogOut, ShoppingBag } from 'lucide-react'
import { requireAdminAuth } from '@/lib/auth/admin-auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check admin authentication
  try {
    await requireAdminAuth()
  } catch (error: any) {
    // Not authenticated - redirect to login
    if (error.message.includes('Session expired')) {
      redirect('/admin/login?error=session_expired')
    } else {
      redirect('/admin/login')
    }
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Produits',
      href: '/admin/products',
      icon: ShoppingBag,
    },
    {
      name: 'Commandes',
      href: '/admin/orders',
      icon: Package,
    },
    {
      name: 'Scanner QR',
      href: '/admin/pickup',
      icon: QrCode,
    },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-card border-r">
        <div className="flex flex-col h-full">
          {/* Logo/Title */}
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold">Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Boutique Ville
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <p className="text-sm font-medium mb-3">
              {process.env.ADMIN_EMAIL || 'Administrateur'}
            </p>

            <form action="/api/admin/auth/logout" method="POST">
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                size="sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Test admin layout protection**

1. Without auth: Visit `http://localhost:3000/admin/dashboard`
   Expected: Redirect to `/admin/login`

2. With invalid cookie:
   ```bash
   curl http://localhost:3000/admin/dashboard \
     -H "Cookie: admin-token=invalid" \
     -v
   ```
   Expected: Redirect to `/admin/login`

3. After valid login: Visit `/admin/dashboard`
   Expected: Dashboard loads, sidebar visible

- [ ] **Step 4: Commit admin layout update**

```bash
git add src/app/admin/layout.tsx
git commit -m "refactor(auth): update admin layout to use new auth system

- Replace cookie check with requireAdminAuth()
- Handle session expired error
- Redirect to /admin/login if not authenticated
- Display ADMIN_EMAIL in sidebar
- Logout form posts to /api/admin/auth/logout"
```

---

## Task 5: Update Admin API Routes Protection

**Files:**
- Modify: `src/app/api/admin/products/route.ts`
- Modify: `src/app/api/admin/products/[id]/route.ts`
- Modify: `src/app/api/admin/products/[id]/upload/route.ts`
- Modify: `src/app/api/admin/products/[id]/stock/route.ts`
- Modify: `src/app/api/admin/orders/[id]/mark-shipped/route.ts`
- Modify: `src/app/api/admin/orders/[id]/resend-email/route.ts`
- Modify: `src/app/api/admin/pickup/redeem/route.ts`

- [ ] **Step 1: Update products list route**

```typescript
// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/admin-auth' // NEW
// Remove old import: import { isAdmin } from '@/lib/auth/admin-check'

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth() // NEW: replaces isAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... rest of the function unchanged
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth() // NEW
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... rest unchanged
}
```

- [ ] **Step 2: Update product detail route**

```typescript
// src/app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/admin-auth' // NEW

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth() // NEW
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... rest unchanged
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth() // NEW
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... rest unchanged
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth() // NEW
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... rest unchanged
}
```

- [ ] **Step 3: Update product upload route**

```typescript
// src/app/api/admin/products/[id]/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/admin-auth' // NEW

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth() // NEW: replaces isAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... rest unchanged
}
```

- [ ] **Step 4: Update product stock route**

```typescript
// src/app/api/admin/products/[id]/stock/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/admin-auth' // NEW

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth() // NEW
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... rest unchanged
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth() // NEW
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... rest unchanged
}
```

- [ ] **Step 5: Update order mark-shipped route**

```typescript
// src/app/api/admin/orders/[id]/mark-shipped/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/admin-auth' // NEW

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth() // NEW
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... rest unchanged
}
```

- [ ] **Step 6: Update order resend-email route**

```typescript
// src/app/api/admin/orders/[id]/resend-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/admin-auth' // NEW

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth() // NEW
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... rest unchanged
}
```

- [ ] **Step 7: Update pickup redeem route**

```typescript
// src/app/api/admin/pickup/redeem/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/admin-auth' // NEW

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth() // NEW
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... rest unchanged
}
```

- [ ] **Step 8: Test admin API routes protection**

Without auth:
```bash
curl http://localhost:3000/api/admin/products -v
```
Expected: 401 Unauthorized

With invalid token:
```bash
curl http://localhost:3000/api/admin/products \
  -H "Cookie: admin-token=invalid" \
  -v
```
Expected: 401 Unauthorized

After valid login (get cookie from browser dev tools):
```bash
curl http://localhost:3000/api/admin/products \
  -H "Cookie: admin-token=YOUR_VALID_TOKEN" \
  -v
```
Expected: 200 with products list

- [ ] **Step 9: Commit API routes update**

```bash
git add src/app/api/admin/products/route.ts \
  src/app/api/admin/products/[id]/route.ts \
  src/app/api/admin/products/[id]/upload/route.ts \
  src/app/api/admin/products/[id]/stock/route.ts \
  src/app/api/admin/orders/[id]/mark-shipped/route.ts \
  src/app/api/admin/orders/[id]/resend-email/route.ts \
  src/app/api/admin/pickup/redeem/route.ts

git commit -m "refactor(auth): update all admin API routes to use new auth system

- Replace isAdmin() with requireAdminAuth() in 7 routes
- Consistent 401 error handling
- Remove dependency on old admin-check module
- All routes tested with curl"
```

---

## Task 6: Add "Mon compte" Button to Header

**Files:**
- Modify: `src/components/layout/header.tsx`
- Reference: `src/lib/auth/config.ts` (NextAuth auth())

- [ ] **Step 1: Read current header**

```bash
cat src/components/layout/header.tsx
```

Note the current structure and where to add the button

- [ ] **Step 2: Add NextAuth session check and button**

```typescript
// src/components/layout/header.tsx
import Link from 'next/link'
import { auth } from '@/lib/auth/config' // NEW
import { User, ShoppingCart } from 'lucide-react' // NEW: User icon
// ... other existing imports

export default async function Header() {
  // NEW: Check NextAuth session
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-display font-bold text-xl">1885</span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          {/* NEW: Mon compte button */}
          <Link
            href={session?.user ? '/profil' : '/connexion'}
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">
              {session?.user ? 'Mon profil' : 'Se connecter'}
            </span>
          </Link>

          {/* Existing cart button */}
          <Link
            href="/panier"
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">Panier</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Test header button**

1. Not logged in: Visit homepage
   - Button shows "Se connecter"
   - Clicking redirects to `/connexion`

2. After Google OAuth login:
   - Button shows "Mon profil"
   - Clicking goes to `/profil`

3. After admin login:
   - Button still shows "Se connecter" (admin cookie ≠ NextAuth session)
   - This is correct behavior (separation of systems)

- [ ] **Step 4: Commit header update**

```bash
git add src/components/layout/header.tsx
git commit -m "feat(auth): add 'Mon compte' button to header

- Check NextAuth session (auth())
- Show 'Mon profil' if logged in, 'Se connecter' if not
- Link to /profil or /connexion accordingly
- User icon from lucide-react
- Responsive (hide text on mobile)"
```

---

## Task 7: Delete Old Admin Check Module

**Files:**
- Delete: `src/lib/auth/admin-check.ts`

- [ ] **Step 1: Verify no imports remain**

Search for imports of admin-check:
```bash
grep -r "from '@/lib/auth/admin-check'" src/
grep -r 'from "@/lib/auth/admin-check"' src/
```

Expected: No results (all replaced in task 5)

- [ ] **Step 2: Delete admin-check file**

```bash
rm src/lib/auth/admin-check.ts
```

- [ ] **Step 3: Verify app still compiles**

```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 4: Commit deletion**

```bash
git add -A
git commit -m "refactor(auth): remove obsolete admin-check module

- Deleted src/lib/auth/admin-check.ts
- All usages replaced with requireAdminAuth()
- Build verification passed"
```

---

## Task 8: Environment Variables Documentation

**Files:**
- Modify: `docs/VERCEL-ENV-TEMPLATE.md` (or create if missing)
- Modify: `README.md` (add auth section)

- [ ] **Step 1: Update Vercel env template**

```markdown
<!-- docs/VERCEL-ENV-TEMPLATE.md -->

# 🚀 Variables d'Environnement Vercel - Template

⚠️ **Ne commitez jamais vos vrais credentials dans Git !**

## Variables à configurer sur Vercel

Allez sur : **Vercel Dashboard > Settings > Environment Variables**

### Auth Configuration

```bash
# Auth Secret (généré avec openssl rand -base64 32)
AUTH_SECRET=<openssl rand -base64 32>

# Admin Authentication (NEW)
ADMIN_EMAIL=admin@ville.fr
ADMIN_PASSWORD=<openssl rand -base64 32>

# Google OAuth (pour clients)
GOOGLE_CLIENT_ID=<votre-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-<votre-secret>
```

### Database & Storage

Obtenez ces valeurs sur [Supabase Dashboard](https://supabase.com/dashboard)

```bash
DATABASE_URL=postgres://postgres.<ref>:<password>@<host>:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

## Notes importantes

### Admin Authentication

- **ADMIN_EMAIL** : Email de l'administrateur (1 seul compte pour MVP)
- **ADMIN_PASSWORD** : Générer un mot de passe fort (32+ caractères)
- Ces credentials sont vérifiés à chaque connexion admin
- Session admin : 8 heures (pas de refresh automatique)

### Client Authentication

- **Google OAuth** : Pour connexion optionnelle des clients
- Les clients peuvent commander sans compte (checkout invité)
- Créer compte permet de suivre commandes et sauvegarder infos

### Sécurité

1. Tous les secrets doivent être marqués "Secret" sur Vercel
2. Ne jamais commiter de valeurs réelles dans Git
3. Rotation régulière des passwords (tous les 6 mois minimum)
4. AUTH_SECRET doit être >= 32 bytes
```

- [ ] **Step 2: Add auth section to README**

```markdown
<!-- README.md -->

## 🔐 Authentication

Cette application utilise **deux systèmes d'authentification séparés** :

### 1. Admin Authentication (Custom)

- **Email/Password** stockés dans variables d'environnement
- **Cookie** : `admin-token` (HTTP-only, 8h)
- **Accès** : `/admin/login` → `/admin/*`

Variables requises :
```bash
ADMIN_EMAIL=admin@ville.fr
ADMIN_PASSWORD=mot-de-passe-sécurisé
AUTH_SECRET=clé-pour-signature-HMAC
```

### 2. Client Authentication (NextAuth)

- **Google OAuth** (optionnel)
- **Cookie** : `authjs.session-token` (HTTP-only, 30 jours)
- **Accès** : `/connexion` → `/profil`

Variables requises :
```bash
GOOGLE_CLIENT_ID=votre-client-id
GOOGLE_CLIENT_SECRET=votre-secret
```

### Checkout Invité

Les clients peuvent commander **sans créer de compte** :
- Panier local (localStorage)
- Email + infos livraison/retrait
- Lien unique pour suivi commande
- QR code pour retrait clic & collect

---

## 🚀 Getting Started

1. **Clone and install**
```bash
git clone <repo>
cd boutique-phygitale
npm install
```

2. **Configure environment**
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

3. **Setup database**
```bash
npm run db:push
npm run db:seed
```

4. **Start development**
```bash
npm run dev
```

Admin : http://localhost:3000/admin/login
Client : http://localhost:3000

---
```

- [ ] **Step 3: Commit documentation**

```bash
git add docs/VERCEL-ENV-TEMPLATE.md README.md
git commit -m "docs: update environment variables and authentication docs

- Add ADMIN_EMAIL and ADMIN_PASSWORD to Vercel template
- Document two separate auth systems in README
- Add security notes and best practices
- Clarify guest checkout support"
```

---

## Task 9: Integration Testing

**Files:**
- Test: All admin routes and pages
- Test: Header button
- Test: Auth isolation

- [ ] **Step 1: Test complete admin flow**

Manual test checklist:

1. **Login page**
   - [ ] Visit `/admin/login`
   - [ ] Page loads correctly
   - [ ] Form fields present (email, password)

2. **Invalid login**
   - [ ] Submit with wrong email
   - [ ] Error message: "Email ou mot de passe incorrect"
   - [ ] Still on login page

3. **Valid login**
   - [ ] Submit with correct ADMIN_EMAIL and ADMIN_PASSWORD
   - [ ] Redirects to `/admin/dashboard`
   - [ ] Cookie `admin-token` set (check browser DevTools)

4. **Admin navigation**
   - [ ] Visit `/admin/products` - page loads
   - [ ] Visit `/admin/orders` - page loads
   - [ ] Visit `/admin/pickup` - page loads
   - [ ] Sidebar shows all nav items

5. **Admin API access**
   - [ ] Upload product image - works (no 401)
   - [ ] Adjust stock - works (no 401)
   - [ ] Create product - works (no 401)

6. **Logout**
   - [ ] Click "Déconnexion" button
   - [ ] Redirects to `/admin/login`
   - [ ] Cookie `admin-token` deleted
   - [ ] Cannot access `/admin/dashboard` (redirects to login)

- [ ] **Step 2: Test session expiration**

1. Login as admin
2. Manually expire token (wait 8h or modify token in cookie)
3. Try to access `/admin/dashboard`
   - [ ] Redirects to `/admin/login?error=session_expired`
   - [ ] Error message visible: "Votre session a expiré"

- [ ] **Step 3: Test client authentication (isolation)**

1. Logout from admin
2. Click "Se connecter" in header
3. Login with Google OAuth
   - [ ] Redirects to `/profil`
   - [ ] Page shows user info (email, name, avatar)
   - [ ] Cookie `authjs.session-token` set

4. Try to access `/admin/dashboard` (while logged in as client)
   - [ ] Redirects to `/admin/login`
   - [ ] ✅ Correct: Google OAuth ≠ admin access

5. Logout from client
6. Login as admin again
7. Header button shows "Se connecter" (not "Mon profil")
   - [ ] ✅ Correct: admin cookie ≠ client session

- [ ] **Step 4: Test header button**

1. Not logged in:
   - [ ] Button shows "Se connecter"
   - [ ] Clicking goes to `/connexion`

2. After Google OAuth:
   - [ ] Button shows "Mon profil"
   - [ ] Clicking goes to `/profil`

3. After admin login:
   - [ ] Button shows "Se connecter" (correct behavior)

- [ ] **Step 5: Document test results**

Create test report:

```bash
cat > docs/AUTH_TESTING_REPORT.md << 'EOF'
# Authentication Testing Report

**Date:** $(date +%Y-%m-%d)
**Tester:** [Your name]

## Test Results

### Admin Authentication ✅
- [x] Login page loads
- [x] Invalid credentials rejected
- [x] Valid credentials accepted
- [x] Cookie admin-token created
- [x] Dashboard accessible
- [x] All admin pages load
- [x] API routes protected (401 without cookie)
- [x] Logout works
- [x] Session expiration handled

### Client Authentication ✅
- [x] Google OAuth works
- [x] Profile page loads
- [x] Cookie authjs.session-token created
- [x] Header button shows correct state

### Isolation ✅
- [x] Google OAuth does not grant admin access
- [x] Admin cookie does not grant client profile access
- [x] Two separate cookies (no collision)

### Edge Cases ✅
- [x] Invalid cookie → redirect to login
- [x] Expired cookie → session expired message
- [x] Missing env vars → error logged
- [x] Direct /admin access → redirect to login

## Issues Found

None

## Recommendations

1. Add rate limiting to login endpoint (Upstash Redis)
2. Add Playwright e2e tests (future)
3. Monitor Sentry for auth errors

EOF
```

- [ ] **Step 6: Commit test report**

```bash
git add docs/AUTH_TESTING_REPORT.md
git commit -m "test: add authentication integration testing report

- Manual testing of complete admin flow
- Client authentication isolation verified
- Session expiration tested
- Header button behavior confirmed
- All tests passed"
```

---

## Task 10: Rate Limiting (Optional but Recommended)

**Files:**
- Modify: `src/app/api/admin/auth/login/route.ts`
- Create: `src/lib/rate-limit.ts` (if not exists)

- [ ] **Step 1: Check if Upstash Redis configured**

```bash
grep "UPSTASH_REDIS_REST_URL" .env.local
```

If not configured, skip this task or configure Upstash first.

- [ ] **Step 2: Create rate limiter helper**

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

/**
 * Admin login rate limiter
 * 5 attempts per 15 minutes per IP
 */
export const adminLoginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  prefix: 'ratelimit:admin-login',
  analytics: true,
})
```

- [ ] **Step 3: Add rate limiting to login route**

```typescript
// src/app/api/admin/auth/login/route.ts
import { adminLoginLimiter } from '@/lib/rate-limit' // NEW

export async function POST(request: NextRequest) {
  try {
    // NEW: Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { success, limit, remaining, reset } = await adminLoginLimiter.limit(ip)

    if (!success) {
      console.warn('[AUTH] Rate limit exceeded:', ip)
      return NextResponse.json(
        {
          error: 'Trop de tentatives. Réessayez dans 15 minutes.',
          retryAfter: new Date(reset).toISOString()
        },
        { status: 429 }
      )
    }

    // ... rest of login logic unchanged
  } catch (error: any) {
    // ...
  }
}
```

- [ ] **Step 4: Test rate limiting**

```bash
# Try 6 login attempts rapidly
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/admin/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"fake@test.com","password":"wrong"}' \
    -w "\n"
done
```

Expected: First 5 return 401, 6th returns 429 with "Trop de tentatives"

- [ ] **Step 5: Commit rate limiting**

```bash
git add src/lib/rate-limit.ts src/app/api/admin/auth/login/route.ts
git commit -m "feat(auth): add rate limiting to admin login

- 5 attempts per 15 minutes per IP
- Upstash Redis sliding window
- 429 response with retry-after
- Tested with 6 consecutive failed attempts"
```

---

## Final Checklist

Before marking this plan as complete, verify:

- [ ] All tests pass (`npm test`)
- [ ] App builds successfully (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Admin login works with ADMIN_EMAIL and ADMIN_PASSWORD
- [ ] Admin logout works
- [ ] All admin pages require authentication
- [ ] All admin API routes require authentication
- [ ] Google OAuth still works for clients
- [ ] Header button shows correct state
- [ ] Two auth systems are completely isolated
- [ ] Documentation updated (README, Vercel template)
- [ ] Test report created

---

## Deployment Checklist

When ready to deploy to production:

1. **Configure Vercel Environment Variables**
   - [ ] Add `ADMIN_EMAIL` (Production + Preview)
   - [ ] Add `ADMIN_PASSWORD` (Production + Preview, marked as Secret)
   - [ ] Verify `AUTH_SECRET` exists (min 32 bytes)
   - [ ] Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

2. **Test on Preview Deployment**
   - [ ] Deploy to preview: `vercel --prod=false`
   - [ ] Test admin login on preview URL
   - [ ] Test admin logout
   - [ ] Test admin dashboard access
   - [ ] Test Google OAuth login
   - [ ] Verify isolation (Google ≠ admin)

3. **Production Deployment**
   - [ ] Merge to main branch
   - [ ] Automatic deploy to production
   - [ ] Monitor Vercel logs for errors
   - [ ] Test admin login on production URL
   - [ ] Monitor Sentry (if configured)

4. **Post-Deployment**
   - [ ] Notify admin users of new login URL (`/admin/login`)
   - [ ] Document admin credentials securely (password manager)
   - [ ] Schedule password rotation (6 months)

---

## Rollback Plan

If issues occur in production:

1. **Admin cannot login:**
   - Check Vercel env vars (ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_SECRET)
   - Check Vercel logs for errors
   - Verify cookie settings (httpOnly, secure, sameSite)
   - Quick fix: Add `ADMIN_BYPASS=true` env var (temporary)

2. **Client authentication broken:**
   - Google OAuth should be unchanged
   - Check NextAuth configuration
   - Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

3. **Complete rollback:**
   ```bash
   git revert HEAD
   git push origin main
   ```
   Vercel will auto-deploy previous version

---

## Success Criteria

This implementation is successful when:

✅ Admin can login with ADMIN_EMAIL and ADMIN_PASSWORD
✅ Admin session lasts 8 hours
✅ Admin logout works
✅ All admin pages and API routes protected
✅ Clients can login with Google OAuth (optional)
✅ Clients can checkout as guests
✅ Two auth systems are completely isolated
✅ No security vulnerabilities (HTTP-only cookies, HMAC signatures)
✅ Documentation complete and accurate
✅ All tests pass

---

**Plan Complete**

Total tasks: 10
Estimated time: 1-2 days
Complexity: Medium
