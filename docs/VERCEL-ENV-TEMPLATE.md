# 🚀 Variables d'Environnement Vercel - Template

⚠️ **Ne commitez jamais vos vrais credentials dans Git !**

## Variables à configurer sur Vercel

Allez sur : **Vercel Dashboard > Settings > Environment Variables**

### Auth Configuration

```bash
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://votre-app.vercel.app
ADMIN_EMAILS=votre-email@gmail.com
```

### Google OAuth

Obtenez ces valeurs sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

```bash
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
