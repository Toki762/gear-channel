// =============================================================
// Amazon PA API v5 — 商品画像取得エンドポイント
// GET /api/amazon-image?q=Gibson+Les+Paul&asin=B00XXXXX
// =============================================================
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const REGION    = 'us-east-1';          // PA API は常に us-east-1
const SERVICE   = 'ProductAdvertisingAPI';
const HOST      = 'webservices.amazon.co.jp';
const ENDPOINT  = `https://${HOST}/paapi5/searchitems`;
const TARGET    = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';

// ── AWS Signature Version 4 ────────────────────────────────
function hmac(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
}

function sha256hex(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

function getSignatureKey(secretKey: string, dateStamp: string): Buffer {
  const kDate    = hmac(`AWS4${secretKey}`, dateStamp);
  const kRegion  = hmac(kDate, REGION);
  const kService = hmac(kRegion, SERVICE);
  return hmac(kService, 'aws4_request');
}

function signRequest(
  accessKey: string,
  secretKey: string,
  payload: string,
  amzDate: string,
  dateStamp: string
): Record<string, string> {
  const payloadHash = sha256hex(payload);

  const canonicalHeaders = [
    `content-encoding:amz-1.0`,
    `content-type:application/json; charset=utf-8`,
    `host:${HOST}`,
    `x-amz-date:${amzDate}`,
    `x-amz-target:${TARGET}`,
  ].join('\n') + '\n';

  const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';

  const canonicalRequest = [
    'POST',
    '/paapi5/searchitems',
    '',                   // query string
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256hex(canonicalRequest),
  ].join('\n');

  const signingKey = getSignatureKey(secretKey, dateStamp);
  const signature  = hmac(signingKey, stringToSign).toString('hex');

  const authHeader =
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    'Authorization':     authHeader,
    'Content-Encoding':  'amz-1.0',
    'Content-Type':      'application/json; charset=utf-8',
    'Host':              HOST,
    'X-Amz-Date':        amzDate,
    'X-Amz-Target':      TARGET,
  };
}

// ── メインハンドラー ───────────────────────────────────────
export async function GET(req: NextRequest) {
  const accessKey  = process.env.AMAZON_ACCESS_KEY;
  const secretKey  = process.env.AMAZON_SECRET_KEY;
  const partnerTag = process.env.AMAZON_PARTNER_TAG;

  if (!accessKey || !secretKey || !partnerTag) {
    return NextResponse.json(
      { error: 'Amazon PA API の環境変数が未設定です (AMAZON_ACCESS_KEY / AMAZON_SECRET_KEY / AMAZON_PARTNER_TAG)' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('q')?.trim();
  const asin    = searchParams.get('asin')?.trim();

  if (!keyword && !asin) {
    return NextResponse.json({ error: 'q または asin パラメーターが必要です' }, { status: 400 });
  }

  // タイムスタンプ生成
  const now       = new Date();
  const amzDate   = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
  const dateStamp = amzDate.slice(0, 8);

  // PA API リクエストボディ
  const body = asin
    ? {
        ItemIds:     [asin],
        Marketplace: 'www.amazon.co.jp',
        PartnerTag:  partnerTag,
        PartnerType: 'Associates',
        Resources:   ['Images.Primary.Large', 'Images.Primary.Medium', 'ItemInfo.Title', 'DetailPageURL'],
        Operation:   'GetItems',  // GetItems は別エンドポイントなのでSearchItemsで代用
      }
    : {
        Keywords:    keyword,
        SearchIndex: 'MusicalInstruments',
        Marketplace: 'www.amazon.co.jp',
        PartnerTag:  partnerTag,
        PartnerType: 'Associates',
        ItemCount:   5,
        Resources:   ['Images.Primary.Large', 'Images.Primary.Medium', 'ItemInfo.Title', 'DetailPageURL'],
      };

  const payload = JSON.stringify(body);
  const headers = signRequest(accessKey, secretKey, payload, amzDate, dateStamp);

  try {
    const res = await fetch(ENDPOINT, {
      method:  'POST',
      headers: headers as Record<string, string>,
      body:    payload,
    });

    const data = await res.json() as any;

    if (!res.ok) {
      console.error('PA API error:', data);
      return NextResponse.json(
        { error: data?.Errors?.[0]?.Message ?? 'PA API エラー' },
        { status: res.status }
      );
    }

    // レスポンスを整形
    const items = (data.SearchResult?.Items ?? []).map((item: any) => ({
      asin:     item.ASIN,
      title:    item.ItemInfo?.Title?.DisplayValue ?? '',
      imageUrl: item.Images?.Primary?.Large?.URL ?? item.Images?.Primary?.Medium?.URL ?? '',
      pageUrl:  item.DetailPageURL ?? `https://www.amazon.co.jp/dp/${item.ASIN}?tag=${partnerTag}`,
    })).filter((i: any) => i.imageUrl);

    return NextResponse.json({ items });

  } catch (err) {
    console.error('amazon-image route error:', err);
    return NextResponse.json({ error: 'ネットワークエラーが発生しました' }, { status: 500 });
  }
}
