# 🔐 Multi-Provider Authentication Guide

**NextAuth v5 supporte 80+ providers !**

---

## 📊 Providers Disponibles

### ✅ Actuellement Implémenté
- **Google OAuth** ✅

### 🎯 Faciles à Ajouter (OAuth)
- **Apple Sign In** (iOS natif, premium UX)
- **GitHub** (développeurs, open-source)
- **Facebook** (grand public)
- **Discord** (communautés)
- **Twitter/X** (réseaux sociaux)
- **Microsoft/Azure AD** (entreprises)
- **LinkedIn** (professionnel)

### 📧 Email-Based Auth
- **Magic Link** (email sans mot de passe)
- **Email/Password** (classique avec bcrypt)

---

## 🍎 Implémentation : Apple Sign In

### Pourquoi Apple ?
- ✅ **iOS natif** : bouton Apple officiel
- ✅ **Privacy-focused** : masquage d'email optionnel
- ✅ **Premium UX** : attendu par utilisateurs iOS
- ✅ **App Store requirement** : obligatoire si Google/Facebook présents

### Configuration Apple Developer

#### 1. Apple Developer Account
1. Aller sur https://developer.apple.com
2. Inscription (99$/an pour entreprise)
3. Créer un App ID

#### 2. Services ID (OAuth)
1. Menu "Certificates, IDs & Profiles"
2. Identifiers > "+" > Services IDs
3. Description: "Boutique 1885 Web"
4. Identifier: `com.boutique1885.web`
5. Enable "Sign In with Apple"
6. Configure:
   - Domains: `votre-domaine.vercel.app`
   - Return URLs: `https://votre-domaine.vercel.app/api/auth/callback/apple`

#### 3. Key (Private Key)
1. Keys > "+" > "Sign in with Apple"
2. Download `.p8` key file
3. Noter Key ID

#### 4. Team ID
1. Membership > Team ID (ex: `ABC123DEF4`)

### Code Implementation

#### Installer le Provider
```bash
npm install next-auth # Déjà installé
```

#### Configuration NextAuth
```typescript
// src/lib/auth/config.ts
import Apple from "next-auth/providers/apple"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({...}), // Existant

    // Apple Sign In
    Apple({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
  ],
  // ... rest of config
})
```

#### Environment Variables
```bash
# .env.local
APPLE_CLIENT_ID=com.boutique1885.web
APPLE_CLIENT_SECRET=voir_generation_ci_dessous
```

#### Générer APPLE_CLIENT_SECRET (JWT)
```javascript
// scripts/generate-apple-secret.js
const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('./AuthKey_XXXXX.p8', 'utf8');

const secret = jwt.sign(
  {
    iss: 'ABC123DEF4', // Team ID
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 180, // 6 months
    aud: 'https://appleid.apple.com',
    sub: 'com.boutique1885.web', // Service ID
  },
  privateKey,
  {
    algorithm: 'ES256',
    header: {
      alg: 'ES256',
      kid: 'KEYID123', // Key ID
    },
  }
);

console.log(secret);
```

#### UI - Apple Button
```tsx
// src/app/connexion/page.tsx
<form
  action={async () => {
    "use server"
    await signIn("apple", { redirectTo: "/profil" })
  }}
>
  <Button
    type="submit"
    className="w-full h-12 bg-black hover:bg-gray-900 text-white"
  >
    <AppleIcon className="w-5 h-5 mr-2" />
    Continuer avec Apple
  </Button>
</form>
```

---

## 📧 Implémentation : Magic Link Email

### Concept
- Utilisateur entre son email
- Reçoit un lien unique par email
- Clic sur le lien → connecté automatiquement
- **Pas de mot de passe à retenir**

### Configuration

#### 1. Installer Nodemailer (ou utiliser Resend)
```bash
# Déjà installé si vous utilisez Resend
npm install nodemailer
```

#### 2. NextAuth Config
```typescript
// src/lib/auth/config.ts
import Email from "next-auth/providers/nodemailer"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({...}),
    Apple({...}),

    // Email Magic Link
    Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  // ...
})
```

