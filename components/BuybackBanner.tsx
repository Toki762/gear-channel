// =============================================================
// BuybackBanner — 楽器の買取屋さん アフィリエイトバナー（A8.net）
// 景表法対応: PR ラベル付き
// variant="text"  → テキスト型（アーティストページ下部など横長スペース向け）
// variant="image" → 画像型 336×280（サイドバー・グリッドカード向け）
// =============================================================

interface Props {
  variant?: 'text' | 'image';
}

export default function BuybackBanner({ variant = 'text' }: Props) {
  if (variant === 'image') {
    return (
      <div className="buyback-img-wrap">
        <span className="buyback-pr">PR</span>
        <a
          href="https://px.a8.net/svt/ejp?a8mat=4B1VTV+AVR9LM+3EMG+TVJ4X"
          rel="nofollow noopener noreferrer"
          target="_blank"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            width={336}
            height={280}
            alt="楽器の買取屋さん"
            src="https://www29.a8.net/svt/bgt?aid=260428387658&wid=002&eno=01&mid=s00000015892005018000&mc=1"
            style={{ border: 0, maxWidth: '100%', height: 'auto', display: 'block', borderRadius: '8px' }}
          />
        </a>
        {/* トラッキングピクセル */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={1}
          height={1}
          src="https://www10.a8.net/0.gif?a8mat=4B1VTV+AVR9LM+3EMG+TVJ4X"
          alt=""
          style={{ border: 0, position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        />
      </div>
    );
  }

  // デフォルト: テキスト型
  return (
    <div className="buyback-banner">
      <span className="buyback-pr">PR</span>
      <a
        href="https://px.a8.net/svt/ejp?a8mat=4B1VTV+AJ95WA+3EMG+BZ8OY"
        rel="nofollow noopener noreferrer"
        target="_blank"
        className="buyback-link"
      >
        <div className="buyback-icon">🎸</div>
        <div className="buyback-body">
          <div className="buyback-title">使わない楽器、高く売れるかも</div>
          <div className="buyback-desc">
            【楽器の買取屋さん】創業10年・電話受付22時まで — 無料査定はこちら
          </div>
        </div>
        <div className="buyback-cta">無料査定 →</div>
      </a>
      {/* トラッキングピクセル */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={1}
        height={1}
        src="https://www11.a8.net/0.gif?a8mat=4B1VTV+AJ95WA+3EMG+BZ8OY"
        alt=""
        style={{ border: 0, position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />
    </div>
  );
}
