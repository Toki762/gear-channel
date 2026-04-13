// =============================================================
// BBS Page — Server Component
// =============================================================
import type { Metadata } from 'next';
import { fetchPosts } from '@/lib/supabase';
import BbsClient from './BbsClient';

// 掲示板は常に最新データを表示（書き込みがリアルタイムで反映されるように）
export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gear-channel.vercel.app';

export const metadata: Metadata = {
  title: '音楽機材 掲示板 — Gear ちゃんねる',
  description: 'ギター・シンセ・エフェクター・DAWなど音楽機材について語る掲示板。実際に使ってみた感想・購入相談・セッティングの質問など何でもどうぞ。',
  openGraph: {
    title: '音楽機材 掲示板 — Gear ちゃんねる',
    description: 'ギター・シンセ・エフェクター・DAWなど音楽機材について語る掲示板。',
    url: `${BASE_URL}/bbs`,
    siteName: 'Gear ちゃんねる',
    locale: 'ja_JP',
    type: 'website',
  },
  alternates: {
    canonical: `${BASE_URL}/bbs`,
  },
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

  // JSON-LD: DiscussionForumPosting（上位10件）
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    name: '音楽機材掲示板 — Gear ちゃんねる',
    url: `${BASE_URL}/bbs`,
    description: '音楽機材について語る掲示板。ギター・シンセ・エフェクター・DAWなど。',
    ...(posts.length > 0 && {
      comment: posts.slice(0, 10).map(p => ({
        '@type': 'Comment',
        text: (p.title ?? '') + (p.body ? ` — ${p.body.slice(0, 100)}` : ''),
        author: { '@type': 'Person', name: p.author ?? '名無し' },
        datePublished: p.created_at,
      })),
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
    </>
  );
}
