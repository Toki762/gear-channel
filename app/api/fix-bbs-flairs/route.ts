// POST /api/fix-bbs-flairs — 既存の「機材」flairを正しいカテゴリに一括更新
// 使い方: curl -X POST https://gear-channel.com/api/fix-bbs-flairs
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// タイトル → 正しいflair のマッピング
const FLAIR_MAP: Record<string, string> = {
  // ── ギター ──
  'Boss DS-1 vs ProCo RAT どっち派？':                            'エフェクター',
  'Fender Stratocaster のピックアップ交換してみた':               'ギター',
  'アナログペダルとデジタルペダル、本気で音変わると思う？':        'エフェクター',
  'ポリフォニックチューナーって実際どう？':                        'エフェクター',
  '70年代のビンテージペダル集めてる人いる？':                      'エフェクター',
  'マンションでもいい音出せるアンプ教えて':                        'アンプ',
  'Gibson Les Paul Standard vs Custom 何が違うの？':              'ギター',
  'Ibanez RG シリーズって現行どれが一番コスパいい？':              'ギター',
  'Martin と Taylor どっちが好き？':                               'ギター',
  // ── ベース ──
  'Fender Jazz Bass vs Precision Bass 初心者はどっち買うべき？':  'ベース',
  'スラップ用にベース買い替えたい。おすすめある？':                'ベース',
  // ── アンプ ──
  'Marshall JCM800 中古で買うのってアリ？':                        'アンプ',
  'Kemper vs Line6 Helix どっちにするか1年悩んでる':              'アンプ',
  // ── エフェクター ──
  'エフェクターボードの電源どうしてる？One Spotで全部まかなえる？': 'エフェクター',
  'テープエコー風ディレイペダルおすすめ教えて':                    'エフェクター',
  'ファズペダルって現行品だと何がおすすめ？':                      'エフェクター',
  // ── キーボード/鍵盤 ──
  'Moog Minimoog vs Roland SH-101 どっちが好き？':                'キーボード/鍵盤',
  '予算20万以内でポリフォニックシンセ探してる':                    'キーボード/鍵盤',
  // ── DAW・DTM ──
  'Logic ProとAbleton Liveどっちがバンド録音に向いてる？':        'DAW・DTM',
  '電子ドラムの打ち込みってやっぱり打ち込みっぽくなる？':          'DAW・DTM',
  // ── マイク ──
  'ボーカル録音に使えるコンデンサーマイク予算3万以内で教えて':    'マイク',
  // ── 音響・その他（ドラム） ──
  '木胴スネアと金属スネアの使い分けってどうしてる？':             '音響・その他',
};

export async function POST() {
  const supabase = createServerClient();

  // 現在のflair='機材' の投稿を全件取得
  const { data: posts, error: fetchErr } = await supabase
    .from('bbs_posts')
    .select('id, title, flair')
    .eq('flair', '機材');

  if (fetchErr) {
    return NextResponse.json({ ok: false, error: fetchErr.message }, { status: 500 });
  }

  const results: { title: string; old: string; new: string; ok: boolean }[] = [];

  for (const post of posts ?? []) {
    const newFlair = FLAIR_MAP[post.title];
    if (!newFlair) {
      // マッピングにないものはとりあえず '購入相談' に（機材全般系）
      const { error } = await supabase
        .from('bbs_posts')
        .update({ flair: '購入相談' })
        .eq('id', post.id);
      results.push({ title: post.title, old: post.flair, new: '購入相談', ok: !error });
      continue;
    }

    const { error } = await supabase
      .from('bbs_posts')
      .update({ flair: newFlair })
      .eq('id', post.id);

    results.push({ title: post.title, old: post.flair, new: newFlair, ok: !error });
  }

  return NextResponse.json({
    ok: true,
    updated: results.filter(r => r.ok).length,
    failed: results.filter(r => !r.ok).length,
    details: results,
  });
}

// GET でマッピング一覧確認
export async function GET() {
  const supabase = createServerClient();
  const { data, count } = await supabase
    .from('bbs_posts')
    .select('title, flair', { count: 'exact' })
    .order('flair');

  return NextResponse.json({
    total: count,
    posts: data,
  });
}
