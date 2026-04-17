// =============================================================
// /api/gear-image — 機材名で商品画像URLを自動取得
// 優先順位: 楽天API（確実）→ Amazon スクレイピング → サウンドハウス
// =============================================================
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID ?? '';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const HEADERS = {
  'User-Agent': UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ja,en-US;q=0.9',
};

// ── 楽天 API（正式、画像URL確実に取れる） ────────────────
async function searchRakutenAPI(keyword: string): Promise<string | null> {
  if (!RAKUTEN_APP_ID) {
    console.warn('[rakuten-api] RAKUTEN_APP_ID が未設定');
    return null;
  }
  const url = new URL('https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601');
  url.searchParams.set('applicationId', RAKUTEN_APP_ID);
  url.searchParams.set('keyword', keyword);
  url.searchParams.set('hits', '1');
  url.searchParams.set('imageFlag', '1');
  url.searchParams.set('format', 'json');

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`[rakuten-api] HTTP ${res.status} — appId="${RAKUTEN_APP_ID}" kw="${keyword}" body=${errText.slice(0, 300)}`);
      return null;
    }
    const json = await res.json();

    // エラーレスポンス（wrong_parameter等）のログ
    if (json?.error) {
      console.error(`[rakuten-api] APIエラー: ${json.error} / ${json.error_description} — appId="${RAKUTEN_APP_ID}"`);
      return null;
    }

    const item = json?.Items?.[0]?.Item;
    if (!item) {
      console.log(`[rakuten-api] 結果0件 kw="${keyword}"`);
      return null;
    }

    // mediumImageUrls から最初の画像を取得
    const imgs = item.mediumImageUrls;
    if (Array.isArray(imgs) && imgs.length > 0) {
      const img = typeof imgs[0] === 'string' ? imgs[0] : imgs[0]?.imageUrl;
      if (img) return img.replace('?_ex=128x128', '?_ex=300x300');
    }
    console.log(`[rakuten-api] 画像なし itemName="${item.itemName}"`);
  } catch (e) {
    console.error('[rakuten-api] fetch例外:', e);
  }
  return null;
}

// ── Amazon Japan スクレイピング ────────────────────────
async function searchAmazon(keyword: string): Promise<string | null> {
  const url = `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}&language=ja_JP`;
  try {
    const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
    if (!res.ok) return null;
    const html = await res.text();
    const patterns = [
      /https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%+_.-]+\.(jpg|jpeg|png)/,
      /https:\/\/images-na\.ssl-images-amazon\.com\/images\/I\/[A-Za-z0-9%+_.-]+\.(jpg|jpeg|png)/,
    ];
    for (const pat of patterns) {
      const m = html.match(pat);
      if (m) return m[0].replace(/_SL\d+_/, '_SL300_');
    }
  } catch { /* ignore */ }
  return null;
}

// ── サウンドハウス スクレイピング ─────────────────────
async function searchSoundhouse(keyword: string): Promise<string | null> {
  const url = `https://www.soundhouse.co.jp/search/index?search_all=${encodeURIComponent(keyword)}`;
  try {
    const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/https?:\/\/(?:www\.)?soundhouse\.co\.jp\/item\/img\/[^"'\s<>]+\.(jpg|jpeg|png)/i);
    return m ? m[0] : null;
  } catch { /* ignore */ }
  return null;
}

// ── メインハンドラー ──────────────────────────────────────
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ url: null });

  const shorter = q.split(/\s+/).slice(0, 3).join(' ');

  try {
    let url: string | null = null;

    // 1. 楽天API（フルクエリ）— 最も確実
    url = await searchRakutenAPI(q);

    // 2. 楽天API（短縮）
    if (!url && shorter !== q) url = await searchRakutenAPI(shorter);

    // 3. Amazon（フルクエリ）
    if (!url) url = await searchAmazon(q);

    // 4. Amazon（短縮）
    if (!url && shorter !== q) url = await searchAmazon(shorter);

    // 5. サウンドハウス
    if (!url) url = await searchSoundhouse(q);
    if (!url && shorter !== q) url = await searchSoundhouse(shorter);

    console.log(`[gear-image] q="${q}" → ${url ?? 'null'}`);

    return NextResponse.json({ url }, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
    });
  } catch (e) {
    console.error('[gear-image]', e);
    return NextResponse.json({ url: null });
  }
}
