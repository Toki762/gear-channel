'use server';
// =============================================================
// Server Actions — アーティストページ
// =============================================================
import { createServerClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

// ── アーティストのページビューをインクリメント ──────────────
export async function incrementArtistView(artistId: string): Promise<void> {
  try {
    const supabase = createServerClient();
    await supabase.rpc('increment_artist_view', { p_artist_id: artistId });
  } catch {
    // artist_views テーブル / 関数が未作成の場合は無視
  }
}

// ── ユーザー追加機材を Supabase に保存 ──────────────────────
export interface AddGearForm {
  brand: string;
  name: string;
  cat: string;
  user: string;
  price: string;
  yt: string;
}

const CAT_ICON: Record<string, string> = {
  'ギター':           '🎸',
  'ベース':           '🎸',
  'アンプ':           '🔊',
  'ギターエフェクター': '⚙️',
  'ベースエフェクター': '⚙️',
  'エフェクター':     '⚙️',
  'キーボード':       '🎹',
  'シンセ/プラグイン': '🎹',
  'ドラム':           '🥁',
  'DAW':              '💻',
  'マイク':           '🎤',
  '音響機材':         '🔊',
};

export async function addUserGear(
  artistId: string,
  form: AddGearForm,
): Promise<{ error?: string }> {
  if (!form.name.trim()) return { error: '機材名を入力してください' };

  try {
    const supabase = createServerClient();

    const { error } = await supabase.from('db_gear').insert({
      artist_id: artistId,
      name:      form.name.trim(),
      brand:     form.brand.trim() || null,
      cat:       form.cat,
      cat_icon:  CAT_ICON[form.cat] ?? '🎵',
      user:      form.user.trim() || '不明',
      price:     form.price.trim() || '価格未設定',
      gear_desc: '',
      kw:        form.name.trim() + (form.brand.trim() ? ' ' + form.brand.trim() : ''),
      image_url: null,
    });

    if (error) return { error: error.message };

    // ISR キャッシュを無効化 → 次のリクエストで再生成
    revalidatePath(`/artists/${artistId}`);
    return {};
  } catch (e: any) {
    return { error: e?.message ?? '不明なエラー' };
  }
}
