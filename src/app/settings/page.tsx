'use client';

import { useState, useEffect } from 'react';
import { Save, Check, LogOut, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SUPPORTED_LANGUAGES } from '@/lib/deepl';
import { createClient } from '@/lib/supabase';

export default function SettingsPage() {
  const [targetLang, setTargetLang] = useState('EN');
  const [sourceLang, setSourceLang] = useState('JA');
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    setTargetLang(localStorage.getItem('default_target_lang') ?? 'EN');
    setSourceLang(localStorage.getItem('default_source_lang') ?? 'JA');
    const supabase = createClient();
    supabase.auth.getSession().then((res: Awaited<ReturnType<typeof supabase.auth.getSession>>) => {
      const userEmail = res.data.session?.user?.email;
      if (userEmail) setEmail(userEmail);
    });
  }, []);

  const handleSave = () => {
    localStorage.setItem('default_target_lang', targetLang);
    localStorage.setItem('default_source_lang', sourceLang);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">設定</h1>

      <div className="flex flex-col gap-6">
        {/* アカウント */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">アカウント</h2>
          {email && (
            <p className="text-sm text-gray-600 mb-3">{email}</p>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            <LogOut size={16} />
            ログアウト
          </button>
        </div>

        {/* デフォルト言語 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">デフォルト翻訳言語</h2>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">翻訳元（ソース）</label>
              <select
                value={sourceLang}
                onChange={e => setSourceLang(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AUTO">自動検出</option>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">翻訳先（ターゲット）</label>
              <select
                value={targetLang}
                onChange={e => setTargetLang(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          {saved ? (
            <><Check size={18} /> 保存しました</>
          ) : (
            <><Save size={18} /> 保存する</>
          )}
        </button>

        {/* お問い合わせ */}
        <Link
          href="/contact"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 font-medium bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
        >
          <Mail size={16} className="text-gray-400" />
          お問い合わせ
        </Link>

        {/* リンク */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <Link href="/terms" className="hover:text-gray-600">利用規約</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-gray-600">プライバシーポリシー</Link>
        </div>

        {/* アプリ情報 */}
        <div className="text-center text-xs text-gray-400 mt-2">
          <p>Translingo v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
