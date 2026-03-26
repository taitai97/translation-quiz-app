'use client';

import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/deepl';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [targetLang, setTargetLang] = useState('JA');
  const [sourceLang, setSourceLang] = useState('AUTO');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiKey(localStorage.getItem('deepl_api_key') ?? '');
    setTargetLang(localStorage.getItem('default_target_lang') ?? 'JA');
    setSourceLang(localStorage.getItem('default_source_lang') ?? 'AUTO');
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('deepl_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('deepl_api_key');
    }
    localStorage.setItem('default_target_lang', targetLang);
    localStorage.setItem('default_source_lang', sourceLang);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">設定</h1>

      <div className="flex flex-col gap-6">
        {/* DeepL APIキー */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-1">DeepL APIキー</h2>
          <p className="text-xs text-gray-500 mb-2">
            DeepL Free APIキーを入力してください（月50万字まで無料）。
            未入力の場合はモック翻訳が使われます。
          </p>
          <a
            href="/deepl-guide.html"
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mb-3"
          >
            📖 APIキーの取得方法を見る →
          </a>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="DeepL-Auth-Key xxxxx..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowKey(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            ※ APIキーはlocalStorageに保存されます。他人と共有しないでください。
          </p>
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

        {/* アプリ情報 */}
        <div className="text-center text-xs text-gray-400 mt-2">
          <p>翻訳クイズ v1.0.0</p>
          <p>データはすべてブラウザのローカルストレージに保存されます</p>
        </div>
      </div>
    </div>
  );
}
