// =============================================================
// gearIndex — 機材名 → アーティストページURLの逆引きマップ
// BBS本文中の機材名を自動リンクするために使用
// =============================================================
import { DB } from './artists';

export interface GearLink {
  name: string;   // 表示名（brand + name）
  href: string;   // /artists/{id}
}

export type Segment = { text: string; href?: string; gearName?: string };

// Supabase db_gear のエントリ型（BBS page から渡される）
export interface DbGearEntry {
  brand: string;
  name: string;
  kw: string;
  artistId: string;
}

// 汎用すぎて誤マッチしやすいキーワードを除外
const BLOCKLIST = new Set([
  'jazz chorus', 'jazz bass', 'stage 4', 'standard', 'classic',
  'special', 'custom', 'vintage', 'studio', 'deluxe', 'custom shop',
]);

// 機材名から登録候補バリアントを生成
function variants(brand: string, name: string, kw: string): string[] {
  const fullName = [brand, name].filter(Boolean).join(' ');
  const words = name.split(/\s+/);
  const list: string[] = [name, fullName];

  if (kw) list.push(kw);

  // "Custom Shop Stratocaster" → "Stratocaster", "Shop Stratocaster"
  for (let i = 1; i < words.length; i++) {
    list.push(words.slice(i).join(' '));
  }

  // "Fender Stratocaster", "Fender Shop Stratocaster"
  if (brand && words.length >= 2) {
    for (let i = 1; i < words.length; i++) {
      list.push(`${brand} ${words.slice(i).join(' ')}`);
    }
  }

  return list;
}

// 静的DBインデックス（初回のみ構築してキャッシュ）
let _staticCache: Map<string, GearLink> | null = null;

function buildStaticIndex(): Map<string, GearLink> {
  if (_staticCache) return _staticCache;
  _staticCache = new Map();

  for (const artist of DB) {
    const href = `/artists/${artist.id}`;
    for (const g of artist.gear ?? []) {
      const fullName = [g.brand, g.name].filter(Boolean).join(' ');
      for (const v of variants(g.brand ?? '', g.name, g.kw ?? '')) {
        if (!v || v.length < 4) continue;
        const key = v.toLowerCase().trim();
        if (BLOCKLIST.has(key)) continue;
        if (!_staticCache.has(key)) {
          _staticCache.set(key, { name: fullName, href });
        }
      }
    }
  }

  return _staticCache;
}

// テキスト中の機材名をリンクセグメントに変換
export function linkifyGear(text: string, dbGear?: DbGearEntry[]): Segment[] {
  const index = buildStaticIndex();

  // dbGear があれば静的DBに上書きせずマージ
  const merged: Map<string, GearLink> = new Map(index);
  if (dbGear?.length) {
    for (const g of dbGear) {
      const fullName = [g.brand, g.name].filter(Boolean).join(' ');
      const href = `/artists/${g.artistId}`;
      for (const v of variants(g.brand, g.name, g.kw)) {
        if (!v || v.length < 4) continue;
        const key = v.toLowerCase().trim();
        if (BLOCKLIST.has(key)) continue;
        if (!merged.has(key)) {
          merged.set(key, { name: fullName, href });
        }
      }
    }
  }

  // 長い名前から先にマッチ（誤マッチ防止）
  const sorted = Array.from(merged.keys()).sort((a, b) => b.length - a.length);

  const segments: Segment[] = [{ text }];

  for (const key of sorted) {
    const link = merged.get(key)!;
    const result: Segment[] = [];

    for (const seg of segments) {
      if (seg.href) { result.push(seg); continue; }

      const lower = seg.text.toLowerCase();
      const idx = lower.indexOf(key);
      if (idx === -1) { result.push(seg); continue; }

      // 単語境界チェック（誤マッチ防止: 前後が文字の途中でないことを確認）
      const before = seg.text[idx - 1];
      const after = seg.text[idx + key.length];
      const isBoundary = (ch: string | undefined) =>
        ch === undefined || /[\s、。！？「」,.!?()/\-\n]/.test(ch);

      if (!isBoundary(before) || !isBoundary(after)) {
        result.push(seg);
        continue;
      }

      if (idx > 0) result.push({ text: seg.text.slice(0, idx) });
      result.push({
        text: seg.text.slice(idx, idx + key.length),
        href: link.href,
        gearName: link.name,
      });
      if (idx + key.length < seg.text.length) {
        result.push({ text: seg.text.slice(idx + key.length) });
      }
    }

    segments.length = 0;
    segments.push(...result);
  }

  return segments;
}
