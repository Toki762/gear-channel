// =============================================================
// BuybackBanner — 楽器の買取屋さん アフィリエイトバナー（A8.net）
// 景表法対応: PR ラベル付き
// variant="image"  → 画像型 336×280（右サイドバー向け）
// variant="text"   → 画像型 300×250（左サイドバー向け）
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

  // デフォルト: 300×250 画像型（左サイドバー向け）
  return (
    <div className="buyback-img-wrap">
      <span className="buyback-pr">PR</span>
      <a
        href="https://px.a8.net/svt/ejp?a8mat=4B1VTV+AJ95WA+3EMG+BYLJL"
        rel="nofollow noopener noreferrer"
        target="_blank"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={300}
          height={250}
          alt="楽器の買取屋さん"
          src="https://www20.a8.net/svt/bgt?aid=260428387637&wid=002&eno=01&mid=s00000015892002009000&mc=1"
          style={{ border: 0, maxWidth: '100%', height: 'auto', display: 'block', borderRadius: '8px' }}
        />
      </a>
      {/* トラッキングピクセル */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={1}
        height={1}
        src="https://www12.a8.net/0.gif?a8mat=4B1VTV+AJ95WA+3EMG+BYLJL"
        alt=""
        style={{ border: 0, position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />
    </div>
  );
}
