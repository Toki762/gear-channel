// =============================================================
// Gear Channel — 設定定数 (TypeScript)
// =============================================================

export const CAT_ICON: Record<string, string> = {
  'ギター': '🎸',
  'ベース': '🎸',
  'ギターアンプ': '🔊',
  'ベースアンプ': '🔊',
  'アンプ': '🔊',
  'ギターエフェクター': '⚡',
  'エフェクター': '⚡',
  'ベースエフェクター': '🎛',
  'キーボード': '🎹',
  'ドラム': '🥁',
  'DAW': '💻',
  'マイク': '🎤',
  '音響機材': '🎚️',
  'シンせ/プラグイン': '🎛️',
  'シンセ/プラグイン': '🎛️',
};

export const FX_SUBCATS = [
  'すべて',
  'OD/ドライブ',
  'ディストーション/ファズ',
  'ディレイ',
  'リバーブ',
  'コーラス/モジュレーション',
  'ピッチ/ワーミー',
  'コンプ',
  'チューナー',
  'マルチ/その他',
] as const;

export type FxSubcat = typeof FX_SUBCATS[number];

import type { GearItem } from '@/lib/types';

export function getFxSubcat(g: GearItem): FxSubcat {
  const n = (g.name + ' ' + g.kw).toLowerCase();
  if (/tube screamer|overdrive|od-|bb preamp|ocd|blues driver|sweet honey|moonshine|guv.nor|crunch|drive|xotic|fulltone|keeley|way huge|hermida|lovepedal|mad prof/i.test(n)) return 'OD/ドライブ';
  if (/distortion|fuzz|rat|muff|big muff|ds-|proco|darkglass|b3k|alpha.omega|metal|doom/i.test(n)) return 'ディストーション/ファズ';
  if (/delay|echo|dd-|nova delay|el capistan|timefactor|carbon copy|dm-|flashback|memory|analog echo/i.test(n)) return 'ディレイ';
  if (/reverb|bigsky|prussian|holy grail|rv-|space|big sky|shimmer/i.test(n)) return 'リバーブ';
  if (/chorus|ch-|ce-|modulation|modfactor|mm-4|vibrato|flanger|phaser|uni-vibe|mobius|tremolo|rotary/i.test(n)) return 'コーラス/モジュレーション';
  if (/pitch|whammy|pog|pitchfactor|harmonizer|harmonist|ps-/i.test(n)) return 'ピッチ/ワーミー';
  if (/compress|dyna comp|dynacomp|sustain|limiter|mxr comp|orange squeeze/i.test(n)) return 'コンプ';
  if (/tuner|tu-|polytune|pitchblack|chromatic/i.test(n)) return 'チューナー';
  if (/helix|kemper|fractal|gx-|axe-fx|multi|loop|rc-|sansamp|bass driver|preamp|di box/i.test(n)) return 'マルチ/その他';
  return 'OD/ドライブ';
}

export function getBrandColor(brand: string): string {
  const c: Record<string, string> = {
    'Fender': '#c41e3a', 'Gibson': '#1e120a', 'Boss': '#cc0011', 'Roland': '#cc0011',
    'Strymon': '#1a3a6a', 'YAMAHA': '#0055aa', 'Line 6': '#0099cc', 'Marshall': '#1a1a1a',
    'Vox': '#880000', 'Native Instruments': '#222', 'Apple': '#1d1d1f', 'Neumann': '#1a1a1a',
    'Shure': '#0066cc', 'Universal Audio': '#111', 'Teenage Engineering': '#e05a00',
    'Arturia': '#cc2222', 'Akai': '#bb1122', 'Dunlop': '#333', 'Ibanez': '#222',
    'MXR': '#444', 'Eventide': '#221a88', 'Klon': '#aa8800',
    'Martin': '#4a2c08', 'PRS': '#1a1a1a', 'Taylor': '#3a2010', 'Tech 21': '#224422',
    'Pearl': '#333', 'DW': '#1a1a1a', 'Zildjian': '#aa6600', 'Darkglass': '#0d1a2e',
    'Spectrasonics': '#110055', 'iZotope': '#0d2a1a', 'FabFilter': '#1a0d33',
    'Soundtoys': '#2d0a18', 'KRK': '#111', 'Audio-Technica': '#111', 'Moog': '#1a0a0a',
    'Nord': '#aa1100', 'Xfer Records': '#111', 'Ableton': '#cc5500', 'Avid': '#111',
    'Steinberg': '#aa8800', 'TC Electronic': '#333', 'Xotic': '#3a1a5a',
    'Electro-Harmonix': '#4a6a1a', 'Walrus Audio': '#2a4a6a', 'Chase Bliss': '#1a2a4a',
    'Korg': '#0a1a3a',
  };
  return c[brand] || '#2a2a2a';
}

export const POPULAR_IDS = [
  'yoasobi', 'hige', 'mrsgreenapple', 'vaundy', 'kinggnu',
  'backnumber', 'radwimps', 'oneokrock', 'ten-feet', 'alexandros',
  'asian-kung-fu', 'sakanaction', 'tokyo-jihen', 'bjc', 'john-mayer',
  'super-beaver', 'quruli', 'macaroni',
];

