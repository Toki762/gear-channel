// =============================================================
// middleware.ts — gear-channel.vercel.app → gear-channel.com リダイレクト
// Vercel の preview URL（gear-channel-xxx.vercel.app）はスキップ
// =============================================================
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PRIMARY_DOMAIN = 'gear-channel.com';
const VERCEL_PROD_ALIAS = 'gear-channel.vercel.app';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';

  // gear-channel.vercel.app（本番エイリアス）のみリダイレクト
  // preview URL（gear-channel-abc123.vercel.app 等）はスキップ
  if (host === VERCEL_PROD_ALIAS) {
    const url = new URL(request.url);
    url.hostname = PRIMARY_DOMAIN;
    url.protocol = 'https:';
    url.port = '';
    return NextResponse.redirect(url, { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  // API・静的ファイルはスキップ
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
