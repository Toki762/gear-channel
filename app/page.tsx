// =============================================================
// Home Page — Server Component
// =============================================================
import type { Metadata } from 'next';
import Link from 'next/link';
import { DB } from '@/data/artists';
import { POPULAR_IDS } from '@/data/config';
import { fetchPosts } from '@/lib/supabase';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gear-channel.vercel.app';

export const metadata: Metadata = {
  title: 'Gear ちゃんねる — アーティストの機材を調べよう',
  description: '日本のアーティストが使用しているギター・ベース・シンセ・エフェクター・DAWを調べるサイト。Official髭男dism・YOASOBI・King Gnuなど人気アーティストの機材情報が充実。',
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: 'Gear ちゃんねる — アーティストの機材を調べよう',
    description: '日本のアーティストが使用しているギター・ベース・シンセ・エフェクター・DAWを調べるサイト。',
    url: BASE_URL,
    siteName: 'Gear ちゃんねる',
    locale: 'ja_JP',
    type: 'website',
    // OGP画像は app/opengraph-image.tsx で自動生成
  },
};

export default async function HomePage() {
  // 人気アーティスト（POPULAR_IDS の順、先頭6件）
  const popularArtists = POPULAR_IDS
    .map(id => DB.find(a => a.id === id))
    .filter(Boolean)
    .slice(0, 6) as typeof DB;

  // 人気スレッド（votes順 上位5件）
  let popularPosts: any[] = [];
  try {
    const result = await fetchPosts({ sort: 'pop', pageSize: 5 });
    popularPosts = result.posts;
  } catch {
    // Supabase接続エラー時はスキップ
  }

  return (
    <main className="page fade">
      {/* Hero */}
      <div className="hero">
        <h1>Gear <span style={{ color: '#d97706' }}>ちゃんねる</span></h1>
        <p style={{ color: '#888', fontSize: '13px' }}>
          アーティストが使用している機材を調べよう
        </p>
      </div>

      {/* 人気アーティスト */}
      <section style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#888', letterSpacing: '0.5px' }}>
            🔥 人気アーティスト
          </div>
          <Link href="/artists" style={{ fontSize: '13px', color: '#d97706', fontWeight: 600, textDecoration: 'none' }}>
            全てのアーティストを見る →
          </Link>
        </div>
        <div className="featured-grid">
          {popularArtists.map((a, i) => (
            <Link key={a.id} href={`/artists/${a.id}`} className="featured-card">
              <div className="featured-name">{a.name}</div>
              <div className="featured-en">{a.en}</div>
              <div style={{ marginTop: '8px' }}>
                <span className="featured-badge">{a.genre}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 人気スレッド */}
      {popularPosts.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#888', letterSpacing: '0.5px' }}>
              💬 人気のスレッド
            </div>
            <Link href="/bbs" style={{ fontSize: '13px', color: '#d97706', fontWeight: 600, textDecoration: 'none' }}>
              掲示板をもっと見る →
            </Link>
          </div>
          <div>
            {popularPosts.map(p => (
              <Link key={p.id} href={`/bbs?post=${p.id}`} className="post-card" style={{ display: 'block', marginBottom: '8px', textDecoration: 'none' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 14px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '3px' }}>
                      <span className={`flair f-${p.flair}`}>{p.flair}</span>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{p.title}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {(p.body || '').slice(0, 80)}…
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* JSON-LD: WebSite + Sitelinks Searchbox */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebSite',
              '@id': `${BASE_URL}/#website`,
              url: BASE_URL,
              name: 'Gear ちゃんねる',
              description: '日本のアーティストが使用している機材・ギター・シンセ・エフェクターを調べるサイト',
              inLanguage: 'ja',
              potentialAction: {
                '@type': 'SearchAction',
                target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/artists?q={search_term_string}` },
                'query-input': 'required name=search_term_string',
              },
            },
            {
              '@type': 'CollectionPage',
              '@id': `${BASE_URL}/#collection`,
              url: BASE_URL,
              name: 'Gear ちゃんねる',
              description: '日本のアーティストが使用している機材・ギター・シンセ・エフェクターを調べるサイト',
              inLanguage: 'ja',
              isPartOf: { '@id': `${BASE_URL}/#website` },
              hasPart: DB.slice(0, 20).map(a => ({
                '@type': 'WebPage',
                url: `${BASE_URL}/artists/${a.id}`,
                name: `${a.name} の機材`,
              })),
            },
          ],
        })}}
      />
    </main>
  );
}