#### 3. Avec Resend (Recommandé)
```typescript
// src/lib/auth/config.ts
import Email from "next-auth/providers/nodemailer"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Email({
      server: "resend", // Magic!
      from: "noreply@boutique1885.fr",

      // Custom email template
      async sendVerificationRequest({ identifier: email, url, provider }) {
        await resend.emails.send({
          from: provider.from,
          to: email,
          subject: "Connexion à Boutique 1885",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #503B64;">Connexion à Boutique 1885</h1>
              <p>Cliquez sur le bouton ci-dessous pour vous connecter :</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #503B64; color: white; text-decoration: none; border-radius: 8px;">
                Se connecter
              </a>
              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                Ce lien expire dans 24 heures et ne peut être utilisé qu'une seule fois.
              </p>
            </div>
          `,
        })
      },
    }),
  ],
})
```

#### 4. Environment Variables
```bash
# Resend (déjà configuré)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@boutique1885.fr

# Ou SMTP classique
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your@gmail.com
EMAIL_SERVER_PASSWORD=app_password
EMAIL_FROM=noreply@boutique1885.fr
```

#### 5. UI - Email Form
```tsx
// src/app/connexion/page.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function ConnexionPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn('email', { email, redirect: false })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center">
        <h2>Email envoyé !</h2>
        <p>Vérifiez votre boîte de réception ({email})</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleMagicLink}>
      <Input
        type="email"
        placeholder="votre@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button type="submit">
        Envoyer le lien magique
      </Button>
    </form>
  )
}
```

---

## 🔒 Implémentation : Email/Password Classique

### Concept
- Inscription avec email + mot de passe
- Hash sécurisé avec bcrypt
- Login classique

### Configuration

#### 1. Installer bcrypt
```bash
npm install bcrypt
npm install -D @types/bcrypt
```

#### 2. NextAuth Config
```typescript
// src/lib/auth/config.ts
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcrypt"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({...}),

    // Email/Password
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find user in database
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)

        if (!user || !user.passwordHash) {
          return null
        }

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],

  // Important: JWT strategy for Credentials provider
  session: {
    strategy: "jwt", // Can't use database strategy with Credentials
  },
})
```

#### 3. Database Schema (Ajouter passwordHash)
```typescript
// src/lib/db/schema.ts
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  passwordHash: text('password_hash'), // Nouveau champ
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

#### 4. API Route - Inscription
```typescript
// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import bcrypt from 'bcrypt'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name } = registerSchema.parse(body)

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email déjà utilisé' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const [newUser] = await db.insert(users).values({
      email,
      name,
      passwordHash,
      emailVerified: new Date(), // Auto-verify for email/password
    }).returning()

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}
```

#### 5. UI - Login/Register Forms
```tsx
// src/app/connexion/page.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ConnexionPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.ok) {
      router.push('/profil')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })

    if (response.ok) {
      // Auto-login after registration
      await signIn('credentials', {
        email,
        password,
        callbackUrl: '/profil',
      })
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button
          variant={mode === 'login' ? 'default' : 'outline'}
          onClick={() => setMode('login')}
        >
          Connexion
        </Button>
        <Button
          variant={mode === 'register' ? 'default' : 'outline'}
          onClick={() => setMode('register')}
        >
          Inscription
        </Button>
      </div>

      {mode === 'login' ? (
        <form onSubmit={handleLogin}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit">Se connecter</Button>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <Input
            type="text"
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Mot de passe (min 8 caractères)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit">S'inscrire</Button>
        </form>
      )}
    </div>
  )
}
```

---

## 🎨 UI Multi-Provider Complète

### Page Connexion avec Tous les Providers
```tsx
// src/app/connexion/page.tsx
import { signIn } from "@/lib/auth/config"
import { Button } from "@/components/ui/button"

export default async function ConnexionPage() {
  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1>Connexion</h1>

      {/* OAuth Providers */}
      <div className="space-y-3">
        {/* Google */}
        <form action={async () => {
          "use server"
          await signIn("google", { redirectTo: "/profil" })
        }}>
          <Button type="submit" variant="outline" className="w-full">
            <GoogleIcon /> Continuer avec Google
          </Button>
        </form>

        {/* Apple */}
        <form action={async () => {
          "use server"
          await signIn("apple", { redirectTo: "/profil" })
        }}>
          <Button type="submit" className="w-full bg-black">
            <AppleIcon /> Continuer avec Apple
          </Button>
        </form>

        {/* GitHub */}
        <form action={async () => {
          "use server"
          await signIn("github", { redirectTo: "/profil" })
        }}>
          <Button type="submit" variant="outline" className="w-full">
            <GithubIcon /> Continuer avec GitHub
          </Button>
        </form>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou
          </span>
        </div>
      </div>

      {/* Email Magic Link */}
      <EmailMagicLinkForm />

      {/* Or Email/Password */}
      <EmailPasswordForm />
    </div>
  )
}
```

