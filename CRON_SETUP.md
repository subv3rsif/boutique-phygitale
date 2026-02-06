# Configuration du Cron Job - Queue d'Emails

Le traitement de la queue d'emails nécessite un cron job pour s'exécuter toutes les 5 minutes. Vercel Hobby limite les crons à une fois par jour, donc nous utilisons un service externe gratuit.

## 🎯 Solution : cron-job.org (Gratuit)

### Pourquoi cron-job.org ?

- ✅ **100% Gratuit** pour un usage raisonnable
- ✅ **Fiable** : 99.9% uptime
- ✅ **Flexible** : Intervalle jusqu'à 1 minute
- ✅ **Monitoring** : Dashboard avec historique d'exécution
- ✅ **Alertes** : Email si le job échoue

### Configuration Étape par Étape

#### 1. Créer un Compte

1. Aller sur **https://cron-job.org**
2. Cliquer sur **"Sign up for free"**
3. Renseigner email + mot de passe
4. Confirmer email

#### 2. Créer le Cron Job

1. **Se connecter** à cron-job.org
2. **Cliquer** sur **"Cronjobs"** (menu gauche)
3. **Cliquer** sur **"Create cronjob"**

**Configuration** :

| Champ | Valeur |
|-------|--------|
| **Title** | `Boutique Phygitale - Email Queue` |
| **URL** | `https://votre-domaine.vercel.app/api/cron/process-email-queue` |
| **Schedule** | Every **5 minutes** |
| **Request method** | `GET` |
| **Request timeout** | `30 seconds` |

**Headers (IMPORTANT)** :

Cliquer sur **"Request headers"** et ajouter :

```
Authorization: Bearer VOTRE_CRON_SECRET
```

⚠️ Remplacer `VOTRE_CRON_SECRET` par la valeur de votre variable d'environnement `CRON_SECRET` (configurée dans Vercel).

**Exemple** :
```
Authorization: Bearer a3f2e9b8c4d1a2f5e8b3c9d2a7f1e4b8c3d9a2f7
```

#### 3. Tester le Job

1. **Sauvegarder** le cron job
2. **Cliquer** sur **"Run now"** pour tester immédiatement
3. **Vérifier** :
   - Status : **Success (200 OK)**
   - Response : `{"success": true, "processed": X}`
   - Duration : < 5 secondes

Si **erreur 401** : Vérifier que le header `Authorization` est correct.

Si **erreur 500** : Vérifier les logs Vercel.

#### 4. Activer les Alertes (Optionnel)

1. **Settings** → **Notifications**
2. **Activer** "Email notification on failure"
3. Vous recevrez un email si 3 exécutions consécutives échouent

### Monitoring

#### Dashboard cron-job.org

**Voir les exécutions** :
- Dernières 100 exécutions visibles
- Status (success/failure)
- Durée d'exécution
- Réponse HTTP

**Alertes** :
- Email automatique si échecs répétés
- Désactivation auto après 10 échecs consécutifs

#### Logs Vercel

**Vérifier les logs** :
1. Vercel Dashboard → **Logs**
2. Filtrer par fonction : `/api/cron/process-email-queue`
3. Voir le nombre d'emails traités

---

## 🔐 Sécurité

### Protection de l'Endpoint

L'endpoint `/api/cron/process-email-queue` vérifie le header `Authorization` :

```typescript
// src/app/api/cron/process-email-queue/route.ts
const authHeader = request.headers.get('authorization');
const token = authHeader?.replace('Bearer ', '');

if (token !== process.env.CRON_SECRET) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**IMPORTANT** : Ne **jamais** partager votre `CRON_SECRET` publiquement.

### Générer un Secret Fort

```bash
# Générer un secret aléatoire de 32 bytes (64 caractères hex)
openssl rand -hex 32
```

Exemple de résultat :
```
a3f2e9b8c4d1a2f5e8b3c9d2a7f1e4b8c3d9a2f7e1b4c8d3a9f2e5b1c7d4a8f3
```

Ajouter dans **Vercel → Settings → Environment Variables** :
```
CRON_SECRET=a3f2e9b8c4d1a2f5e8b3c9d2a7f1e4b8c3d9a2f7e1b4c8d3a9f2e5b1c7d4a8f3
```

---

## 🔄 Alternative : Vercel Pro (Payant)

Si vous souhaitez utiliser Vercel Cron natif, vous pouvez upgrade vers le **plan Pro** ($20/mois) :

### Avantages Vercel Pro

- ✅ Crons illimités (fréquence jusqu'à 1 minute)
- ✅ Intégration native (pas de service externe)
- ✅ Logs dans Vercel Dashboard
- ✅ Plus de fonctions concurrentes
- ✅ Analytics avancés

### Configuration Vercel Pro

Si vous upgradez, restaurer le `vercel.json` original :

```json
{
  "crons": [
    {
      "path": "/api/cron/process-email-queue",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Puis redéployer :
```bash
git add vercel.json
git commit -m "chore: restore Vercel cron (Pro plan)"
git push
```

---

## 📊 Comparaison des Solutions

| Critère | cron-job.org (Gratuit) | Vercel Pro |
|---------|------------------------|------------|
| **Coût** | Gratuit | $20/mois |
| **Setup** | 5 minutes | Immédiat |
| **Fiabilité** | 99.9% | 99.99% |
| **Fréquence min** | 1 minute | 1 minute |
| **Monitoring** | Dashboard externe | Vercel Dashboard |
| **Maintenance** | Aucune | Aucune |

**Recommandation** : Commencer avec **cron-job.org** (gratuit), puis upgrade vers **Vercel Pro** si :
- Vous avez besoin d'autres features Pro (Edge Functions, etc.)
- Vous voulez tout centraliser dans Vercel
- Le budget le permet

---

## ✅ Checklist de Configuration

- [ ] Compte cron-job.org créé
- [ ] Cron job configuré (URL + schedule)
- [ ] Header `Authorization` ajouté avec `CRON_SECRET`
- [ ] Test manuel réussi (200 OK)
- [ ] Alertes email activées
- [ ] Vérification logs Vercel après 5 minutes
- [ ] Email de confirmation reçu (tester une vraie commande)

---

## 🐛 Troubleshooting

### Erreur 401 Unauthorized

**Cause** : Header `Authorization` manquant ou incorrect.

**Solution** :
1. Vérifier que le header est bien ajouté dans cron-job.org
2. Format exact : `Authorization: Bearer VOTRE_SECRET` (avec `Bearer` et espace)
3. Vérifier que `CRON_SECRET` est bien configuré dans Vercel

### Erreur 500 Internal Server Error

**Cause** : Erreur dans le code ou connexion DB/Resend.

**Solution** :
1. Aller dans **Vercel Dashboard → Logs**
2. Chercher l'erreur exacte
3. Vérifier les credentials (Resend API Key, Database URL)

### Emails ne sont pas envoyés

**Cause** : Queue bloquée ou quota Resend dépassé.

**Solution** :
1. Vérifier la table `email_queue` dans Drizzle Studio
2. Voir combien de jobs en status `pending` ou `failed`
3. Lire `last_error` pour identifier le problème
4. Vérifier quota Resend Dashboard (3000 emails/mois gratuit)

### Cron job désactivé automatiquement

**Cause** : 10 échecs consécutifs (protection cron-job.org).

**Solution** :
1. Identifier la cause des échecs (voir logs Vercel)
2. Corriger le problème
3. Réactiver le cron dans cron-job.org dashboard

---

## 📞 Support

**cron-job.org** : support@cron-job.org
**Vercel** : vercel.com/support

---

**Dernière mise à jour** : Février 2026
