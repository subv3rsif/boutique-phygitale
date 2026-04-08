# Configuration NextAuth avec Supabase

## Problème Résolu

Supabase utilise ses propres tables `users` et `sessions` dans le schéma `auth` pour son système d'authentification natif. NextAuth essayait d'utiliser les mêmes noms de tables, créant un conflit.

## Solution: Tables Préfixées

NextAuth utilise maintenant des tables préfixées dans le schéma `public`:

- `nextauth_users` (au lieu de `users`)
- `nextauth_accounts` (au lieu de `accounts`)
- `nextauth_sessions` (au lieu de `sessions`)
- `nextauth_verification_tokens` (au lieu de `verification_tokens`)

## Setup (Déjà Fait)

Les tables ont été créées avec:

```bash
npx tsx scripts/setup-nextauth.ts
```

Ce script crée toutes les tables nécessaires dans Supabase.

## Architecture

```
┌─────────────────────────────────────────┐
│           Supabase Database             │
├─────────────────────────────────────────┤
│                                         │
│  Schéma: auth (Supabase Auth)          │
│  ├── users (40+ colonnes Supabase)     │
│  └── sessions (Supabase native)        │
│                                         │
│  Schéma: public (NextAuth)             │
│  ├── nextauth_users                    │
│  ├── nextauth_accounts                 │
│  ├── nextauth_sessions                 │
│  └── nextauth_verification_tokens      │
│                                         │
└─────────────────────────────────────────┘
```

## Dual Auth Systems

### 1. Admin Auth (Custom)
- **Fichier**: `src/lib/auth/admin-auth.ts`
- **Cookie**: `admin-token` (HMAC-SHA256)
- **Routes**: `/admin/*`
- **Variables**: `ADMIN_EMAIL`, `ADMIN_PASSWORD`

### 2. Client Auth (NextAuth)
- **Fichier**: `src/lib/auth/config.ts`
- **Provider**: Google OAuth
- **Cookie**: `authjs.session-token`
- **Routes**: `/connexion`, `/profil`
- **Tables**: `nextauth_*`

## Variables d'Environnement

```bash
# Admin Auth
ADMIN_EMAIL=admin@ville.fr
ADMIN_PASSWORD=<strong-password>
AUTH_SECRET=<32-byte-key>

# NextAuth (Client)
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-<your-secret>

# Database
DATABASE_URL=postgres://...
```

## Testing

### Test Admin Auth
```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ville.fr","password":"your-password"}'
```

### Test Google OAuth
1. Visit: http://localhost:3000/connexion
2. Click "Sign in with Google"
3. After auth, redirects to `/profil`

## Troubleshooting

### Si les tables NextAuth n'existent pas sur Vercel

Exécutez le script de setup localement (il se connecte à la même DB):
```bash
npx tsx scripts/setup-nextauth.ts
```

### Vérifier que les tables existent

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_name LIKE 'nextauth_%';
```

Devrait retourner:
- nextauth_users
- nextauth_accounts
- nextauth_sessions
- nextauth_verification_tokens

## Maintenance

### Ajouter un nouveau provider OAuth

1. Installer le provider dans `src/lib/auth/config.ts`
2. Ajouter les credentials dans `.env.local`
3. Les tables NextAuth restent les mêmes

### Migration Future

Si vous voulez migrer vers un schéma dédié:

```sql
CREATE SCHEMA nextauth;
ALTER TABLE nextauth_users SET SCHEMA nextauth;
-- etc.
```

Puis mettre à jour le schéma Drizzle avec le namespace.

## Resources

- NextAuth v5: https://authjs.dev/
- Drizzle Adapter: https://authjs.dev/getting-started/adapters/drizzle
- Supabase: https://supabase.com/docs
