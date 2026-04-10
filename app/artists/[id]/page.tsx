// =============================================================
// Artist Detail Page — Server Component
// =============================================================
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DB } from '@/data/artists';
import GearSection from './GearSection';

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
  return {
    title: `${artist.name} の機材 — Gear ちゃんねる`,
    description: `${artist.name}（${artist.en}）が使用しているギター・シンセ・エフェクターなどの機材を一覧で確認。${(artist.desc || '').slice(0, 100)}`,
  };
}

// ── Page ──────────────────────────────────────────────────
export default function ArtistPage({ params }: Props) {
  const artist = DB.find(a => a.id === params.id);
  if (!artist) notFound();

  return (
    <main className="page fade">
      {/* パンくず */}
      <nav className="bc">
        <a href="/">ホーム</a> › {artist.name}
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

      {/* 機材セクション（インタラクティブ） */}
      <GearSection artist={artist} />
    </main>
  );
}
