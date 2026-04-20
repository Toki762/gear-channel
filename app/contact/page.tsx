// =============================================================
// Contact Page — お問い合わせ
// =============================================================
import type { Metadata } from 'next';
import Link from 'next/link';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gear-channel.vercel.app';

export const metadata: Metadata = {
  title: 'お問い合わせ — Gear ちゃんねる',
  description: 'Gear ちゃんねるへのお問い合わせページ。機材情報の修正・ご意見・ご要望はこちらから。',
  alternates: { canonical: `${BASE_URL}/contact` },
  openGraph: {
    title: 'お問い合わせ — Gear ちゃんねる',
    description: 'Gear ちゃんねるへのお問い合わせページ。',
    url: `${BASE_URL}/contact`,
    siteName: 'Gear ちゃんねる',
    locale: 'ja_JP',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <main className="page fade">
      <div className="bc"><Link href="/">ホーム</Link> › お問い合わせ</div>
      <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>お問い合わせ</h1>
      <p style={{ color: '#777', fontSize: '13px', marginBottom: '28px' }}>
        機材情報の誤りのご指摘・ご意見・ご要望などはこちらからどうぞ。
      </p>

      <div className="prose-block">
        <p>
          以下のGoogleフォームよりお問い合わせいただけます。通常2〜5営業日以内にご返信いたします。
        </p>

        <div id="contact-form-wrap" style={{
          background: '#fafaf8',
          border: '1px solid #e4e2dd',
          borderRadius: '12px',
          padding: '28px',
          marginTop: '20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📬</div>
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>お問い合わせフォーム</div>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
            ※ Googleフォームが開きます
          </div>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSe7vyVthjYuapRoN3ys1LWcgqWFXjtIALnRms25GO6Gg88Irw/viewform"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: '#1a1a1a',
              color: '#fff',
              padding: '12px 28px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            フォームを開く →
          </a>
        </div>

        <div style={{ marginTop: '28px', padding: '16px', background: '#fffbeb', borderRadius: '8px', fontSize: '13px', color: '#92600a' }}>
          <strong>📌 よくあるお問い合わせ</strong>
          <ul style={{ marginTop: '8px', paddingLeft: '18px' }}>
            <li>掲載機材の誤り・情報更新のご依頼</li>
            <li>アーティストの追加リクエスト</li>
            <li>掲示板の不適切な投稿の報告</li>
            <li>リンク切れ・表示バグのご報告</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
