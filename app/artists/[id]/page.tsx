// =============================================================
// Artist Detail Page — Server Component
// =============================================================
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DB } from '@/data/artists';
import GearSection from './GearSection';
import ViewTracker from './ViewTracker';
import AdUnit from '@/components/AdUnit';
import BuybackBanner from '@/components/BuybackBanner';
import { getLocale, t } from '@/lib/i18n';
import { createServerClient } from '@/lib/supabase';
import type { GearItem } from '@/lib/types';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gear-channel.com';

// ISR: 1時間ごとに再検証（Vercel無料枠のCPU消費を抑える）
export const revalidate = 3600;

interface Props {
  params: { id: string };
}

// ── 静的パスを事前生成（ISR / Static Generation）────────────
export function generateStaticParams() {
  return DB.map(a => ({ id: a.id }));
}

// ── OGP メタデータ ────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artist = DB.find(a => a.id === params.id);
  if (!artist) return { title: 'Not Found' };

  const locale = getLocale();
  const isEn = locale === 'en';

  // メンバー名を抽出
  const memberNames = (artist.members ?? '')
    .split(/[、,，\n\/]|(?<=[^\s])\s*\(/)
    .map(s => s.replace(/[（(）)].*/g, '').trim())
    .filter(s => s.length > 0 && s !== artist.name);
  const memberStr = memberNames.length > 0 ? `${memberNames.slice(0, 4).join('・')} ` : '';

  // 機材名を上位6件抽出
  const topGear = (artist.gear ?? []).slice(0, 6).map(g => [g.brand, g.name].filter(Boolean).join(' '));

  const title = isEn
    ? `${artist.en ?? artist.name} Gear & Equipment — Gear Channel`
    : `${artist.name} の機材・使用ギター・エフェクター — Gear ちゃんねる`;

  const description = isEn
    ? `${artist.en ?? artist.name} gear list — guitars, basses, effects, synths & more. ${topGear.slice(0, 3).join(', ')}.`
    : `${memberStr}${artist.name}（${artist.en}）が使用するギター・ベース・エフェクターを一覧で確認。${topGear.slice(0, 3).join('、')}など。${(artist.desc || '').slice(0, 60)}`;

  return {
    title,
    description,
    keywords: [artist.name, artist.en, ...memberNames, ...topGear, 'guitar', 'gear', 'effects', 'Gear Channel'].filter(Boolean),
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/artists/${artist.id}`,
      siteName: isEn ? 'Gear Channel' : 'Gear ちゃんねる',
      locale: isEn ? 'en_US' : 'ja_JP',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/artists/${artist.id}`,
    },
  };
}

// ── Page ──────────────────────────────────────────────────
export default async function ArtistPage({ params }: Props) {
  const artist = DB.find(a => a.id === params.id);
  if (!artist) notFound();
  const locale = getLocale();

  // Supabase から管理者追加の機材を取得し GearItem 形式に変換
  let dbGear: GearItem[] = [];
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('db_gear')
      .select('*')
      .eq('artist_id', params.id)
      .order('created_at', { ascending: true });
    if (!error && data) {
      dbGear = data.map((item: any): GearItem => ({
        id: `db_${item.id}`,
        brand: item.brand ?? '',
        name: item.name,
        cat: item.cat ?? 'その他',
        catIcon: item.cat_icon ?? '🎵',
        user: item.user ?? '',
        price: item.price ?? '',
        kw: item.kw || item.name,
        yt: [`${item.name} レビュー`, `${item.name} サウンドデモ`, `${item.name} 使い方`],
        similar: [],
        desc: item.gear_desc ?? '',
        wikiTitle: '',
        imageUrl: item.image_url || undefined,
      }));
    }
  } catch {
    // db_gearテーブル未作成の場合は無視
  }

  // 機材リスト（全カテゴリをフラットに展開）
  const gearNames: string[] = Object.values(artist.gear ?? {})
    .flat()
    .map((g: any) => g?.name ?? g)
    .filter(Boolean);

  // JSON-LD 構造化データ
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `${artist.name} の使用機材`,
    description: `${artist.name}が実際に使用しているギター・エフェクター・シンセなどの機材一覧`,
    url: `${BASE_URL}/artists/${artist.id}`,
    mainEntity: {
      '@type': 'MusicGroup',
      name: artist.name,
      alternateName: artist.en,
      genre: artist.genre,
      foundingDate: artist.since,
      description: artist.desc ?? '',
    },
    ...(gearNames.length > 0 && {
      mentions: gearNames.slice(0, 10).map(name => ({
        '@type': 'Product',
        name,
      })),
    }),
  };

  return (
    <main className="page-with-sidebar fade">
      {/* 左サイドバー広告 */}
      <aside className="page-sidebar-left">
        <div className="page-sidebar-label">PR</div>
        <BuybackBanner />
      </aside>

      <ViewTracker artistId={params.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* メインコンテンツ */}
      <div className="page-main">
        <nav className="bc">
          <a href="/">{t(locale, 'bcHome')}</a> › <a href="/artists">{t(locale, 'bcArtists')}</a> › {artist.name}
        </nav>

        <div className="art-hd">
          <div className="art-name">{artist.name}</div>
          <div className="art-en">{artist.en}</div>
          <div className="art-meta">
            <span className="tag">{artist.genre}</span>
            <span className="tag">{artist.since}</span>
            <span className="tag">{artist.origin}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#888', lineHeight: 1.7 }}>{artist.members}</div>
          {artist.desc && (
            <p style={{ marginTop: '14px', fontSize: '13px', color: '#ccc', lineHeight: 1.8 }}>
              {artist.desc}
            </p>
          )}
        </div>

        <GearSection artist={artist} dbGear={dbGear} locale={locale} />

        <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTIST ?? ''} className="my-6" />
      </div>

      {/* 右サイドバー広告（スクロールしても常に見える） */}
      <aside className="page-sidebar">
        <div className="page-sidebar-label">PR</div>
        <BuybackBanner variant="image" />
      </aside>
    </main>
  );
}
