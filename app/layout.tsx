import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Analytics } from '@vercel/analytics/react';
import { getLocale } from '@/lib/i18n';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gear-channel.com';
const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Gear ちゃんねる — アーティストの機材を調べよう',
    template: '%s | Gear ちゃんねる',
  },
  description: '日本のアーティストが使用している機材・ギター・シンセ・エフェクターを調べるサイト。掲示板でミュージシャンと語ろう。',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    siteName: 'Gear ちゃんねる',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();

  return (
    <html lang={locale === 'en' ? 'en' : 'ja'}>
      <head>
        {adsenseId && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>
        <Header locale={locale} />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
