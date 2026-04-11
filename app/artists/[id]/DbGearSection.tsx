// =============================================================
// DbGearSection — 管理画面から追加した機材を表示するセクション
// =============================================================
interface DbGearItem {
  id: string;
  artist_id: string;
  name: string;
  brand: string;
  cat: string;
  cat_icon: string;
  user: string;
  price: string;
  gear_desc: string;
  kw: string;
  image_url: string;
  created_at: string;
}

interface Props {
  gear: DbGearItem[];
}

export default function DbGearSection({ gear }: Props) {
  // カテゴリ別にグループ化
  const byCat: Record<string, DbGearItem[]> = {};
  for (const item of gear) {
    if (!byCat[item.cat]) byCat[item.cat] = [];
    byCat[item.cat].push(item);
  }

  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ fontWeight: 800, fontSize: 13, color: '#888', letterSpacing: '0.5px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
        ➕ 追加機材情報
        <span style={{ fontSize: 11, fontWeight: 400, color: '#bbb' }}>（管理者が追加）</span>
      </div>

      {Object.entries(byCat).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 8, padding: '4px 10px', background: '#f0ede7', borderRadius: 5, display: 'inline-block' }}>
            {items[0]?.cat_icon} {cat}
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {items.map(item => (
              <div key={item.id} style={{ background: '#fff', border: '1px solid #e4e2dd', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

                  {/* 商品画像 */}
                  {item.image_url ? (
                    <div style={{ width: 80, minWidth: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f6', borderRadius: 8, border: '1px solid #ece9e3', overflow: 'hidden', flexShrink: 0 }}>
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  ) : (
                    <div style={{ width: 80, minWidth: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f6', borderRadius: 8, border: '1px solid #ece9e3', fontSize: 28, flexShrink: 0 }}>
                      {item.cat_icon}
                    </div>
                  )}

                  {/* 情報 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* ブランド + 機材名 */}
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                      {item.brand && <span style={{ color: '#888', fontWeight: 400, fontSize: 12, marginRight: 4 }}>{item.brand}</span>}
                      {item.name}
                    </div>

                    {/* メタ情報 */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, color: '#888', marginBottom: item.gear_desc ? 6 : 0 }}>
                      {item.user && <span>👤 {item.user}</span>}
                      {item.price && <span>💴 {item.price}</span>}
                    </div>

                    {/* 説明 */}
                    {item.gear_desc && (
                      <div style={{ fontSize: 12, color: '#666', lineHeight: 1.7, marginBottom: 8 }}>{item.gear_desc}</div>
                    )}

                    {/* 購入リンク */}
                    {(item.kw || item.name) && (
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <a className="g-buy ba" href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(item.kw || item.name)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, padding: '5px 8px' }}>🛒 Amazon</a>
                        <a className="g-buy bs" href={`https://www.soundhouse.co.jp/search/index?search_all=${encodeURIComponent(item.kw || item.name)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, padding: '5px 8px' }}>🎸 サウンドハウス</a>
                        <a className="g-buy br" href={`https://search.rakuten.co.jp/search/mall/${encodeURIComponent(item.kw || item.name)}/`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, padding: '5px 8px' }}>楽天</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
