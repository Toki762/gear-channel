// =============================================================
// /api/gear-image — 機材名で楽天市場を検索し商品画像URLを返す
// 環境変数: RAKUTEN_APP_ID（楽天デベロッパーサイトで無料取得）
// =============================================================
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ url: null });

  const appId = process.env.RAKUTEN_APP_ID;
  if (!appId) {
    console.warn('[gear-image] RAKUTEN_APP_ID が設定されていません');
    return NextResponse.json({ url: null });
  }

  try {
    const searchUrl = new URL(
      'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706'
    );
    searchUrl.searchParams.set('applicationId', appId);
    searchUrl.searchParams.set('keyword', q);
    searchUrl.searchParams.set('imageFlag', '1');
    searchUrl.searchParams.set('hits', '5');
    searchUrl.searchParams.set('sort', '-reviewCount');
    // formatVersion は指定しない → デフォルト(v1) を使用
    // v1: Items[i].Item.mediumImageUrls[j].imageUrl (オブジェクト形式)

    const res = await fetch(searchUrl.toString(), {
      next: { revalidate: 86400 }, // 24時間キャッシュ
    });

    if (!res.ok) {
      console.error('[gear-image] Rakuten API error:', res.status, await res.text());
      return NextResponse.json({ url: null });
    }

    const json = await res.json();
    const items: any[] = json.Items ?? [];

    for (const wrapper of items) {
      // v1 形式: { Item: { mediumImageUrls: [{ imageUrl: "..." }] } }
      const item = wrapper?.Item ?? wrapper;
      const imageUrls: any[] = item?.mediumImageUrls ?? [];

      for (const entry of imageUrls) {
        // v1: entry = { imageUrl: "..." }
        // v2: entry = "..." (文字列)
        const url: string | null =
          typeof entry === 'string' ? entry : (entry?.imageUrl ?? null);
        if (url) {
          return NextResponse.json({ url }, {
            headers: {
              'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
            },
          });
        }
      }
    }

    return NextResponse.json({ url: null });
  } catch (e) {
    console.error('[gear-image] error:', e);
    return NextResponse.json({ url: null });
  }
}
