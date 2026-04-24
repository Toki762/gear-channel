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
import { type Locale, t, localeCat } from '@/lib/i18n';

interface Props {
  artist: Artist;
  dbGear?: GearItem[];
  locale?: Locale;
}

type EditOverride = {
  name?: string;
  price?: string;
  user?: string;
  cat?: string;
};

const ALL_CATS = ['ギター','ベース','アンプ','ギターエフェクター','ベースエフェクター','エフェクター','キーボード','シンセ/プラグイン','ドラム','DAW','マイク','音響機材'];

/**
 * members フィールドを個人ごとに分割して返す
 * 対応フォーマット:
 *   洋楽: "Kurt Cobain (Vo/Gt)\nKrist Novoselic (Ba)"  ← \\n リテラル or 改行
 *   邦楽: "藤原聡 (Vo/Pf) / 小笹大輔 (Gt)"            ← " / " 区切り
 */
function parseMemberOptions(members: string): string[] {
  if (!members) return [];
  // \\n（リテラル2文字）・実改行・" / "（スペース付きスラッシュ）の3種に対応
  return members.split(/\\n|\n| \/ /).map(s => s.trim()).filter(Boolean);
}

export default function GearSection({ artist, dbGear = [], locale = 'ja' }: Props) {
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
    if (!addForm.name.trim()) { alert(t(locale, 'addGearValidation')); return; }
    setAdding(true);
    try {
      const result = await addUserGear(a.id, addForm);
      if (result.error) {
        alert(t(locale, 'addGearFail'));
        return;
      }
      setAddForm({ brand: '', name: '', cat: 'ギター', user: '', price: '', yt: '' });
      setShowAddForm(false);
      router.refresh();
    } catch {
      alert(t(locale, 'addGearFail'));
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      {/* メンバーフィルターバー */}
      {memberFilter && (
        <div className="member-filter-bar">
          👤 <b>{memberFilter}</b>{locale === 'en' ? ' gear' : ' の機材を表示中'}{' '}
          <button onClick={() => setMemberFilter(null)}>{t(locale, 'memberFilterClear')}</button>
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
            {localeCat(locale, c)}
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
            memberOptions={parseMemberOptions(a.members)}
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
            locale={locale}
          />
        ))}
      </div>

      {/* 機材追加ボタン */}
      <div className="add-gear-row">
        {!showAddForm && (
          <button className="add-gear-btn" onClick={() => setShowAddForm(true)}>
            {t(locale, 'addGearBtn')}
          </button>
        )}
      </div>

      {/* 機材追加フォーム */}
      {showAddForm && (
        <div className="add-gear-form">
          <div className="add-gear-title">{t(locale, 'addGearTitle')}</div>
          <div className="add-gear-grid">
            <input className="add-gear-in" placeholder={t(locale, 'addGearBrandPh')} value={addForm.brand} onChange={e => setAddForm(p => ({ ...p, brand: e.target.value }))} />
            <input className="add-gear-in" placeholder={t(locale, 'addGearNamePh')} value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} />
            <select className="add-gear-in" value={addForm.cat} onChange={e => setAddForm(p => ({ ...p, cat: e.target.value }))}>
              {ALL_CATS.map(c => <option key={c} value={c}>{localeCat(locale, c)}</option>)}
            </select>
            <select className="add-gear-in" value={addForm.user} onChange={e => setAddForm(p => ({ ...p, user: e.target.value }))}>
              <option value="">{t(locale, 'addGearSelectMember')}</option>
              {parseMemberOptions(a.members).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value="バンド全体">{t(locale, 'addGearWholeBand')}</option>
              <option value="不明">{t(locale, 'addGearUnknown')}</option>
            </select>
          </div>
          <div className="add-gear-grid">
            <input className="add-gear-in" placeholder={t(locale, 'addGearPricePh')} value={addForm.price} onChange={e => setAddForm(p => ({ ...p, price: e.target.value }))} />
            <input className="add-gear-in" placeholder={t(locale, 'addGearYtPh')} value={addForm.yt} onChange={e => setAddForm(p => ({ ...p, yt: e.target.value }))} />
          </div>
          <div className="add-gear-actions">
            <button className="add-gear-save" onClick={addGear} disabled={adding}>
              {adding ? t(locale, 'addGearSavingBtn') : t(locale, 'addGearSaveBtn')}
            </button>
            <button className="add-gear-cancel" onClick={() => setShowAddForm(false)} disabled={adding}>{t(locale, 'addGearCancelBtn')}</button>
          </div>
          <div style={{ fontSize: '10px', color: '#bbb' }}>{t(locale, 'addGearNote')}</div>
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
  memberOptions: string[];
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
  locale: Locale;
}

function GearCard({ g, artistId, memberOptions, isOpen, isEditing, override, editValues, onEditValuesChange, isUserAdded, onToggle, onStartEdit, onCancelEdit, onSaveEdit, onDelete, onMemberClick, locale }: GearCardProps) {
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
            {hasEdit && <span className="g-edited-badge">{t(locale, 'editedBadge')}</span>}
            {isUserAdded && <span className="user-gear-badge">{t(locale, 'userAddedBadge')}</span>}
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
                  <div className="af-card-store">{t(locale, 'amazonStore')}</div>
                </div>
              </a>

              {/* ショップボタン */}
              <a className="af-btn af-btn-amazon" href={`https://www.amazon.co.jp/s?k=${shopEnc}`} target="_blank" rel="noopener noreferrer">
                {t(locale, 'amazonBtn')} <span>›</span>
              </a>
              <a className="af-btn af-btn-rakuten" href={`https://search.rakuten.co.jp/search/mall/${shopEnc}/`} target="_blank" rel="noopener noreferrer">
                {t(locale, 'rakutenBtn')} <span>›</span>
              </a>
              <a className="af-btn af-btn-yahoo" href={`https://shopping.yahoo.co.jp/search?p=${shopEnc}`} target="_blank" rel="noopener noreferrer">
                {t(locale, 'yahooBtn')} <span>›</span>
              </a>
              <a className="af-btn af-btn-soundhouse" href={`https://www.soundhouse.co.jp/search/index/?search_all=${soundhouseQ}&i_type=a`} target="_blank" rel="noopener noreferrer">
                {t(locale, 'soundhouseBtn')} <span>›</span>
              </a>
            </div>

            {/* YouTube */}
            <div>
              <div className="gex-sec-ttl">{t(locale, 'ytSectionTitle')}</div>
              <div className="gex-yt-list">
                {ytQueries.map(q => (
                  <a key={q} className="gex-yt-link" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`} target="_blank" rel="noopener noreferrer">
                    <span>▶</span><span>{q}</span>
                  </a>
                ))}
                <a className="gex-yt-link" href={`https://www.youtube.com/results?search_query=${nameEnc}`} target="_blank" rel="noopener noreferrer" style={{ color: '#cc0000', borderColor: '#cc0000', background: '#fff4f4', fontWeight: 700 }}>
                  <span>🔍</span><span>{t(locale, 'ytSearchLabel', { name })}</span>
                </a>
              </div>
            </div>

            {/* 似た機材 */}
            {g.similar && g.similar.length > 0 && (
              <div>
                <div className="gex-sec-ttl">{t(locale, 'similarGear')}</div>
                <div className="gex-sim-row">
                  {g.similar.map(s => <span key={s} className="gex-sim-tag">{s}</span>)}
                </div>
              </div>
            )}

            {/* 編集フォーム */}
            {isEditing && editValues && onEditValuesChange && (
              <div className="edit-form">
                <div className="edit-form-ttl">{t(locale, 'editFormTitle')} <span className="edit-wiki-badge">{t(locale, 'editWikiBadge')}</span></div>
                <div className="edit-row">
                  <span className="edit-label">{t(locale, 'editLabelName')}</span>
                  <input className="edit-in" value={editValues.name} onChange={e => onEditValuesChange({ ...editValues, name: e.target.value })} placeholder={g.name} />
                </div>
                <div className="edit-row">
                  <span className="edit-label">{t(locale, 'editLabelCat')}</span>
                  <select className="edit-in" value={editValues.cat} onChange={e => onEditValuesChange({ ...editValues, cat: e.target.value })}>
                    {ALL_CATS.map(c => <option key={c} value={c}>{localeCat(locale, c)}</option>)}
                  </select>
                </div>
                <div className="edit-row">
                  <span className="edit-label">{t(locale, 'editLabelUser')}</span>
                  <select className="edit-in" value={editValues.user} onChange={e => onEditValuesChange({ ...editValues, user: e.target.value })}>
                    <option value="">{t(locale, 'addGearSelectMember')}</option>
                    {memberOptions.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="バンド全体">{t(locale, 'addGearWholeBand')}</option>
                    <option value="不明">{t(locale, 'addGearUnknown')}</option>
                  </select>
                </div>
                <div className="edit-actions">
                  <button className="edit-save" onClick={onSaveEdit}>{t(locale, 'editSave')}</button>
                  <button className="edit-cancel" onClick={onCancelEdit}>{t(locale, 'editCancel')}</button>
                </div>
                <div className="edit-note">{t(locale, 'editNote')}</div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="gex-actions">
              <a className="gex-bbs-btn" href={`/bbs?gear=${encodeURIComponent(g.kw.split(' ')[0])}`}>
                {t(locale, 'discussBtn')}
              </a>
              {!isEditing && (
                <button className="gex-edit-btn" onClick={onStartEdit}>{t(locale, 'editInfoBtn')}</button>
              )}
              {isUserAdded ? (
                <button className="del-gear-btn" onClick={() => { if (confirm(t(locale, 'deleteConfirm'))) onDelete(); }}>
                  {t(locale, 'deleteBtn')}
                </button>
              ) : (
                <span style={{ fontSize: '11px', color: '#bbb' }}>{t(locale, 'officialDataNote')}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
