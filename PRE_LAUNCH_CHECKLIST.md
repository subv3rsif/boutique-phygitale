# Checklist Pré-Lancement - Boutique Phygitale

Cette checklist exhaustive garantit que tous les aspects critiques sont validés avant la mise en production.

## 🔐 Sécurité

### Authentification & Autorisation
- [ ] Middleware admin fonctionne (`/admin/*` redirige vers `/login` si non authentifié)
- [ ] Seuls les emails dans `ADMIN_EMAILS` peuvent accéder à l'admin
- [ ] Session timeout configuré (7 jours par défaut)
- [ ] Logout fonctionne et invalide la session
- [ ] Pas de backdoor ou credentials hardcodés dans le code

### Stripe & Paiements
- [ ] **Clés Stripe en mode LIVE** (pas de `sk_test_` ou `pk_test_`)
- [ ] Webhook Stripe configuré avec URL production
- [ ] Signature webhook vérifiée (`stripe.webhooks.constructEvent()`)
- [ ] Idempotence webhook active (table `stripe_events`)
- [ ] Test webhook réussi (Stripe Dashboard → Send test event)
- [ ] Montants **toujours recalculés côté serveur** depuis le catalogue
- [ ] Payload client jamais utilisé pour les prix/totaux

### Tokens & QR Codes
- [ ] Tokens générés avec `crypto.randomBytes(32)` (256 bits)
- [ ] Tokens **hashés** (SHA-256) avant stockage en DB
- [ ] Token en clair **jamais** stocké en DB
- [ ] Expiration tokens = 30 jours
- [ ] Validation token vérifie expiration + usage unique
- [ ] Token validation rejette tokens déjà utilisés (409)

### Rate Limiting
- [ ] Rate limiter Upstash configuré et fonctionnel
- [ ] Checkout limité à 10 sessions/heure par IP
- [ ] Order view limité à 3 requêtes/heure par IP
- [ ] Test : 11ème requête checkout retourne 429
- [ ] Headers rate limit exposés (`X-RateLimit-Remaining`)

### Headers & CSP
- [ ] `X-Frame-Options: DENY` présent sur toutes les pages
- [ ] `X-Content-Type-Options: nosniff` présent
- [ ] `Referrer-Policy: strict-origin-when-cross-origin` présent
- [ ] HTTPS forcé (automatique sur Vercel)
- [ ] Pas de mixed content (HTTP + HTTPS)

### Base de Données
- [ ] Row Level Security (RLS) activé sur toutes les tables
- [ ] Policies RLS configurées (admin only via service role)
- [ ] Service Role Key **jamais** exposé côté client
- [ ] Connexions poolées (pgBouncer) pour éviter limites
- [ ] Backups automatiques activés (Supabase)

### Secrets & Variables d'Environnement
- [ ] Tous les secrets dans Vercel Environment Variables
- [ ] `.env.local` dans `.gitignore`
- [ ] Pas de secrets committés dans Git (audit avec `git-secrets`)
- [ ] `CRON_SECRET` fort (32+ caractères aléatoires)
- [ ] `ADMIN_EMAILS` limité aux vrais admins
- [ ] `NODE_ENV=production` en production

## ✅ Fonctionnel

### Parcours Checkout Delivery
- [ ] Ajout produit au panier fonctionne
- [ ] Modification quantité (1-10) fonctionne
- [ ] Suppression item du panier fonctionne
- [ ] Sélection mode "Livraison" fonctionne
- [ ] Calcul frais de port correct (basé sur catalogue)
- [ ] Total TTC affiché correctement
- [ ] Checkbox RGPD obligatoire bloque si non cochée
- [ ] Bouton "Payer" crée session Stripe
- [ ] Redirection vers Stripe Checkout fonctionne
- [ ] Paiement test réussit (carte `4242 4242 4242 4242`)
- [ ] Retour sur page `/commande/success`
- [ ] Webhook `checkout.session.completed` reçu et traité
- [ ] Order status passe à `'paid'` en DB
- [ ] Email confirmation envoyé
- [ ] Email reçu dans inbox (pas spam)
- [ ] Page `/ma-commande/[orderId]` affiche détails

