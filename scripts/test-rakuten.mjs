// 楽天APIテストスクリプト
// 実行: node scripts/test-rakuten.mjs YOUR_APP_ID
const appId = process.argv[2];
if (!appId) {
  console.error('使い方: node scripts/test-rakuten.mjs YOUR_APP_ID');
  process.exit(1);
}

const url = new URL('https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706');
url.searchParams.set('applicationId', appId);
url.searchParams.set('keyword', 'Gibson Les Paul');
url.searchParams.set('imageFlag', '1');
url.searchParams.set('hits', '2');

console.log('リクエスト URL:', url.toString());
console.log('---');

const res = await fetch(url.toString());
const json = await res.json();

if (json.error) {
  console.error('APIエラー:', json.error, json.error_description);
  process.exit(1);
}

console.log('ヒット数:', json.count ?? 0);
console.log('取得件数:', (json.Items ?? []).length);

for (const wrapper of json.Items ?? []) {
  const item = wrapper?.Item ?? wrapper;
  const images = item?.mediumImageUrls ?? [];
  console.log('---');
  console.log('商品名:', item?.itemName?.slice(0, 60));
  console.log('画像数:', images.length);
  console.log('画像URL:', images[0]?.imageUrl ?? images[0] ?? '(なし)');
}
