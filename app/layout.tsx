import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Gear ちゃんねる — アーティストの機材を調べよう',
  description: '日本のアーティストが使用している機材・ギター・シンセ・エフェクターを調べるサイト。掲示板でミュージシャンと語ろう。',
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
