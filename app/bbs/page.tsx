// =============================================================
// BBS Page — Server Component
// =============================================================
import type { Metadata } from 'next';
import { fetchPosts, createServerClient } from '@/lib/supabase';
import BbsClient from './BbsClient';

// 掲示板は常に最新データを表示（書き込みがリアルタイムで反映されるように）
export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gear-channel.com';

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

  const [{ posts, total }, dbGearResult] = await Promise.all([
    fetchPosts({ flair, search, gearKw, sort, page, pageSize: PAGE_SIZE }),
    createServerClient().from('db_gear').select('id, brand, name, kw'),
  ]);

  // Supabase db_gear をリンク用に整形
  type DbGearEntry = { id: number; brand: string | null; name: string; kw: string | null };
  const dbGear: { brand: string; name: string; kw: string; artistId: string }[] =
    ((dbGearResult.data ?? []) as DbGearEntry[]).map(g => ({
      brand: g.brand ?? '',
      name: g.name,
      kw: g.kw ?? g.name,
      artistId: String(g.id),
    }));

  // JSON-LD: ItemList of DiscussionForumPosting（上位10件）
  // Google要件: headline, url, author(name), datePublished が各投稿に必要
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '音楽機材掲示板 — Gear ちゃんねる',
    url: `${BASE_URL}/bbs`,
    description: '音楽機材について語る掲示板。ギター・シンセ・エフェクター・DAWなど。',
    itemListElement: posts.slice(0, 10).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'DiscussionForumPosting',
        headline: p.title ?? '無題',
        url: `${BASE_URL}/bbs?thread=${p.id}`,
        datePublished: p.created_at,
        author: {
          '@type': 'Person',
          name: p.author ?? '名無し',
          url: `${BASE_URL}/bbs`,
        },
        // text は必須（image/video がないため常に含める）
        text: (p.body || p.title || '音楽機材掲示板への投稿').slice(0, 200),
      },
    })),
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
        dbGear={dbGear}
      />
    </>
  );
}
