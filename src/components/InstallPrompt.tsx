'use client';

import { useEffect, useState } from 'react';
import { X, Share, Plus, MoreVertical } from 'lucide-react';

type Platform = 'ios' | 'android' | null;

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return null;
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true);
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);

  useEffect(() => {
    // すでにインストール済み or 非対応プラットフォームは表示しない
    if (isStandalone()) return;
    const p = detectPlatform();
    if (!p) return;

    // 過去に閉じた場合は7日間表示しない
    const dismissed = localStorage.getItem('install_prompt_dismissed');
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    setPlatform(p);
    // 少し遅らせて表示
    const timer = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('install_prompt_dismissed', String(Date.now()));
    setShow(false);
  };

  if (!show) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={handleDismiss}
      />

      {/* ポップアップ */}
      <div className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-blue-600 px-5 py-4 flex items-start justify-between">
            <div>
              <p className="text-white font-bold text-base">ホーム画面に追加する</p>
              <p className="text-blue-100 text-xs mt-0.5">アプリとして快適に使えます</p>
            </div>
            <button onClick={handleDismiss} className="text-blue-200 hover:text-white mt-0.5">
              <X size={20} />
            </button>
          </div>

          {/* 手順 */}
          <div className="px-5 py-4">
            {platform === 'ios' ? (
              <div className="flex flex-col gap-3">
                <Step num={1} icon={<Share size={18} className="text-blue-600" />}>
                  画面下の<strong>「共有」ボタン</strong>をタップ
                  <span className="text-xs text-gray-400 block mt-0.5">（四角から上矢印が出るアイコン）</span>
                </Step>
                <Step num={2} icon={<Plus size={18} className="text-blue-600" />}>
                  <strong>「ホーム画面に追加」</strong>を選ぶ
                </Step>
                <Step num={3} icon={<span className="text-blue-600 font-bold text-sm">追加</span>}>
                  右上の<strong>「追加」</strong>をタップして完了
                </Step>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Step num={1} icon={<MoreVertical size={18} className="text-blue-600" />}>
                  ブラウザ右上の<strong>メニュー（⋮）</strong>をタップ
                </Step>
                <Step num={2} icon={<Plus size={18} className="text-blue-600" />}>
                  <strong>「ホーム画面に追加」</strong>または<br />
                  <strong>「アプリをインストール」</strong>を選ぶ
                </Step>
                <Step num={3} icon={<span className="text-blue-600 font-bold text-sm">OK</span>}>
                  <strong>「追加」</strong>をタップして完了
                </Step>
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="px-5 pb-4">
            <button
              onClick={handleDismiss}
              className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200"
            >
              今はしない
            </button>
          </div>
        </div>

        {/* 吹き出しの三角（下向き） */}
        <div className="flex justify-center">
          <div className="w-4 h-4 bg-gray-100 rotate-45 -mt-2 rounded-sm shadow" />
        </div>
      </div>
    </>
  );
}

function Step({
  num,
  icon,
  children,
}: {
  num: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {num}
      </div>
      <div className="flex items-start gap-2 flex-1">
        <span className="flex-shrink-0 mt-0.5">{icon}</span>
        <span className="text-sm text-gray-700 leading-snug">{children}</span>
      </div>
    </div>
  );
}
