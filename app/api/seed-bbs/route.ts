// POST /api/seed-bbs — BBS シードデータ一括挿入
// 使い方: fetch('/api/seed-bbs', { method: 'POST' }) または curl -X POST https://<your-domain>/api/seed-bbs
// ⚠️ 本番環境では使用後に削除してください
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

const posts = [
  // ── ギター ──────────────────────────────────────
  { author: 'レスポール信者', flair: '機材', title: 'Gibson Les Paul Standard vs Custom 何が違うの？', body: '見た目以外の違いがよくわからん。StandardとCustomで音って変わる？価格差5万くらいあるけど悩んでる', gear_tag: 'Gibson Les Paul' },
  { author: 'フレット磨き職人', flair: '機材', title: 'Ibanez RG シリーズって現行どれが一番コスパいい？', body: 'RG450とRG550で迷ってる。フロイドローズ搭載モデルが欲しいけど予算10万以内で探してる。使ってる人いたら感想教えて', gear_tag: 'Ibanez RG' },
  { author: 'アコギ派', flair: '機材', title: 'Martin と Taylor どっちが好き？', body: 'アコギ買い替え検討中。MartinのD-28とTaylorの814ceで迷ってる。試奏したけど好みが難しい。それぞれの特徴語り合おう', gear_tag: null },
  { author: '弦オタク', flair: '雑談', title: 'みんな弦何使ってる？ゲージと銘柄教えて', body: 'ずっとErnie Ball Regular Slinkys（10-46）使ってたけど最近Elixirのコーティング弦に変えた。長持ちするのはいいけど音の違い気になる人いる？', gear_tag: null },
  // ── ベース ──────────────────────────────────────
  { author: 'フィンガースタイル派', flair: '機材', title: 'Fender Jazz Bass vs Precision Bass 初心者はどっち買うべき？', body: '初めてのベース購入検討中。JBとPBどっちがいいか迷いすぎてもう3ヶ月悩んでる。それぞれ弾いてる人の意見聞きたい', gear_tag: 'Fender Jazz Bass' },
  { author: 'スラッパー', flair: '機材', title: 'スラップ用にベース買い替えたい。おすすめある？', body: 'スラップしやすいベース探してる。今はFender MexのJBだけど、もっとスラップ向きの音が欲しい。Music ManのStingRayとか気になってる', gear_tag: null },
  // ── アンプ ──────────────────────────────────────
  { author: 'チューブ原理主義者', flair: '機材', title: 'Marshall JCM800 中古で買うのってアリ？', body: '憧れのJCM800を中古で狙ってる。40年前のアンプをメンテせずに使うのはリスクある？球の状態とかどこ見ればいい？', gear_tag: 'Marshall JCM800' },
  { author: 'デジタル移行組', flair: '機材', title: 'Kemper vs Line6 Helix どっちにするか1年悩んでる', body: 'アンプシミュに移行しようと思って絞ったけど決められない。Kemperのプロファイリングに興味あるけどHelixの柔軟性も捨てがたい。使ってる人リアルな感想頼む', gear_tag: 'Kemper' },
  // ── エフェクター ──────────────────────────────────
  { author: 'ボードビルダー', flair: '機材', title: 'エフェクターボードの電源どうしてる？One Spotで全部まかなえる？', body: 'ペダル8個のボード組んでる。今はOne Spot使ってるけどノイズが気になってきた。Strymon Zuma買うか悩んでるけど高すぎ問題', gear_tag: null },
  { author: 'ディレイコレクター', flair: '機材', title: 'テープエコー風ディレイペダルおすすめ教えて', body: 'Echoplexみたいなテープエコーサウンドをペダルで再現したい。BOSS DM-2W、Strymon El Capistan、Way Huge Aqua-Pussとかどれがいい？', gear_tag: null },
  { author: 'ファズ狂', flair: '機材', title: 'ファズペダルって現行品だと何がおすすめ？', body: 'Fuzz Faceのシリコン版かゲルマニウム版かで迷ってる。弾いたことある人どっちが好き？Big Muffとの違いも気になる', gear_tag: null },
  // ── シンセ・キーボード ──────────────────────────────
  { author: 'シンセ沼住人', flair: '機材', title: 'Moog Minimoog vs Roland SH-101 どっちが好き？', body: 'アナログシンセ沼にハマって2年。Minimoofの太さも好きだけどSH-101の軽さと小ささが魅力的。ビンテージシンセ好きな人語ろう', gear_tag: 'Moog' },
  { author: 'ポリシンセ探し中', flair: '機材', title: '予算20万以内でポリフォニックシンセ探してる', body: 'Roland Juno-60の音が好きなんだけど本物は高すぎ。Behringer JU-04AとかJupiter-Xmとか代替品多すぎてどれがいいか分からん', gear_tag: 'Roland' },
  // ── DAW・宅録 ──────────────────────────────────
  { author: 'Logic使い', flair: '機材', title: 'Logic ProとAbleton Liveどっちがバンド録音に向いてる？', body: 'バンドのデモ録り用にDAW選んでる。Logic使ってたけどAbletonの方がいいって言われた。実際バンド録音で使ってる人どっちが好き？', gear_tag: null },
  { author: 'マイク沼', flair: '機材', title: 'ボーカル録音に使えるコンデンサーマイク予算3万以内で教えて', body: 'Audio-TechnicaのAT2020ずっと使ってたけど買い替えたい。Rode NT1とかBlue Yaeti Xとか候補あるけど宅録でボーカルに最適なの何？', gear_tag: null },
  { author: '宅録ドラマー', flair: '機材', title: '電子ドラムの打ち込みってやっぱり打ち込みっぽくなる？', body: 'Roland TD-17KVX買ったけどMIDIでDAWに録ると打ち込みっぽさが抜けない。ベロシティのランダマイズとかグルーヴクオンタイズ使ってる人いる？', gear_tag: 'Roland' },
  // ── ドラム ──────────────────────────────────────
  { author: 'スネア収集家', flair: '機材', title: '木胴スネアと金属スネアの使い分けってどうしてる？', body: 'PearlのフリーフローティングとLudwigの402使ってるけど曲によって使い分けがわからん。みんなどうやって判断してる？', gear_tag: 'Pearl' },
  { author: '電子ドラム派', flair: '雑談', title: 'マンションで生ドラム練習できてる人いる？', body: '防音室作るか電子ドラムにするか悩みすぎてる。防音室DIYしてる人いたらコスト感教えてほしい。電子ドラムも叩き心地が気になる', gear_tag: null },
  // ── 雑談 ──────────────────────────────────────
  { author: '機材貧乏', flair: '雑談', title: '機材代が生活費より多い月があるんだが', body: '先月エフェクター3個、シールド2本、弦5セット買ったら食費超えた。みんな機材費用どうやって管理してる？やめられん', gear_tag: null },
  { author: 'ネット購入派', flair: '雑談', title: 'ギター試奏せずにネットで買って後悔した話', body: 'YouTubeのレビュー動画だけ見てSquier Classic Vibes買ったら思ったより塗装ムラあって凹んだ。みんな試奏派？ネット購入派？', gear_tag: null },
  { author: '楽器屋バイト', flair: '雑談', title: '楽器屋でバイトして気づいた機材の豆知識', body: '島村楽器でバイトして1年。在庫管理してたら意外な事実が判明。展示品って意外と売れてて型落ちモデルが超コスパいいってこと。展示落ちが一番お得かも', gear_tag: null },
  { author: 'ライブハウス常連', flair: '雑談', title: 'ライブハウスのバックラインって実際どこまで信用できる？', body: '地方の小箱でMarshallのアンプ使ったら音がボソボソで全然ダメだった。自前アンプ持ち込み派？ライブハウスのバックライン信用してる？', gear_tag: null },
  { author: 'ギタリスト兼Vo', flair: '雑談', title: 'ギター弾きながら歌う練習法教えて', body: '弾き語りの練習して半年、いまだに両立できない。歌うとギターが止まる、ギター弾くと歌詞飛ぶ。コツとか練習法あれば教えてください', gear_tag: null },
  { author: '機材売買マン', flair: '雑談', title: 'メルカリで楽器売るときのコツ教えて', body: '使わなくなったギター3本売りたい。写真の撮り方とか説明文の書き方とか、査定価格より高く売るコツある？ヤフオクとどっちがいい？', gear_tag: null },
];

