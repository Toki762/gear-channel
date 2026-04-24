// =============================================================
// Footer — サイトフッター（多言語対応）
// =============================================================
import Link from 'next/link';
import { getLocale, t } from '@/lib/i18n';

export default function Footer() {
  const locale = getLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="wrap">
        {/* PR表記（景表法対応） */}
        <div className="footer-disclaimer">
          <strong>{t(locale, 'footerDisclaimerTitle')}</strong>
          {' '}{t(locale, 'footerDisclaimerText')}
        </div>

        {/* ナビリンク */}
        <nav className="footer-links">
          <Link href="/about">{t(locale, 'footerAbout')}</Link>
          <Link href="/privacy">{t(locale, 'footerPrivacy')}</Link>
          <Link href="/contact">{t(locale, 'footerContact')}</Link>
          <Link href="/artists">{t(locale, 'footerArtists')}</Link>
          <Link href="/bbs">{t(locale, 'footerBbs')}</Link>
        </nav>

        {/* コピーライト */}
        <div className="footer-copy">
          {t(locale, 'footerCopy', { year })}
        </div>
      </div>
    </footer>
  );
}
