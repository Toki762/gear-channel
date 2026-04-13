// =============================================================
// /api/gear-image — 機材名でECサイト商品画像URLを自動取得
// 優先順位: 楽天 → サウンドハウス → Yahoo!ショッピング
// APIキー不要、スクレイピングのみ
// =============================================================
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ── 楽天 ──────────────────────────────────────────────────
async function searchRakuten(keyword: string): Promise<string | null> {
  const url = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'ja,en-US;q=0.9' },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/https:\/\/thumbnail\.image\.rakuten\.co\.jp[^"'\s<>)]+\.(jpg|jpeg|png)/i);
    return m ? m[0] : null;
  } catch { return null; }
}

// ── サウンドハウス ─────────────────────────────────────
async function searchSoundhouse(keyword: string): Promise<string | null> {
  const url = `https://www.soundhouse.co.jp/search/index?search_all=${encodeURIComponent(keyword)}`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'ja' },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    // サウンドハウス商品画像パターン
    const m = html.match(/https:\/\/[^"'\s<>]*soundhouse\.co\.jp\/[^"'\s<>]+\.(jpg|jpeg|png)/i);
    return m ? m[0] : null;
  } catch { return null; }
}

// ── Yahoo!ショッピング ────────────────────────────────
async function searchYahooShopping(keyword: string): Promise<string | null> {
  const url = `https://shopping.yahoo.co.jp/search?p=${encodeURIComponent(keyword)}&cid=2502`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'ja' },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    // Yahoo!ショッピング商品サムネ
    const m = html.match(/https:\/\/item-shopping\.c\.yimg\.jp\/[^"'\s<>]+\.(jpg|jpeg|png)/i);
    return m ? m[0] : null;
  } catch { return null; }
}

// ── メインハンドラー ──────────────────────────────────────
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ url: null });

  // 短縮クエリ（ブランド+機材名の最初3語）
  const shorter = q.split(' ').slice(0, 3).join(' ');

  try {
    // 1. 楽天（フルクエリ）
    let url = await searchRakuten(q);

    // 2. 楽天（短縮）
    if (!url && shorter !== q) url = await searchRakuten(shorter);

    // 3. サウンドハウス（フルクエリ）
    if (!url) url = await searchSoundhouse(q);

    // 4. サウンドハウス（短縮）
    if (!url && shorter !== q) url = await searchSoundhouse(shorter);

    // 5. Yahoo!ショッピング（フルクエリ）
    if (!url) url = await searchYahooShopping(q);

    // 6. Yahoo!ショッピング（短縮）
    if (!url && shorter !== q) url = await searchYahooShopping(shorter);

    return NextResponse.json({ url }, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
    });
  } catch (e) {
    console.error('[gear-image]', e);
    return NextResponse.json({ url: null });
  }
}
