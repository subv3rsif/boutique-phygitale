import type { Metadata } from "next";
// Luxury Minimal Fonts - Zara/COS inspired
import { Josefin_Sans, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeScript } from "./theme-script";
import { Header } from "@/components/layout/header";
import { ClientLayoutWrapper } from "@/components/layout/client-layout-wrapper";
import { Toaster } from "@/components/ui/sonner";

// Display: 1885 geometric sans for refined titles
const josefin = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '600', '700'],
  display: 'swap',
});

// Sans: Modern geometric for UI (clean, architectural)
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

// Mono: Technical details
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "Boutique Ville - Goodies officiels",
    template: "%s | Boutique Ville",
  },
  description: "Boutique en ligne officielle de la ville. Commandez vos goodies avec livraison à domicile ou retrait gratuit à La Fabrik.",
  keywords: ["boutique", "ville", "goodies", "cadeaux", "municipalité", "livraison", "retrait", "La Fabrik"],
  authors: [{ name: "Ville" }],
  creator: "Ville",
  publisher: "Ville",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    title: "Boutique Ville - Goodies officiels",
    description: "Boutique en ligne officielle de la ville. Commandez vos goodies avec livraison ou retrait sur place.",
    siteName: "Boutique Ville",
  },
  twitter: {
    card: "summary_large_image",
    title: "Boutique Ville - Goodies officiels",
    description: "Boutique en ligne officielle de la ville. Commandez vos goodies avec livraison ou retrait sur place.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add Google Search Console verification if needed
    // google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${josefin.variable} ${dmSans.variable} ${jetbrains.variable} font-sans antialiased`}>
        <ThemeProvider>
          <Header />
          <main className="min-h-[calc(100vh-4rem)] pb-24">{children}</main>
          <footer className="w-full border-t py-8 mt-12 mb-20">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
              <div className="flex justify-center gap-4 mb-4">
                <a href="/mentions-legales" className="hover:underline focus-magenta rounded px-2 py-1">
                  Mentions légales
                </a>
                <a href="/politique-confidentialite" className="hover:underline focus-magenta rounded px-2 py-1">
                  Politique de confidentialité
                </a>
                <a href="/cgv" className="hover:underline focus-magenta rounded px-2 py-1">
                  CGV
                </a>
              </div>
              <p>© 2026 Boutique 1885 - Édition municipale</p>
            </div>
          </footer>
          <ClientLayoutWrapper />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
