# ✨ Magic Link Email - Guide de Configuration

**Status** : Code installé ✅ | Configuration requise ⚠️

---

## 📊 Ce Qui Est Installé

### ✅ Code Implémenté
- NextAuth Resend provider
- Magic Link form component
- Page /connexion mise à jour (Google + Magic Link)
- Email template (NextAuth default)
- UI premium (Love Symbol × Cloud Dancer)

---

## ⚙️ Configuration Requise

### 1. Environment Variables

**Ajouter dans `.env.local`** :
```bash
# Email (Resend déjà configuré normalement)
RESEND_API_KEY=re_... # Déjà présent
EMAIL_FROM=noreply@votre-domaine.fr # NOUVEAU
```

**`EMAIL_FROM` doit être** :
- Un domaine vérifié dans Resend
- Exemple : `noreply@boutique1885.fr`
- Ou : `contact@votre-domaine.com`

---

### 2. Vérifier Domaine dans Resend

#### Si domaine pas encore vérifié :

1. **Aller sur** : https://resend.com/domains
2. **Ajouter domaine** : `votre-domaine.fr`
3. **Configurer DNS** :
   ```
   Type: TXT
   Name: resend._domainkey
   Value: [fourni par Resend]

   Type: TXT
   Name: @
   Value: [SPF fourni par Resend]
   ```
4. **Attendre vérification** : 5-30 min

#### Si domaine déjà vérifié :
✅ Rien à faire ! Utilisez votre domaine existant.

---

### 3. Test Local

#### Lancer Dev Server
```bash
npm run dev
```

#### Tester Flow
1. **Aller sur** : http://localhost:3000/connexion
2. **Voir** : Bouton Google + Divider "OU" + Formulaire Email
3. **Entrer email** : votre@email.com
4. **Cliquer** : "Envoyer le lien magique ✨"
5. **Vérifier** : Email dans boîte de réception
6. **Cliquer lien** : Redirect vers /profil
7. **Vérifier** : Connecté automatiquement ✅

---

## 📧 Email Template

### Template par Défaut (NextAuth)
NextAuth envoie un email simple avec :
- Subject: "Sign in to [App Name]"
- Body: Button "Sign in"
- Expire: 24h

### Personnaliser (Optionnel)

Si vous voulez un template Love Symbol × Cloud Dancer custom :

```typescript
// src/lib/auth/config.ts
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

Resend({
  apiKey: process.env.RESEND_API_KEY!,
  from: process.env.EMAIL_FROM!,

  // Custom email
  async sendVerificationRequest({ identifier: email, url }) {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: "Connexion à Boutique 1885",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="
              display: inline-block;
              width: 64px;
              height: 64px;
              background: linear-gradient(135deg, #503B64 0%, rgba(80, 59, 100, 0.8) 100%);
              border-radius: 50%;
              color: white;
              font-family: 'Cormorant Garamond', serif;
              font-size: 24px;
              font-weight: bold;
              line-height: 64px;
            ">18</div>
          </div>

          <!-- Title -->
          <h1 style="
            font-family: 'Cormorant Garamond', serif;
            font-size: 32px;
            color: #503B64;
            text-align: center;
            margin-bottom: 20px;
          ">Connexion à Boutique 1885</h1>

          <!-- Message -->
          <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
            Cliquez sur le bouton ci-dessous pour vous connecter à votre compte.
          </p>

          <!-- Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${url}" style="
              display: inline-block;
              padding: 16px 40px;
              background: linear-gradient(135deg, #503B64 0%, rgba(80, 59, 100, 0.8) 100%);
              color: white;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 14px rgba(80, 59, 100, 0.4);
            ">Se connecter ✨</a>
          </div>

          <!-- Footer -->
          <div style="
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
          ">
            <p style="color: #999; font-size: 14px; margin-bottom: 10px;">
              🕐 Ce lien expire dans 24 heures
            </p>
            <p style="color: #999; font-size: 14px; margin-bottom: 10px;">
              🔒 Ce lien ne peut être utilisé qu'une seule fois
            </p>
            <p style="color: #999; font-size: 12px;">
              Si vous n'avez pas demandé ce lien, ignorez cet email.
            </p>
          </div>
        </div>
      `,
    })
  },
}),
```

---

## 🎨 UI/UX Flow

### Page /connexion
```
┌────────────────────────────────────┐
│         [Logo Badge "18"]          │
│                                    │
│          Connexion                 │
│   Connectez-vous pour accéder...   │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  🔵 Continuer avec Google    │  │
│  └──────────────────────────────┘  │
│                                    │
│    ───────── OU par email ────────  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ 📧 votre@email.com           │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ ✨ Envoyer le lien magique → │  │
│  └──────────────────────────────┘  │
│                                    │
│  Un email avec un lien unique...   │
│  Aucun mot de passe nécessaire ✨   │
└────────────────────────────────────┘
```

### Après Submit
```
┌────────────────────────────────────┐
│         [📧 Email Icon]            │
│                                    │
│        Email envoyé !              │
│                                    │
│  Nous avons envoyé un lien à       │
│      votre@email.com               │
│                                    │
│  ✨ Cliquez sur le lien dans...    │
│  🕐 Le lien expire dans 24h        │
│  📬 Vérifiez vos spams si...       │
│                                    │
│  [ Renvoyer à une autre adresse ]  │
└────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Email non reçu
**Causes possibles** :
1. ❌ EMAIL_FROM non vérifié dans Resend
2. ❌ Email en spam (vérifier dossier spam)
3. ❌ RESEND_API_KEY invalide
4. ❌ Limite Resend atteinte (100 emails/jour en gratuit)

