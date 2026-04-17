// @ts-nocheck
// =============================================================
// Supabase クライアント — ブラウザ用 & サーバー用
// =============================================================
import { createClient } from '@supabase/supabase-js';
import type { BbsPost, BbsComment } from './types';

// ── ブラウザ用クライアント（Client Components から使用）────────
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── サーバー用クライアント（Server Components / Server Actions）─
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// ── BBS データ取得ユーティリティ ────────────────────────────
export async function fetchPosts(options?: {
  flair?: string;
  search?: string;
  gearKw?: string;
  sort?: 'pop' | 'new';
  page?: number;
  pageSize?: number;
}) {
  const supabase = createServerClient();
  const {
    flair,
    search,
    gearKw,
    sort = 'pop',
    page = 0,
    pageSize = 20,
  } = options ?? {};

  // ① 投稿一覧を取得（コメントは別途取得するため bbs_comments JOIN しない）
  let query = supabase
    .from('bbs_posts')
    .select('*', { count: 'exact' });

  if (flair && flair !== 'すべて') query = query.eq('flair', flair);
  if (search) query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
  if (gearKw) {
    const kw = gearKw.split(' ')[0];
    query = query.or(`gear_tag.ilike.%${kw}%,title.ilike.%${kw}%,body.ilike.%${kw}%`);
  }

  if (sort === 'pop') query = query.order('votes', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data: posts, error, count } = await query
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw error;
  if (!posts || posts.length === 0) return { posts: [] as BbsPost[], total: count ?? 0 };

  // ② 取得した投稿 ID に紐づくコメントを一括取得
  const postIds = posts.map((p: any) => p.id);
  const { data: comments } = await supabase
    .from('bbs_comments')
    .select('*')
    .in('post_id', postIds)
    .order('created_at', { ascending: true });

  // ③ 投稿にコメントをマージ
  const commentsByPost: Record<string, BbsComment[]> = {};
  for (const c of (comments ?? []) as BbsComment[]) {
    if (!commentsByPost[c.post_id]) commentsByPost[c.post_id] = [];
    commentsByPost[c.post_id].push(c);
  }
  const merged = posts.map((p: any) => ({
    ...p,
    bbs_comments: commentsByPost[p.id] ?? [],
  })) as BbsPost[];

  return { posts: merged, total: count ?? 0 };
}
