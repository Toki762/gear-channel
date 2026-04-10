-- =============================================================
-- Gear Channel — Supabase スキーマ定義
-- Supabase Dashboard の SQL Editor で実行してください
-- =============================================================

-- ── BBS 投稿テーブル ─────────────────────────────────────────
create table if not exists bbs_posts (
  id          text        primary key default gen_random_uuid()::text,
  author      text        not null default '名無し',
  flair       text        not null default '雑談',
  title       text        not null,
  body        text        not null,
  votes       int         not null default 1,
  gear_tag    text,
  created_at  timestamptz not null default now(),
  -- トップレベル投稿のみ。スレッドネスト用だが基本 null
  reply_to    text        references bbs_posts(id) on delete set null
);

-- ── BBS コメントテーブル ─────────────────────────────────────
create table if not exists bbs_comments (
  id          text        primary key default gen_random_uuid()::text,
  post_id     text        not null references bbs_posts(id) on delete cascade,
  author      text        not null default '名無し',
  body        text        not null,
  votes       int         not null default 0,
  created_at  timestamptz not null default now(),
  -- コメントへの返信（同じ post_id 内）
  reply_to    text        references bbs_comments(id) on delete set null
);

-- ── インデックス ─────────────────────────────────────────────
create index if not exists bbs_posts_votes_idx      on bbs_posts(votes desc);
create index if not exists bbs_posts_created_at_idx on bbs_posts(created_at desc);
create index if not exists bbs_comments_post_id_idx on bbs_comments(post_id);
create index if not exists bbs_comments_created_at_idx on bbs_comments(created_at asc);

-- ── Row Level Security ───────────────────────────────────────
alter table bbs_posts     enable row level security;
alter table bbs_comments  enable row level security;

-- 既存ポリシーを削除してから再作成（再実行しても安全）
drop policy if exists "posts_select"    on bbs_posts;
drop policy if exists "comments_select" on bbs_comments;
drop policy if exists "posts_insert"    on bbs_posts;
drop policy if exists "comments_insert" on bbs_comments;

-- 全員が読める
create policy "posts_select"    on bbs_posts    for select using (true);
create policy "comments_select" on bbs_comments for select using (true);

-- 全員が投稿できる（認証なし運用）
create policy "posts_insert"    on bbs_posts    for insert with check (true);
create policy "comments_insert" on bbs_comments for insert with check (true);

-- 投票更新は Server Action 経由のみ（service_role key 使用）
-- クライアントからの直接 update/delete は禁止
-- create policy "posts_update" on bbs_posts for update using (false);

-- ── アーティスト・機材テーブル（将来用）─────────────────────
-- 現状は data/artists.ts の静的データを使用。
-- Supabase に移行する場合は以下を有効化してください。

/*
create table if not exists artists (
  id       text primary key,
  name     text not null,
  en       text,
  genre    text,
  since    text,
  origin   text,
  members  text,
  desc     text
);

create table if not exists gear (
  id        text,
  artist_id text not null references artists(id) on delete cascade,
  brand     text,
  name      text not null,
  cat       text,
  user_name text,
  price     text,
  kw        text,
  yt        jsonb not null default '[]',
  similar   jsonb not null default '[]',
  desc      text,
  wiki_title text,
  primary key (id, artist_id)
);

create index if not exists gear_artist_id_idx on gear(artist_id);
*/

-- ── サンプルデータ（開発用）────────────────────────────────
insert into bbs_posts (id, author, flair, title, body, votes, gear_tag)
values
  ('p1', 'Tele使い', 'ギター',
   'テレキャスターとストラトキャスターの違いを誰か教えてほしい',
   '最近Official髭男dismの小笹さんの影響でテレキャスターが気になってます。ストラトも候補なんですが、実際弾き比べた経験がある人のリアルな意見が聞きたいです。',
   28, 'Telecaster'),
  ('p2', 'DTM初心者', 'DAW・DTM',
   'Logic Pro vs Ableton Live — どちらから始めるべき？',
   'YOASOBI Ayaseさんみたいな曲作りに憧れています。DTMを始めるにあたってLogicかAbletonか迷っています。Macユーザーです。',
   31, 'Logic Pro'),
  ('p3', 'コンデンサーMIC欲しい', 'マイク',
   '自宅録音におすすめのコンデンサーマイク（3万円以下）',
   'RADWIMPSの野田洋次郎さんが使うNeumann U87は流石に高すぎるので、自宅ボーカル録音用に3万円以下でおすすめのコンデンサーマイクを教えてください。',
   33, 'マイク')
on conflict (id) do nothing;

insert into bbs_comments (post_id, author, body, votes)
values
  ('p1', 'ギタマガ読者', 'テレキャスはカッティングが際立つブライトな音、ストラトはポジションによって色々な音が出ます。小笹さんみたいなクリーン中心ならどちらでも良いですが、キャラが立ってるのはテレキャスかな。', 14),
  ('p2', 'プロデューサー志望', 'Mac使うならLogicが断然コスパいいです。買い切り￥3,600で内蔵プラグインも充実してる。', 20),
  ('p3', '録音エンジニア志望', 'AKG C214は2〜3万円で本格的なスタジオサウンドが手に入ります。次点でAudio-Technica AT2035も定番でコスパ高いです。', 22)
on conflict do nothing;
