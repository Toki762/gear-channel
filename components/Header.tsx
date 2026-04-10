'use client';
// =============================================================
// Header — Client Component（検索フォームがあるため）
// =============================================================
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, Suspense } from 'react';

function HeaderInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/artists?q=${encodeURIComponent(q.trim())}`);
    else router.push('/artists');
  }

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
            placeholder="アーティスト・機材を検索…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <button type="submit" className="s-btn">検索</button>
        </form>
        <Link href="/artists" className="nav-a">アーティスト</Link>
        <Link href="/bbs" className="nav-a">掲示板</Link>
      </div>
    </header>
  );
}

export default function Header() {
  return (
    <Suspense fallback={
      <header>
        <div className="hd">
          <Link href="/" className="logo">Gear <span>ch.</span></Link>
        </div>
      </header>
    }>
      <HeaderInner />
    </Suspense>
  );
}
