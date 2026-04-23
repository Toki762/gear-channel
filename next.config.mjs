/** @type {import('next').NextConfig} */
const nextConfig = {
  // vercel.app ドメインからカスタムドメインへ 301 リダイレクト
  // → 重複コンテンツ・canonical 不一致を解消
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'gear-channel.vercel.app' }],
        destination: 'https://gear-channel.com/:path*',
        permanent: true, // 301
      },
    ];
  },

  // 画像最適化 — Amazon・サウンドハウス等の外部画像をNext.js経由で最適化
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com' },
      { protocol: 'https', hostname: 'www.soundhouse.co.jp' },
      { protocol: 'https', hostname: 'thumbnail.image.rakuten.co.jp' },
      { protocol: 'https', hostname: 'item-shopping.c.yimg.jp' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // HTTPヘッダー — SEO・セキュリティ強化
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // クリックジャッキング防止
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // XSS防止
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // リファラー情報
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // 静的アセットを長期キャッシュ
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
