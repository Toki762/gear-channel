// BBS シードスクリプト — ターミナルで node seed_bbs.mjs を実行
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pxnodeqhteyckzsywbxw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4bm9kZXFodGV5Y2t6c3l3Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgwNzE3MywiZXhwIjoyMDkxMzgzMTczfQ.bt5cTc9Orbm0lSvFlgV3yQ0f3TMZSKqiLFSLwxJ3peM',
  { auth: { persistSession: false } }
);

const posts = [
  {
    author: 'ギター初心者',
    flair: '雑談',
    title: '初めてエフェクター買ったんだけど繋ぎ方合ってる？',
    body: 'ギター→ワウ→歪み→コーラス→ディレイ→アンプ で繋いでるんだけどこれで合ってる？音出るけどなんか変な気がして',
    gear_tag: null,
  },
  {
    author: 'ぺだる厨',
    flair: 'エフェクター',
    title: 'Boss DS-1 vs ProCo RAT どっち派？',
    body: '歪みの定番2択、みんなどっち使ってる？自分はRAT一筋10年だけど最近DS-1も気になってきた。それぞれの良さ語ってくれ',
    gear_tag: 'Boss DS-1',
  },
  {
    author: 'スタジオ籠もり太郎',
    flair: '雑談',
    title: '練習スタジオ代節約するコツ教えて',
    body: '毎週スタジオ入ってたら月1万以上かかってきつい。みんなどうやって練習スペース確保してるの？',
    gear_tag: null,
  },
  {
    author: 'トーンマニア',
    flair: 'ギター',
    title: 'Fender Stratocaster のピックアップ交換してみた',
    body: 'ノーマルのシングルからTexas Specialに交換してみたけど、中域の張りが全然違う。コスパ最高だった。交換したことある人いる？',
    gear_tag: 'Fender Stratocaster',
  },
  {
    author: '名無し',
    flair: '雑談',
    title: 'バンドメンバー募集ってどこでやってる？',
    body: 'Twitterで告知してもなかなか集まらない。スタジオの掲示板とかアプリとか、効果あった方法あれば教えてほしい',
    gear_tag: null,
  },
  {
    author: 'アナログ信者',
    flair: 'エフェクター',
    title: 'アナログペダルとデジタルペダル、本気で音変わると思う？',
    body: 'ブラインドテストしたらわかんないって説もあるけど、自分はアナログの方が気持ちよく弾けてる気がする。プラシーボかもしれないけど大事よな',
    gear_tag: null,
  },
  {
    author: 'ベース弾き',
    flair: '雑談',
    title: 'ベーシストが機材にお金かけるのって無駄じゃないよな？',
    body: 'バンドメンバーに「ベースはどうせ聞こえないんだから安物でいい」って言われたんだけど、Aguilarのプリアンプ買ったら全然違うよ？',
    gear_tag: null,
  },
  {
    author: 'チューニング職人',
    flair: 'エフェクター',
    title: 'ポリフォニックチューナーって実際どう？',
    body: 'TC ElectronicのPolyTuneずっと気になってる。ライブで全弦一気にチューニングできるって便利すぎない？使ってる人感想聞かせて',
    gear_tag: 'TC Electronic PolyTune',
  },
  {
    author: 'ホームレコーダー',
    flair: '雑談',
    title: '宅録の環境整えたいんだけど何から揃えればいい？',
    body: 'DAWはGarage Band、オーディオインターフェースはScarlett 2i2持ってる。次は何買うべき？モニタースピーカー？コンデンサーマイク？',
    gear_tag: null,
  },
  {
    author: 'レトロフリーク',
    flair: 'エフェクター',
    title: '70年代のビンテージペダル集めてる人いる？',
    body: 'MXR Phase 90のBlock Logo版をフリマで入手した。現行品と弾き比べると確かに違う気がする。ビンテージ好きのギタリストと語りたい',
    gear_tag: 'MXR Phase 90',
  },
  {
    author: 'アンプ難民',
    flair: 'アンプ',
    title: 'マンションでもいい音出せるアンプ教えて',
    body: '一人暮らしマンションでギター弾いてるけど、アッテネーターかヘッドフォンアンプかで迷ってる。Fender Blues Juniorほしいけど音量的に無理かな',
    gear_tag: 'Fender Blues Junior',
  },
  {
    author: 'ライブキッズ',
    flair: '雑談',
    title: '最近行ったライブで感動した機材使い教えて',
    body: '先週見たバンドのギタリストがKemperだけでめちゃくちゃいい音出してた。アンプシミュレーターのクオリティ上がりすぎでしょ',
    gear_tag: null,
  },
];

