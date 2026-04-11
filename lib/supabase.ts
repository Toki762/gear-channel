// =============================================================
// Supabase クライアント — ブラウザ用 & サーバー用
// =============================================================
import { createClient } from '@supabase/supabase-js';
import type { BbsPost, BbsComment } from './types';

// ── Database 型（Supabase CLI で自動生成する場合はそちらを使用）──
type PostInsert = {
  author?: string;
  flair: string;
  title: string;
  body: string;
  votes?: number;
  gear_tag?: string | null;
  reply_to?: string | null;
};
type CommentInsert = {
  post_id: string;
  author?: string;
  body: string;
  votes?: number;
  reply_to?: string | null;
};

export type Database = {
  public: {
    Tables: {
      bbs_posts: {
        Row: BbsPost;
        Insert: PostInsert;
        Update: Partial<BbsPost>;
      };
      bbs_comments: {
        Row: BbsComment;
        Insert: CommentInsert;
        Update: Partial<BbsComment>;
      };
    };
  };
};

// ── ブラウザ用クライアント（Client Components から使用）────────
export function createBrowserClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── サーバー用クライアント（Server Components / Server Actions）─
// 注意: service_role キーは環境変数に入れ、クライアントに漏らさない
export function createServerClient() {
  return createClient<Database>(
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

  let query = supabase
    .from('bbs_posts')
    .select('*, bbs_comments(*)')
    .is('reply_to', null); // トップレベル投稿のみ

  if (flair && flair !== 'すべて') query = query.eq('flair', flair);
  if (search) query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
  if (gearKw) {
    const kw = gearKw.split(' ')[0];
    query = query.or(`gear_tag.ilike.%${kw}%,title.ilike.%${kw}%,body.ilike.%${kw}%`);
  }

  if (sort === 'pop') query = query.order('votes', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw error;
  return { posts: (data ?? []) as BbsPost[], total: count ?? 0 };
}