export const BBS_CATS = [
  'すべて', 'ギター', 'ベース', 'アンプ', 'エフェクター',
  'キーボード/鍵盤', 'DAW・DTM', 'マイク', '音響・その他',
  'ヘッドホン', 'スピーカー/モニター', 'プラグイン', '購入相談', '雑談',
];

export const FLAIR_CLS: Record<string, string> = {
  'ギター': 'f-guitar', 'ベース': 'f-bass', 'アンプ': 'f-amp', 'エフェクター': 'f-fx',
  'キーボード/鍵盤': 'f-key', 'DAW・DTM': 'f-daw', 'マイク': 'f-mic',
  '音響・その他': 'f-mpr', 'ヘッドホン': 'f-hp', 'スピーカー/モニター': 'f-spk',
  'プラグイン': 'f-plug', '購入相談': 'f-buy', '雑談': 'f-other',
};

// Brand → Clearbit domain mapping
export const BRAND_DOMAIN: Record<string, string> = {
  'Fender': 'fender.com', 'Gibson': 'gibson.com', 'Boss': 'boss.info', 'Roland': 'roland.com',
  'Strymon': 'strymon.net', 'YAMAHA': 'yamaha.com', 'Line 6': 'line6.com', 'Marshall': 'marshall.com',
  'Vox': 'voxamps.com', 'Native Instruments': 'native-instruments.com', 'Apple': 'apple.com',
  'Neumann': 'neumann.com', 'Shure': 'shure.com', 'Universal Audio': 'uaudio.com',
  'Arturia': 'arturia.com', 'Akai': 'akaipro.com', 'Dunlop': 'jimdunlop.com',
  'Ibanez': 'ibanez.com', 'MXR': 'jimdunlop.com', 'Eventide': 'eventideaudio.com',
  'Martin': 'martinguitar.com', 'PRS': 'prsguitars.com', 'Taylor': 'taylorguitars.com',
  'Tech 21': 'tech21nyc.com', 'Pearl': 'pearldrum.com', 'DW': 'dwdrums.com',
  'Zildjian': 'zildjian.com', 'Darkglass': 'darkglass.com',
  'JHS Pedals': 'jhspedals.com', 'Keeley Electronics': 'robertkeeley.com',
  'Spectrasonics': 'spectrasonics.net', 'iZotope': 'izotope.com', 'FabFilter': 'fabfilter.com',
  'Soundtoys': 'soundtoys.com', 'KRK': 'krkmusic.com', 'Audio-Technica': 'audio-technica.com',
  'Moog': 'moogmusic.com', 'Nord': 'nordkeyboards.com', 'Xfer Records': 'xferrecords.com',
  'Ableton': 'ableton.com', 'Avid': 'avid.com', 'Steinberg': 'steinberg.net',
  'TC Electronic': 'tcelectronic.com', 'Xotic': 'xotic.us',
  'Electro-Harmonix': 'ehx.com', 'Walrus Audio': 'walrusaudio.com',
  'Chase Bliss': 'chaseblissaudio.com', 'Korg': 'korg.com',
  'Fractal Audio': 'fractalaudio.com', 'Kemper': 'kemper-amps.com',
};

export const ARTIST_KANA: Record<string, string> = {
  'hige':          'ひげだん おふぃしゃるひげだんでぃずむ',
  'radwimps':      'らどわいんぷす らどうぃんぷす',
  'john-mayer':    'じょんめいやー',
  'yoasobi':       'よあそび あやせ いくら',
  'bjc':           'ぶらんきーじぇっとしてぃ ぶらんきー あさいけんいち',
  'kinggnu':       'きんぐぬー king gnu',
  'oneokrock':     'わんおくろっく one ok rock',
  'backnumber':    'ばっくなんばー back number',
  'mrsgreenapple': 'みせす Mrs GREEN APPLE おおもりもとき',
  'sakanaction':   'さかなくしょん sakanaction',
  'asian-kung-fu': 'あじかん あじあんかんふーじぇねれーしょん',
  'tokyo-jihen':   'とうきょうじへん tokyo jihen しいなりんご',
  'ten-feet':      'てんふぃーと 10feet 10-FEET',
  'alexandros':    'あれきさんどろす Alexandros',
  'super-beaver':  'すーぱーびーばー SUPER BEAVER',
  'quruli':        'くるり Quruli',
  'macaroni':      'まかろにえんぴつ Macaroni Enpitsu',
  'billie':        'びりーあいりっしゅ billie eilish',
  'saucy-dog':     'さうしーどっぐ Saucy Dog いしはらしんや せとあやか あきざわかずき',
  'novelbright':   'のべるぶらいと Novelbright たけなかゆうだい とうのようへい',
  'myfirststory':  'まいふぁーすとすとーりー MY FIRST STORY ひろ のぶ てる',
  'shishamo':      'ししゃも SHISHAMO みやざきあさこ まつおかあや よしかわみさき',
};
