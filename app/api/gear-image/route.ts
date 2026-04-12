// =============================================================
// /api/gear-image — 機材名で楽天市場を検索し商品画像URLを返す
// 環境変数: RAKUTEN_APP_ID（楽天デベロッパーで無料取得）
// =============================================================
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function searchRakuten(appId: string, keyword: string): Promise<string | null> {
  const url = new URL('https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706');
  url.searchParams.set('applicationId', appId);
  url.searchParams.set('keyword', keyword);
  url.searchParams.set('imageFlag', '1');
  url.searchParams.set('hits', '3');

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) return null;

  const json = await res.json();
  const items: any[] = json.Items ?? [];

  for (const wrapper of items) {
    const item = wrapper?.Item ?? wrapper;
    const imageUrls: any[] = item?.mediumImageUrls ?? [];
    for (const entry of imageUrls) {
      const imgUrl: string | null =
        typeof entry === 'string' ? entry : (entry?.imageUrl ?? null);
      if (imgUrl) return imgUrl;
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ url: null, debug: 'no query' });

  const appId = process.env.RAKUTEN_APP_ID;
  if (!appId) {
    return NextResponse.json({ url: null, debug: 'RAKUTEN_APP_ID not set' });
  }

  try {
    // 1回目: ブランド＋機材名で検索
    let url = await searchRakuten(appId, q);

    // 2回目: 末尾2ワードで再検索
    if (!url) {
      const nameOnly = q.split(' ').slice(-2).join(' ');
      if (nameOnly !== q) url = await searchRakuten(appId, nameOnly);
    }

    return NextResponse.json({ url, debug: url ? 'ok' : 'no results' }, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
    });
  } catch (e: any) {
    return NextResponse.json({ url: null, debug: `error: ${e?.message}` });
  }
}
