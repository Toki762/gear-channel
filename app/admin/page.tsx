'use client';
// =============================================================
// 管理画面 — /admin
// 機材・アーティストをフォームで追加・削除できます
// =============================================================
import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { DB } from '@/data/artists';

const CORRECT_PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'gear-admin';

// カテゴリ一覧（cat と catIcon のセット）
const CATEGORIES = [
  { cat: 'ギター',           catIcon: '🎸' },
  { cat: 'ベース',           catIcon: '🎸' },
  { cat: 'アンプ',           catIcon: '🔊' },
  { cat: 'エフェクター',     catIcon: '⚡'  },
  { cat: 'ギターエフェクター', catIcon: '⚡' },
  { cat: 'ベースエフェクター', catIcon: '⚡' },
  { cat: 'キーボード/鍵盤',  catIcon: '🎹' },
  { cat: 'シンセ/プラグイン', catIcon: '🎛️' },
  { cat: 'DAW',              catIcon: '💻' },
  { cat: 'マイク',            catIcon: '🎤' },
  { cat: '音響機材',          catIcon: '🎚️' },
  { cat: 'ドラム',            catIcon: '🥁' },
  { cat: 'その他',            catIcon: '🎵' },
];

// 全アーティスト（TypeScript DB のみ）
const ALL_ARTISTS = DB.map(a => ({ id: a.id, name: a.name }));

// ───────────────────────────────────────────────
// メイン
// ───────────────────────────────────────────────
export default function AdminPage() {
  const [pass, setPass] = useState('');
  const [authed, setAuthed] = useState(false);
  const [passError, setPassError] = useState(false);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (pass === CORRECT_PASS) {
      setAuthed(true);
    } else {
      setPassError(true);
    }
  }

  if (!authed) {
    return (
      <main style={{ maxWidth: 400, margin: '80px auto', padding: '0 16px' }}>
        <div style={{ background: '#fff', border: '1px solid #e4e2dd', borderRadius: 12, padding: 28 }}>
          <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 8 }}>🔐</div>
          <h1 style={{ fontSize: 18, fontWeight: 800, textAlign: 'center', marginBottom: 20 }}>管理画面</h1>
          <form onSubmit={login}>
            <input
              type="password"
              placeholder="パスワードを入力"
              value={pass}
              onChange={e => { setPass(e.target.value); setPassError(false); }}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginBottom: 10 }}
              autoFocus
            />
            {passError && <div style={{ color: '#cc0000', fontSize: 12, marginBottom: 8 }}>パスワードが違います</div>}
            <button
              type="submit"
              style={{ width: '100%', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              ログイン
            </button>
          </form>
        </div>
      </main>
    );
  }

  return <AdminPanel />;
}

// ───────────────────────────────────────────────
// 管理パネル本体
// ───────────────────────────────────────────────
function AdminPanel() {
  const [tab, setTab] = useState<'gear' | 'artist' | 'list'>('gear');

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '20px 16px 60px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>⚙️ 管理画面</h1>
      <p style={{ fontSize: 12, color: '#aaa', marginBottom: 20 }}>機材・アーティストの追加・削除ができます</p>

      {/* タブ */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '2px solid #e4e2dd', paddingBottom: 0 }}>
        {([['gear', '🎸 機材を追加'], ['artist', '🎤 アーティストを追加'], ['list', '📋 追加済み一覧']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: '8px 16px', border: 'none', borderRadius: '6px 6px 0 0', cursor: 'pointer',
              fontWeight: tab === key ? 800 : 400, fontSize: 13,
              background: tab === key ? '#1a1a1a' : '#f0ede7',
              color: tab === key ? '#fff' : '#555',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'gear'   && <GearForm />}
      {tab === 'artist' && <ArtistForm />}
      {tab === 'list'   && <GearList />}
    </main>
  );
}

// ───────────────────────────────────────────────
// 機材追加フォーム
// ───────────────────────────────────────────────
interface AmazonItem {
  asin: string;
  title: string;
  imageUrl: string;
  pageUrl: string;
}

