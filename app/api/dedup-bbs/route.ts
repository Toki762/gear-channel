// GET /api/dedup-bbs        → 重複スレッドの一覧を確認
// GET /api/dedup-bbs?run=1  → 古い方を削除
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: Request) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);

  // 全スレッドを取得してタイトルの重複を検出
  const { data: posts, error } = await supabase
    .from('bbs_posts')
    .select('id, title, created_at')
    .order('title')
    .order('created_at');

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // タイトルごとにグループ化して重複を検出
  const byTitle: Record<string, { id: number; created_at: string }[]> = {};
  for (const p of posts ?? []) {
    if (!byTitle[p.title]) byTitle[p.title] = [];
    byTitle[p.title].push({ id: p.id, created_at: p.created_at });
  }

  const duplicates = Object.entries(byTitle).filter(([, arr]) => arr.length > 1);

  if (searchParams.get('run') !== '1') {
    return NextResponse.json({
      duplicates: duplicates.map(([title, arr]) => ({ title, count: arr.length, ids: arr.map(a => a.id) })),
      message: duplicates.length > 0
        ? `重複 ${duplicates.length} 件。?run=1 を付けてアクセスすると古い方を削除します`
        : '重複スレッドはありません',
    });
  }

  // run=1 → 各重複の古い方（created_at が早い方）を削除
  const deleted: { title: string; deleted_id: number }[] = [];
  for (const [title, arr] of duplicates) {
    // 作成日時が一番古いものを削除（先頭、order('created_at')済み）
    const toDelete = arr[0];
    const { error: delErr } = await supabase
      .from('bbs_posts')
      .delete()
      .eq('id', toDelete.id);
    deleted.push({ title, deleted_id: toDelete.id });
  }

  return NextResponse.json({ ok: true, deleted });
}
