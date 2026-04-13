// =============================================================
// /api/gear-image — Wikipedia APIで機材画像を自動取得（APIキー不要）
// Gibson Les Paul, Fender Telecaster, Boss DD-8 etc. は高品質画像あり
// 見つからない場合は null を返し、フロントはアイコンにフォールバック
// =============================================================
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function getWikipediaImage(keyword: string): Promise<string | null> {
  // Step1: キーワードでWikipedia記事を検索
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
  if (hits.length === 0) return null;

  // Step2: 上位3件の記事から画像を探す
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
  return null;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ url: null });

  try {
    // 1回目: ブランド＋機材名で検索（例: "Gibson Les Paul Standard"）
    let url = await getWikipediaImage(q);

    // 2回目: 機材名の最初の3ワードだけで再検索
    if (!url) {
      const shorter = q.split(' ').slice(0, 3).join(' ');
      if (shorter !== q) url = await getWikipediaImage(shorter);
    }

    return NextResponse.json({ url }, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
    });
  } catch (e) {
    console.error('[gear-image]', e);
    return NextResponse.json({ url: null });
  }
}
