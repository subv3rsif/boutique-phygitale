// src/emails/stock-alert.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Link,
  Preview,
  Section,
  Hr,
} from '@react-email/components';

interface StockAlertEmailProps {
  productName: string;
  productId: string;
  currentStock: number;
  threshold: number;
  adminUrl: string;
}

export default function StockAlertEmail({
  productName,
  productId,
  currentStock,
  threshold,
  adminUrl,
}: StockAlertEmailProps) {
  const productUrl = `${adminUrl}/admin/products/${productId}`;

  return (
    <Html>
      <Head />
      <Preview>Stock faible : {productName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚠️ Alerte Stock Faible</Heading>

          <Text style={text}>
            Le stock du produit suivant est en dessous du seuil d'alerte :
          </Text>

          <Section style={productSection}>
            <Text style={productName}>
              <strong>{productName}</strong>
            </Text>
            <Text style={stockInfo}>
              Stock actuel : <strong style={warning}>{currentStock} unités</strong>
            </Text>
            <Text style={stockInfo}>
              Seuil d'alerte : {threshold} unités
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            Nous vous recommandons de réapprovisionner ce produit rapidement pour éviter une rupture de stock.
          </Text>

          <Section style={buttonContainer}>
            <Link href={productUrl} style={button}>
              Gérer le stock →
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Cet email a été envoyé automatiquement par le système de gestion de stock.
            <br />
            <Link href={adminUrl} style={footerLink}>
              Accéder au panneau d'administration
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '5px',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const productSection = {
  backgroundColor: '#fff9f0',
  border: '2px solid #ffc107',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const productName = {
  color: '#333',
  fontSize: '18px',
  margin: '0 0 12px',
};

const stockInfo = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
};

const warning = {
  color: '#d32f2f',
  fontWeight: 'bold' as const,
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '24px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#503B64',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  marginTop: '32px',
  textAlign: 'center' as const,
};

const footerLink = {
  color: '#503B64',
  textDecoration: 'underline',
};