### Parcours Checkout Pickup
- [ ] Sélection mode "Retrait" fonctionne
- [ ] Frais de port = 0€ en mode retrait
- [ ] Informations La Fabrik affichées (adresse, horaires)
- [ ] Paiement test réussit
- [ ] Webhook traite correctement le mode pickup
- [ ] Token QR généré (32 bytes random)
- [ ] Token hashé en DB (pas clair)
- [ ] QR code généré (300x300px minimum)
- [ ] Email avec QR code envoyé
- [ ] QR code s'affiche dans l'email
- [ ] QR code scannable avec téléphone
- [ ] URL `/retrait/[token]` fonctionne
- [ ] Page retrait affiche détails commande

### Admin - Gestion Commandes
- [ ] Dashboard affiche stats correctes (CA, nb commandes)
- [ ] Liste commandes s'affiche
- [ ] Filtres (status, mode, date) fonctionnent
- [ ] Tri par date décroissante par défaut
- [ ] Détail commande affiche toutes les infos
- [ ] Bouton "Marquer expédié" visible si delivery + paid
- [ ] Saisie tracking number fonctionne
- [ ] Email "shipped" envoyé après marquage
- [ ] Bouton "Renvoyer email" fonctionne
- [ ] Rate limit sur renvoi email actif

### Admin - Scanner QR Pickup
- [ ] Page `/admin/pickup` accessible (admin authentifié)
- [ ] Input token large et touch-friendly (h-14 minimum)
- [ ] Auto-focus sur input au chargement
- [ ] Paste token auto-valide si > 20 caractères
- [ ] Validation réussie → Card verte + détails commande
- [ ] Validation échouée → Card rouge + error code
- [ ] Error 404 : Token invalide
- [ ] Error 410 : Token expiré
- [ ] Error 409 : Token déjà utilisé (affiche date/user)
- [ ] Error 400 : Commande non payée
- [ ] Order status passe à `'fulfilled'` après validation
- [ ] Section aide collapsible fonctionne
- [ ] Responsive mobile (staff sur téléphone)
- [ ] Clear auto après succès (3 secondes)

### Queue Emails
- [ ] Cron `/api/cron/process-email-queue` s'exécute toutes les 5 minutes
- [ ] Emails pending traités
- [ ] Retry automatique en cas d'échec (backoff exponentiel)
- [ ] Max 5 tentatives avant abandon
- [ ] Jobs `failed` identifiables dans DB
- [ ] Email `sent_at` mis à jour après envoi réussi
- [ ] Templates React Email s'affichent correctement
- [ ] QR codes inline (base64) dans emails pickup
- [ ] Liens cliquables dans emails

## 🎨 UX & Design

### Responsive Mobile
- [ ] Testé sur iPhone SE (320px width minimum)
- [ ] Testé sur iPad (768px)
- [ ] Testé sur Desktop (1920px)
- [ ] Navigation hamburger fonctionne (< md)
- [ ] Panier : stack vertical sur mobile
- [ ] ProductCard : 1 col mobile, 2 cols tablet, 3-4 cols desktop
- [ ] Admin : sidebar collapse sur mobile
- [ ] QR Scanner : pleine largeur, boutons touch-friendly
- [ ] Pas de scroll horizontal involontaire

### Accessibilité (WCAG 2.1 AA)
- [ ] Contraste texte/fond ≥ 4.5:1 (vérifier avec Wave ou axe DevTools)
- [ ] Tous les boutons ont aria-label ou texte visible
- [ ] Focus visible (ring-2) sur tous les éléments interactifs
- [ ] Navigation clavier complète (Tab, Enter, Espace)
- [ ] ARIA live regions pour notifications (toasts)
- [ ] Images ont alt text descriptif
- [ ] Formulaires ont labels associés
- [ ] Messages erreur annoncés aux screen readers