const commentsByTitle: Record<string, { author: string; body: string }[]> = {
  'Gibson Les Paul Standard vs Custom 何が違うの？': [
    { author: 'LP愛好家', body: 'CustomはエボニーフィンガーボードとMulti-pliバインディングが大きな違い。音はStandardの方が荒々しくてロックっぽいと個人的には思う' },
    { author: 'ギター修理屋', body: 'ネックグレードとかトップ材の選定基準がCustomの方が厳しいらしいよ。音よりも工程と材のランクの話で価格差が出てる感じ' },
    { author: '名無し', body: 'どっちも同じに聞こえるって言ったら怒られそうだけど正直プレイアビリティはあんま変わらん笑　デザインで選んでいいと思う' },
    { author: 'ヴィンテージ派', body: '58〜59年のバーストレプリカ的な観点ではStandardの方が近い。Customはより現代的な解釈のLPって感じ' },
  ],
  'Ibanez RG シリーズって現行どれが一番コスパいい？': [
    { author: 'メタル小僧', body: 'RG550は日本製でクオリティ高い。10万以内ならこれ一択じゃないかな。ZPSトレモロも安定してる' },
    { author: 'ジャパンギター信者', body: 'RG450はコスパ最強だけど細かい部分の仕上げが甘い。少し頑張ってRG550にした方が後悔しないと思う' },
    { author: 'フロイド慣れ', body: 'フロイドローズはチューニング安定するけど弦交換が最初はしんどいよ。ロック式ペグの操作慣れるまで時間かかった' },
  ],
  'Martin と Taylor どっちが好き？': [
    { author: 'アコギ20年', body: 'Martinは低音の鳴りが独特でブルーズやフォーク向き。Taylorは全域バランスよくてフィンガーピッキングにめちゃ合う。ジャンルによる' },
    { author: 'ソロギター弾き', body: 'Taylorの814ceはエレアコとして使いやすい。ライブで使うならTaylorの方がピックアップ系が優秀' },
    { author: '名無し', body: 'どっちも最高だけど正直予算内で気に入ったの買えばいい。D-28もすごく良い音するよ' },
    { author: 'ギター講師', body: 'ボディシェイプの違いも大きい。Martinのドレッドノートは音量大きめ、TaylorのGTやGrandAuditoriumは小ぶりで弾きやすい' },
  ],
  'みんな弦何使ってる？ゲージと銘柄教えて': [
    { author: 'ダダリオ派', body: "D'Addario EXL110一択。安定の品質でどこでも買える。Elixirより安いし自分は弦の鮮度より張り心地優先派" },
    { author: 'コーティング信者', body: 'Elixirのナノウェブに変えてから弦交換の頻度が3分の1になった。最初の音がずっと続くわけじゃないけどコスパは全然いい' },
    { author: '名無し', body: 'GHS Boomersが好きだけど日本で買えるとこ少なくて悩んでる' },
    { author: 'チョーキング多め', body: '09-42のスーパーライトにしてから速弾きとチョーキングが楽になった。音は細くなるけど慣れれば問題ない' },
  ],
  'Fender Jazz Bass vs Precision Bass 初心者はどっち買うべき？': [
    { author: 'ベース講師', body: 'ジャンル関係なくPBで基本を学ぶことをおすすめしてる。シンプルな分、自分の音を出す練習になる。JBは後から違いがわかるようになってから' },
    { author: 'JB信者', body: 'JBの方がネックが細くて弾きやすい。初心者にも優しいと思う。2ピックアップで音の幅も広い' },
    { author: '両方持ち', body: '両方持ってるけどどっちも好き。バンドでの使い分けはPBがロック・パンク、JBがファンク・ジャズって感じ' },
    { author: '名無し', body: '試奏して自分が弾いて気持ちいい方でいいよ。どっちも名器だから後悔しない' },
  ],
  'スラップ用にベース買い替えたい。おすすめある？': [
    { author: 'スラップマスター', body: 'Music Man StingRayは正解だと思う。スラップの抜けが違う。あとEQが強力なんで音作りの幅が広い' },
    { author: 'スラップ初心者', body: 'Warwickもスラップ向き。低音の立ち上がりが早くてサムが決まりやすい。中古で出回ってるから狙い目' },
    { author: '名無し', body: 'メキシコFenderのJBにBartoliniとかNordstrandのピックアップ載せると化けることある。改造もあり' },
  ],
  'Marshall JCM800 中古で買うのってアリ？': [
    { author: 'ビンテージアンプ屋', body: '球の状態が全て。プリ管もパワー管も替えてたらそんなにリスクない。コンデンサーが劣化してることも多いから信頼できるリペアマンに診てもらってから買うのがベスト' },
    { author: 'JCM800使い', body: '自分の2203は35年物だけど毎年メンテして現役。愛着が全然違うよ。ちゃんとしたとこで買えば問題ない' },
    { author: 'メンテ職人', body: 'ヒューズ切れ、カップリングコンデンサの液漏れ、ポットのガリが三大トラブル。買う前にフルボリュームで鳴らさせてもらって異音ないか確認して' },
    { author: '名無し', body: 'JCM800の音はほんとにかっこいい。多少リスクあっても欲しいなら買うべきだと思う' },
  ],
  'Kemper vs Line6 Helix どっちにするか1年悩んでる': [
    { author: 'Kemperユーザー', body: 'KemperはプロファイリングでリアルアンプのDNAを丸ごと取り込める感覚。Facebookとかにプロファイルが山ほど無料で転がってる。音のリアリティはKemperが上' },
    { author: 'Helix使い', body: 'HelixはUIが直感的すぎて最高。ライブでの操作性はKemperより上だと思う。エフェクトの種類もHelixの方が多い' },
    { author: 'どっちも持ち', body: 'スタジオ録音ならKemper、ライブのリアルタイム操作ならHelix。予算あれば両方買っちゃえばいいよ笑' },
    { author: 'Quad Cortex推し', body: '今から買うならNeural DSP Quad Cortexも検討した方がいい。UIがiPadみたいで操作めちゃ楽。エコシステムも成長中' },
    { author: '名無し', body: '1年悩んでるなら楽器屋で両方試奏してきて。試奏10分でどっちか決まると思う' },
  ],
  'エフェクターボードの電源どうしてる？One Spotで全部まかなえる？': [
    { author: 'ノイズ対策マニア', body: 'One Spotはデジタルペダルとアナログ混在すると絶対ノイズ出る。アイソレートされてないから。Strymon Zumaは高いけど投資価値あり' },
    { author: 'CIOKS推し', body: 'CIOKSのDC10とかAC10がおすすめ。Zumaより安くてアイソレーション完璧。ヨーロッパのブランドで品質高い' },
    { author: 'Voodoo Lab派', body: 'Voodoo Lab Pedal Power 2 Plusもいいよ。長年使ってるけどトラブルなし。定番だけに安心感が違う' },
    { author: '名無し', body: 'ペダル数が少ないうちはOne Spotで十分だけど増えてきたらアイソレート電源の恩恵を実感する。最初からいいの買えばよかったと後悔した' },
  ],
  'テープエコー風ディレイペダルおすすめ教えて': [
    { author: 'El Capistanユーザー', body: 'El Capistanは間違いなく最高峰。モジュレーション感、テープサチュレーション、テープスピードの揺れ全部リアル。値段高いけど後悔なし' },
    { author: 'DM-2W使い', body: 'Boss DM-2Wはアナログ回路でシンプルに使えていい。テープエコーの再現というよりアナログディレイの温かさって感じ。あの価格帯では最高' },
    { author: 'ディレイオタク', body: 'Catalinbread Belle EpochもEchoplex系でいいよ。El Capistanより安くてテープっぽさはちゃんとある' },
    { author: 'アンビ好き', body: '自分はMXR Carbon Copyで満足してる。テープエコーじゃないけどウォームなアナログディレイが好きなんで' },
  ],
  'ファズペダルって現行品だと何がおすすめ？': [
    { author: 'Fuzz Face使い', body: 'ゲルマニウムは温度に敏感で気難しいけどあの倍音はシリコンでは出ない。夏のライブはチューニングより先にファズが心配になるレベル笑' },
    { author: 'Big Muff信者', body: 'Big Muffはオクターブ感のある壁みたいな歪みが独特。Fuzz Faceとは方向性が全然違う。両方持ってるといいよ' },
    { author: '名無し', body: 'Dunlop製のFuzz Face Miniが小さくてボードに収まりやすい。シリコンとゲルマニウムどっちもミニサイズで出てる' },
    { author: 'ファズ沼人', body: 'Stomp Under Foot、Analogman、Skreddy等のブティック系ファズも聴いてみて。大手にはない個性がある。値段もまあまあするけど' },
  ],
  'Moog Minimoog vs Roland SH-101 どっちが好き？': [
    { author: 'モジュラー民', body: 'MiniMoogの3OSCとフィルターの組み合わせは唯一無二。あのカットオフを上げ下げしてるだけで時間溶ける笑' },
    { author: 'SH-101使い', body: 'SH-101は軽くてシーケンサー内蔵なのが最高。ライブでの取り回しがめちゃいい。Minimoofは据え置き前提になりがち' },
    { author: '名無し', body: 'どっちも最高だけど今の価格でビンテージ買うなら代替品の方がよくない？BehringerのModelDとかMS-1とか安くて普通に使えるし' },
    { author: 'シンセ講師', body: 'リプロダクションは確かに安いけどビンテージ機材の文脈で使いたいなら本物の意味は別にある。音楽的な理由というより所有欲的な理由で笑' },
  ],
  '予算20万以内でポリフォニックシンセ探してる': [
    { author: 'Juno使い', body: 'Roland Boutique JP-08とかJU-06Aは本物に近い音するよ。価格も抑えられてる。鍵盤ついてないけどMIDIコン繋げばOK' },
    { author: 'Deepmind推し', body: 'Behringer DeepMind 12がマジでコスパ最強。12ポリで本格的なアナログ。Juno系の音が好きならかなり近い' },
    { author: 'Sequential派', body: 'Sequential Prophet-6は20万超えるけど中古なら手が届くかも。本物のアナログポリはやっぱり別格' },
    { author: 'Prophet-5愛好家', body: 'OberheimのOB-6も聴いてみて。Prophet-6と同じ開発陣でより甘い音。どっちも最高だけど方向性が違う' },
    { author: '名無し', body: 'Arturia PolyBrute中古もアリ。価格こなれてきてる' },
  ],
  'Logic ProとAbleton Liveどっちがバンド録音に向いてる？': [
    { author: 'Logic使い歴10年', body: 'Logicはマルチトラック録音の使いやすさと付属プラグインのクオリティが高い。ドラムレコーダー、Flextime、Spacesignerとか無料で使えるのが強すぎ' },
    { author: 'Ableton派', body: 'AbletonはSessionビューでのアイデア出しが最高。バンドのリハに持ち込んでリアルタイムでループ組むのに向いてる。でも純粋な録音ならLogicかな' },
    { author: 'エンジニア', body: 'プロのスタジオはPro Toolsが標準。でもバンドのデモなら正直LogicもAbletonも大差ない。操作慣れてる方使えばいい' },
    { author: 'DTM初心者', body: 'MacあるならLogicが一番コスパいいと思う。2万円であれだけの機能はすごい' },
  ],
  'ボーカル録音に使えるコンデンサーマイク予算3万以内で教えて': [
    { author: 'ボーカリスト', body: 'Rode NT1は3万以内で買えてノイズフロアが業界最低レベル。宅録ボーカルに最適。音も繊細で素直' },
    { author: 'レコーディング趣味', body: 'Audio-Technica AT4040も3万ちょいで買える。AT2020より全然上で、中域の艶が好き。邦楽ボーカルとの相性良い' },
    { author: '宅録歴5年', body: 'Blue Yeti ProはUSBマイクだからオーディオIFいらない。手軽さで言えばコスパ最強。ただ音質はXLRには劣る' },
    { author: 'マイク教徒', body: 'シュアーのSM7Bも3万ちょいで買える。ダイナミックマイクだけど宅録ボーカルに最高。動画配信でも定番で将来性あり' },
  ],
  '電子ドラムの打ち込みってやっぱり打ち込みっぽくなる？': [
    { author: 'ドラマー兼DTM', body: 'ベロシティのランダマイズは必須。あとヒューマナイズ機能でタイミングを±5msくらいランダムにするとかなり自然になる' },
    { author: 'グルーヴ派', body: 'グルーヴテンプレートに乗せるのが一番手軽。Logic付属の「Please Human」とかAbletonのGroove Poolが使いやすい' },
    { author: 'Sound Engineer', body: '打ち込みっぽさの原因の半分はドラムサンプル自体の質。Steven Slate Drumsとか高品質なサンプル使うだけでリアル感上がる' },
    { author: '名無し', body: 'TD-17KVXのメッシュヘッドでかなりダイナミクスは出るよ。あとハイハットのオープン/クローズの使い分けを意識すると化ける' },
  ],
  '木胴スネアと金属スネアの使い分けってどうしてる？': [
    { author: 'スタジオドラマー', body: 'ロック系は金属（メープルやオーク）、ポップやR&Bは木胴（メープルやバーチ）って感じで使い分けてる。録音だと特にキャラが出る' },
    { author: '名無し', body: 'Pearlのフリーフローティングはチューニングの安定感が段違い。ライブで重宝する' },
    { author: 'ドラム講師', body: '金属スネアはアタックが強くてカットしてくる音、木胴はボディが豊かで温かみがある。どっちも一本ずつ持ってると対応幅が全然違う' },
  ],
  'マンションで生ドラム練習できてる人いる？': [
    { author: 'マンションドラマー', body: '防音室DIYした。スタイロフォームと石膏ボードで二重壁作って50万くらいかかった。完璧じゃないけど隣に聞こえないレベルにはなった' },
    { author: '電子ドラム派', body: 'Roland TD-50XとKFSのメッシュヘッドにしたらかなり静かになった。それでも床の振動は対策必要でテニスボールとか防振ゴムを重ねてる' },
    { author: '近隣配慮', body: 'マンションで生ドラムは正直厳しい。スタジオ月額会員になった方が安上がりで近所関係も壊れない笑' },
    { author: 'スタジオ比較', body: 'スタジオの月会員制度探してみて。24時間使えるとこもあって月2万以内だったりする' },
  ],
  '機材代が生活費より多い月があるんだが': [
    { author: '機材沼の先輩', body: 'わかりすぎる笑　自分は今月Strymon 2個買って食費が野菜炒めになった。でも後悔はしてない' },
    { author: '断捨離のすすめ', body: '使ってない機材を定期的に売ると意外と回る。メルカリで売ったお金で新しいの買うサイクルができてからは財布がそんなに痛くなくなった' },
    { author: 'キャッシュフロー管理', body: '機材用の口座を別に作って毎月決まった額入れてる。その範囲内でやりくりするようになってから破綻しなくなった笑' },
    { author: '名無し', body: '楽器は資産だから大丈夫って自分に言い聞かせてる' },
  ],
  'ギター試奏せずにネットで買って後悔した話': [
    { author: '試奏派', body: '絶対試奏すべき。同じモデルでも個体差が結構あるよ。特にネックのグリップ感は実際触らないとわからない' },
    { author: 'ネット購入歴10年', body: '正規品で新品ならネットでも大丈夫なことが多い。でも中古はリスクあり。塗装ムラとかネックの反りは写真じゃわからん' },
    { author: '楽器屋派', body: '試奏して気に入ったやつをネットで安く買うのが最強戦略。楽器屋には申し訳ないけど' },
    { author: '名無し', body: 'Squier Classic Vibesは当たり個体と外れ個体の差が大きいシリーズだからこそ試奏が重要。自分も1本目は外れた笑' },
  ],
  '楽器屋でバイトして気づいた機材の豆知識': [
    { author: '元楽器屋勤め', body: '展示落ちは傷チェックさえすれば本当にお得。エージングもされてて弾きやすくなってるし値引き交渉もしやすい' },
    { author: '値引き交渉派', body: '型落ちモデルは在庫処分で交渉余地あり。定価の30%引きとかも全然いける場合ある。現金払いも効く' },
    { author: '名無し', body: '楽器屋のバイトいいな。機材の扱い方とかメンテ知識が自然に身につきそう' },
    { author: '内部情報的な', body: '新製品発表直後は旧モデルが一気に値下がりするタイミング。メーカーの発表スケジュール追ってると狙い目が見えてくる' },
  ],
  'ライブハウスのバックラインって実際どこまで信用できる？': [
    { author: 'ライブエンジニア', body: '小箱のバックラインは正直当たり外れ激しい。自分でメンテしてないハコのアンプは球がくたびれてたり、コンディション最悪のことある' },
    { author: '持ち込み派', body: 'ヘッドアンプだけ持ち込みにしてるとリスク分散できる。キャビだけならハコの使ってもまだマシ' },
    { author: 'バンドマン歴10年', body: 'ハコのJC-120（ローランドジャズコーラス）はどこでもだいたい安定してる。歪みペダル持ってればクリーンチャンネルだけ使えばなんとかなる' },
    { author: '名無し', body: 'リハスタで使えた音がライブ本番だと全然違ってパニックになったことある。シミュレーター系持ち込みにしてから安定した' },
  ],
  'ギター弾きながら歌う練習法教えて': [
    { author: '弾き語り5年', body: 'まずギターのコード進行を完全に無意識でできるレベルまで体に染み込ませること。歌詞見なくても弾けるまで何百回でも弾く' },
    { author: '練習の鬼', body: 'ギターのリズムを口でスキャットしながら弾く練習が効果的。「チャン、チャカ、チャン」みたいに。それができたら歌詞に置き換える' },
    { author: 'ギター教室講師', body: 'ゆっくりテンポから始めること。完璧に弾けるテンポで歌う練習を繰り返してテンポを上げていくのが正攻法' },
    { author: '独学派', body: '自分はメトロノーム使って体が勝手に動くくらいまで弾き込んでから歌を乗せた。最初は歌詞カード見ながらでいい' },
  ],
  'メルカリで楽器売るときのコツ教えて': [
    { author: 'メルカリ上級者', body: '写真は白背景で明るい場所で撮ること。傷は正直に全部写真に収める。コメントで「傷ありますか？」って来る前に先に書いた方が信頼される' },
    { author: '売買ベテラン', body: 'ヤフオクの方が楽器は高く売れることが多い。メルカリはすぐ売れるけど価格は低め。急いでないならヤフオク推奨' },
    { author: '名無し', body: '説明文にシリアルナンバー書くと本物確認したい人が安心して買ってくれる。あとケースや付属品の有無も必ず書いて' },
    { author: '経験談', body: '梱包は過剰なくらいがいい。ギターは特に首折れリスクあるから段ボール二重にしてネック周りはプチプチ巻きまくる' },
  ],
};

