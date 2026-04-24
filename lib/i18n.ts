// =============================================================
// i18n — 多言語対応（日本語 / 英語）
// =============================================================
// ブラウザ言語を自動検出し、クッキー gear_lang で上書き可能
// サーバーコンポーネント: getLocale() で取得
// クライアントコンポーネント: locale を props で受け取る
// =============================================================

export type Locale = 'ja' | 'en';
export const LOCALE_COOKIE = 'gear_lang';

// カテゴリ名の英語マッピング
export const CAT_EN: Record<string, string> = {
  'すべて': 'All',
  'ギター': 'Guitar',
  'ベース': 'Bass',
  'アンプ': 'Amp',
  'ギターエフェクター': 'Guitar FX',
  'ベースエフェクター': 'Bass FX',
  'エフェクター': 'Effects',
  'キーボード': 'Keyboard',
  'キーボード/鍵盤': 'Keys',
  'シンセ/プラグイン': 'Synth/Plugin',
  'プラグイン': 'Plugin',
  'ドラム': 'Drums',
  'DAW': 'DAW',
  'DAW・DTM': 'DAW/DTM',
  'マイク': 'Mic',
  'マイク/音響': 'Mic/Audio',
  '音響機材': 'Audio Gear',
  '音響・その他': 'Audio/Other',
  'ヘッドホン': 'Headphones',
  'スピーカー/モニター': 'Speaker/Monitor',
  '購入相談': 'Buying Advice',
  '雑談': 'General',
  'その他': 'Other',
};

export function localeCat(locale: Locale, cat: string): string {
  if (locale === 'ja') return cat;
  return CAT_EN[cat] ?? cat;
}

