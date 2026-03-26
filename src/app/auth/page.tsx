'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setSent(true);
    setLoading(false);
  };

  const canProceed = mode === 'login' || agreed;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Translingo</h1>
          <p className="text-sm text-gray-500 mt-1">翻訳と復習が同時にできるアプリ</p>
        </div>

        {/* タブ */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
          <button
            onClick={() => { setMode('login'); setSent(false); }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mode === 'login' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            ログイン
          </button>
          <button
            onClick={() => { setMode('signup'); setSent(false); }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mode === 'signup' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            新規登録
          </button>
        </div>

        {/* 新規登録時の同意チェック */}
        {mode === 'signup' && (
          <label className="flex items-start gap-2 mb-5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0"
            />
            <span className="text-xs text-gray-600 leading-relaxed">
              <Link href="/terms" className="text-blue-600 hover:underline">利用規約</Link>
              {'および'}
              <Link href="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</Link>
              に同意します
            </span>
          </label>
        )}

        {/* Googleボタン */}
        <button
          onClick={handleGoogle}
          disabled={!canProceed}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Googleで{mode === 'signup' ? '登録' : 'ログイン'}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">または</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {sent ? (
          <div className="text-center py-4 px-2">
            <p className="text-sm font-medium text-gray-800">メールを送信しました</p>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              {email} にログインリンクを送りました。メールをご確認ください。
            </p>
          </div>
        ) : (
          <form onSubmit={handleEmail} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="メールアドレス"
              required
              disabled={!canProceed}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={loading || !canProceed}
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '送信中...' : `メールで${mode === 'signup' ? '登録' : 'ログイン'}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