function GearForm() {
  const supabase = createBrowserClient();
  const [form, setForm] = useState({
    artistId: ALL_ARTISTS[0]?.id ?? '',
    name: '',
    brand: '',
    cat: 'ギター',
    catIcon: '🎸',
    user: '',
    price: '',
    desc: '',
    kw: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Amazon 検索
  const [amzLoading, setAmzLoading] = useState(false);
  const [amzResults, setAmzResults] = useState<AmazonItem[]>([]);
  const [amzError, setAmzError] = useState<string | null>(null);

  async function searchAmazon() {
    const q = [form.brand, form.name].filter(Boolean).join(' ').trim();
    if (!q) { setAmzError('機材名またはブランドを入力してください'); return; }
    setAmzLoading(true);
    setAmzError(null);
    setAmzResults([]);
    try {
      const res = await fetch(`/api/amazon-image?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) { setAmzError(data.error ?? 'Amazon APIエラー'); return; }
      if (!data.items?.length) { setAmzError('商品が見つかりませんでした'); return; }
      setAmzResults(data.items);
    } catch {
      setAmzError('通信エラーが発生しました');
    } finally {
      setAmzLoading(false);
    }
  }

  function pickAmazonImage(item: AmazonItem) {
    setForm(f => ({ ...f, imageUrl: item.imageUrl }));
    setAmzResults([]);
  }

  function setCategory(cat: string) {
    const found = CATEGORIES.find(c => c.cat === cat);
    setForm(f => ({ ...f, cat, catIcon: found?.catIcon ?? '🎵' }));
  }

  // 選択アーティストのメンバーリスト
  // members フィールドのセパレーターは ' / '（スペース付きスラッシュ）
  // 括弧内の '/' (例: Vo/Gt) と区別するため、前後にスペースがある ' / ' のみで分割
  const artist = DB.find(a => a.id === form.artistId);
  const memberList = artist?.members
    ? artist.members.split(/ \/ |[、,，\n]/).map(s => s.trim()).filter(Boolean)
    : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setMsg({ ok: false, text: '機材名を入力してください' }); return; }
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.from('db_gear').insert({
      artist_id: form.artistId,
      name: form.name.trim(),
      brand: form.brand.trim(),
      cat: form.cat,
      cat_icon: form.catIcon,
      user: form.user,
      price: form.price.trim(),
      gear_desc: form.desc.trim(),
      kw: form.kw.trim(),
      image_url: form.imageUrl.trim(),
    });

    setLoading(false);
    if (error) {
      setMsg({ ok: false, text: `エラー: ${error.message}` });
    } else {
      setMsg({ ok: true, text: '✅ 機材を追加しました！' });
      setForm(f => ({ ...f, name: '', brand: '', user: '', price: '', desc: '', kw: '' }));
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gap: 14 }}>

        {/* アーティスト選択 */}
        <div>
          <Label>アーティスト</Label>
          <select value={form.artistId} onChange={e => setForm(f => ({ ...f, artistId: e.target.value }))} style={inputStyle}>
            {ALL_ARTISTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        {/* カテゴリ */}
        <div>
          <Label>カテゴリ</Label>
          <select value={form.cat} onChange={e => setCategory(e.target.value)} style={inputStyle}>
            {CATEGORIES.map(c => <option key={c.cat} value={c.cat}>{c.catIcon} {c.cat}</option>)}
          </select>
        </div>

        {/* 機材名 & ブランド */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <Label>機材名 ＊必須</Label>
            <input placeholder="例: Stratocaster" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <Label>ブランド</Label>
            <input placeholder="例: Fender" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} style={inputStyle} />
          </div>
        </div>

        {/* 使用メンバー & 価格 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <Label>使用メンバー（バンドの場合）</Label>
            {memberList.length > 0 ? (
              <select value={form.user} onChange={e => setForm(f => ({ ...f, user: e.target.value }))} style={inputStyle}>
                <option value="">選択してください</option>
                <option value="全員">全員</option>
                {memberList.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              <input placeholder="メンバー名または空欄" value={form.user} onChange={e => setForm(f => ({ ...f, user: e.target.value }))} style={inputStyle} />
            )}
          </div>
          <div>
            <Label>価格（参考）</Label>
            <input placeholder="例: ¥150,000 〜" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={inputStyle} />
          </div>
        </div>

        {/* 検索キーワード */}
        <div>
          <Label>検索キーワード（機材名の英語表記など）</Label>
          <input placeholder="例: fender stratocaster strat" value={form.kw} onChange={e => setForm(f => ({ ...f, kw: e.target.value }))} style={inputStyle} />
        </div>

        {/* 商品画像URL + Amazon連携 */}
        <div>
          <Label>商品画像</Label>

          {/* PA API が使える場合：自動検索ボタン */}
          {process.env.NEXT_PUBLIC_AMAZON_PA_ENABLED === 'true' ? (
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button
                type="button"
                onClick={searchAmazon}
                disabled={amzLoading}
                style={{
                  background: amzLoading ? '#888' : '#f90',
                  color: '#111',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: amzLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {amzLoading ? '🔍 検索中…' : '🛒 Amazonで画像を自動取得'}
              </button>
              <span style={{ fontSize: 11, color: '#aaa', alignSelf: 'center' }}>ブランド＋機材名で検索</span>
            </div>
          ) : (
            /* PA API 未承認中：手動コピー案内 */
            <div style={{ background: '#f8f6f0', border: '1px solid #e4e2dd', borderRadius: 8, padding: '10px 12px', marginBottom: 10, fontSize: 12, color: '#555', lineHeight: 1.8 }}>
              <b>📋 画像URLの取得方法</b>（PA API承認後は自動化されます）<br />
              ① 下の「Amazonで検索」ボタンで商品ページを開く<br />
              ② 商品のメイン画像を<b>右クリック → 「画像のURLをコピー」</b><br />
              ③ 下の入力欄にペースト
              <div style={{ marginTop: 6 }}>
                <a
                  href={`https://www.amazon.co.jp/s?k=${encodeURIComponent([form.brand, form.name].filter(Boolean).join(' '))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    background: '#f90',
                    color: '#111',
                    fontWeight: 700,
                    fontSize: 12,
                    padding: '5px 12px',
                    borderRadius: 6,
                    textDecoration: 'none',
                  }}
                >
                  🛒 Amazonで検索して開く →
                </a>
              </div>
            </div>
          )}

          {/* Amazon検索エラー */}
          {amzError && (
            <div style={{ fontSize: 12, color: '#cc0000', marginBottom: 8 }}>{amzError}</div>
          )}

          {/* Amazon検索結果サムネイル（PA API使用時） */}
          {amzResults.length > 0 && (
            <div style={{ background: '#fff9f0', border: '1px solid #f90', borderRadius: 8, padding: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#c65000' }}>
                クリックして画像をセット
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {amzResults.map(item => (
                  <button
                    key={item.asin}
                    type="button"
                    onClick={() => pickAmazonImage(item)}
                    title={item.title}
                    style={{
                      background: '#fff',
                      border: '2px solid #e4e2dd',
                      borderRadius: 8,
                      padding: 4,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      width: 90,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#f90')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#e4e2dd')}
                  >
                    <img src={item.imageUrl} alt={item.title} style={{ width: 72, height: 72, objectFit: 'contain' }} />
                    <span style={{ fontSize: 9, color: '#888', lineHeight: 1.3, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setAmzResults([])} style={{ marginTop: 8, background: 'none', border: 'none', color: '#aaa', fontSize: 11, cursor: 'pointer' }}>
                × 閉じる
              </button>
            </div>
          )}

          {/* 画像URL入力 */}
          <input
            placeholder="画像URLをペースト（例: https://m.media-amazon.com/images/I/...）"
            value={form.imageUrl}
            onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
            style={inputStyle}
          />

          {/* プレビュー */}
          {form.imageUrl && (
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src={form.imageUrl}
                alt="プレビュー"
                style={{ width: 80, height: 80, objectFit: 'contain', border: '1px solid #e4e2dd', borderRadius: 6, background: '#fafaf8' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div style={{ fontSize: 11, color: '#555' }}>
                ← プレビュー
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                  style={{ marginLeft: 8, background: 'none', border: 'none', color: '#cc4444', cursor: 'pointer', fontSize: 11 }}
                >
                  × クリア
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 説明 */}
        <div>
          <Label>機材の説明・メモ</Label>
          <textarea
            placeholder="例: ○○ツアーで使用。ボディカラーはSunburst。"
            value={form.desc}
            onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {msg && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: msg.ok ? '#f0fdf4' : '#fef2f2', color: msg.ok ? '#166534' : '#991b1b', fontSize: 13 }}>
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={loading} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 800, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? '保存中…' : '🎸 機材を追加する'}
        </button>
      </div>
    </form>
  );
}

// ───────────────────────────────────────────────
// 新規アーティスト追加フォーム
// ───────────────────────────────────────────────
function ArtistForm() {
  const supabase = createBrowserClient();
  const [form, setForm] = useState({
    id: '', name: '', en: '', genre: '', since: '', origin: '', members: '', desc: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function makeId(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').slice(0, 40);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setMsg({ ok: false, text: 'アーティスト名を入力してください' }); return; }
    const id = form.id.trim() || makeId(form.name);
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.from('db_artists').insert({
      id,
      name: form.name.trim(),
      en: form.en.trim(),
      genre: form.genre.trim(),
      since: form.since.trim(),
      origin: form.origin.trim(),
      members: form.members.trim(),
      artist_desc: form.desc.trim(),
    });

    setLoading(false);
    if (error) {
      setMsg({ ok: false, text: `エラー: ${error.message}` });
    } else {
      setMsg({ ok: true, text: `✅ アーティスト「${form.name}」を追加しました！機材の追加は「機材を追加」タブから行ってください。` });
      setForm({ id: '', name: '', en: '', genre: '', since: '', origin: '', members: '', desc: '' });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#92600a' }}>
        💡 既存のアーティスト（YOASOBI・ヒゲダンなど）はすでに登録済みです。新しいアーティストを追加する場合のみ使ってください。
      </div>
      <div style={{ display: 'grid', gap: 14 }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <Label>アーティスト名（日本語）＊必須</Label>
            <input placeholder="例: 米津玄師" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <Label>アーティスト名（英語）</Label>
            <input placeholder="例: Kenshi Yonezu" value={form.en} onChange={e => setForm(f => ({ ...f, en: e.target.value }))} style={inputStyle} />
          </div>
        </div>

        <div>
          <Label>ID（URLに使う英数字）— 空欄で自動生成</Label>
          <input placeholder="例: kenshi-yonezu" value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} style={inputStyle} />
          {form.name && !form.id && (
            <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>自動生成: {makeId(form.name)}</div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div>
            <Label>ジャンル</Label>
            <input placeholder="例: J-Pop" value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <Label>デビュー年</Label>
            <input placeholder="例: 2009" value={form.since} onChange={e => setForm(f => ({ ...f, since: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <Label>出身地</Label>
            <input placeholder="例: 東京都" value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))} style={inputStyle} />
          </div>
        </div>

        <div>
          <Label>メンバー（バンドの場合、読点で区切る）</Label>
          <input placeholder="例: 藤原聡、楢﨑誠、小笹大輔、髙巣那奈" value={form.members} onChange={e => setForm(f => ({ ...f, members: e.target.value }))} style={inputStyle} />
        </div>

        <div>
          <Label>アーティスト紹介文</Label>
          <textarea
            placeholder="例: ○○年デビューのシンガーソングライター。ドラムとシンセを中心に..."
            value={form.desc}
            onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {msg && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: msg.ok ? '#f0fdf4' : '#fef2f2', color: msg.ok ? '#166534' : '#991b1b', fontSize: 13 }}>
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={loading} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 800, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? '保存中…' : '🎤 アーティストを追加する'}
        </button>
      </div>
    </form>
  );
}

// ───────────────────────────────────────────────
// 追加済み機材一覧
// ───────────────────────────────────────────────
function GearList() {
  const supabase = createBrowserClient();
  const [gear, setGear] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterArtist, setFilterArtist] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [gearRes, artistRes] = await Promise.all([
      supabase.from('db_gear').select('*').order('created_at', { ascending: false }),
      supabase.from('db_artists').select('*').order('name'),
    ]);
    setGear(gearRes.data ?? []);
    setArtists(artistRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function deleteGear(id: string) {
    if (!confirm('この機材を削除しますか？')) return;
    setDeleting(id);
    await supabase.from('db_gear').delete().eq('id', id);
    setDeleting(null);
    load();
  }

  function startEdit(g: any) {
    setEditingId(g.id);
    setEditForm({
      name: g.name ?? '',
      brand: g.brand ?? '',
      cat: g.cat ?? '',
      user: g.user ?? '',
      price: g.price ?? '',
      gear_desc: g.gear_desc ?? '',
      kw: g.kw ?? '',
      image_url: g.image_url ?? '',
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    const catIcon = CATEGORIES.find(c => c.cat === editForm.cat)?.catIcon ?? '🎵';
    const { error } = await supabase.from('db_gear').update({ ...editForm, cat_icon: catIcon }).eq('id', editingId);
    setSaving(false);
    if (error) { alert('保存エラー: ' + error.message); return; }
    setEditingId(null);
    load();
  }

  async function deleteArtist(id: string) {
    if (!confirm(`このアーティストを削除しますか？\n※ このアーティストの機材データも一緒に削除してください。`)) return;
    await supabase.from('db_artists').delete().eq('id', id);
    load();
  }

  const artistName = (id: string) => {
    const ts = DB.find(a => a.id === id);
    if (ts) return ts.name;
    const db = artists.find(a => a.id === id);
    return db?.name ?? id;
  };

  const filtered = filterArtist ? gear.filter(g => g.artist_id === filterArtist) : gear;

  if (loading) return <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>読み込み中…</div>;

  return (
    <div>
      {/* Supabase追加アーティスト一覧 */}
      {artists.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>🎤 追加したアーティスト ({artists.length}件)</div>
          <div style={{ display: 'grid', gap: 6 }}>
            {artists.map(a => (
              <div key={a.id} style={{ background: '#fff', border: '1px solid #e4e2dd', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700 }}>{a.name}</span>
                  {a.en && <span style={{ color: '#aaa', fontSize: 12, marginLeft: 8 }}>{a.en}</span>}
                  {a.genre && <span style={{ background: '#f0ede7', color: '#666', fontSize: 11, padding: '1px 6px', borderRadius: 4, marginLeft: 8 }}>{a.genre}</span>}
                </div>
                <button onClick={() => deleteArtist(a.id)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>削除</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 機材一覧 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>🎸 追加した機材 ({gear.length}件)</div>
        <select value={filterArtist} onChange={e => setFilterArtist(e.target.value)} style={{ ...inputStyle, width: 'auto', fontSize: 12 }}>
          <option value="">すべてのアーティスト</option>
          {Array.from(new Set(gear.map(g => g.artist_id))).map(id => (
            <option key={id} value={id}>{artistName(id)}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#aaa', padding: '30px 0' }}>機材がまだ追加されていません</div>
      ) : (
        <div style={{ display: 'grid', gap: 6 }}>
          {filtered.map(g => (
            <div key={g.id} style={{ background: '#fff', border: `1px solid ${editingId === g.id ? '#6366f1' : '#e4e2dd'}`, borderRadius: 8, padding: '10px 14px' }}>
              {editingId === g.id ? (
                // ── インライン編集フォーム ──
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>✏️ 機材を編集</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div><Label>ブランド</Label><input value={editForm.brand} onChange={e => setEditForm((f: any) => ({ ...f, brand: e.target.value }))} style={inputStyle} /></div>
                    <div><Label>機材名 ＊</Label><input value={editForm.name} onChange={e => setEditForm((f: any) => ({ ...f, name: e.target.value }))} style={inputStyle} /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <Label>カテゴリ</Label>
                      <select value={editForm.cat} onChange={e => setEditForm((f: any) => ({ ...f, cat: e.target.value }))} style={inputStyle}>
                        {CATEGORIES.map(c => <option key={c.cat} value={c.cat}>{c.catIcon} {c.cat}</option>)}
                      </select>
                    </div>
                    <div><Label>使用メンバー</Label><input value={editForm.user} onChange={e => setEditForm((f: any) => ({ ...f, user: e.target.value }))} style={inputStyle} /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div><Label>検索キーワード(kw)</Label><input value={editForm.kw} onChange={e => setEditForm((f: any) => ({ ...f, kw: e.target.value }))} style={inputStyle} /></div>
                    <div><Label>画像URL</Label><input value={editForm.image_url} onChange={e => setEditForm((f: any) => ({ ...f, image_url: e.target.value }))} style={inputStyle} placeholder="https://..." /></div>
                  </div>
                  <div><Label>説明文</Label><textarea value={editForm.gear_desc} onChange={e => setEditForm((f: any) => ({ ...f, gear_desc: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={saveEdit} disabled={saving} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      {saving ? '保存中…' : '💾 保存'}
                    </button>
                    <button onClick={() => setEditingId(null)} style={{ background: '#f0ede7', color: '#555', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>キャンセル</button>
                  </div>
                </div>
              ) : (
                // ── 通常表示 ──
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontSize: 13 }}>{g.cat_icon}</span>
                      <span style={{ background: '#f0ede7', color: '#666', fontSize: 11, padding: '1px 6px', borderRadius: 4 }}>{g.cat}</span>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{g.brand ? `${g.brand} ` : ''}{g.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#888' }}>
                      🎤 {artistName(g.artist_id)}
                      {g.user && <span style={{ marginLeft: 8 }}>👤 {g.user}</span>}
                    </div>
                    {g.gear_desc && <div style={{ fontSize: 12, color: '#aaa', marginTop: 3 }}>{g.gear_desc.slice(0, 60)}{g.gear_desc.length > 60 ? '…' : ''}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 10 }}>
                    <button onClick={() => startEdit(g)} style={{ background: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>編集</button>
                    <button onClick={() => deleteGear(g.id)} disabled={deleting === g.id} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                      {deleting === g.id ? '…' : '削除'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────
// 共通スタイル
// ───────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 11px',
  border: '1px solid #ddd',
  borderRadius: 7,
  fontSize: 13,
  background: '#fafaf8',
  outline: 'none',
};

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>{children}</div>;
}
