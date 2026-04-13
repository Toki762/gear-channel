// =============================================================
// gearIndex — 機材名 → アーティストページURLの逆引きマップ
// BBS本文中の機材名を自動リンクするために使用
// =============================================================
import { DB } from './artists';

export interface GearLink {
  name: string;   // 表示名（brand + name）
  href: string;   // /artists/{id}
}

// 機材名（小文字）→ GearLink のマップ
let _cache: Map<string, GearLink> | null = null;

export function getGearIndex(): Map<string, GearLink> {
  if (_cache) return _cache;

  _cache = new Map<string, GearLink>();

  for (const artist of DB) {
    for (const g of artist.gear ?? []) {
      const href = `/artists/${artist.id}`;
      const fullName = [g.brand, g.name].filter(Boolean).join(' ');

      // モデル名（スペースなし短縮含む）と完全名の両方を登録
      const variants = [g.name, fullName];

      // 4文字以上のもののみ登録（短すぎると誤マッチが多い）
      for (const v of variants) {
        if (v.length >= 4) {
          const key = v.toLowerCase();
          if (!_cache.has(key)) {
            _cache.set(key, { name: fullName, href });
          }
        }
      }
    }
  }

  return _cache;
}

// テキスト中の機材名をリンクに変換するユーティリティ
// React向けに JSX を返すのではなく、{ text, href } セグメントの配列を返す
export type Segment = { text: string; href?: string; gearName?: string };

export function linkifyGear(text: string): Segment[] {
  const index = getGearIndex();

  // 長い名前から先にマッチ（"Les Paul Standard" が "Les Paul" より先にマッチするよう）
  const sorted = Array.from(index.keys()).sort((a, b) => b.length - a.length);

  // 単純な置換: テキストを走査してマッチする機材名を見つける
  const segments: Segment[] = [{ text }];

  for (const key of sorted) {
    const link = index.get(key)!;
    const result: Segment[] = [];

    for (const seg of segments) {
      if (seg.href) {
        result.push(seg); // すでにリンク化済みはスキップ
        continue;
      }

      const lower = seg.text.toLowerCase();
      const idx = lower.indexOf(key);
      if (idx === -1) {
        result.push(seg);
        continue;
      }

      // マッチ前後の文字が単語境界かチェック（誤マッチ防止）
      const before = seg.text[idx - 1];
      const after = seg.text[idx + key.length];
      const wordBoundary = /[\s、。！？「」,\n]|^$/;
      if (before !== undefined && !wordBoundary.test(before)) {
        result.push(seg);
        continue;
      }
      if (after !== undefined && !wordBoundary.test(after)) {
        result.push(seg);
        continue;
      }

      if (idx > 0) result.push({ text: seg.text.slice(0, idx) });
      result.push({ text: seg.text.slice(idx, idx + key.length), href: link.href, gearName: link.name });
      if (idx + key.length < seg.text.length) result.push({ text: seg.text.slice(idx + key.length) });
    }

    // セグメントを更新
    segments.length = 0;
    segments.push(...result);
  }

  return segments;
}
