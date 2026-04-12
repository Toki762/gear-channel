// =============================================================
// /api/gear-image — 機材名で楽天市場を検索し商品画像URLを返す
// レスポンスは Next.js サーバー側で 24h キャッシュされる
// 環境変数: RAKUTEN_APP_ID（楽天デベロッパーサイトで無料取得）
// =============================================================
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ url: null });

  const appId = process.env.RAKUTEN_APP_ID;
  if (!appId) return NextResponse.json({ url: null });

  try {
    const searchUrl = new URL(
      'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706'
    );
    searchUrl.searchParams.set('applicationId', appId);
    searchUrl.searchParams.set('keyword', q);
    searchUrl.searchParams.set('imageFlag', '1');
    searchUrl.searchParams.set('hits', '5');
    // レビュー数の多い（実績のある）商品を優先
    searchUrl.searchParams.set('sort', '-reviewCount');
    searchUrl.searchParams.set('formatVersion', '2');

    const res = await fetch(searchUrl.toString(), {
      next: { revalidate: 86400 }, // 24時間キャッシュ
    });

    if (!res.ok) return NextResponse.json({ url: null });

    const json = await res.json();

    // formatVersion=2 だと Items は配列の配列
    const items: any[] = json.Items ?? [];
    for (const item of items) {
      // formatVersion=2: item は直接オブジェクト
      const imageUrls: { imageUrl: string }[] =
        item?.mediumImageUrls ?? item?.Item?.mediumImageUrls ?? [];
      const url = imageUrls[0]?.imageUrl ?? null;
      if (url) {
        return NextResponse.json({ url }, {
          headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
        });
      }
    }

    return NextResponse.json({ url: null });
  } catch (e) {
    console.error('[gear-image] error:', e);
    return NextResponse.json({ url: null });
  }
}
