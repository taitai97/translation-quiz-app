'use client';

import { useEffect, useState } from 'react';
import { X, Share, Plus, MoreVertical } from 'lucide-react';

type Browser =
  | 'ios-safari'   // iOS Safari → 共有ボタンは画面下
  | 'ios-chrome'   // iOS Chrome → 共有ボタンは画面上（アドレスバー右）
  | 'ios-other'    // iOS その他ブラウザ → 共有は上
  | 'android'      // Android Chrome など → メニュー（⋮）
  | null;

function detectBrowser(): Browser {
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);

  if (isIOS) {
    if (/CriOS/i.test(ua)) return 'ios-chrome';
    if (/FxiOS|EdgiOS|OPiOS/i.test(ua)) return 'ios-other';
    return 'ios-safari';
  }
  if (isAndroid) return 'android';
  return null;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator &&
      (navigator as { standalone?: boolean }).standalone === true)
  );
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [browser, setBrowser] = useState<Browser>(null);

  useEffect(() => {
    if (isStandalone()) return;
    const b = detectBrowser();
    if (!b) return;

    const dismissed = localStorage.getItem('install_prompt_dismissed');
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    setBrowser(b);
    const timer = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('install_prompt_dismissed', String(Date.now()));
    setShow(false);
  };

  if (!show || !browser) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={handleDismiss} />

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
            <Steps browser={browser} />
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
      </div>
    </>
  );
}

function Steps({ browser }: { browser: Browser }) {
  if (browser === 'ios-safari') {
    return (
      <div className="flex flex-col gap-3">
        <Step num={1} icon={<Share size={18} className="text-blue-600" />}>
          画面<strong>下中央</strong>の<strong>「共有」ボタン</strong>をタップ
          <span className="text-xs text-gray-400 block mt-0.5">四角から上矢印が出るアイコン</span>
        </Step>
        <Step num={2} icon={<Plus size={18} className="text-blue-600" />}>
          メニューをスクロールして<strong>「ホーム画面に追加」</strong>を選ぶ
        </Step>
        <Step num={3} icon={<span className="text-blue-600 font-bold text-sm">追加</span>}>
          右上の<strong>「追加」</strong>をタップして完了
        </Step>
      </div>
    );
  }

  if (browser === 'ios-chrome') {
    return (
      <div className="flex flex-col gap-3">
        <Step num={1} icon={<Share size={18} className="text-blue-600" />}>
          画面<strong>右上</strong>（アドレスバー横）の<strong>「共有」ボタン</strong>をタップ
          <span className="text-xs text-gray-400 block mt-0.5">四角から上矢印が出るアイコン</span>
        </Step>
        <Step num={2} icon={<Plus size={18} className="text-blue-600" />}>
          <strong>「ホーム画面に追加」</strong>を選ぶ
        </Step>
        <Step num={3} icon={<span className="text-blue-600 font-bold text-sm">追加</span>}>
          右上の<strong>「追加」</strong>をタップして完了
        </Step>
      </div>
    );
  }

  if (browser === 'ios-other') {
    return (
      <div className="flex flex-col gap-3">
        <Step num={1} icon={<Share size={18} className="text-blue-600" />}>
          画面<strong>上部</strong>の<strong>「共有」ボタン</strong>をタップ
          <span className="text-xs text-gray-400 block mt-0.5">四角から上矢印が出るアイコン</span>
        </Step>
        <Step num={2} icon={<Plus size={18} className="text-blue-600" />}>
          <strong>「ホーム画面に追加」</strong>を選ぶ
        </Step>
        <Step num={3} icon={<span className="text-blue-600 font-bold text-sm">追加</span>}>
          <strong>「追加」</strong>をタップして完了
        </Step>
      </div>
    );
  }

  // android
  return (
    <div className="flex flex-col gap-3">
      <Step num={1} icon={<MoreVertical size={18} className="text-blue-600" />}>
        ブラウザ<strong>右上のメニュー（⋮）</strong>をタップ
      </Step>
      <Step num={2} icon={<Plus size={18} className="text-blue-600" />}>
        <strong>「ホーム画面に追加」</strong>または
        <strong>「アプリをインストール」</strong>を選ぶ
      </Step>
      <Step num={3} icon={<span className="text-blue-600 font-bold text-sm">OK</span>}>
        <strong>「追加」</strong>をタップして完了
      </Step>
    </div>
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