---

## 📊 Comparaison des Providers

| Provider | Setup | UX | Sécurité | Coût | Recommandé |
|----------|-------|----|-----------| ------|-----------|
| **Google** | ⭐⭐⭐ Facile | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ | Gratuit | ✅ Oui |
| **Apple** | ⭐⭐ Moyen | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ | 99$/an | ✅ iOS users |
| **GitHub** | ⭐⭐⭐ Facile | ⭐⭐⭐⭐ Bon | ⭐⭐⭐⭐ | Gratuit | ✅ Dev audience |
| **Magic Link** | ⭐⭐⭐ Facile | ⭐⭐⭐⭐ Bon | ⭐⭐⭐⭐ | Gratuit | ✅ Simplicité |
| **Email/Password** | ⭐⭐ Moyen | ⭐⭐⭐ OK | ⭐⭐⭐ | Gratuit | ⚠️ Legacy |

---

## 🎯 Recommandation MVP

### Combo Optimal
1. **Google OAuth** ✅ (Déjà implémenté)
2. **Apple Sign In** (si budget iOS)
3. **Magic Link Email** (simplicité max)

### Pourquoi ?
- ✅ **Couverture 95%+ utilisateurs** (Google + Apple)
- ✅ **Fallback email** pour edge cases
- ✅ **Pas de mot de passe à gérer** (sécurité)
- ✅ **UX moderne et fluide**

### À Éviter (MVP)
- ❌ Email/Password classique (complexité, sécurité)
- ❌ Facebook (déclin, privacy concerns)
- ❌ Trop de providers (choice overload)

---

## 🔧 Migration Path

### Étape 1: Ajouter Magic Link (Recommandé)
```bash
# Temps: 30 min
# Impact: Fallback email pour users sans Google/Apple
```

### Étape 2: Ajouter Apple (Si iOS users)
```bash
# Temps: 2h (Apple Developer setup)
# Impact: Premium UX pour iPhone users
```

### Étape 3: Autres Providers (Si nécessaire)
```bash
# GitHub: 15 min
# Discord: 20 min
# Facebook: 30 min
```

---

## 📝 Exemple Complet : Ajouter GitHub

### 1. GitHub OAuth App
1. https://github.com/settings/developers
2. New OAuth App
3. Callback URL: `https://votre-domaine.vercel.app/api/auth/callback/github`
4. Copier Client ID + Secret

### 2. Code
```typescript
// src/lib/auth/config.ts
import GitHub from "next-auth/providers/github"

providers: [
  Google({...}),

  GitHub({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  }),
]
```

### 3. Env Vars
```bash
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### 4. UI
```tsx
<Button onClick={() => signIn("github")}>
  <GithubIcon /> GitHub
</Button>
```

**C'est tout !** 15 minutes max.

---

## ✅ Checklist Implementation

### Multi-Provider Setup
- [ ] Google OAuth (✅ déjà fait)
- [ ] Apple Sign In (si iOS users)
- [ ] Magic Link Email (recommandé)
- [ ] GitHub (si dev audience)
- [ ] Autres (optionnel)

### Security
- [ ] HTTPS obligatoire (Vercel auto)
- [ ] CSRF protection (NextAuth auto)
- [ ] Rate limiting sur /api/auth
- [ ] Email verification (Magic Link auto)
- [ ] Password strength (si Email/Password)

### UX
- [ ] Loading states
- [ ] Error messages clairs
- [ ] Success redirects
- [ ] Social buttons design cohérent
- [ ] Mobile-friendly forms

---

## 💡 Conclusion

**Oui, c'est totalement possible !**

NextAuth v5 rend l'ajout de providers **extrêmement simple** :
- **OAuth providers** : 15-30 min chacun
- **Magic Link** : 30 min
- **Email/Password** : 1-2h (plus complexe)

**Recommendation** : Commencez avec **Google (✅) + Magic Link** pour couvrir 95% des cas d'usage.

---

**Guide créé** : 2026-03-01
**NextAuth version** : 5.0.0-beta.30
**Documentation** : https://authjs.dev/getting-started/providers
