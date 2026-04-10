// =============================================================
// Home Page — Server Component
// =============================================================
import Link from 'next/link';
import { DB } from '@/data/artists';
import { POPULAR_IDS } from '@/data/config';
import { fetchPosts } from '@/lib/supabase';

export default async function HomePage() {
  // 人気アーティスト
  const popularArtists = POPULAR_IDS
    .map(id => DB.find(a => a.id === id))
    .filter(Boolean) as typeof DB;

  // 人気スレッド（votes順 上位5件）
  const { posts: popularPosts } = await fetchPosts({ sort: 'pop', pageSize: 5 });

  return (
    <main className="page fade">
      {/* Hero */}
      <div className="hero">
        <h1>🎸 Gear <span style={{ color: '#d97706' }}>ちゃんねる</span></h1>
        <p style={{ color: '#888', fontSize: '13px' }}>
          日本のアーティストが使用している機材を調べよう
        </p>
      </div>

      {/* 人気アーティスト */}
      <section style={{ marginBottom: '36px' }}>
        <div style={{ fontWeight: 700, fontSize: '13px', color: '#888', marginBottom: '10px', letterSpacing: '0.5px' }}>
          🔥 人気アーティスト
        </div>
        <div className="featured-grid">
          {popularArtists.slice(0, 6).map(a => (
            <Link key={a.id} href={`/artists/${a.id}`} className="featured-card">
              <div className="featured-badge">人気</div>
              <div style={{ fontWeight: 700, fontSize: '15px', lineHeight: 1.3 }}>{a.name}</div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{a.en}</div>
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '6px' }}>
                <span className="tag" style={{ marginRight: '4px' }}>{a.genre}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 全アーティスト */}
      <section style={{ marginBottom: '36px' }}>
        <div style={{ fontWeight: 700, fontSize: '13px', color: '#888', marginBottom: '10px', letterSpacing: '0.5px' }}>
          🎵 アーティスト一覧
        </div>
        <div className="a-grid">
          {DB.map(a => (
            <Link key={a.id} href={`/artists/${a.id}`} className="a-card">
              <div className="a-name">{a.name}</div>
              <div className="a-en">{a.en}</div>
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                {(a.desc || '').slice(0, 60)}…
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 人気スレッド */}
      {popularPosts.length > 0 && (
        <section>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#888', marginBottom: '10px', letterSpacing: '0.5px' }}>
            💬 人気のスレッド
          </div>
          <div>
            {popularPosts.map(p => (
              <Link key={p.id} href={`/bbs?post=${p.id}`} className="post-card" style={{ display: 'block', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div className="vote-col" style={{ textAlign: 'center', minWidth: '32px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{p.votes}</div>
                    <div style={{ fontSize: '9px', color: '#aaa' }}>票</div>
                  </div>
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
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <Link href="/bbs" style={{ fontSize: '13px', color: '#d97706', fontWeight: 600 }}>
              掲示板をもっと見る →
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
