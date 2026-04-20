// =============================================================
// Sitemap — Next.js App Router 自動サイトマップ生成
// =============================================================
import type { MetadataRoute } from 'next';
import { DB } from '@/data/artists';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gear-channel.com';

// コンテンツの実際の最終更新日（artists.ts や静的ページを更新したら一緒に更新すること）
const CONTENT_UPDATED_AT = new Date('2026-04-21');
const STATIC_UPDATED_AT  = new Date('2026-01-01');

export default function sitemap(): MetadataRoute.Sitemap {
  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: CONTENT_UPDATED_AT,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/artists`,
      lastModified: CONTENT_UPDATED_AT,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/bbs`,
      lastModified: CONTENT_UPDATED_AT,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: STATIC_UPDATED_AT,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: STATIC_UPDATED_AT,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: STATIC_UPDATED_AT,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // アーティスト個別ページ
  const artistPages: MetadataRoute.Sitemap = DB.map(artist => ({
    url: `${BASE_URL}/artists/${artist.id}`,
    lastModified: CONTENT_UPDATED_AT,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...artistPages];
}
