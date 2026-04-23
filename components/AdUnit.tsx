'use client';
// =============================================================
// AdUnit — Google AdSense 手動配置用コンポーネント
// =============================================================
// 使い方:
//   <AdUnit slot="1234567890" />                  // レスポンシブ（デフォルト）
//   <AdUnit slot="1234567890" format="rectangle" /> // 300x250 ボックス
//   <AdUnit slot="1234567890" className="my-4" />   // カスタムスタイル
// =============================================================
import { useEffect, useRef } from 'react';

const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_ID ?? '';

interface Props {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

export default function AdUnit({ slot, format = 'auto', className = '' }: Props) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    // 開発環境 or ID未設定 or 2重push防止
    if (!PUBLISHER_ID || pushed.current) return;
    try {
      pushed.current = true;
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // adsbygoogle が未ロードの場合は無視
    }
  }, []);

  // 本番 & ID設定済み & スロット設定済みのときだけ表示
  if (!PUBLISHER_ID || !slot) return null;

  return (
    <div className={`overflow-hidden text-center ${className}`}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
