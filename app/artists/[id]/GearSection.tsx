'use client';
// =============================================================
// GearSection — Client Component
// カテゴリフィルター・アコーディオンカードのインタラクション
// =============================================================
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Artist, GearItem } from '@/lib/types';
import { getFxSubcat, FX_SUBCATS } from '@/data/config';
import { addUserGear } from './actions';

interface Props {
  artist: Artist;
  dbGear?: GearItem[]; // 管理画面から追加した機材
}

type EditOverride = {
  name?: string;
  price?: string;
  user?: string;
  cat?: string;
};

const ALL_CATS = ['ギター','ベース','アンプ','ギターエフェクター','ベースエフェクター','エフェクター','キーボード','シンセ/プラグイン','ドラム','DAW','マイク','音響機材'];

export default function GearSection({ artist, dbGear = [] }: Props) {
  const a = artist;
  const router = useRouter();

  const [openCards, setOpenCards] = useState<Set<string>>(new Set());
  const [editCard, setEditCard] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, { name: string; user: string; cat: string }>>({});
  const [catFilter, setCatFilter] = useState('すべて');
  const [fxSubcat, setFxSubcat] = useState('すべて');
  const [memberFilter, setMemberFilter] = useState<string | null>(null);
  const editsKey = `gear_edits_${a.id}`;
  const [edits, setEditsRaw] = useState<Record<string, EditOverride>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem(`gear_edits_${a.id}`) ?? '{}'); } catch { return {}; }
  });
  function setEdits(fn: (prev: Record<string, EditOverride>) => Record<string, EditOverride>) {
    setEditsRaw(prev => {
      const next = fn(prev);
      try { localStorage.setItem(editsKey, JSON.stringify(next)); } catch {}
      return next;
    });
  }
  const [userGear, setUserGear] = useState<GearItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ brand: '', name: '', cat: 'ギター', user: '', price: '', yt: '' });
  const [adding, setAdding] = useState(false);

  // 表示する機材リスト（静的データ＋管理画面追加分＋ユーザー追加分）
  let allGear = [...a.gear, ...dbGear, ...userGear];
  if (memberFilter) {
    const mf = memberFilter.replace(/\s*\(.*?\)/g, '').trim();
    allGear = allGear.filter(g => g.user && g.user.includes(mf));
  }

  const cats = ['すべて', ...Array.from(new Set(allGear.map(g => g.cat)))];
  let gears = catFilter === 'すべて' ? allGear : allGear.filter(g => g.cat === catFilter);
  if ((catFilter === 'ギターエフェクター' || catFilter === 'ベースエフェクター') && fxSubcat !== 'すべて') {
    gears = gears.filter(g => getFxSubcat(g) === fxSubcat);
  }

  const toggleCard = useCallback((key: string) => {
    setOpenCards(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setEditCard(null);
  }, []);

  function startEdit(gearId: string, currentName: string, currentUser: string, currentCat: string) {
    const key = `${a.id}-${gearId}`;
    setEditValues(prev => ({ ...prev, [key]: { name: currentName, user: currentUser, cat: currentCat } }));
    setEditCard(key);
  }

  function saveEdit(gearId: string) {
    const key = `${a.id}-${gearId}`;
    const vals = editValues[key];
    if (!vals) return;
    setEdits(prev => ({
      ...prev,
      [key]: {
        ...(vals.name.trim() ? { name: vals.name.trim() } : {}),
        ...(vals.user.trim() ? { user: vals.user.trim() } : {}),
        ...(vals.cat ? { cat: vals.cat } : {}),
      },
    }));
    setEditCard(null);
  }

  async function addGear() {
    if (!addForm.name.trim()) { alert('機材名を入力してください'); return; }
    setAdding(true);
    try {
      const result = await addUserGear(a.id, addForm);
      if (result.error) {
        alert('追加に失敗しました: ' + result.error);
        return;
      }
      setAddForm({ brand: '', name: '', cat: 'ギター', user: '', price: '', yt: '' });
      setShowAddForm(false);
      // サーバーコンポーネントを再フェッチ → dbGear に新機材が反映される
      router.refresh();
    } catch {
      alert('追加に失敗しました。しばらくしてからお試しください。');
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      {/* メンバーフィルターバー */}
      {memberFilter && (
        <div className="member-filter-bar">
          👤 <b>{memberFilter}</b> の機材を表示中{' '}
          <button onClick={() => setMemberFilter(null)}>× 全員表示</button>
        </div>
      )}

      {/* カテゴリフィルター */}
      <div className="cf">
        {cats.map(c => (
          <button
            key={c}
            className={`cf-btn${catFilter === c ? ' on' : ''}`}
            onClick={() => { setCatFilter(c); setFxSubcat('すべて'); }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* エフェクターサブカテゴリ */}
      {(catFilter === 'ギターエフェクター' || catFilter === 'ベースエフェクター') && (
        <div className="fx-sub-row">
          {FX_SUBCATS.map(c => (
            <button
              key={c}
              className={`fx-sub-btn${fxSubcat === c ? ' on' : ''}`}
              onClick={() => setFxSubcat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* 機材グリッド */}
      <div className="g-grid">
        {gears.map(g => (
          <GearCard
            key={g.id}
            g={g}
            artistId={a.id}
            isOpen={openCards.has(`${a.id}-${g.id}`)}
            isEditing={editCard === `${a.id}-${g.id}`}
            override={edits[`${a.id}-${g.id}`]}
            isUserAdded={userGear.some(u => u.id === g.id)}
            onToggle={() => toggleCard(`${a.id}-${g.id}`)}
            onStartEdit={() => startEdit(g.id, edits[`${a.id}-${g.id}`]?.name || g.name, edits[`${a.id}-${g.id}`]?.user || g.user, edits[`${a.id}-${g.id}`]?.cat || g.cat)}
            onCancelEdit={() => setEditCard(null)}
            onSaveEdit={() => saveEdit(g.id)}
            editValues={editValues[`${a.id}-${g.id}`]}
            onEditValuesChange={v => setEditValues(prev => ({ ...prev, [`${a.id}-${g.id}`]: v }))}
            onDelete={() => setUserGear(prev => prev.filter(u => u.id !== g.id))}
            onMemberClick={setMemberFilter}
          />
        ))}
      </div>

      {/* 機材追加ボタン */}
      <div className="add-gear-row">
        {!showAddForm && (
          <button className="add-gear-btn" onClick={() => setShowAddForm(true)}>
            ＋ 機材を追加する
          </button>
        )}
      </div>

      {/* 機材追加フォーム */}
      {showAddForm && (
        <div className="add-gear-form">
          <div className="add-gear-title">＋ 機材を追加</div>
          <div className="add-gear-grid">
            <input className="add-gear-in" placeholder="ブランド（例：Fender）" value={addForm.brand} onChange={e => setAddForm(p => ({ ...p, brand: e.target.value }))} />
            <input className="add-gear-in" placeholder="機材名（必須）" value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} />
            <select className="add-gear-in" value={addForm.cat} onChange={e => setAddForm(p => ({ ...p, cat: e.target.value }))}>
              {ALL_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            <input className="add-gear-in" placeholder="使用メンバー" value={addForm.user} onChange={e => setAddForm(p => ({ ...p, user: e.target.value }))} />
          </div>
          <div className="add-gear-grid">
            <input className="add-gear-in" placeholder="価格（例：¥50,000〜）" value={addForm.price} onChange={e => setAddForm(p => ({ ...p, price: e.target.value }))} />
            <input className="add-gear-in" placeholder="YouTube検索ワード（任意）" value={addForm.yt} onChange={e => setAddForm(p => ({ ...p, yt: e.target.value }))} />
          </div>
          <div className="add-gear-actions">
            <button className="add-gear-save" onClick={addGear} disabled={adding}>
              {adding ? '保存中…' : '追加する'}
            </button>
            <button className="add-gear-cancel" onClick={() => setShowAddForm(false)} disabled={adding}>キャンセル</button>
          </div>
          <div style={{ fontSize: '10px', color: '#bbb' }}>追加した機材はサイト全体に反映されます</div>
        </div>
      )}
    </>
  );
}

// ── 機材画像キャッシュ（ページ内で同じ機材を重複リクエストしない）──
const gearImageCache = new Map<string, string | null>();

// ── 個別機材カード ──────────────────────────────────────────
interface GearCardProps {
  g: GearItem;
  artistId: string;
  isOpen: boolean;
  isEditing: boolean;
  override?: EditOverride;
  editValues?: { name: string; user: string; cat: string };
  onEditValuesChange?: (v: { name: string; user: string; cat: string }) => void;
  isUserAdded: boolean;
  onToggle: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onMemberClick: (m: string) => void;
}

function GearCard({ g, artistId, isOpen, isEditing, override, editValues, onEditValuesChange, isUserAdded, onToggle, onStartEdit, onCancelEdit, onSaveEdit, onDelete, onMemberClick }: GearCardProps) {
  const ov = override ?? {};
  const name = ov.name || g.name;

  // 商品画像を楽天APIから自動取得（キャッシュ付き）
  // キャッシュキー = "brand name" → kw の余計な語に関係なく同一製品は1回だけ取得
  const [thumbUrl, setThumbUrl] = useState<string | null>(g.imageUrl ?? null);
  useEffect(() => {
    if (thumbUrl) return; // すでに画像あり（管理画面設定 or 取得済み）
    const query = [g.brand, g.name].filter(Boolean).join(' ');
    const cacheKey = query; // brand + name で統一（kw の差異を吸収）
    if (gearImageCache.has(cacheKey)) {
      setThumbUrl(gearImageCache.get(cacheKey) ?? null);
      return;
    }
    fetch(`/api/gear-image?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(({ url }: { url: string | null }) => {
        gearImageCache.set(cacheKey, url ?? null);
        setThumbUrl(url ?? null);
      })
      .catch(() => gearImageCache.set(cacheKey, null));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g.brand, g.name]);
  const price = ov.price || g.price;
  const user = ov.user || g.user;
  const cat = ov.cat || g.cat;
  const hasEdit = !!(ov.name || ov.price || ov.user || ov.cat);
  const key = `${artistId}-${g.id}`;

  // EC サイト検索クエリ: brand + name のみ（kw の余計な語は含めない）
  const shopEnc = encodeURIComponent([g.brand, name].filter(Boolean).join(' '));
  const nameEnc = encodeURIComponent(name);
  const soundhouseQ = encodeURIComponent(name.replace(/\s*[（(][^）)]*[）)]/g, '').trim());

  const ytQueries = [
    ...(g.yt || []),
    `${name} サウンドデモ`,
    `${name} レビュー 比較`,
  ].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 6);

  return (
    <div id={`gc-${key}`} className={`g-card${isOpen ? ' open' : ''}`}>
      {/* カードヘッダー（クリックで開閉） */}
      <div className="g-top" onClick={onToggle}>
        <div className="g-thumb">
          <a
            href={`https://www.amazon.co.jp/s?k=${shopEnc}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            title={`${name} をAmazonで見る`}
            style={{ display: 'block', textDecoration: 'none' }}
          >
            <div className="g-thumb-box" style={{ position: 'relative' }}>
              {thumbUrl ? (
                <img
                  src={thumbUrl}
                  alt={name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={() => setThumbUrl(null)}
                />
              ) : (
                <span className="g-thumb-init">{g.catIcon}</span>
              )}
              {/* ホバー時にショッピングアイコン表示 */}
              <span style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.35)', color: '#fff', fontSize: '18px',
                borderRadius: '8px', opacity: 0,
                transition: 'opacity 0.15s',
              }} className="g-thumb-hover">🛒</span>
            </div>
          </a>
          <div className="g-brand-s">{g.brand}</div>
        </div>
        <div className="g-body">
          <div className="g-cat">{cat}</div>
          <div className="g-name">
            {g.brand && <span style={{ color: '#999', fontWeight: 400, marginRight: '4px', fontSize: '0.85em' }}>{g.brand}</span>}
            {name}
            {hasEdit && <span className="g-edited-badge">編集済</span>}
            {isUserAdded && <span className="user-gear-badge">追加</span>}
          </div>
          <button
            className="g-user"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', color: 'inherit', fontSize: 'inherit' }}
            onClick={e => { e.stopPropagation(); onMemberClick(user); }}
          >
            {user}
          </button>
        </div>
        <div className="g-chevron">▼</div>
      </div>

      {/* 展開コンテンツ */}
      {isOpen && (
        <div className="g-expand">
          <div className="gex-inner">
            {/* 機材説明 */}
            {g.desc && (
              <div>
                <div className="gex-sec-ttl">📖 機材について</div>
                <div className="gex-desc">{g.desc}</div>
              </div>
            )}

            {/* アフィリエイトカード（Ameba風） */}
            <div className="af-card">
              {/* 画像 + 商品名 */}
              <a
                href={`https://www.amazon.co.jp/s?k=${shopEnc}`}
                target="_blank"
                rel="noopener noreferrer"
                className="af-card-top"
              >
                <div className="af-card-img">
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={() => setThumbUrl(null)}
                    />
                  ) : (
                    <span style={{ fontSize: '40px', opacity: 0.4 }}>{g.catIcon}</span>
                  )}
                </div>
                <div className="af-card-info">
                  <div className="af-card-name">
                    {g.brand && <span className="af-card-brand">{g.brand}</span>}
                    {name}
                  </div>
                  <div className="af-card-store">Amazon（アマゾン）</div>
                </div>
              </a>

              {/* ショップボタン */}
              <a className="af-btn af-btn-amazon" href={`https://www.amazon.co.jp/s?k=${shopEnc}`} target="_blank" rel="noopener noreferrer">
                Amazon（アマゾン）で詳細を見る <span>›</span>
              </a>
              <a className="af-btn af-btn-rakuten" href={`https://search.rakuten.co.jp/search/mall/${shopEnc}/`} target="_blank" rel="noopener noreferrer">
                楽天市場で詳細を見る <span>›</span>
              </a>
              <a className="af-btn af-btn-yahoo" href={`https://shopping.yahoo.co.jp/search?p=${shopEnc}`} target="_blank" rel="noopener noreferrer">
                Yahoo!ショッピングで詳細を見る <span>›</span>
              </a>
              <a className="af-btn af-btn-soundhouse" href={`https://www.soundhouse.co.jp/search/index/?search_all=${soundhouseQ}&i_type=a`} target="_blank" rel="noopener noreferrer">
                サウンドハウスで詳細を見る <span>›</span>
              </a>
            </div>

            {/* YouTube */}
            <div>
              <div className="gex-sec-ttl">▶ YouTube で調べる</div>
              <div className="gex-yt-list">
                {ytQueries.map(q => (
                  <a key={q} className="gex-yt-link" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`} target="_blank" rel="noopener noreferrer">
                    <span>▶</span><span>{q}</span>
                  </a>
                ))}
                <a className="gex-yt-link" href={`https://www.youtube.com/results?search_query=${nameEnc}`} target="_blank" rel="noopener noreferrer" style={{ color: '#cc0000', borderColor: '#cc0000', background: '#fff4f4', fontWeight: 700 }}>
                  <span>🔍</span><span>「{name}」でYouTubeを検索する</span>
                </a>
              </div>
            </div>

            {/* 似た機材 */}
            {g.similar && g.similar.length > 0 && (
              <div>
                <div className="gex-sec-ttl">似た機材</div>
                <div className="gex-sim-row">
                  {g.similar.map(s => <span key={s} className="gex-sim-tag">{s}</span>)}
                </div>
              </div>
            )}

            {/* 編集フォーム */}
            {isEditing && editValues && onEditValuesChange && (
              <div className="edit-form">
                <div className="edit-form-ttl">情報を編集 <span className="edit-wiki-badge">Wiki編集</span></div>
                <div className="edit-row">
                  <span className="edit-label">名前</span>
                  <input className="edit-in" value={editValues.name} onChange={e => onEditValuesChange({ ...editValues, name: e.target.value })} placeholder={g.name} />
                </div>
                <div className="edit-row">
                  <span className="edit-label">カテゴリ</span>
                  <select className="edit-in" value={editValues.cat} onChange={e => onEditValuesChange({ ...editValues, cat: e.target.value })}>
                    {ALL_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="edit-row">
                  <span className="edit-label">使用者</span>
                  <input className="edit-in" value={editValues.user} onChange={e => onEditValuesChange({ ...editValues, user: e.target.value })} placeholder={g.user} />
                </div>
                <div className="edit-actions">
                  <button className="edit-save" onClick={onSaveEdit}>保存</button>
                  <button className="edit-cancel" onClick={onCancelEdit}>キャンセル</button>
                </div>
                <div className="edit-note">編集内容はこのブラウザのみに保存されます</div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="gex-actions">
              <a className="gex-bbs-btn" href={`/bbs?gear=${encodeURIComponent(g.kw.split(' ')[0])}`}>
                💬 掲示板で話す
              </a>
              {!isEditing && (
                <button className="gex-edit-btn" onClick={onStartEdit}>✏️ 情報を編集</button>
              )}
              {isUserAdded ? (
                <button className="del-gear-btn" onClick={() => { if (confirm('この機材を削除しますか？')) onDelete(); }}>
                  🗑 削除
                </button>
              ) : (
                <span style={{ fontSize: '11px', color: '#bbb' }}>公式データは削除不可</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
