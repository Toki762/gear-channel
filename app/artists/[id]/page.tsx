// =============================================================
// Artist Detail Page — Server Component
// =============================================================
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DB } from '@/data/artists';
import GearSection from './GearSection';
import DbGearSection from './DbGearSection';
import { createServerClient } from '@/lib/supabase';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gear-channel.vercel.app';

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

  const title = `${artist.name} の機材・使用ギター・エフェクター — Gear ちゃんねる`;
  const description = `${artist.name}（${artist.en}）が実際に使用しているギター・ベース・シンセ・エフェクターなどの機材を一覧で確認できます。${(artist.desc || '').slice(0, 80)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/artists/${artist.id}`,
      siteName: 'Gear ちゃんねる',
      locale: 'ja_JP',
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

  // Supabase から管理者追加の機材を取得（テーブルが存在しない場合はスキップ）
  let dbGear: any[] = [];
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('db_gear')
      .select('*')
      .eq('artist_id', params.id)
      .order('created_at', { ascending: false });
    if (!error && data) dbGear = data;
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
    <main className="page fade">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* パンくず */}
      <nav className="bc">
        <a href="/">ホーム</a> › <a href="/artists">アーティスト一覧</a> › {artist.name}
      </nav>

      {/* アーティストヘッダー */}
      <div className="art-hd">
        <div className="art-name">{artist.name}</div>
        <div className="art-en">{artist.en}</div>
        <div className="art-meta">
          <span className="tag">{artist.genre}</span>
          <span className="tag">{artist.since}</span>
          <span className="tag">{artist.origin}</span>
        </div>
        <div style={{ fontSize: '12px', color: '#888', lineHeight: 1.7 }}>{artist.members}</div>
      </div>

      {/* 機材セクション（TypeScript静的データ） */}
      <GearSection artist={artist} />

      {/* 管理者が追加した機材（Supabase） */}
      {dbGear && dbGear.length > 0 && (
        <DbGearSection gear={dbGear} />
      )}
    </main>
  );
}
