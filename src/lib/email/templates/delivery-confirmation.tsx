import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
} from '@react-email/components';
import { formatCurrency } from '@/lib/catalogue';

/**
 * Delivery Confirmation Email Template
 * Sent when a delivery order is confirmed (after successful payment)
 */

type DeliveryConfirmationEmailProps = {
  order: {
    id: string;
    items: Array<{
      nameSnapshot: string;
      qty: number;
      unitPriceCents: number;
      shippingCentsPerUnit: number;
    }>;
    itemsTotalCents: number;
    shippingTotalCents: number;
    grandTotalCents: number;
    customerEmail: string;
  };
};

export function DeliveryConfirmationEmail({ order }: DeliveryConfirmationEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={title}>Votre commande est confirmée</Text>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              Bonjour,
            </Text>

            <Text style={paragraph}>
              Nous avons bien reçu votre commande et votre paiement a été confirmé.
              Vous recevrez un email avec le numéro de suivi dans 2-3 jours ouvrés.
            </Text>

            <Hr style={hr} />

            <Text style={heading}>Récapitulatif de votre commande</Text>

            {order.items.map((item, index) => (
              <Section key={index} style={itemSection}>
                <Text style={itemName}>
                  {item.nameSnapshot} <span style={itemQty}>x{item.qty}</span>
                </Text>
                <Text style={itemPrice}>
                  {formatCurrency(item.unitPriceCents * item.qty)}
                </Text>
              </Section>
            ))}

            <Hr style={hr} />

            <Section style={totalSection}>
              <Text style={totalLabel}>Sous-total produits :</Text>
              <Text style={totalValue}>{formatCurrency(order.itemsTotalCents)}</Text>
            </Section>

            <Section style={totalSection}>
              <Text style={totalLabel}>Frais de livraison :</Text>
              <Text style={totalValue}>{formatCurrency(order.shippingTotalCents)}</Text>
            </Section>

            <Section style={totalSection}>
              <Text style={totalLabelBold}>Total TTC :</Text>
              <Text style={totalValueBold}>{formatCurrency(order.grandTotalCents)}</Text>
            </Section>

            <Hr style={hr} />

            <Text style={paragraph}>
              <strong>Délai de livraison estimé :</strong> 5-7 jours ouvrés
            </Text>

            <Text style={paragraph}>
              Vous pouvez retrouver les détails de votre commande à tout moment sur :
            </Text>

            <Link href={`${appUrl}/ma-commande/${order.id}`} style={link}>
              Voir ma commande
            </Link>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Pour toute question, contactez-nous à{' '}
              <Link href="mailto:support@ville.fr" style={footerLink}>
                support@ville.fr
              </Link>
            </Text>
            <Text style={footerText}>© 2024 Ville - Boutique officielle</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const header = {
  padding: '32px 24px',
  backgroundColor: '#1e293b',
};

const title = {
  margin: '0',
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#ffffff',
  textAlign: 'center' as const,
};

const content = {
  padding: '24px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#334155',
  margin: '16px 0',
};

const heading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '24px 0 16px',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
};

const itemSection = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
};

const itemName = {
  fontSize: '14px',
  color: '#475569',
  margin: '0',
};

const itemQty = {
  color: '#64748b',
  fontWeight: 'normal' as const,
};

const itemPrice = {
  fontSize: '14px',
  color: '#1e293b',
  fontWeight: '600' as const,
  margin: '0',
};

const totalSection = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
};

const totalLabel = {
  fontSize: '14px',
  color: '#475569',
  margin: '0',
};

const totalValue = {
  fontSize: '14px',
  color: '#1e293b',
  margin: '0',
};

const totalLabelBold = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0',
};

const totalValueBold = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
  fontSize: '16px',
  display: 'inline-block',
  margin: '16px 0',
};

const footer = {
  padding: '24px',
  backgroundColor: '#f8fafc',
  borderTop: '1px solid #e2e8f0',
};

const footerText = {
  fontSize: '12px',
  color: '#64748b',
  textAlign: 'center' as const,
  margin: '8px 0',
};

const footerLink = {
  color: '#3b82f6',
  textDecoration: 'underline',
};

export default DeliveryConfirmationEmail;