const commentsByTitle = {
  '初めてエフェクター買ったんだけど繋ぎ方合ってる？': [
    { author: '先輩ギタリスト', body: 'ワウは基本チェーンの一番最初でOK。歪みの前か後かは好みあるけど前の方がスタンダード。その繋ぎで全然問題ないよ！' },
    { author: '機材オタク', body: 'コーラスはディレイより後ろに置く人も多い。ディレイ→コーラスにすると空間系のまとまりが出る。いろいろ試してみて' },
    { author: '名無し', body: 'センドリターンがついてるアンプなら空間系はそっちに挿す方法もあるよ。将来的に試してみて' },
  ],
  'Boss DS-1 vs ProCo RAT どっち派？': [
    { author: 'ブルース好き', body: 'RATのフィルターつまみが最高。下げると激しく、上げると落ち着いた音になる。DS-1より幅広い音作りできると思う' },
    { author: 'パンク小僧', body: 'DS-1はJoe Satrianiが使ってたの有名だよな。安くてどこでも手に入るし初心者にはDS-1おすすめ' },
    { author: '名無し', body: 'どっちも持ってるけど気分で使い分けてる。RATはブルース系、DS-1はハードロック系って感じ' },
  ],
  '練習スタジオ代節約するコツ教えて': [
    { author: 'スタジオ常連', body: '平日昼とかオフピーク時間帯使うと半額くらいになるスタジオ多い。あとメンバーで月一まとめ払い契約すると安くなる' },
    { author: 'DTMer', body: '宅録環境作ったらスタジオ行く回数激減した。録音して聴き返す方が練習効率もいい' },
  ],
  'ポリフォニックチューナーって実際どう？': [
    { author: 'PolyTune使い', body: 'PolyTune使ってるけど便利すぎて戻れない。ライブで素早くチューニングチェックできるのが最高。買って後悔ゼロ' },
    { author: 'クリップ派', body: 'KORGのピッチクリップの方が精度高い気がする。ポリフォは大まかなチェック用に使って細かいのはクリップで確認してる' },
  ],
  '宅録の環境整えたいんだけど何から揃えればいい？': [
    { author: 'エンジニア見習い', body: 'Scarlett 2i2あるならモニスピ次かな。YAMAHAのHS5かADAMのT5Vあたりが定番。部屋の広さに合わせて選んで' },
    { author: '宅録10年選手', body: 'マイクより先にモニター環境整えた方がいい。モニタリングがちゃんとできないと全部がズレてくる' },
  ],
  'マンションでもいい音出せるアンプ教えて': [
    { author: 'アッテネーター使い', body: 'Two Notes TorpedoとかBoss Waza Tube Amplifireがおすすめ。アンプ鳴らせないなら最初からアンプシミュの方が選択肢広い' },
    { author: '隣人思いの人', body: 'Blues Juniorにアッテネーター足してもいいけどぶっちゃけHeadrush MX5の方がコスパいい。アンシミュも進化してるよ' },
  ],
  'ベーシストが機材にお金かけるのって無駄じゃないよな？': [
    { author: 'ベース信者', body: '全然無駄じゃない。むしろ低音が締まるとバンド全体のサウンドが引き締まる。わかる人にはわかる話' },
    { author: 'ミックスエンジニア', body: 'エンジニア目線だとベースの音質は超大事。スタジオ仕事してるとベースの音で仕上がりが全然変わるの実感する' },
  ],
  '最近行ったライブで感動した機材使い教えて': [
    { author: 'アナログ派', body: 'Kemperは確かにすごいけど自分はアンプとエフェクターボードの見た目好きだからなかなか移行できない笑' },
    { author: '機材ウォッチャー', body: '最近Quad Cortexも増えてきたね。ライブ映えするビジュアルがいい' },
  ],
};

async function main() {
  console.log('BBS シードデータを投稿中...\n');

  const postIds = {};

  for (const post of posts) {
    const { data, error } = await supabase
      .from('bbs_posts')
      .insert(post)
      .select('id, title')
      .single();

    if (error) {
      console.error('× 投稿失敗:', post.title, '-', error.message);
    } else {
      postIds[data.title] = data.id;
      console.log('✓ スレッド:', data.title);
    }
  }

  console.log('\nコメントを投稿中...\n');

  for (const [title, comments] of Object.entries(commentsByTitle)) {
    const postId = postIds[title];
    if (!postId) { console.log('× スレ見つからず:', title); continue; }

    for (const comment of comments) {
      const { error } = await supabase.from('bbs_comments').insert({
        post_id: postId,
        author: comment.author,
        body: comment.body,
        reply_to: null,
      });
      if (error) {
        console.error('  × コメント失敗:', error.message);
      } else {
        console.log(`  └ [${comment.author}] ${comment.body.slice(0, 30)}...`);
      }
    }
  }

  console.log('\n✅ 完了！');
}

main().catch(console.error);
