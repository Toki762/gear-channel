'use server';
// =============================================================
// BBS Server Actions — Supabase への書き込み
// service_role key を使用（RLS をバイパス）
// =============================================================
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase';
import type { ActionResult, CreatePostInput, CreateCommentInput } from '@/lib/types';

// ── 投稿を作成 ────────────────────────────────────────────
export async function createPost(input: CreatePostInput): Promise<ActionResult<{ id: string }>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;
    const { data, error } = await supabase
      .from('bbs_posts')
      .insert({
        author: input.author || '名無し',
        flair: input.flair,
        title: input.title.trim(),
        body: input.body.trim(),
        gear_tag: input.gear_tag?.trim() || null,
      })
      .select('id')
      .single();

    if (error) throw error;
    revalidatePath('/bbs');
    return { ok: true, data: { id: data.id } };
  } catch (err) {
    console.error('createPost error:', err);
    return { ok: false, error: err instanceof Error ? err.message : '投稿に失敗しました' };
  }
}

// ── コメントを作成 ────────────────────────────────────────
export async function createComment(input: CreateCommentInput): Promise<ActionResult<{ id: string }>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;
    const { data, error } = await supabase
      .from('bbs_comments')
      .insert({
        post_id: input.post_id,
        author: input.author || '名無し',
        body: input.body.trim(),
        reply_to: input.reply_to ?? null,
      })
      .select('id')
      .single();

    if (error) throw error;
    revalidatePath('/bbs');
    return { ok: true, data: { id: data.id } };
  } catch (err) {
    console.error('createComment error:', err);
    return { ok: false, error: err instanceof Error ? err.message : 'コメントの投稿に失敗しました' };
  }
}

// ── 投稿に投票 ────────────────────────────────────────────
export async function votePost(postId: string, delta: 1 | -1): Promise<ActionResult> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // 現在のvotes取得
    const { data: current, error: fetchErr } = await supabase
      .from('bbs_posts')
      .select('votes')
      .eq('id', postId)
      .single();
    if (fetchErr) throw fetchErr;

    const newVotes = (current.votes ?? 0) + delta;
    const { error } = await supabase
      .from('bbs_posts')
      .update({ votes: newVotes })
      .eq('id', postId);
    if (error) throw error;

    revalidatePath('/bbs');
    return { ok: true, data: undefined };
  } catch (err) {
    console.error('votePost error:', err);
    return { ok: false, error: err instanceof Error ? err.message : '投票に失敗しました' };
  }
}

// ── コメントに投票 ─────────────────────────────────────────
export async function voteComment(commentId: string, delta: 1 | -1): Promise<ActionResult> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    const { data: current, error: fetchErr } = await supabase
      .from('bbs_comments')
      .select('votes')
      .eq('id', commentId)
      .single();
    if (fetchErr) throw fetchErr;

    const newVotes = (current.votes ?? 0) + delta;
    const { error } = await supabase
      .from('bbs_comments')
      .update({ votes: newVotes })
      .eq('id', commentId);
    if (error) throw error;

    revalidatePath('/bbs');
    return { ok: true, data: undefined };
  } catch (err) {
    console.error('voteComment error:', err);
    return { ok: false, error: err instanceof Error ? err.message : '投票に失敗しました' };
  }
}
