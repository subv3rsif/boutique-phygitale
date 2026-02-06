import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Conditions Générales de Vente - Boutique Ville',
};

export default function CGVPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Conditions Générales de Vente</h1>

      <div className="mb-6 text-muted-foreground">
        <p>Version 1.0 - En vigueur au {new Date().toLocaleDateString('fr-FR')}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Objet</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent les ventes
              de produits réalisées sur la boutique en ligne de la municipalité.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Produits</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Les produits proposés sont ceux figurant sur le site et dans la limite
              des stocks disponibles. Les photographies sont non contractuelles.
            </p>
            <p>
              Quantité maximale par produit : 10 unités
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Prix</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Les prix sont indiqués en euros TTC (TVA française incluse).
            </p>
            <p>
              Les frais de livraison sont calculés en fonction du mode choisi :
            </p>
            <ul>
              <li><strong>Retrait sur place :</strong> Gratuit</li>
              <li><strong>Livraison à domicile :</strong> Selon tarifs La Poste affichés</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Commande</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Toute commande implique l'acceptation des présentes CGV et de la
              politique de confidentialité.
            </p>
            <p>
              La commande est confirmée après paiement intégral via Stripe.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Paiement</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Le paiement s'effectue en ligne via Stripe (CB, Visa, Mastercard).
            </p>
            <p>
              Le paiement est sécurisé et les données bancaires ne sont jamais
              stockées par la municipalité.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Livraison</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h4 className="font-semibold mb-2">Livraison à domicile</h4>
            <ul>
              <li>France métropolitaine uniquement</li>
              <li>Délai : 5-7 jours ouvrés</li>
              <li>Via La Poste</li>
              <li>Numéro de suivi fourni par email</li>
            </ul>

            <h4 className="font-semibold mb-2 mt-4">Retrait sur place</h4>
            <ul>
              <li>Lieu : La Fabrik, [Adresse]</li>
              <li>Horaires : Lundi-Vendredi 9h-18h</li>
              <li>QR code à présenter obligatoirement</li>
              <li>Validité du QR code : 30 jours</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Droit de rétractation</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Conformément à l'article L221-18 du Code de la consommation, vous disposez
              d'un délai de 14 jours à compter de la réception pour exercer votre droit
              de rétractation sans avoir à justifier de motifs.
            </p>
            <p>
              Pour exercer ce droit, contactez : <strong>retour@ville.fr</strong>
            </p>
            <p>
              Les frais de retour sont à votre charge.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Garanties</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Les produits bénéficient de la garantie légale de conformité
              (articles L217-4 à L217-14 du Code de la consommation) et de
              la garantie contre les vices cachés (articles 1641 à 1649 du Code civil).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Responsabilité</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              La municipalité ne saurait être tenue responsable en cas de :
            </p>
            <ul>
              <li>Force majeure</li>
              <li>Retard de livraison imputable au transporteur</li>
              <li>Utilisation non conforme des produits</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Données personnelles</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Les données collectées sont traitées conformément à notre
              <a href="/politique-confidentialite" className="underline ml-1">
                politique de confidentialité
              </a>
              .
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Médiation</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              En cas de litige, vous pouvez recourir à la médiation de la consommation
              conformément à l'article L612-1 du Code de la consommation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>12. Droit applicable</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Les présentes CGV sont soumises au droit français.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>13. Contact</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Pour toute question :
              <br />
              Email : <strong>support@ville.fr</strong>
              <br />
              Téléphone : [Numéro]
              <br />
              Adresse : [Adresse mairie]
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
