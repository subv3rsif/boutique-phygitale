import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
  Img,
} from '@react-email/components';
import { formatCurrency } from '@/lib/catalogue';

/**
 * Pickup Confirmation Email Template
 * Sent when a pickup order is confirmed (after successful payment)
 * Includes QR code for pickup validation
 */

type PickupConfirmationEmailProps = {
  order: {
    id: string;
    items: Array<{
      nameSnapshot: string;
      qty: number;
      unitPriceCents: number;
    }>;
    itemsTotalCents: number;
    grandTotalCents: number;
    customerEmail: string;
  };
  qrCodeDataURL: string; // Base64 QR code image
  pickupToken: string; // Clear token for backup URL
};

export function PickupConfirmationEmail({
  order,
  qrCodeDataURL,
  pickupToken,
}: PickupConfirmationEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const pickupLocation = process.env.NEXT_PUBLIC_PICKUP_LOCATION_NAME || 'La Fabrik';
  const pickupAddress =
    process.env.NEXT_PUBLIC_PICKUP_LOCATION_ADDRESS ||
    '123 Rue de la République, 75001 Paris';
  const pickupHours =
    process.env.NEXT_PUBLIC_PICKUP_LOCATION_HOURS || 'Lundi-Vendredi 9h-18h';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={title}>Votre commande est prête à retirer</Text>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Bonjour,</Text>

            <Text style={paragraph}>
              Votre commande a été confirmée et sera disponible pour retrait dans les
              prochaines 24 heures.
            </Text>

            <Hr style={hr} />

            {/* QR Code Section */}
            <Section style={qrSection}>
              <Text style={heading}>Votre QR Code de retrait</Text>
              <Text style={paragraph}>
                Présentez ce QR code au comptoir de {pickupLocation} pour récupérer votre
                commande.
              </Text>

              <div style={qrContainer}>
                <Img src={qrCodeDataURL} alt="QR Code de retrait" style={qrImage} />
              </div>

              <div style={warningBox}>
                <Text style={warningText}>
                  ⚠️ <strong>Important</strong> : Ce QR code est valable 30 jours et à
                  usage unique.
                </Text>
              </div>
            </Section>

            <Hr style={hr} />

            {/* Pickup Instructions */}
            <Section>
              <Text style={heading}>Instructions de retrait</Text>

              <div style={infoBox}>
                <Text style={infoLabel}>📍 Lieu :</Text>
                <Text style={infoValue}>{pickupLocation}</Text>
                <Text style={infoValue}>{pickupAddress}</Text>
              </div>

              <div style={infoBox}>
                <Text style={infoLabel}>🕐 Horaires :</Text>
                <Text style={infoValue}>{pickupHours}</Text>
              </div>

              <div style={infoBox}>
                <Text style={infoLabel}>✓ À faire :</Text>
                <Text style={infoValue}>1. Présentez-vous au comptoir</Text>
                <Text style={infoValue}>
                  2. Montrez ce QR code (sur votre téléphone ou imprimé)
                </Text>
                <Text style={infoValue}>
                  3. Le staff validera votre retrait et vous remettra votre commande
                </Text>
              </div>
            </Section>

            <Hr style={hr} />

            {/* Order Summary */}
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
              <Text style={totalLabel}>Total TTC :</Text>
              <Text style={totalValue}>{formatCurrency(order.grandTotalCents)}</Text>
            </Section>

            <Hr style={hr} />

            {/* Backup Link */}
            <Section>
              <Text style={paragraph}>
                <strong>Vous ne trouvez plus cet email ?</strong>
              </Text>
              <Text style={paragraph}>
                Retrouvez votre QR code à tout moment sur :
              </Text>
              <Link href={`${appUrl}/ma-commande/${order.id}`} style={link}>
                Voir ma commande
              </Link>
              <Text style={smallText}>
                Ou utilisez ce lien direct :<br />
                <Link href={`${appUrl}/retrait/${pickupToken}`} style={linkSmall}>
                  {appUrl}/retrait/{pickupToken}
                </Link>
              </Text>
            </Section>
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

const qrSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const qrContainer = {
  padding: '24px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  margin: '16px 0',
};

const qrImage = {
  width: '300px',
  height: '300px',
  margin: '0 auto',
  display: 'block',
};

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '6px',
  padding: '12px 16px',
  margin: '16px 0',
};

const warningText = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0',
  textAlign: 'center' as const,
};

const infoBox = {
  marginBottom: '16px',
  padding: '12px',
  backgroundColor: '#f8fafc',
  borderRadius: '6px',
};

const infoLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 8px 0',
};

const infoValue = {
  fontSize: '14px',
  color: '#475569',
  margin: '4px 0',
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
  padding: '16px 0',
};

const totalLabel = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0',
};

const totalValue = {
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

const linkSmall = {
  color: '#3b82f6',
  textDecoration: 'underline',
  fontSize: '12px',
  wordBreak: 'break-all' as const,
};

const smallText = {
  fontSize: '12px',
  color: '#64748b',
  margin: '8px 0',
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

export default PickupConfirmationEmail;
