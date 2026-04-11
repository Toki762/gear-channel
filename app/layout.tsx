import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
  },
  twitter: {
    card: 'summary',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
