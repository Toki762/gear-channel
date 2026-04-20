// =============================================================
// About Page — 運営者情報
// =============================================================
import type { Metadata } from 'next';
import Link from 'next/link';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gear-channel.vercel.app';

export const metadata: Metadata = {
  title: '運営者情報 — Gear ちゃんねる',
  description: 'Gear ちゃんねるの運営者情報・サイト概要です。',
  alternates: { canonical: `${BASE_URL}/about` },
  openGraph: {
    title: '運営者情報 — Gear ちゃんねる',
    description: 'Gear ちゃんねるの運営者情報・サイト概要です。',
    url: `${BASE_URL}/about`,
    siteName: 'Gear ちゃんねる',
    locale: 'ja_JP',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <main className="page fade">
      <div className="bc"><Link href="/">ホーム</Link> › 運営者情報</div>
      <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>運営者情報</h1>

      <div className="prose-block">

        <h2>サイトについて</h2>
        <p>
          「Gear ちゃんねる」は、日本のアーティストが実際に使用している音楽機材（ギター・ベース・エフェクター・シンセサイザー・DAWなど）を
          調べることができる情報サイトです。
        </p>
        <p>
          「あのアーティストのあの音、どうやって出してるんだろう？」という疑問を持つ音楽ファンや、
          機材選びの参考にしたいミュージシャンのために、公開情報をもとに機材情報を整理・掲載しています。
        </p>

        <h2>運営の目的</h2>
        <ul>
          <li>アーティストの使用機材を一箇所で調べられる場所を作る</li>
          <li>音楽制作・バンド活動をしている人が機材を比較・検討しやすくする</li>
          <li>掲示板を通じて、機材好きのコミュニティを育てる</li>
        </ul>

        <h2>掲載情報について</h2>
        <p>
          機材情報はライブ映像・インタビュー記事・メーカー公式情報などの公開情報をもとに作成しています。
          情報は変わることがあるため、最新の状況と異なる場合があります。
          誤情報のご指摘は<Link href="/contact">お問い合わせ</Link>よりお知らせください。
        </p>

        <h2>広告・アフィリエイトについて</h2>
        <p>
          当サイトはAmazonアソシエイト・楽天アフィリエイト・バリューコマース（サウンドハウス）・Yahoo!ショッピングのアフィリエイトプログラムに参加しています。
          機材の購入リンクをクリックして商品を購入された場合、当サイトに紹介料が支払われることがあります。
          これにより、利用者の方のご購入金額が増えることは一切ありません。
        </p>
        <p>
          紹介料はサイトの運営・コンテンツ制作費に充てています。
        </p>

        <h2>お問い合わせ</h2>
        <p>
          サイトに関するご意見・ご要望・機材情報の修正依頼などは<Link href="/contact">お問い合わせページ</Link>よりお気軽にどうぞ。
        </p>

      </div>
    </main>
  );
}
