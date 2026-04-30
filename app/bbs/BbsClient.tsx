'use client';
// =============================================================
// BbsClient — 掲示板の全インタラクション
// ソート・フィルター・投票・新規投稿・コメント
// =============================================================
import { useState, useTransition, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { BbsPost, BbsComment } from '@/lib/types';
import { BBS_CATS, FLAIR_CLS } from '@/data/config';
import { createPost, createComment } from './actions';
import { linkifyGear, type Segment, type DbGearEntry } from '@/data/gearIndex';
import AdUnit from '@/components/AdUnit';
import BuybackBanner from '@/components/BuybackBanner';
import { type Locale, t, localeCat } from '@/lib/i18n';

// 機材名を薄いリンクに変換するコンポーネント
function GearLinkedText({ text, dbGear }: { text: string; dbGear?: DbGearEntry[] }) {
  const segments: Segment[] = linkifyGear(text, dbGear);
  return (
    <>
      {segments.map((seg, i) =>
        seg.href ? (
          <a
            key={i}
            href={seg.href}
            style={{ color: 'inherit', opacity: 0.55, textDecoration: 'underline', textDecorationStyle: 'dotted', textDecorationColor: 'currentColor' }}
            title={`機材ページ: ${seg.gearName}`}
            onClick={e => e.stopPropagation()}
          >
            {seg.text}
          </a>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}

const NAME_KEY = 'bbs_author_name';

interface Props {
  initialPosts: BbsPost[];
  total: number;
  initialFlair: string;
  initialSearch: string;
  initialGearKw: string;
  initialSort: 'pop' | 'new';
  initialPage: number;
  pageSize: number;
  dbGear?: DbGearEntry[];
  locale?: Locale;
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
  dbGear = [],
  locale = 'ja',
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // フィルター状態
  const [flair, setFlair] = useState(initialFlair);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState<'pop' | 'new'>(initialSort);
  const [page, setPage] = useState(initialPage);

  // ページ遷移時に検索バーをリセット
  useEffect(() => {
    setSearch('');
  }, [pathname]);

  // 表示制御
  const [openPosts, setOpenPosts] = useState<Set<string>>(new Set());
  const [showNewPost, setShowNewPost] = useState(false);
  const [replyTo, setReplyTo] = useState<{ postId: string; commentId: string; author: string } | null>(null);

  // 投稿フォーム（名前はlocalStorageから復元）
  const [savedName, setSavedName] = useState('');
  useEffect(() => {
    const name = localStorage.getItem(NAME_KEY) ?? '';
    setSavedName(name);
    setNewPost(p => ({ ...p, author: name }));
  }, []);

  const [newPost, setNewPost] = useState({ author: '', flair: 'ギター', title: '', body: '', gearTag: '' });
  const [newComment, setNewComment] = useState<Record<string, { author: string; body: string }>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState<Record<string, boolean>>({});

  // 名前が変わったらlocalStorageに保存
  function setAuthorName(name: string) {
    setNewPost(p => ({ ...p, author: name }));
    localStorage.setItem(NAME_KEY, name);
  }

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

  async function handleSubmitPost(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmittingPost) return; // 二重送信防止
    setSubmitError(null);
    if (!newPost.title.trim() || !newPost.body.trim()) {
      setSubmitError('タイトルと本文は必須です');
      return;
    }
    setIsSubmittingPost(true);
    try {
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
    } finally {
      setIsSubmittingPost(false);
    }
  }

  async function handleSubmitComment(postId: string, e: React.FormEvent) {
    e.preventDefault();
    if (isSubmittingComment[postId]) return; // 二重送信防止
    const c = newComment[postId];
    if (!c?.body.trim()) return;
    // コメント欄の名前もlocalStorageに保存
    if (c.author) localStorage.setItem(NAME_KEY, c.author);
    setIsSubmittingComment(prev => ({ ...prev, [postId]: true }));
    try {
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
    } finally {
      setIsSubmittingComment(prev => ({ ...prev, [postId]: false }));
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
            <h1 style={{ fontSize: '18px', fontWeight: 800 }}>📋 {t(locale, 'navBbs')}</h1>
            <button
              className="new-post-btn"
              onClick={() => setShowNewPost(v => !v)}
              style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
            >
              {t(locale, 'bbsNewThread')}
            </button>
          </div>

          {/* ソート */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            <button
              className={`sort-btn${sort === 'pop' ? ' on' : ''}`}
              onClick={() => handleSort('pop')}
              style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', fontWeight: sort === 'pop' ? 700 : 400, background: sort === 'pop' ? '#1a1a1a' : '#fff', color: sort === 'pop' ? '#fff' : '#333' }}
            >
              {t(locale, 'bbsPopular')}
            </button>
            <button
              className={`sort-btn${sort === 'new' ? ' on' : ''}`}
              onClick={() => handleSort('new')}
              style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', fontWeight: sort === 'new' ? 700 : 400, background: sort === 'new' ? '#1a1a1a' : '#fff', color: sort === 'new' ? '#fff' : '#333' }}
            >
              {t(locale, 'bbsLatest')}
            </button>
          </div>

          {/* BBS検索 */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            <input
              className="s-in"
              type="search"
              placeholder={t(locale, 'bbsSearchPh')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="s-btn">{t(locale, 'bbsSearchBtn')}</button>
          </form>

          {/* 機材フィルターバナー */}
          {initialGearKw && (
            <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '8px', padding: '8px 12px', marginBottom: '10px', fontSize: '13px' }}>
              <b>{initialGearKw}</b> {locale === 'en' ? 'related threads' : '関連のスレッドを表示中'}
              <button
                onClick={() => pushQuery({ gear: undefined })}
                style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#d97706' }}
              >
                {t(locale, 'bbsGearClear')}
              </button>
            </div>
          )}

          {/* 広告（投稿フォームの上） */}
          <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BBS ?? ''} className="my-3" />

          {/* 新規投稿フォーム */}
          {showNewPost && (
            <form onSubmit={handleSubmitPost} className="new-post-form" style={{ background: '#fafaf8', border: '1px solid #e4e2dd', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '10px' }}>{t(locale, 'bbsPostFormTitle')}</div>
              {submitError && <div style={{ color: '#cc0000', fontSize: '12px', marginBottom: '8px' }}>{submitError}</div>}
              <div style={{ display: 'grid', gap: '8px' }}>
                <input className="bbs-in" placeholder={t(locale, 'bbsNamePh')} value={newPost.author} onChange={e => setAuthorName(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' }} />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select className="bbs-in" value={newPost.flair} onChange={e => setNewPost(p => ({ ...p, flair: e.target.value }))} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', flex: 1 }}>
                    {BBS_CATS.filter(c => c !== 'すべて').map(c => <option key={c} value={c}>{localeCat(locale, c)}</option>)}
                  </select>
                  <input className="bbs-in" placeholder={t(locale, 'bbsGearTagPh')} value={newPost.gearTag} onChange={e => setNewPost(p => ({ ...p, gearTag: e.target.value }))} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', flex: 2 }} />
                </div>
                <input className="bbs-in" placeholder={locale === 'en' ? 'Title (required)' : 'タイトル（必須）'} value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' }} />
                <textarea className="bbs-in" placeholder={locale === 'en' ? 'Body (required)' : '本文（必須）'} value={newPost.body} onChange={e => setNewPost(p => ({ ...p, body: e.target.value }))} rows={4} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="submit" disabled={isSubmittingPost} style={{ background: isSubmittingPost ? '#888' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 18px', fontWeight: 700, fontSize: '13px', cursor: isSubmittingPost ? 'not-allowed' : 'pointer', opacity: isSubmittingPost ? 0.7 : 1 }}>
                  {isSubmittingPost ? t(locale, 'bbsSubmittingBtn') : t(locale, 'bbsSubmitBtn')}
                </button>
                <button type="button" onClick={() => setShowNewPost(false)} disabled={isSubmittingPost} style={{ background: '#f0ede7', color: '#555', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '13px', cursor: 'pointer' }}>{t(locale, 'bbsCancelBtn')}</button>
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
                commentValue={newComment[p.id] ?? { author: savedName, body: '' }}
                onCommentChange={val => setNewComment(prev => ({ ...prev, [p.id]: val }))}
                onSubmitComment={e => handleSubmitComment(p.id, e)}
                isSubmittingComment={!!isSubmittingComment[p.id]}
                replyTo={replyTo}
                onSetReplyTo={setReplyTo}
                dbGear={dbGear}
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
          <div className="bbs-sidebar-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>カテゴリ</div>
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

          {/* 買取バナー（楽器を語るユーザー向け） */}
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '11px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>PR</div>
            <BuybackBanner variant="image" />
            <div style={{ marginTop: '12px' }}>
              <BuybackBanner />
            </div>
          </div>
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
  commentValue: { author: string; body: string };
  onCommentChange: (v: { author: string; body: string }) => void;
  onSubmitComment: (e: React.FormEvent) => void;
  isSubmittingComment: boolean;
  replyTo: { postId: string; commentId: string; author: string } | null;
  onSetReplyTo: (r: { postId: string; commentId: string; author: string } | null) => void;
  dbGear?: DbGearEntry[];
}

function PostCard({ post: p, isOpen, onToggle, commentValue, onCommentChange, onSubmitComment, isSubmittingComment, replyTo, onSetReplyTo, dbGear }: PostCardProps) {
  const flairCls = FLAIR_CLS[p.flair] ?? 'f-other';
  const comments = p.bbs_comments ?? [];
  const excerpt = (p.body ?? '').slice(0, 120);

  // 購入リンク（機材タグがある場合）
  const buyLinks = p.gear_tag ? (
    <div className="bbs-buy-links" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
      <a className="g-buy ba" href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(p.gear_tag)}`} target="_blank" rel="noopener noreferrer">🛒 Amazon</a>
      <a className="g-buy br" href={`https://search.rakuten.co.jp/search/mall/${encodeURIComponent(p.gear_tag)}/`} target="_blank" rel="noopener noreferrer">楽天</a>
      <a className="g-buy by" href={`https://shopping.yahoo.co.jp/search?p=${encodeURIComponent(p.gear_tag)}`} target="_blank" rel="noopener noreferrer">Yahoo</a>
      <a className="g-buy bs" href={`https://www.soundhouse.co.jp/search/index?search_all=${encodeURIComponent(p.gear_tag)}`} target="_blank" rel="noopener noreferrer">🎸 サウンドハウス</a>
    </div>
  ) : null;

  return (
    <div className="post-card">
      {/* 上部：投稿本文 */}
      <div style={{ display: 'flex', gap: '10px', padding: '12px 14px 10px' }}>
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
            <GearLinkedText text={excerpt} dbGear={dbGear} />{(p.body ?? '').length > 120 ? '…' : ''}
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

      {/* コメントセクション（下に展開） */}
      {isOpen && (
        <div className="comments-section" style={{ borderTop: '1px solid #f0ede7', padding: '12px 14px 14px' }}>
          {/* コメント一覧 */}
          {comments.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              {comments.map(c => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  onReply={() => onSetReplyTo({ postId: p.id, commentId: c.id, author: c.author })}
                  allComments={comments}
                  dbGear={dbGear}
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
            <button type="submit" disabled={isSubmittingComment} style={{ background: isSubmittingComment ? '#888' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontWeight: 700, fontSize: '13px', cursor: isSubmittingComment ? 'not-allowed' : 'pointer', opacity: isSubmittingComment ? 0.7 : 1, alignSelf: 'flex-start' }}>
              {isSubmittingComment ? '送信中…' : 'コメントする'}
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
  allComments: BbsComment[];
  dbGear?: DbGearEntry[];
}

function CommentItem({ comment: c, onReply, allComments, dbGear }: CommentItemProps) {
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
            <div style={{ fontSize: '13px', lineHeight: 1.6 }}><GearLinkedText text={c.body} dbGear={dbGear} /></div>
          </div>
        </div>
        <button onClick={onReply} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#aaa', marginTop: '4px', padding: 0 }}>
          ↩ 返信
        </button>
      </div>
    </div>
  );
}
