'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  if (!offline) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-xs text-yellow-800">
      <WifiOff size={14} />
      オフライン中 — キャッシュされたデータを表示しています
    </div>
  );
}
