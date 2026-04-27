// =============================================================
// middleware.ts
//   1. gear-channel.vercel.app → gear-channel.com リダイレクト
//   2. Accept-Language ヘッダーから gear_lang クッキーを自動設定
// =============================================================
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PRIMARY_DOMAIN = 'gear-channel.com';
const VERCEL_PROD_ALIAS = 'gear-channel.vercel.app';
const LOCALE_COOKIE = 'gear_lang';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1年

function detectLocale(request: NextRequest): 'ja' | 'en' {
  const acceptLang = request.headers.get('accept-language') ?? '';
  // ja または ja-JP を含む場合は日本語
  if (/^ja\b/i.test(acceptLang) || /,\s*ja\b/i.test(acceptLang)) return 'ja';
  return 'en';
}

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';

  if (host === VERCEL_PROD_ALIAS) {
    // vercel.app の /robots.txt → Disallow: / を返してクロールをブロック
    if (request.nextUrl.pathname === '/robots.txt') {
      return new NextResponse('User-agent: *\nDisallow: /\n', {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // ① vercel.app → カスタムドメインへ 301 リダイレクト（noindex ヘッダー付き）
    const url = new URL(request.url);
    url.hostname = PRIMARY_DOMAIN;
    url.protocol = 'https:';
    url.port = '';
    const redirect = NextResponse.redirect(url, { status: 301 });
    redirect.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return redirect;
  }

  const response = NextResponse.next();

  // ② gear_lang クッキーが未設定の場合のみ Accept-Language から自動設定
  if (!request.cookies.get(LOCALE_COOKIE)) {
    const locale = detectLocale(request);
    response.cookies.set(LOCALE_COOKIE, locale, {
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