### Performance
- [ ] Lighthouse Performance > 85
- [ ] Lighthouse Accessibility > 95
- [ ] Lighthouse Best Practices > 90
- [ ] Lighthouse SEO > 90
- [ ] Core Web Vitals :
  - [ ] LCP (Largest Contentful Paint) < 2.5s
  - [ ] FID (First Input Delay) < 100ms
  - [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Images optimisées (WebP/AVIF, lazy loading)
- [ ] Next.js Image component utilisé partout
- [ ] Pas de bundle JS > 500KB

### Loading States & Feedback
- [ ] Skeleton loaders pendant chargement pages
- [ ] Spinner sur bouton checkout pendant création session
- [ ] Toast notifications pour succès/erreurs
- [ ] Loading spinner sur actions admin (marquer expédié, scanner QR)
- [ ] Désactivation boutons pendant actions async
- [ ] Messages d'erreur clairs et actionnables

### Pages d'Erreur
- [ ] Page 404 custom avec liens utiles
- [ ] Page 500/error avec bouton "Réessayer"
- [ ] Error boundary global catch les erreurs React
- [ ] Messages d'erreur ne révèlent pas d'infos sensibles

## 📧 Emails

### Configuration Domaine
- [ ] Domaine vérifié dans Resend Dashboard
- [ ] SPF record configuré
- [ ] DKIM record configuré
- [ ] DMARC record configuré
- [ ] Test email reçu (inbox, pas spam)

### Templates
- [ ] Template `delivery_confirmation` render correctement
- [ ] Template `pickup_confirmation` render correctement (avec QR)
- [ ] Template `shipped_notification` render correctement
- [ ] QR codes s'affichent (inline base64)
- [ ] Liens cliquables (tracking La Poste, `/ma-commande/[id]`)
- [ ] Footer avec mentions légales présent
- [ ] Responsive mobile (Gmail app, Outlook app testés)
- [ ] Pas de spam score élevé (tester avec mail-tester.com)

### Contenu
- [ ] Sujet email clair et concis
- [ ] Récap commande complet (produits, quantités, total)
- [ ] Instructions retrait claires (adresse, horaires La Fabrik)
- [ ] Email contact support visible
- [ ] Liens "Se désinscrire" / RGPD conformes
- [ ] Pas de typos ou fautes d'orthographe

## 📄 Légal & RGPD

### Pages Légales
- [ ] Page `/mentions-legales` complétée avec infos réelles
  - [ ] Nom/SIRET de la municipalité
  - [ ] Adresse postale
  - [ ] Email contact
  - [ ] Directeur de publication
  - [ ] Hébergeur (Vercel)
- [ ] Page `/politique-confidentialite` complétée
  - [ ] Données collectées listées
  - [ ] Finalités expliquées
  - [ ] Durée de conservation précisée
  - [ ] Droits utilisateurs (accès, rectification, suppression)
  - [ ] Contact DPO
- [ ] Page `/cgv` complétée
  - [ ] Conditions générales de vente
  - [ ] Droit de rétractation (14 jours)
  - [ ] Modalités de livraison
  - [ ] Prix TTC
  - [ ] Conditions de retrait

### Consentements
- [ ] Checkbox RGPD obligatoire au checkout
- [ ] Lien vers politique confidentialité dans checkbox
- [ ] Consentement enregistré en DB (table `gdpr_consents`)
  - [ ] IP address
  - [ ] User agent
  - [ ] Timestamp
  - [ ] Version politique (1.0)
- [ ] Email confirmation contient lien politique confidentialité

### Droits Utilisateurs
- [ ] Procédure droit d'accès documentée
- [ ] Procédure suppression données documentée
- [ ] Email contact DPO/support fonctionnel
- [ ] Délai réponse ≤ 1 mois (RGPD)

## 🧪 Tests

### Tests Unitaires
- [ ] `npm run test` passe sans erreur
- [ ] Coverage > 70% (si configuré)
- [ ] Tests catalogue : calculs totaux corrects
- [ ] Tests validations Zod : rejette payloads invalides
- [ ] Tests store Zustand : actions panier fonctionnent
- [ ] Tests token generator : unicité, hash, expiration

### Tests Manuels
- [ ] **Parcours complet delivery** : Achat → Paiement → Email
- [ ] **Parcours complet pickup** : Achat → QR → Scan → Validation
- [ ] **Double paiement** : Replay webhook ne retraite pas (idempotence)
- [ ] **Token expiré** : Scan QR après 30 jours retourne 410
- [ ] **Token réutilisé** : 2ème scan retourne 409
- [ ] **Rate limit** : 11ème checkout bloqué (429)
- [ ] **Stock épuisé** : Gestion si product.stockQuantity = 0 (si activé)
- [ ] **Session expirée** : Stripe session expire après 24h, order canceled

### Tests Cross-Browser
- [ ] Chrome (Desktop + Mobile)
- [ ] Firefox
- [ ] Safari (Desktop + iOS)
- [ ] Edge
- [ ] Pas de bugs JavaScript console
- [ ] Rendu CSS identique (ou acceptable)

## 📊 Monitoring & Logs

### Vercel
- [ ] Analytics activé
- [ ] Logs accessibles (Vercel Dashboard)
- [ ] Alertes configurées (optionnel, Vercel Pro)
- [ ] Cron jobs visibles dans dashboard
- [ ] Cron emails exécuté avec succès (pas d'erreurs)

### Sentry (si configuré)
- [ ] DSN configuré (production)
- [ ] Sourcemaps uploadés (build production)
- [ ] Erreurs capturées et visibles dans dashboard
- [ ] Alertes email/Slack configurées
- [ ] Performance monitoring activé

### Stripe
- [ ] Webhooks dashboard : événements récents visibles
- [ ] Aucun webhook échoué (ou résolu)
- [ ] Logs détaillés accessibles (Developers → Events)

### Upstash
- [ ] Redis dashboard : connexions actives
- [ ] Pas d'erreurs de connexion
- [ ] Mémoire utilisée acceptable (< 80%)

## 🚀 Déploiement

### Vercel
- [ ] Build production réussit (`npm run build` local)
- [ ] Déploiement Vercel réussi (pas d'erreurs build)
- [ ] Variables d'environnement configurées (Production + Preview)
- [ ] Domaine personnalisé configuré et vérifié
- [ ] HTTPS actif (certificat Let's Encrypt)
- [ ] Pas d'avertissement sécurité navigateur

### DNS & Domaine
- [ ] Enregistrement CNAME vers Vercel configuré
- [ ] Propagation DNS complète (vérifier avec `dig` ou `nslookup`)
- [ ] Sous-domaine `boutique.ville-example.fr` résolu correctement
- [ ] Pas de redirection cassée

## 🔄 Post-Lancement

### Jour 1
- [ ] Monitoring actif (vérifier toutes les 2 heures)
- [ ] Première commande réelle testée manuellement
- [ ] Webhooks Stripe : aucun échec
- [ ] Emails : aucun bounce
- [ ] QR codes : premiers scans validés

### Semaine 1
- [ ] Collecter feedback utilisateurs (clients + staff)
- [ ] Analyser Core Web Vitals (Vercel Analytics)
- [ ] Vérifier taux de conversion checkout
- [ ] Identifier points de friction UX
- [ ] Ajuster si nécessaire (stock, shipping costs)

### Mois 1
- [ ] Audit sécurité complet (optionnel, pentester externe)
- [ ] Optimisations performance basées sur données réelles
- [ ] Mise à jour documentation si changements
- [ ] Planifier roadmap features (v2)

## 📞 Contacts & Support

### Équipe Technique
- [ ] Liste de contacts à jour (dev, admin sys, support)
- [ ] Procédure escalade définie (qui appeler si down ?)
- [ ] Accès admin configurés (backup admins)

### Utilisateurs Finaux
- [ ] Email support visible (`support@ville.fr`)
- [ ] Page contact ou formulaire disponible
- [ ] FAQ (optionnel mais recommandé)
- [ ] Horaires support définis

## ✅ Validation Finale

### Signer & Dater

**Date de validation** : ___________________

**Validé par** :
- [ ] Développeur : ___________________ (signature)
- [ ] Chef de projet : ___________________ (signature)
- [ ] Responsable technique municipalité : ___________________ (signature)

---

## 🎉 Lancement Autorisé

Une fois **toutes** les cases cochées et signatures recueillies, le lancement en production est autorisé.

**🚨 En cas de doute sur un point critique (sécurité, paiements), NE PAS lancer.**

Contactez l'équipe technique pour validation supplémentaire.

---

**Bonne chance pour le lancement ! 🚀**
