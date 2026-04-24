'use client';
// =============================================================
// Header — ナビゲーション・検索・言語切替
// =============================================================
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, Suspense, useCallback } from 'react';
import { type Locale, LOCALE_COOKIE, t } from '@/lib/i18n';

interface Props {
  locale: Locale;
}

function HeaderInner({ locale: initialLocale }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [locale, setLocale] = useState<Locale>(initialLocale);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/artists?q=${encodeURIComponent(q.trim())}`);
    else router.push('/artists');
  }

  const toggleLang = useCallback(() => {
    const next: Locale = locale === 'ja' ? 'en' : 'ja';
    setLocale(next);
    // クッキーを更新（1年）
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    router.refresh();
  }, [locale, router]);

  return (
    <header>
      <div className="hd">
        <Link href="/" className="logo">
          Gear <span>ch.</span>
        </Link>
        <form className="hd-search" onSubmit={handleSearch}>
          <input
            className="s-in"
            type="search"
            placeholder={t(locale, 'searchPlaceholder')}
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <button type="submit" className="s-btn">{t(locale, 'searchBtn')}</button>
        </form>
        <Link href="/artists" className="nav-a">{t(locale, 'navArtists')}</Link>
        <Link href="/bbs" className="nav-a">{t(locale, 'navBbs')}</Link>
        {/* 言語切替ボタン */}
        <button
          onClick={toggleLang}
          className="nav-a"
          style={{
            background: 'none',
            border: '1px solid currentColor',
            cursor: 'pointer',
            borderRadius: '4px',
            padding: '2px 8px',
            fontSize: '12px',
            fontWeight: 700,
            opacity: 0.7,
          }}
          title={locale === 'ja' ? 'Switch to English' : '日本語に切り替え'}
        >
          {t(locale, 'langSwitch')}
        </button>
      </div>
    </header>
  );
}

export default function Header({ locale }: Props) {
  return (
    <Suspense fallback={
      <header>
        <div className="hd">
          <Link href="/" className="logo">Gear <span>ch.</span></Link>
        </div>
      </header>
    }>
      <HeaderInner locale={locale} />
    </Suspense>
  );
}