// UI 文字列辞書
export const i18n = {
  ja: {
    // Header
    searchPlaceholder: 'アーティスト・機材を検索…',
    searchBtn: '検索',
    navArtists: 'アーティスト',
    navBbs: '掲示板',
    langSwitch: 'EN',

    // パンくず
    bcHome: 'ホーム',
    bcArtists: 'アーティスト一覧',

    // Artists page
    artistsPageTitle: 'アーティスト一覧',
    artistsNoResults: '「{q}」に一致するアーティストが見つかりませんでした',
    artistsResults: '「{q}」の検索結果 {n}件',

    // GearSection — メンバーフィルター
    memberFilterClear: '× 全員表示',

    // GearSection — カード
    editedBadge: '編集済',
    userAddedBadge: '追加',

    // GearSection — 展開コンテンツ
    ytSectionTitle: '▶ YouTube で調べる',
    ytSearchLabel: '「{name}」でYouTubeを検索する',
    similarGear: '似た機材',

    // GearSection — ショップボタン
    amazonStore: 'Amazon（アマゾン）',
    amazonBtn: 'Amazon（アマゾン）で詳細を見る',
    rakutenBtn: '楽天市場で詳細を見る',
    yahooBtn: 'Yahoo!ショッピングで詳細を見る',
    soundhouseBtn: 'サウンドハウスで詳細を見る',

    // GearSection — 編集フォーム
    editInfoBtn: '✏️ 情報を編集',
    editFormTitle: '情報を編集',
    editWikiBadge: 'Wiki編集',
    editLabelName: '名前',
    editLabelCat: 'カテゴリ',
    editLabelUser: '使用者',
    editSave: '保存',
    editCancel: 'キャンセル',
    editNote: '編集内容はこのブラウザのみに保存されます',

    // GearSection — アクション
    discussBtn: '💬 掲示板で話す',
    deleteBtn: '🗑 削除',
    deleteConfirm: 'この機材を削除しますか？',
    officialDataNote: '公式データは削除不可',

    // GearSection — 機材追加フォーム
    addGearBtn: '＋ 機材を追加する',
    addGearTitle: '＋ 機材を追加',
    addGearBrandPh: 'ブランド（例：Fender）',
    addGearNamePh: '機材名（必須）',
    addGearSelectMember: '── メンバーを選択 ──',
    addGearWholeBand: 'バンド全体',
    addGearUnknown: '不明',
    addGearPricePh: '価格（例：¥50,000〜）',
    addGearYtPh: 'YouTube検索ワード（任意）',
    addGearSaveBtn: '追加する',
    addGearSavingBtn: '保存中…',
    addGearCancelBtn: 'キャンセル',
    addGearNote: '追加した機材はサイト全体に反映されます',
    addGearValidation: '機材名を入力してください',
    addGearFail: '追加に失敗しました。しばらくしてからお試しください。',

    // BBS
    bbsNewThread: '＋ 新規スレッド',
    bbsPopular: '🔥 人気順',
    bbsLatest: '🕐 新着順',
    bbsSearchPh: 'スレッドを検索…',
    bbsGearRelated: '🔍 {kw} 関連のスレッドを表示中',
    bbsGearClear: '× 解除',
    bbsPostFormTitle: '新規スレッドを立てる',
    bbsNamePh: '名前（省略可）',
    bbsGearTagPh: '機材タグ（例：Telecaster）',
    bbsBodyPh: '本文…',
    bbsSubmitBtn: '投稿する',
    bbsSubmittingBtn: '投稿中…',
    bbsCancelBtn: 'キャンセル',
    bbsSearchBtn: '検索',

    // Footer
    footerDisclaimerTitle: '【PR / 広告表記】',
    footerDisclaimerText: '当サイトはAmazonアソシエイト・楽天アフィリエイト・バリューコマース（サウンドハウス）・Yahoo!ショッピングのアフィリエイトプログラムに参加しています。機材リンクをクリックして商品を購入された場合、当サイトに紹介料が発生することがあります。利用者の方のご購入金額が増えることは一切ありません。',
    footerAbout: '運営者情報',
    footerPrivacy: 'プライバシーポリシー',
    footerContact: 'お問い合わせ',
    footerArtists: 'アーティスト一覧',
    footerBbs: '掲示板',
    footerCopy: '© {year} Gear ちゃんねる — アーティストの機材を調べるサイト',
  },
  en: {
    // Header
    searchPlaceholder: 'Search artists & gear…',
    searchBtn: 'Search',
    navArtists: 'Artists',
    navBbs: 'Forum',
    langSwitch: 'JA',

    // Breadcrumb
    bcHome: 'Home',
    bcArtists: 'All Artists',

    // Artists page
    artistsPageTitle: 'All Artists',
    artistsNoResults: 'No artists found for "{q}"',
    artistsResults: '{n} results for "{q}"',

    // GearSection — member filter
    memberFilterClear: '× Show All',

    // GearSection — card
    editedBadge: 'Edited',
    userAddedBadge: 'Added',

    // GearSection — expanded
    ytSectionTitle: '▶ Search on YouTube',
    ytSearchLabel: 'Search "{name}" on YouTube',
    similarGear: 'Similar Gear',

    // GearSection — shop buttons
    amazonStore: 'Amazon',
    amazonBtn: 'View on Amazon',
    rakutenBtn: 'View on Rakuten',
    yahooBtn: 'View on Yahoo! Shopping',
    soundhouseBtn: 'View on Soundhouse',

    // GearSection — edit form
    editInfoBtn: '✏️ Edit Info',
    editFormTitle: 'Edit Info',
    editWikiBadge: 'Wiki Edit',
    editLabelName: 'Name',
    editLabelCat: 'Category',
    editLabelUser: 'User',
    editSave: 'Save',
    editCancel: 'Cancel',
    editNote: 'Edits are saved in this browser only',

    // GearSection — actions
    discussBtn: '💬 Discuss on Forum',
    deleteBtn: '🗑 Delete',
    deleteConfirm: 'Delete this gear item?',
    officialDataNote: 'Official data cannot be deleted',

    // GearSection — add gear form
    addGearBtn: '+ Add Gear',
    addGearTitle: '+ Add Gear',
    addGearBrandPh: 'Brand (e.g. Fender)',
    addGearNamePh: 'Gear name (required)',
    addGearSelectMember: '── Select member ──',
    addGearWholeBand: 'Whole Band',
    addGearUnknown: 'Unknown',
    addGearPricePh: 'Price (e.g. ¥50,000~)',
    addGearYtPh: 'YouTube search keyword (optional)',
    addGearSaveBtn: 'Add',
    addGearSavingBtn: 'Saving…',
    addGearCancelBtn: 'Cancel',
    addGearNote: 'Added gear will be visible to all users',
    addGearValidation: 'Please enter a gear name',
    addGearFail: 'Failed to add. Please try again later.',

    // BBS
    bbsNewThread: '+ New Thread',
    bbsPopular: '🔥 Popular',
    bbsLatest: '🕐 Latest',
    bbsSearchPh: 'Search threads…',
    bbsGearRelated: '🔍 Showing threads related to "{kw}"',
    bbsGearClear: '× Clear',
    bbsPostFormTitle: 'Post a New Thread',
    bbsNamePh: 'Name (optional)',
    bbsGearTagPh: 'Gear tag (e.g. Telecaster)',
    bbsBodyPh: 'Body…',
    bbsSubmitBtn: 'Post',
    bbsSubmittingBtn: 'Posting…',
    bbsCancelBtn: 'Cancel',
    bbsSearchBtn: 'Search',

    // Footer
    footerDisclaimerTitle: '[Affiliate Disclosure]',
    footerDisclaimerText: 'This site participates in Amazon Associates, Rakuten Affiliate, ValueCommerce (Soundhouse), and Yahoo! Shopping affiliate programs. We may earn a commission when you click gear links and make a purchase, at no extra cost to you.',
    footerAbout: 'About',
    footerPrivacy: 'Privacy Policy',
    footerContact: 'Contact',
    footerArtists: 'All Artists',
    footerBbs: 'Forum',
    footerCopy: '© {year} Gear Channel — Music Gear Database',
  },
} as const;

export type DictKey = keyof typeof i18n.ja;

/** 翻訳文字列を返す。{var} プレースホルダーを置換 */
export function t(
  locale: Locale,
  key: DictKey,
  vars?: Record<string, string | number>,
): string {
  const dict = i18n[locale] as Record<string, string>;
  const fallback = i18n.ja as Record<string, string>;
  let str = dict[key] ?? fallback[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

/** サーバーコンポーネント用: cookies() からロケールを取得 */
export function getLocale(): Locale {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { cookies } = require('next/headers') as { cookies: () => { get: (k: string) => { value: string } | undefined } };
    const lang = cookies().get(LOCALE_COOKIE)?.value;
    return lang === 'en' ? 'en' : 'ja';
  } catch {
    return 'ja';
  }
}
