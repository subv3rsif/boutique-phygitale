import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Politique de confidentialité - Boutique Ville',
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Politique de confidentialité</h1>

      <div className="mb-6 text-muted-foreground">
        <p>Version 1.0 - Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Collecte des données</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Nous collectons les données suivantes lors de votre commande :
            </p>
            <ul>
              <li>Email (obligatoire pour la confirmation de commande)</li>
              <li>Numéro de téléphone (optionnel, recommandé pour les retraits)</li>
              <li>Adresse de livraison (uniquement pour les livraisons)</li>
              <li>Informations de paiement (traitées par Stripe, jamais stockées par nous)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Utilisation des données</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Vos données sont utilisées uniquement pour :</p>
            <ul>
              <li>Traiter et expédier votre commande</li>
              <li>Vous envoyer des emails de confirmation et de suivi</li>
              <li>Gérer les retraits sur place (QR code)</li>
              <li>Respecter nos obligations légales et comptables</li>
            </ul>
            <p>
              <strong>Nous ne vendons jamais vos données à des tiers.</strong>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Conservation des données</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Vos données de commande sont conservées pendant :
            </p>
            <ul>
              <li>3 ans après l'achat (obligations comptables)</li>
              <li>Les QR codes expirent après 30 jours</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Vos droits (RGPD)</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
              <li><strong>Droit d'accès</strong> : consulter vos données</li>
              <li><strong>Droit de rectification</strong> : corriger vos données</li>
              <li><strong>Droit à l'effacement</strong> : supprimer vos données</li>
              <li><strong>Droit d'opposition</strong> : refuser le traitement</li>
              <li><strong>Droit à la portabilité</strong> : récupérer vos données</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous à : <strong>privacy@ville.fr</strong>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Sécurité</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles
              pour protéger vos données :
            </p>
            <ul>
              <li>Chiffrement HTTPS pour toutes les communications</li>
              <li>Paiements sécurisés via Stripe (certifié PCI-DSS)</li>
              <li>Tokens QR hashés (non stockés en clair)</li>
              <li>Accès restreint aux données (équipe autorisée uniquement)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Cookies</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Ce site utilise uniquement des cookies essentiels (panier d'achat en local storage).
              Aucun cookie de tracking, analytics ou publicité n'est utilisé.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Services tiers</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Nous utilisons les services suivants :</p>
            <ul>
              <li><strong>Stripe</strong> (paiement) - <a href="https://stripe.com/privacy" className="underline">Politique de confidentialité</a></li>
              <li><strong>Resend</strong> (emails) - <a href="https://resend.com/privacy" className="underline">Politique de confidentialité</a></li>
              <li><strong>Vercel</strong> (hébergement) - <a href="https://vercel.com/legal/privacy-policy" className="underline">Politique de confidentialité</a></li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Contact</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Pour toute question concernant cette politique de confidentialité :
              <br />
              Email : <strong>privacy@ville.fr</strong>
              <br />
              Adresse : [Adresse de la mairie]
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
