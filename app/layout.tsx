import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Analytics } from '@vercel/analytics/react';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gear-channel.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Gear ちゃんねる — アーティストの機材を調べよう',
    template: '%s | Gear ちゃんねる',
  },
  description: '日本のアーティストが使用している機材・ギター・シンセ・エフェクターを調べるサイト。掲示板でミュージシャンと語ろう。',
  openGraph: {
    siteName: 'Gear ちゃんねる',
    locale: 'ja_JP',
    type: 'website',
    // OGP画像は app/opengraph-image.tsx で自動生成される
  },
  twitter: {
    card: 'summary_large_image',
    // Twitter画像も opengraph-image.tsx から自動適用
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
  return (
    <html lang="ja">
      <body>
        <Header />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
