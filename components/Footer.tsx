// =============================================================
// Footer — サイトフッター（PR表記・ポリシーリンク含む）
// =============================================================
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      {/* PR表記（景表法対応） */}
      <div style={{
        background: '#fafaf8',
        border: '1px solid #e4e2dd',
        borderRadius: '6px',
        padding: '8px 12px',
        marginBottom: '12px',
        fontSize: '12px',
        color: '#888',
        textAlign: 'center',
      }}>
        <strong style={{ color: '#555' }}>【PR / 広告表記】</strong>
        当サイトはAmazonアソシエイト・楽天・サウンドハウス（バリューコマース）・Yahoo!のアフィリエイトプログラムに参加しています。
        機材リンクをクリックして商品を購入された場合、当サイトに紹介料が発生することがあります。
      </div>

      {/* リンク */}
      <nav style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '10px', fontSize: '12px' }}>
        <Link href="/about" style={{ color: '#888', textDecoration: 'none' }}>運営者情報</Link>
        <Link href="/privacy" style={{ color: '#888', textDecoration: 'none' }}>プライバシーポリシー</Link>
        <Link href="/contact" style={{ color: '#888', textDecoration: 'none' }}>お問い合わせ</Link>
        <Link href="/artists" style={{ color: '#888', textDecoration: 'none' }}>アーティスト一覧</Link>
        <Link href="/bbs" style={{ color: '#888', textDecoration: 'none' }}>掲示板</Link>
      </nav>

      {/* コピーライト */}
      <div style={{ textAlign: 'center', fontSize: '12px', color: '#bbb' }}>
        © {new Date().getFullYear()} Gear ちゃんねる — アーティストの機材を調べるサイト
      </div>
    </footer>
  );
}
