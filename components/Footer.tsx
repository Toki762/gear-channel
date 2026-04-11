// =============================================================
// Footer — サイトフッター（PR表記・ポリシーリンク含む）
// =============================================================
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        {/* PR表記（景表法対応） */}
        <div className="footer-disclaimer">
          <strong>【PR / 広告表記】</strong>
          当サイトはAmazonアソシエイト・楽天アフィリエイト・バリューコマース（サウンドハウス）・Yahoo!ショッピングのアフィリエイトプログラムに参加しています。
          機材リンクをクリックして商品を購入された場合、当サイトに紹介料が発生することがあります。利用者の方のご購入金額が増えることは一切ありません。
        </div>

        {/* ナビリンク */}
        <nav className="footer-links">
          <Link href="/about">運営者情報</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
          <Link href="/contact">お問い合わせ</Link>
          <Link href="/artists">アーティスト一覧</Link>
          <Link href="/bbs">掲示板</Link>
        </nav>

        {/* コピーライト */}
        <div className="footer-copy">
          © {new Date().getFullYear()} Gear ちゃんねる — アーティストの機材を調べるサイト
        </div>
      </div>
    </footer>
  );
}
