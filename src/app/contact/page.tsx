'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Check } from 'lucide-react';

const CATEGORIES = [
  '不具合・バグ報告',
  '機能のご要望',
  'アカウントについて',
  'その他',
];

export default function ContactPage() {
  const router = useRouter();
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, message }),
    });
    if (res.ok) {
      setSent(true);
    } else {
      setError('送信に失敗しました。もう一度お試しください。');
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <Check size={28} className="text-green-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-800">送信しました</p>
          <p className="text-sm text-gray-500 mt-1">お問い合わせありがとうございます。</p>
        </div>
        <button
          onClick={() => router.push('/settings')}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          設定に戻る
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">お問い合わせ</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">カテゴリ</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">お問い合わせ内容</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            rows={6}
            placeholder="詳しい内容をご記入ください"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send size={16} />
          {loading ? '送信中...' : '送信する'}
        </button>
      </form>
    </div>
  );
}