export async function POST() {
  const supabase = createServerClient();

  const results: { inserted: number; comments: number; errors: string[] } = {
    inserted: 0,
    comments: 0,
    errors: [],
  };

  const postIds: Record<string, string> = {};

  // 投稿を挿入
  for (const post of posts) {
    const { data, error } = await supabase
      .from('bbs_posts')
      .insert(post)
      .select('id, title')
      .single();

    if (error) {
      results.errors.push(`Post failed: ${post.title} — ${error.message}`);
    } else {
      postIds[data.title] = data.id;
      results.inserted++;
    }
  }

  // コメントを挿入
  for (const [title, comments] of Object.entries(commentsByTitle)) {
    const postId = postIds[title];
    if (!postId) continue;

    for (const comment of comments) {
      const { error } = await supabase.from('bbs_comments').insert({
        post_id: postId,
        author: comment.author,
        body: comment.body,
        reply_to: null,
      });
      if (error) {
        results.errors.push(`Comment failed: ${error.message}`);
      } else {
        results.comments++;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    inserted: results.inserted,
    comments: results.comments,
    errors: results.errors.length > 0 ? results.errors : undefined,
  });
}

// GET でステータス確認
export async function GET() {
  const supabase = createServerClient();
  const { count: postCount } = await supabase
    .from('bbs_posts')
    .select('*', { count: 'exact', head: true });
  const { count: commentCount } = await supabase
    .from('bbs_comments')
    .select('*', { count: 'exact', head: true });

  return NextResponse.json({
    bbs_posts: postCount ?? 0,
    bbs_comments: commentCount ?? 0,
    message: postCount === 0
      ? 'DBにデータなし。POST /api/seed-bbs を実行してください'
      : `投稿${postCount}件・コメント${commentCount}件が存在します`,
  });
}
