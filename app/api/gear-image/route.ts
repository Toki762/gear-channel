// =============================================================
// /api/gear-image — 機材名で商品画像URLを自動取得
// 優先順位: 楽天スクレイピング → Wikipedia API（フォールバック）
// APIキー不要
// =============================================================
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// ── 楽天スクレイピング ─────────────────────────────────────
async function searchRakuten(keyword: string): Promise<string | null> {
  const url = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ja,en-US;q=0.9',
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const html = await res.text();

    // 楽天サムネイル画像URLを抽出
    const patterns = [
      /https:\/\/thumbnail\.image\.rakuten\.co\.jp[^"'\s<>)]+\.jpg/i,
      /https:\/\/thumbnail\.image\.rakuten\.co\.jp[^"'\s<>)]+\.jpeg/i,
      /https:\/\/thumbnail\.image\.rakuten\.co\.jp[^"'\s<>)]+\.png/i,
    ];
    for (const pat of patterns) {
      const m = html.match(pat);
      if (m) return m[0];
    }
  } catch { /* ignore */ }
  return null;
}

// ── Wikipedia API ──────────────────────────────────────────
async function searchWikipedia(keyword: string): Promise<string | null> {
  try {
    const searchUrl = new URL('https://en.wikipedia.org/w/api.php');
    searchUrl.searchParams.set('action', 'query');
    searchUrl.searchParams.set('list', 'search');
    searchUrl.searchParams.set('srsearch', keyword);
    searchUrl.searchParams.set('srlimit', '3');
    searchUrl.searchParams.set('format', 'json');
    searchUrl.searchParams.set('origin', '*');

    const searchRes = await fetch(searchUrl.toString(), { next: { revalidate: 86400 } });
    if (!searchRes.ok) return null;
    const searchJson = await searchRes.json();
    const hits: { title: string }[] = searchJson.query?.search ?? [];

    for (const hit of hits) {
      const imgUrl = new URL('https://en.wikipedia.org/w/api.php');
      imgUrl.searchParams.set('action', 'query');
      imgUrl.searchParams.set('titles', hit.title);
      imgUrl.searchParams.set('prop', 'pageimages');
      imgUrl.searchParams.set('pithumbsize', '400');
      imgUrl.searchParams.set('piprop', 'thumbnail');
      imgUrl.searchParams.set('format', 'json');
      imgUrl.searchParams.set('origin', '*');

      const imgRes = await fetch(imgUrl.toString(), { next: { revalidate: 86400 } });
      if (!imgRes.ok) continue;
      const imgJson = await imgRes.json();
      const pages = Object.values(imgJson.query?.pages ?? {}) as any[];
      const thumb = pages[0]?.thumbnail?.source ?? null;
      if (thumb) return thumb;
    }
  } catch { /* ignore */ }
  return null;
}

// ── メインハンドラー ──────────────────────────────────────
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ url: null });

  try {
    // 1. 楽天スクレイピング（ブランド+機材名）
    let url = await searchRakuten(q);

    // 2. 楽天 機材名のみ（短縮）
    if (!url) {
      const shorter = q.split(' ').slice(0, 3).join(' ');
      if (shorter !== q) url = await searchRakuten(shorter);
    }

    // 3. Wikipediaフォールバック
    if (!url) url = await searchWikipedia(q);
    if (!url) {
      const shorter = q.split(' ').slice(0, 3).join(' ');
      if (shorter !== q) url = await searchWikipedia(shorter);
    }

    return NextResponse.json({ url }, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
    });
  } catch (e) {
    console.error('[gear-image]', e);
    return NextResponse.json({ url: null });
  }
}
