// =============================================================
// Home Page — Server Component
// =============================================================
import type { Metadata } from 'next';
import Link from 'next/link';
import { DB } from '@/data/artists';
import { POPULAR_IDS } from '@/data/config';
import { fetchPosts, createServerClient } from '@/lib/supabase';
import BuybackBanner from '@/components/BuybackBanner';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gear-channel.com';

export const metadata: Metadata = {
  title: 'Gear ちゃんねる — アーティストの使用機材のデータベースを皆で作ろう',
  description: '日本のアーティストが使用しているギター・ベース・シンセ・エフェクター・DAWを調べるサイト。Official髭男dism・YOASOBI・King Gnuなど人気アーティストの機材情報が充実。',
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: 'Gear ちゃんねる — アーティストの使用機材のデータベースを皆で作ろう',
    description: '日本のアーティストが使用しているギター・ベース・シンセ・エフェクター・DAWを調べるサイト。',
    url: BASE_URL,
    siteName: 'Gear ちゃんねる',
    locale: 'ja_JP',
    type: 'website',
    // OGP画像は app/opengraph-image.tsx で自動生成
  },
};

export default async function HomePage() {
  // 人気アーティスト（artist_views のビュー数順 → フォールバックで POPULAR_IDS）
  let popularArtists: typeof DB = [];
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('artist_views')
      .select('artist_id, view_count')
      .order('view_count', { ascending: false })
      .limit(12); // 余裕を持って取得し、DB に存在するアーティストのみ表示
    if (data && data.length > 0) {
      popularArtists = data
        .map(row => DB.find(a => a.id === row.artist_id))
        .filter(Boolean) as typeof DB;
    }
  } catch {
    // artist_views テーブル未作成の場合は無視
  }
  // 6件未満なら POPULAR_IDS で補完
  if (popularArtists.length < 6) {
    const existing = new Set(popularArtists.map(a => a.id));
    const fallback = POPULAR_IDS
      .filter(id => !existing.has(id))
      .map(id => DB.find(a => a.id === id))
      .filter(Boolean) as typeof DB;
    popularArtists = [...popularArtists, ...fallback].slice(0, 6);
  } else {
    popularArtists = popularArtists.slice(0, 6);
  }

  // 人気スレッド（votes順 上位5件）
  let popularPosts: any[] = [];
  try {
    const result = await fetchPosts({ sort: 'pop', pageSize: 5 });
    popularPosts = result.posts;
  } catch {
    // Supabase接続エラー時はスキップ
  }

  return (
    <main className="page-with-sidebar fade">
      {/* 左サイドバー広告 */}
      <aside className="page-sidebar-left">
        <div className="page-sidebar-label">PR</div>
        <BuybackBanner />
      </aside>

      <div className="page-main">
      {/* Hero */}
      <div className="hero">
        <h1>Gear <span style={{ color: '#d97706' }}>ちゃんねる</span></h1>
        <p style={{ color: '#888', fontSize: '13px' }}>
          アーティストの使用機材のデータベースを皆で作ろう
        </p>
      </div>

      {/* 人気アーティスト */}
      <section style={{ marginBottom: '36px' }}>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#888', letterSpacing: '0.5px' }}>
            🔥 人気アーティスト
          </div>
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
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
          <Link href="/artists" style={{ fontSize: '13px', color: '#d97706', fontWeight: 600, textDecoration: 'none' }}>
            全てのアーティストを見る →
          </Link>
        </div>
      </section>

      {/* 人気スレッド */}
      {popularPosts.length > 0 && (
        <section style={{ marginBottom: '36px' }}>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#888', letterSpacing: '0.5px' }}>
              💬 人気のスレッド
            </div>
          </div>
          <div>
            {popularPosts.map(p => (
              <Link key={p.id} href={`/bbs?post=${p.id}`} className="post-card" style={{ display: 'block', marginBottom: '8px', textDecoration: 'none' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 14px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '3px' }}>
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
          <div style={{ textAlign: 'right', marginTop: '10px' }}>
            <Link href="/bbs" style={{ fontSize: '13px', color: '#d97706', fontWeight: 600, textDecoration: 'none' }}>
              掲示板をもっと見る →
            </Link>
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
      </div>{/* /page-main */}

      {/* 右サイドバー広告 */}
      <aside className="page-sidebar">
        <div className="page-sidebar-label">PR</div>
        <BuybackBanner variant="image" />
      </aside>
    </main>
  );
}
