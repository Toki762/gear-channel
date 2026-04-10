'use client';
// =============================================================
// BbsClient — 掲示板の全インタラクション
// ソート・フィルター・投票・新規投稿・コメント
// =============================================================
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { BbsPost, BbsComment } from '@/lib/types';
import { BBS_CATS, FLAIR_CLS } from '@/data/config';
import { createPost, createComment, votePost, voteComment } from './actions';

interface Props {
  initialPosts: BbsPost[];
  total: number;
  initialFlair: string;
  initialSearch: string;
  initialGearKw: string;
  initialSort: 'pop' | 'new';
  initialPage: number;
  pageSize: number;
}

export default function BbsClient({
  initialPosts,
  total,
  initialFlair,
  initialSearch,
  initialGearKw,
  initialSort,
  initialPage,
  pageSize,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // フィルター状態
  const [flair, setFlair] = useState(initialFlair);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState<'pop' | 'new'>(initialSort);
  const [page, setPage] = useState(initialPage);

  // 表示制御
  const [openPosts, setOpenPosts] = useState<Set<string>>(new Set());
  const [showNewPost, setShowNewPost] = useState(false);
  const [replyTo, setReplyTo] = useState<{ postId: string; commentId: string; author: string } | null>(null);

  // 投稿フォーム
  const [newPost, setNewPost] = useState({ author: '', flair: 'ギター', title: '', body: '', gearTag: '' });
  const [newComment, setNewComment] = useState<Record<string, { author: string; body: string }>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // クエリを更新してページ再レンダリング
  function pushQuery(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const merged = { flair, q: search, sort, page: String(page), ...params };
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== 'すべて' && v !== '0' && v !== 'pop') sp.set(k, v);
    });
    startTransition(() => router.push(`/bbs?${sp.toString()}`));
  }

  function handleFlairChange(f: string) {
    setFlair(f);
    setPage(0);
    pushQuery({ flair: f, page: '0' });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    pushQuery({ q: search, page: '0' });
  }

  function handleSort(s: 'pop' | 'new') {
    setSort(s);
    setPage(0);
    pushQuery({ sort: s, page: '0' });
  }

  function togglePost(id: string) {
    setOpenPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleVotePost(postId: string, delta: 1 | -1) {
    const result = await votePost(postId, delta);
    if (!result.ok) alert(result.error);
  }

  async function handleVoteComment(commentId: string, delta: 1 | -1) {
    const result = await voteComment(commentId, delta);
    if (!result.ok) alert(result.error);
  }

  async function handleSubmitPost(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!newPost.title.trim() || !newPost.body.trim()) {
      setSubmitError('タイトルと本文は必須です');
      return;
    }
    const result = await createPost({
      author: newPost.author || '名無し',
      flair: newPost.flair,
      title: newPost.title,
      body: newPost.body,
      gear_tag: newPost.gearTag || undefined,
    });
    if (result.ok) {
      setNewPost({ author: '', flair: 'ギター', title: '', body: '', gearTag: '' });
      setShowNewPost(false);
      router.refresh();
    } else {
      setSubmitError(result.error);
    }
  }

  async function handleSubmitComment(postId: string, e: React.FormEvent) {
    e.preventDefault();
    const c = newComment[postId];
    if (!c?.body.trim()) return;
    const result = await createComment({
      post_id: postId,
      author: c.author || '名無し',
      body: c.body,
      reply_to: replyTo?.commentId,
    });
    if (result.ok) {
      setNewComment(prev => ({ ...prev, [postId]: { author: '', body: '' } }));
      setReplyTo(null);
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <main className="page fade">
      <div className="bbs-layout">
        {/* ── メインコンテンツ ─── */}
        <div className="bbs-main">
          {/* ヘッダー */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 800 }}>📋 掲示板</h1>
            <button
              className="new-post-btn"
              onClick={() => setShowNewPost(v => !v)}
              style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
            >
              ＋ 新規スレッド
            </button>
          </div>

          {/* ソート */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            <button
              className={`sort-btn${sort === 'pop' ? ' on' : ''}`}
              onClick={() => handleSort('pop')}
              style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', fontWeight: sort === 'pop' ? 700 : 400, background: sort === 'pop' ? '#1a1a1a' : '#fff', color: sort === 'pop' ? '#fff' : '#333' }}
            >
              🔥 人気順
            </button>
            <button
              className={`sort-btn${sort === 'new' ? ' on' : ''}`}
              onClick={() => handleSort('new')}
              style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', fontWeight: sort === 'new' ? 700 : 400, background: sort === 'new' ? '#1a1a1a' : '#fff', color: sort === 'new' ? '#fff' : '#333' }}
            >
              🕐 新着順
            </button>
          </div>

          {/* BBS検索 */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            <input
              className="s-in"
              type="search"
              placeholder="スレッドを検索…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="s-btn">検索</button>
          </form>

          {/* 機材フィルターバナー */}
          {initialGearKw && (
            <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '8px', padding: '8px 12px', marginBottom: '10px', fontSize: '13px' }}>
              🔍 <b>{initialGearKw}</b> 関連のスレッドを表示中
              <button
                onClick={() => pushQuery({ gear: undefined })}
                style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#d97706' }}
              >
                × 解除
              </button>
            </div>
          )}

          {/* 新規投稿フォーム */}
          {showNewPost && (
            <form onSubmit={handleSubmitPost} className="new-post-form" style={{ background: '#fafaf8', border: '1px solid #e4e2dd', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '10px' }}>新規スレッドを立てる</div>
              {submitError && <div style={{ color: '#cc0000', fontSize: '12px', marginBottom: '8px' }}>{submitError}</div>}
              <div style={{ display: 'grid', gap: '8px' }}>
                <input className="bbs-in" placeholder="名前（省略可）" value={newPost.author} onChange={e => setNewPost(p => ({ ...p, author: e.target.value }))} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' }} />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select className="bbs-in" value={newPost.flair} onChange={e => setNewPost(p => ({ ...p, flair: e.target.value }))} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', flex: 1 }}>
                    {BBS_CATS.filter(c => c !== 'すべて').map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input className="bbs-in" placeholder="機材タグ（例：Telecaster）" value={newPost.gearTag} onChange={e => setNewPost(p => ({ ...p, gearTag: e.target.value }))} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', flex: 2 }} />
                </div>
                <input className="bbs-in" placeholder="タイトル（必須）" value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' }} />
                <textarea className="bbs-in" placeholder="本文（必須）" value={newPost.body} onChange={e => setNewPost(p => ({ ...p, body: e.target.value }))} rows={4} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="submit" style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 18px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>投稿する</button>
                <button type="button" onClick={() => setShowNewPost(false)} style={{ background: '#f0ede7', color: '#555', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '13px', cursor: 'pointer' }}>キャンセル</button>
              </div>
            </form>
          )}

          {/* 投稿一覧 */}
          {initialPosts.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#aaa', padding: '40px 0' }}>
              スレッドがまだありません。最初に投稿してみましょう！
            </div>
          ) : (
            initialPosts.map(p => (
              <PostCard
                key={p.id}
                post={p}
                isOpen={openPosts.has(p.id)}
                onToggle={() => togglePost(p.id)}
                onVote={delta => handleVotePost(p.id, delta)}
                commentValue={newComment[p.id] ?? { author: '', body: '' }}
                onCommentChange={val => setNewComment(prev => ({ ...prev, [p.id]: val }))}
                onSubmitComment={e => handleSubmitComment(p.id, e)}
                replyTo={replyTo}
                onSetReplyTo={setReplyTo}
                onVoteComment={handleVoteComment}
              />
            ))
          )}

          {/* ページネーション */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '20px' }}>
              {page > 0 && (
                <button onClick={() => { setPage(page - 1); pushQuery({ page: String(page - 1) }); }} style={{ padding: '6px 14px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
                  ← 前へ
                </button>
              )}
              <span style={{ padding: '6px 12px', fontSize: '13px', color: '#888' }}>
                {page + 1} / {totalPages}
              </span>
              {page < totalPages - 1 && (
                <button onClick={() => { setPage(page + 1); pushQuery({ page: String(page + 1) }); }} style={{ padding: '6px 14px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
                  次へ →
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── サイドバー ─── */}
        <aside className="bbs-sidebar">
          <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>カテゴリ</div>
          {BBS_CATS.map(c => (
            <button
              key={c}
              onClick={() => handleFlairChange(c)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '7px 10px', marginBottom: '3px', borderRadius: '6px',
                border: 'none', cursor: 'pointer', fontSize: '13px',
                background: flair === c ? '#1a1a1a' : 'transparent',
                color: flair === c ? '#fff' : '#555',
                fontWeight: flair === c ? 700 : 400,
              }}
            >
              {c}
            </button>
          ))}
        </aside>
      </div>
    </main>
  );
}

// ── 投稿カード ──────────────────────────────────────────────
interface PostCardProps {
  post: BbsPost;
  isOpen: boolean;
  onToggle: () => void;
  onVote: (delta: 1 | -1) => void;
  commentValue: { author: string; body: string };
  onCommentChange: (v: { author: string; body: string }) => void;
  onSubmitComment: (e: React.FormEvent) => void;
  replyTo: { postId: string; commentId: string; author: string } | null;
  onSetReplyTo: (r: { postId: string; commentId: string; author: string } | null) => void;
  onVoteComment: (id: string, delta: 1 | -1) => void;
}

function PostCard({ post: p, isOpen, onToggle, onVote, commentValue, onCommentChange, onSubmitComment, replyTo, onSetReplyTo, onVoteComment }: PostCardProps) {
  const flairCls = FLAIR_CLS[p.flair] ?? 'f-other';
  const comments = p.bbs_comments ?? [];
  const excerpt = (p.body ?? '').slice(0, 120);

  // 購入リンク
  const buyLinks = p.gear_tag ? (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
      <a className="g-buy ba" href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(p.gear_tag)}`} target="_blank" rel="noopener noreferrer">🛒 Amazon</a>
      <a className="g-buy br" href={`https://search.rakuten.co.jp/search/mall/${encodeURIComponent(p.gear_tag)}/`} target="_blank" rel="noopener noreferrer">楽天</a>
      <a className="g-buy by" href={`https://shopping.yahoo.co.jp/search?p=${encodeURIComponent(p.gear_tag)}`} target="_blank" rel="noopener noreferrer">Yahoo</a>
    </div>
  ) : null;

  return (
    <div className="post-card">
      <div style={{ display: 'flex', gap: '10px' }}>
        {/* 投票カラム */}
        <div className="vote-col">
          <button className="vote-btn up" onClick={() => onVote(1)} title="いいね">▲</button>
          <div className="vote-n">{p.votes}</div>
          <button className="vote-btn dn" onClick={() => onVote(-1)} title="よくない">▼</button>
        </div>

        {/* 投稿本文 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span className={`flair ${flairCls}`}>{p.flair}</span>
            {p.gear_tag && (
              <span style={{ fontSize: '11px', background: '#f0ede7', borderRadius: '4px', padding: '1px 6px', color: '#888' }}>
                🎸 {p.gear_tag}
              </span>
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px', lineHeight: 1.35 }}>
            {p.title}
          </div>
          <div style={{ fontSize: '12px', color: '#777', marginBottom: '6px' }}>
            {excerpt}{(p.body ?? '').length > 120 ? '…' : ''}
          </div>
          {buyLinks}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px', fontSize: '12px', color: '#aaa' }}>
            <span>{p.author}</span>
            <span>{new Date(p.created_at).toLocaleDateString('ja-JP')}</span>
            <button
              onClick={onToggle}
              style={{ background: 'none', border: '1px solid #e4e2dd', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', color: '#555', padding: '3px 8px' }}
            >
              💬 {comments.length}件のコメント {isOpen ? '▲' : '▼'}
            </button>
          </div>
        </div>
      </div>

      {/* コメントセクション */}
      {isOpen && (
        <div className="comments-section" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0ede7' }}>
          {/* コメント一覧 */}
          {comments.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              {comments.map(c => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  onReply={() => onSetReplyTo({ postId: p.id, commentId: c.id, author: c.author })}
                  onVote={delta => onVoteComment(c.id, delta)}
                  allComments={comments}
                />
              ))}
            </div>
          )}

          {/* 返信先表示 */}
          {replyTo?.postId === p.id && (
            <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '6px', padding: '6px 10px', marginBottom: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>↩ <b>{replyTo.author}</b> への返信</span>
              <button onClick={() => onSetReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>×</button>
            </div>
          )}

          {/* コメント入力フォーム */}
          <form onSubmit={onSubmitComment} style={{ display: 'grid', gap: '6px' }}>
            <input
              placeholder="名前（省略可）"
              value={commentValue.author}
              onChange={e => onCommentChange({ ...commentValue, author: e.target.value })}
              style={{ padding: '7px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' }}
            />
            <textarea
              placeholder="コメントを入力…"
              value={commentValue.body}
              onChange={e => onCommentChange({ ...commentValue, body: e.target.value })}
              rows={3}
              style={{ padding: '7px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', resize: 'vertical' }}
            />
            <button type="submit" style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', alignSelf: 'flex-start' }}>
              コメントする
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ── コメントアイテム ────────────────────────────────────────
interface CommentItemProps {
  comment: BbsComment;
  onReply: () => void;
  onVote: (delta: 1 | -1) => void;
  allComments: BbsComment[];
}

function CommentItem({ comment: c, onReply, onVote, allComments }: CommentItemProps) {
  const parent = c.reply_to ? allComments.find(x => x.id === c.reply_to) : null;
  const isNested = !!c.reply_to;

  return (
    <div style={{ marginLeft: isNested ? '20px' : '0', borderLeft: isNested ? '2px solid #e4e2dd' : 'none', paddingLeft: isNested ? '10px' : '0', marginBottom: '8px' }}>
      {parent && (
        <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '3px' }}>
          ↩ {parent.author} への返信
        </div>
      )}
      <div style={{ background: '#fafaf8', borderRadius: '8px', padding: '8px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: '12px' }}>{c.author}</span>
              <span style={{ fontSize: '11px', color: '#bbb' }}>{new Date(c.created_at).toLocaleDateString('ja-JP')}</span>
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.6 }}>{c.body}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
            <button onClick={() => onVote(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#aaa' }}>▲</button>
            <span style={{ fontSize: '11px', fontWeight: 600 }}>{c.votes}</span>
          </div>
        </div>
        <button onClick={onReply} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#aaa', marginTop: '4px', padding: 0 }}>
          ↩ 返信
        </button>
      </div>
    </div>
  );
}
