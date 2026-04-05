// src/emails/out-of-stock.tsx
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

interface OutOfStockEmailProps {
  productName: string;
  productId: string;
  adminUrl: string;
}

export default function OutOfStockEmail({
  productName: name,
  productId,
  adminUrl,
}: OutOfStockEmailProps) {
  const productUrl = `${adminUrl}/admin/products/${productId}`;

  return (
    <Html>
      <Head />
      <Preview>Rupture de stock : {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🚨 Rupture de Stock</Heading>

          <Text style={text}>
            Le produit suivant est en rupture de stock et a été automatiquement désactivé :
          </Text>

          <Section style={productSection}>
            <Text style={productNameStyle}>
              <strong>{name}</strong>
            </Text>
            <Text style={stockInfo}>
              Stock actuel : <strong style={critical}>0 unités</strong>
            </Text>
            <Text style={statusBadge}>
              ❌ Produit désactivé automatiquement
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            Ce produit n'est plus visible sur la boutique en ligne. Il sera automatiquement réactivé lorsque vous ajouterez du stock.
          </Text>

          <Text style={urgentText}>
            <strong>Action requise :</strong> Réapprovisionnez ce produit dès que possible pour le rendre à nouveau disponible à la vente.
          </Text>

          <Section style={buttonContainer}>
            <Link href={productUrl} style={button}>
              Réapprovisionner →
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

const urgentText = {
  color: '#d32f2f',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  backgroundColor: '#ffebee',
  padding: '16px',
  borderRadius: '8px',
  borderLeft: '4px solid #d32f2f',
};

const productSection = {
  backgroundColor: '#ffebee',
  border: '2px solid #d32f2f',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const productNameStyle = {
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

const critical = {
  color: '#d32f2f',
  fontWeight: 'bold' as const,
};

const statusBadge = {
  color: '#d32f2f',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  marginTop: '12px',
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
  backgroundColor: '#d32f2f',
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
