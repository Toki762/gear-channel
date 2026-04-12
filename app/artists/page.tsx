// =============================================================
// Artists Listing Page — Server Component
// =============================================================
import type { Metadata } from 'next';
import Link from 'next/link';
import { DB } from '@/data/artists';
import { ARTIST_KANA } from '@/data/config';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gear-channel.vercel.app';

export const metadata: Metadata = {
  title: 'アーティスト一覧',
  description: `Official髭男dism・YOASOBI・King Gnu・RADWIMPSなど${DB.length}組のアーティストが使用しているギター・ベース・シンセ・エフェクター機材情報をまとめています。`,
  alternates: { canonical: `${BASE_URL}/artists` },
  openGraph: {
    title: 'アーティスト一覧 | Gear ちゃんねる',
    description: `${DB.length}組のアーティストの機材情報を網羅。使用ギター・エフェクター・DAWを調べよう。`,
    url: `${BASE_URL}/artists`,
    siteName: 'Gear ちゃんねる',
    locale: 'ja_JP',
    type: 'website',
  },
};

interface Props {
  searchParams: { q?: string };
}

export default function ArtistsPage({ searchParams }: Props) {
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
    <main className="page fade">
      <div className="bc"><Link href="/">ホーム</Link> › アーティスト一覧</div>
      <h1 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>
        🎵 アーティスト一覧
        {q && <span style={{ fontSize: '14px', color: '#888', fontWeight: 400, marginLeft: '8px' }}>「{q}」の検索結果 {filtered.length}件</span>}
      </h1>
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#aaa', padding: '40px 0' }}>
          「{q}」に一致するアーティストが見つかりませんでした
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

      {/* JSON-LD: ItemList（検索結果でのリッチ表示対応） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'アーティスト一覧 — Gear ちゃんねる',
          description: `${DB.length}組のアーティストの機材情報`,
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
    </main>
  );
}
