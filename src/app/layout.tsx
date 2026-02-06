import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Header />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <footer className="border-t py-8 mt-12">
          <div className="container text-center text-sm text-muted-foreground">
            <div className="flex justify-center gap-4 mb-4">
              <a href="/mentions-legales" className="hover:underline">
                Mentions légales
              </a>
              <a href="/politique-confidentialite" className="hover:underline">
                Politique de confidentialité
              </a>
              <a href="/cgv" className="hover:underline">
                CGV
              </a>
            </div>
            <p>© 2024 Ville - Boutique officielle</p>
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
