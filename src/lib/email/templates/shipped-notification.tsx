import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ShippedNotificationEmailProps {
  orderNumber: string;
  customerEmail: string;
  trackingNumber: string;
  trackingUrl: string;
  orderUrl: string;
  items: Array<{
    name: string;
    qty: number;
    priceCents: number;
  }>;
  totalCents: number;
}

export function ShippedNotificationEmail({
  orderNumber,
  customerEmail,
  trackingNumber,
  trackingUrl,
  orderUrl,
  items,
  totalCents,
}: ShippedNotificationEmailProps) {
  const formattedTotal = (totalCents / 100).toFixed(2);

  return (
    <Html>
      <Head />
      <Preview>Votre colis a été expédié - Suivi de votre commande</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Heading style={h1}>📦 Votre colis a été expédié !</Heading>

          <Text style={text}>Bonjour,</Text>

          <Text style={text}>
            Bonne nouvelle ! Votre commande #{orderNumber.slice(0, 8)} a été confiée à La Poste
            et est en route vers vous.
          </Text>

          {/* Tracking Info */}
          <Section style={trackingSection}>
            <Text style={trackingLabel}>Numéro de suivi :</Text>
            <Text style={trackingNumberStyle}>{trackingNumber}</Text>

            <Button style={button} href={trackingUrl}>
              Suivre mon colis
            </Button>
          </Section>

          <Text style={text}>
            <strong>Délai de livraison estimé :</strong> 3 à 5 jours ouvrés
          </Text>

          <Hr style={hr} />

          {/* Order Summary */}
          <Heading as="h2" style={h2}>
            Récapitulatif de votre commande
          </Heading>

          {items.map((item, index) => (
            <div key={index} style={itemRow}>
              <Text style={itemText}>
                {item.name} × {item.qty}
              </Text>
              <Text style={itemPrice}>{(item.priceCents / 100).toFixed(2)} €</Text>
            </div>
          ))}

          <Hr style={hr} />

          <div style={totalRow}>
            <Text style={totalLabel}>Total TTC</Text>
            <Text style={totalAmount}>{formattedTotal} €</Text>
          </div>

          <Hr style={hr} />

          {/* Help Section */}
          <Text style={text}>
            <strong>Besoin d'aide ?</strong>
          </Text>

          <Text style={text}>
            Si vous avez des questions sur votre commande ou votre livraison,
            n'hésitez pas à nous contacter.
          </Text>

          <Section style={buttonContainer}>
            <Button style={secondaryButton} href={orderUrl}>
              Voir ma commande
            </Button>
          </Section>

          {/* Footer */}
          <Hr style={hr} />

          <Text style={footer}>
            Cet email a été envoyé à {customerEmail}
            <br />
            <br />
            Boutique Ville - Goodies officiels
            <br />
            <Link href="#" style={link}>
              Politique de confidentialité
            </Link>
            {' · '}
            <Link href="#" style={link}>
              Mentions légales
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ShippedNotificationEmail.PreviewProps = {
  orderNumber: '12345678-90ab-cdef-1234-567890abcdef',
  customerEmail: 'client@example.com',
  trackingNumber: 'XX123456789FR',
  trackingUrl: 'https://www.laposte.fr/outils/suivre-vos-envois?code=XX123456789FR',
  orderUrl: 'http://localhost:3000/ma-commande/12345678',
  items: [
    { name: 'Mug Ville Edition 2024', qty: 2, priceCents: 2400 },
    { name: 'Tote Bag Ville', qty: 1, priceCents: 1500 },
  ],
  totalCents: 4350,
} as ShippedNotificationEmailProps;

export default ShippedNotificationEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 40px',
  lineHeight: '1.3',
};

const h2 = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '20px 0 10px',
  padding: '0 40px',
};

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  padding: '0 40px',
  margin: '10px 0',
};

const trackingSection = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 40px',
  textAlign: 'center' as const,
};

const trackingLabel = {
  color: '#71717a',
  fontSize: '14px',
  margin: '0 0 8px',
};

const trackingNumberStyle = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  fontFamily: 'monospace',
  margin: '0 0 20px',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const secondaryButton = {
  ...button,
  backgroundColor: '#ffffff',
  color: '#2563eb',
  border: '2px solid #2563eb',
};

const buttonContainer = {
  padding: '20px 40px',
  textAlign: 'center' as const,
};

const itemRow = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '12px 40px',
};

const itemText = {
  color: '#525252',
  fontSize: '15px',
  margin: 0,
};

const itemPrice = {
  color: '#525252',
  fontSize: '15px',
  margin: 0,
  fontWeight: '600',
};

const totalRow = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '16px 40px',
};

const totalLabel = {
  color: '#1a1a1a',
  fontSize: '17px',
  fontWeight: 'bold',
  margin: 0,
};

const totalAmount = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: 0,
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const footer = {
  color: '#71717a',
  fontSize: '12px',
  lineHeight: '20px',
  padding: '0 40px',
  textAlign: 'center' as const,
};

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
};
