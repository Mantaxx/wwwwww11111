import ClientProviders from '@/components/providers/ClientProviders';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`
  ),
  title: 'Palka MTM - Mistrzowie Sprintu | Golebie Pocztowe',
  description:
    'Ekskluzywna platforma aukcyjna dla hodowcow golebi pocztowych. Kupuj i sprzedawaj championow z rodowodami.',
  keywords: 'golebie pocztowe, aukcje, hodowla, championy, rodowody, Palka MTM, mistrzowie sprintu',
  authors: [{ name: 'Palka MTM - Mistrzowie Sprintu' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Palka MTM - Mistrzowie Sprintu',
    description: 'Ekskluzywna platforma aukcyjna dla hodowcow golebi pocztowych',
    type: 'website',
    locale: 'pl_PL',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Palka MTM - Mistrzowie Sprintu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Palka MTM - Mistrzowie Sprintu',
    description: 'Ekskluzywna platforma aukcyjna dla hodowcow golebi pocztowych',
    images: ['/logo.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          precedence="default"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-900 text-white relative bg-cover bg-top bg-no-repeat bg-fixed pigeon-lofts-background">
        {/* Nakładka dla kontrastu (jaśniejsza, aby zdjęcie było widoczne) */}
        <div className="absolute inset-0 bg-black/30 -z-10" />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
