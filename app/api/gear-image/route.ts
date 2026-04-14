// =============================================================
// /api/gear-image — 機材名で商品画像URLを自動取得
// 優先順位: Amazon JP → 楽天 → サウンドハウス
// =============================================================
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const HEADERS = {
  'User-Agent': UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
};

// ── Amazon Japan ──────────────────────────────────────────
async function searchAmazon(keyword: string): Promise<string | null> {
  const url = `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}&language=ja_JP`;
  try {
    const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
    if (!res.ok) return null;
    const html = await res.text();

    // Amazonの商品画像パターン（複数試す）
    const patterns = [
      /https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%+_-]+\.(jpg|jpeg|png)/,
      /https:\/\/images-na\.ssl-images-amazon\.com\/images\/I\/[A-Za-z0-9%+_-]+\.(jpg|jpeg|png)/,
      /"hiRes":"(https:\/\/[^"]+\.(?:jpg|jpeg|png))"/,
      /data-src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+\.(?:jpg|jpeg|png))"/,
    ];

    for (const pat of patterns) {
      const m = html.match(pat);
      if (m) {
        const imgUrl = m[1] ?? m[0];
        // SL75_ SL160_ などのサムネサイズを SL300_ に置き換えてやや大きく
        return imgUrl.replace(/_SL\d+_/, '_SL300_').replace(/_AC_[^.]+/, '');
      }
    }
  } catch { /* ignore */ }
  return null;
}

// ── 楽天 ──────────────────────────────────────────────────
async function searchRakuten(keyword: string): Promise<string | null> {
  const url = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`;
  try {
    const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
    if (!res.ok) return null;
    const html = await res.text();

    const patterns = [
      /https:\/\/thumbnail\.image\.rakuten\.co\.jp[^"'\s<>)]+\.(jpg|jpeg|png)/i,
      /https:\/\/shop\.r10s\.jp[^"'\s<>)]+\.(jpg|jpeg|png)/i,
    ];
    for (const pat of patterns) {
      const m = html.match(pat);
      if (m) return m[0];
    }
  } catch { /* ignore */ }
  return null;
}

// ── サウンドハウス ─────────────────────────────────────
async function searchSoundhouse(keyword: string): Promise<string | null> {
  const url = `https://www.soundhouse.co.jp/search/index?search_all=${encodeURIComponent(keyword)}`;
  try {
    const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
    if (!res.ok) return null;
    const html = await res.text();

    // サウンドハウス商品画像: /item/img/ パターン
    const patterns = [
      /https?:\/\/(?:www\.)?soundhouse\.co\.jp\/item\/img\/[^"'\s<>]+\.(jpg|jpeg|png)/i,
      /"(https?:\/\/(?:www\.)?soundhouse\.co\.jp\/[^"]+\.(?:jpg|jpeg|png))"/i,
    ];
    for (const pat of patterns) {
      const m = html.match(pat);
      if (m) return m[1] ?? m[0];
    }
  } catch { /* ignore */ }
  return null;
}

// ── メインハンドラー ──────────────────────────────────────
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ url: null });

  // 短縮クエリ（最初の3語）
  const shorter = q.split(/\s+/).slice(0, 3).join(' ');

  try {
    let url: string | null = null;

    // 1. Amazon（フルクエリ）
    url = await searchAmazon(q);

    // 2. Amazon（短縮）
    if (!url && shorter !== q) url = await searchAmazon(shorter);

    // 3. 楽天（フルクエリ）
    if (!url) url = await searchRakuten(q);

    // 4. 楽天（短縮）
    if (!url && shorter !== q) url = await searchRakuten(shorter);

    // 5. サウンドハウス
    if (!url) url = await searchSoundhouse(q);
    if (!url && shorter !== q) url = await searchSoundhouse(shorter);

    console.log(`[gear-image] q="${q}" → ${url ?? 'null'}`);

    return NextResponse.json({ url }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (e) {
    console.error('[gear-image]', e);
    return NextResponse.json({ url: null });
  }
}
