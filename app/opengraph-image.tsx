// =============================================================
// OGP画像 — /og-image.png として自動配信される
// Next.js の ImageResponse (Vercel Edge) で動的生成
// =============================================================
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Gear ちゃんねる — アーティストの使用機材のデータベースを皆で作ろう';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#1a1a1a',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 左アクセントバー */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: 10, height: '100%', background: '#d97706', display: 'flex' }} />

        {/* 背景の丸装飾 */}
        <div style={{ position: 'absolute', right: 80, top: 60, width: 280, height: 280, borderRadius: '50%', background: '#d97706', opacity: 0.12, display: 'flex' }} />
        <div style={{ position: 'absolute', right: 160, bottom: 60, width: 180, height: 180, borderRadius: '50%', background: '#d97706', opacity: 0.08, display: 'flex' }} />

        {/* メインコンテンツ */}
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 90, paddingRight: 90 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 16 }}>
            <span style={{ fontSize: 96, fontWeight: 900, color: '#ffffff', letterSpacing: '-3px', lineHeight: 1 }}>
              Gear
            </span>
            <span style={{ fontSize: 96, fontWeight: 900, color: '#d97706', letterSpacing: '-2px', lineHeight: 1 }}>
              ちゃんねる
            </span>
          </div>
          <div style={{ fontSize: 32, color: '#888888', marginBottom: 48, display: 'flex' }}>
            アーティストの使用機材のデータベースを皆で作ろう
          </div>

          {/* タグ */}
          <div style={{ display: 'flex', gap: 12 }}>
            {['🎸 ギター', '⚡ エフェクター', '🎹 シンセ', '💻 DAW'].map(tag => (
              <div
                key={tag}
                style={{
                  background: '#2a2a2a',
                  border: '1px solid #333',
                  borderRadius: 8,
                  padding: '8px 18px',
                  color: '#ccc',
                  fontSize: 24,
                  display: 'flex',
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
