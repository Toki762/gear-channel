// =============================================================
// Gear Channel — TypeScript 型定義
// =============================================================

export interface GearItem {
  id: string;
  brand: string;
  name: string;
  cat: string;
  catIcon: string;
  user: string;
  price: string;
  kw: string;
  yt: string[];
  similar: string[];
  desc: string;
  wikiTitle: string;
}

export interface Artist {
  id: string;
  name: string;
  en: string;
  genre: string;
  since: string;
  origin: string;
  members: string;
  desc: string;
  gear: GearItem[];
}

// ── Supabase BBS ───────────────────────────────────────────────

export interface BbsComment {
  id: string;
  post_id: string;
  author: string;
  body: string;
  votes: number;
  created_at: string;
  reply_to: string | null;
}

export interface BbsPost {
  id: string;
  author: string;
  flair: string;
  title: string;
  body: string;
  votes: number;
  gear_tag: string | null;
  created_at: string;
  reply_to: string | null;
  bbs_comments?: BbsComment[];
}

// フォーム送信用
export interface CreatePostInput {
  author: string;
  flair: string;
  title: string;
  body: string;
  gear_tag?: string;
}

export interface CreateCommentInput {
  post_id: string;
  author: string;
  body: string;
  reply_to?: string;
}

// Server Action の戻り値
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };
