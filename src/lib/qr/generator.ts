import QRCode from 'qrcode';

/**
 * QR Code Generator
 * Creates QR codes for pickup orders
 */

export type QRCodeOptions = {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  width?: number;
  color?: {
    dark?: string;
    light?: string;
  };
};

/**
 * Generate QR code as Data URL (base64)
 * Perfect for embedding in emails
 */
export async function generateQRCodeDataURL(
  data: string,
  options?: QRCodeOptions
): Promise<string> {
  const defaultOptions: QRCodeOptions = {
    errorCorrectionLevel: 'H', // High error correction for damaged codes
    margin: 2,
    width: 400,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    const dataURL = await QRCode.toDataURL(data, mergedOptions);
    return dataURL;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error('QR code generation failed');
  }
}

/**
 * Generate QR code as Buffer (for server-side operations)
 */
export async function generateQRCodeBuffer(
  data: string,
  options?: QRCodeOptions
): Promise<Buffer> {
  const defaultOptions: QRCodeOptions = {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 400,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    const buffer = await QRCode.toBuffer(data, mergedOptions);
    return buffer;
  } catch (error) {
    console.error('Failed to generate QR code buffer:', error);
    throw new Error('QR code generation failed');
  }
}

/**
 * Generate pickup QR code URL
 * This is the URL that the QR code will encode
 */
export function generatePickupQRCodeURL(token: string, appUrl?: string): string {
  const baseUrl = appUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/retrait/${token}`;
}

/**
 * Generate QR code for pickup order
 * Convenience function that creates the full QR code data URL
 */
export async function generatePickupQRCode(
  token: string,
  appUrl?: string
): Promise<string> {
  const url = generatePickupQRCodeURL(token, appUrl);
  return await generateQRCodeDataURL(url);
}