**Solutions** :
```bash
# 1. Vérifier Resend API key
echo $RESEND_API_KEY

# 2. Vérifier domaine vérifié
# Aller sur https://resend.com/domains

# 3. Tester en local (logs console)
npm run dev
# Check console pour erreurs Resend
```

### Lien ne fonctionne pas
**Causes possibles** :
1. ❌ Lien expiré (>24h)
2. ❌ Lien déjà utilisé (one-time use)
3. ❌ NEXTAUTH_URL incorrect

**Solutions** :
```bash
# Vérifier NEXTAUTH_URL
echo $NEXTAUTH_URL
# Doit être: http://localhost:3000 (dev)
#         ou https://votre-domaine.vercel.app (prod)
```

### Erreur "Invalid provider"
**Cause** : Provider Resend non activé

**Solution** :
```typescript
// Vérifier src/lib/auth/config.ts
import Resend from "next-auth/providers/resend"

providers: [
  Google({...}),
  Resend({...}), // ← Doit être présent
]
```

---

## 📊 Limites Resend

### Plan Gratuit
- ✅ 100 emails/jour
- ✅ 1 domaine vérifié
- ✅ Support email

### Plan Payant ($20/mois)
- ✅ 50,000 emails/mois
- ✅ Domaines illimités
- ✅ Analytics
- ✅ Webhooks

**Pour MVP** : Gratuit suffit largement (100 magic links/jour = 3000/mois)

---

## ✅ Checklist Final

### Configuration
- [ ] EMAIL_FROM ajouté dans .env.local
- [ ] Domaine vérifié dans Resend
- [ ] RESEND_API_KEY valide
- [ ] NEXTAUTH_URL correct

### Test Local
- [ ] npm run dev lance sans erreur
- [ ] Page /connexion affiche Google + Magic Link
- [ ] Formulaire email fonctionne
- [ ] Email reçu (inbox ou spam)
- [ ] Lien fonctionne → redirect /profil
- [ ] User visible dans database (users table)

### Déploiement
- [ ] EMAIL_FROM configuré dans Vercel env vars
- [ ] Domaine vérifié pour production
- [ ] Test en production
- [ ] Email envoyé depuis domaine vérifié

---

## 🎯 Avantages Magic Link

### Sécurité
- ✅ **Pas de mot de passe** → pas de leak possible
- ✅ **One-time use** → lien non réutilisable
- ✅ **Expiration 24h** → window attack minimale
- ✅ **Email verification** → garantie ownership

### UX
- ✅ **Zéro friction** → pas de création compte
- ✅ **Pas d'oubli** → pas de "mot de passe oublié"
- ✅ **Mobile-friendly** → click dans email = login
- ✅ **Universel** → fonctionne pour tout le monde

### Business
- ✅ **Conversion optimale** → moins de friction
- ✅ **Support réduit** → pas de reset password
- ✅ **Coût minimal** → gratuit jusqu'à 100/jour

---

## 🚀 Prochaines Étapes

### Immédiat
1. **Configurer EMAIL_FROM** (1 min)
2. **Vérifier domaine Resend** (si pas déjà fait)
3. **Tester en local** (5 min)

### Court Terme
4. **Personnaliser email template** (optionnel, 30 min)
5. **Ajouter analytics** (track opens/clicks)

### Moyen Terme
6. **Ajouter Apple Sign In** (si iOS users)
7. **Dashboard admin** (voir tous les users)

---

**Guide créé** : 2026-03-01
**Provider** : NextAuth Resend
**Status** : Prêt pour configuration
**Documentation** : https://authjs.dev/getting-started/providers/resend

