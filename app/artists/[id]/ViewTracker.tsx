'use client';
// =============================================================
// ViewTracker — ページ表示時にアーティストのビュー数を加算
// レンダリングには何も出力しない
// =============================================================
import { useEffect, useRef } from 'react';
import { incrementArtistView } from './actions';

export default function ViewTracker({ artistId }: { artistId: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    incrementArtistView(artistId);
  }, [artistId]);

  return null;
}
