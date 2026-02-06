import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Mentions légales - Boutique Ville',
};

export default function MentionsLegalesPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Mentions légales</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Éditeur du site</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              <strong>Nom de la municipalité</strong>
              <br />
              Adresse : [Adresse complète]
              <br />
              Téléphone : [Numéro de téléphone]
              <br />
              Email : contact@ville.fr
            </p>
            <p>
              <strong>Directeur de la publication :</strong> [Nom du Maire]
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hébergement</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Ce site est hébergé par :
              <br />
              <strong>Vercel Inc.</strong>
              <br />
              340 S Lemon Ave #4133
              <br />
              Walnut, CA 91789
              <br />
              États-Unis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Propriété intellectuelle</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              L'ensemble de ce site relève de la législation française et internationale
              sur le droit d'auteur et la propriété intellectuelle. Tous les droits de
              reproduction sont réservés, y compris pour les documents téléchargeables
              et les représentations iconographiques et photographiques.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Protection des données personnelles</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Conformément à la loi "Informatique et Libertés" du 6 janvier 1978
              modifiée et au Règlement Général sur la Protection des Données (RGPD),
              vous disposez d'un droit d'accès, de rectification et de suppression
              des données vous concernant.
            </p>
            <p>
              Pour exercer ces droits, contactez-nous à : privacy@ville.fr
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookies</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Ce site n'utilise que des cookies essentiels au fonctionnement
              du panier d'achat (stockage local). Aucun cookie de tracking
              ou de publicité n'est utilisé.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
