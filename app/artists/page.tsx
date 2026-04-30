// =============================================================
// Artists Listing Page — Server Component（多言語対応）
// =============================================================
import type { Metadata } from 'next';
import Link from 'next/link';
import { DB } from '@/data/artists';
import { ARTIST_KANA } from '@/data/config';
import { getLocale, t } from '@/lib/i18n';
import BuybackBanner from '@/components/BuybackBanner';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gear-channel.com';

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const isEn = locale === 'en';

  return {
    title: isEn ? 'All Artists' : 'アーティスト一覧',
    description: isEn
      ? `Browse gear used by ${DB.length} artists — guitars, basses, synths, effects, DAWs and more.`
      : `Official髭男dism・YOASOBI・King Gnu・RADWIMPSなど${DB.length}組のアーティストが使用しているギター・ベース・シンセ・エフェクター機材情報をまとめています。`,
    alternates: { canonical: `${BASE_URL}/artists` },
    openGraph: {
      title: isEn ? `All Artists | Gear Channel` : 'アーティスト一覧 | Gear ちゃんねる',
      description: isEn
        ? `${DB.length} artists' gear — guitars, effects, synths & more.`
        : `${DB.length}組のアーティストの機材情報を網羅。使用ギター・エフェクター・DAWを調べよう。`,
      url: `${BASE_URL}/artists`,
      siteName: isEn ? 'Gear Channel' : 'Gear ちゃんねる',
      locale: isEn ? 'en_US' : 'ja_JP',
      type: 'website',
    },
  };
}

interface Props {
  searchParams: { q?: string };
}

export default function ArtistsPage({ searchParams }: Props) {
  const locale = getLocale();
  const q = (searchParams.q ?? '').toLowerCase();

  const filtered = (q
    ? DB.filter(a => {
        const kana = ARTIST_KANA[a.id] ?? '';
        return (
          a.name.toLowerCase().includes(q) ||
          (a.en ?? '').toLowerCase().includes(q) ||
          kana.includes(q) ||
          a.genre.toLowerCase().includes(q)
        );
      })
    : [...DB]
  ).sort((a, b) => {
    const ka = ARTIST_KANA[a.id] ?? a.name;
    const kb = ARTIST_KANA[b.id] ?? b.name;
    return ka.localeCompare(kb, 'ja');
  });

  return (
    <main className="page-with-sidebar fade">
      {/* 左サイドバー広告 */}
      <aside className="page-sidebar-left">
        <div className="page-sidebar-label">PR</div>
        <BuybackBanner />
      </aside>

      {/* メインコンテンツ */}
      <div className="page-main">
        <div className="bc">
          <Link href="/">{t(locale, 'bcHome')}</Link> › {t(locale, 'bcArtists')}
        </div>
        <h1 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>
          🎵 {t(locale, 'artistsPageTitle')}
          {q && (
            <span style={{ fontSize: '14px', color: '#888', fontWeight: 400, marginLeft: '8px' }}>
              {t(locale, 'artistsResults', { q, n: filtered.length })}
            </span>
          )}
        </h1>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '40px 0' }}>
            {t(locale, 'artistsNoResults', { q })}
          </div>
        ) : (
          <div className="a-grid">
            {filtered.map(a => (
              <Link key={a.id} href={`/artists/${a.id}`} className="a-card">
                <div className="a-name">{a.name}</div>
                <div className="a-en">{a.en}</div>
                <div className="a-meta" style={{ marginTop: '4px' }}>
                  <span className="tag">{a.genre}</span>
                  <span className="tag" style={{ marginLeft: '4px' }}>{a.since}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                  {(a.desc || '').slice(0, 60)}…
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* JSON-LD: ItemList */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: locale === 'en' ? 'All Artists — Gear Channel' : 'アーティスト一覧 — Gear ちゃんねる',
            description: `${DB.length} artists' gear database`,
            url: `${BASE_URL}/artists`,
            numberOfItems: filtered.length,
            itemListElement: filtered.slice(0, 30).map((a, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `${BASE_URL}/artists/${a.id}`,
              name: a.name,
            })),
          })}}
        />
      </div>

      {/* 右サイドバー広告 */}
      <aside className="page-sidebar">
        <div className="page-sidebar-label">PR</div>
        <BuybackBanner variant="image" />
      </aside>
    </main>
  );
}
