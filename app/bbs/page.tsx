// =============================================================
// BBS Page — Server Component
// =============================================================
import type { Metadata } from 'next';
import { fetchPosts } from '@/lib/supabase';
import BbsClient from './BbsClient';

export const metadata: Metadata = {
  title: '掲示板 — Gear ちゃんねる',
  description: '音楽機材について語る掲示板。ギター・シンセ・エフェクター・DAWなど何でも話しましょう。',
};

interface Props {
  searchParams: {
    flair?: string;
    q?: string;
    gear?: string;
    sort?: 'pop' | 'new';
    page?: string;
  };
}

const PAGE_SIZE = 20;

export default async function BbsPage({ searchParams }: Props) {
  const flair = searchParams.flair;
  const search = searchParams.q;
  const gearKw = searchParams.gear;
  const sort = searchParams.sort === 'new' ? 'new' : 'pop';
  const page = Math.max(0, parseInt(searchParams.page ?? '0', 10) || 0);

  const { posts, total } = await fetchPosts({
    flair,
    search,
    gearKw,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <BbsClient
      initialPosts={posts}
      total={total}
      initialFlair={flair ?? 'すべて'}
      initialSearch={search ?? ''}
      initialGearKw={gearKw ?? ''}
      initialSort={sort}
      initialPage={page}
      pageSize={PAGE_SIZE}
    />
  );
}
