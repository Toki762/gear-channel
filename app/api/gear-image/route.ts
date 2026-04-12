// =============================================================
// /api/gear-image — デバッグ版（原因特定後に削除）
// =============================================================
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ url: null, debug: 'no query' });

  const appId = process.env.RAKUTEN_APP_ID;
  if (!appId) return NextResponse.json({ url: null, debug: 'RAKUTEN_APP_ID not set' });

  const url = new URL('https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706');
  url.searchParams.set('applicationId', appId);
  url.searchParams.set('keyword', q);
  url.searchParams.set('imageFlag', '1');
  url.searchParams.set('hits', '3');

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' }); // キャッシュなし
    const text = await res.text();
    const json = JSON.parse(text);

    // 生のレスポンスをそのまま返す（デバッグ用）
    const items = json.Items ?? [];
    const firstItem = items[0] ?? null;

    return NextResponse.json({
      url: null,
      debug: {
        status: res.status,
        itemCount: items.length,
        firstItemKeys: firstItem ? Object.keys(firstItem) : [],
        firstItem: firstItem,
        error: json.error ?? null,
        errorDescription: json.error_description ?? null,
      }
    });
  } catch (e: any) {
    return NextResponse.json({ url: null, debug: `fetch error: ${e?.message}` });
  }
}
