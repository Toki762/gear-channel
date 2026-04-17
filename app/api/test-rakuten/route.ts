// =============================================================
// /api/test-rakuten — 楽天API接続テスト用（デバッグ専用）
// https://gear-channel.com/api/test-rakuten?q=Boss+DS-1 でテスト
// =============================================================
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? 'Fender Stratocaster';
  const appId = process.env.RAKUTEN_APP_ID ?? '';

  if (!appId) {
    return NextResponse.json({
      ok: false,
      error: 'RAKUTEN_APP_ID が未設定',
      appId: '(empty)',
    });
  }

  const url = new URL('https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601');
  url.searchParams.set('applicationId', appId);
  url.searchParams.set('keyword', q);
  url.searchParams.set('hits', '1');
  url.searchParams.set('imageFlag', '1');
  url.searchParams.set('format', 'json');

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' });
    const body = await res.text();

    let parsed: any = null;
    try { parsed = JSON.parse(body); } catch { /* noop */ }

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      appId: appId.slice(0, 12) + '...',  // 先頭12文字だけ表示
      query: q,
      rakutenError: parsed?.error ?? null,
      rakutenErrorDesc: parsed?.error_description ?? null,
      itemCount: parsed?.count ?? null,
      firstItem: parsed?.Items?.[0]?.Item
        ? {
            name: parsed.Items[0].Item.itemName,
            image: parsed.Items[0].Item.mediumImageUrls?.[0] ?? null,
          }
        : null,
      rawBodySnippet: body.slice(0, 500),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'fetch失敗', appId: appId.slice(0, 12) + '...' });
  }
}
