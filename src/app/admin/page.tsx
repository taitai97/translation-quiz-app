'use client';

import { useEffect, useState } from 'react';
import { Users, FileText, CreditCard, BookOpen, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface UserRow {
  id: string;
  email: string;
  provider: string;
  createdAt: string;
  translations: number;
  cards: number;
  sessions: number;
  lastSessionAt: number | null;
}

interface Stats {
  users: { total: number; thisWeek: number; byProvider: Record<string, number> };
  translations: { total: number; thisWeek: number };
  cards: { total: number };
  sessions: { total: number };
  dailyActiveUsers: { date: string; count: number }[];
  userList: UserRow[];
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
        {icon}
        {label}
      </div>
      <p className="text-3xl font-bold text-gray-800">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-blue-600 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => {
        if (!r.ok) throw new Error('アクセス権限がありません');
        return r.json();
      })
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="text-center py-16">
      <p className="text-red-600 font-medium">{error}</p>
      <Link href="/" className="mt-4 inline-block text-sm text-blue-600">← ホームに戻る</Link>
    </div>
  );

  if (!stats) return null;

  const maxDau = Math.max(...stats.dailyActiveUsers.map(d => d.count), 1);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">運営ダッシュボード</h1>
      </div>

      {/* メトリクス */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={<Users size={14} />} label="総ユーザー数" value={stats.users.total} sub={`今週 +${stats.users.thisWeek}`} />
        <StatCard icon={<FileText size={14} />} label="総翻訳数" value={stats.translations.total} sub={`今週 +${stats.translations.thisWeek}`} />
        <StatCard icon={<CreditCard size={14} />} label="総カード数" value={stats.cards.total} />
        <StatCard icon={<BookOpen size={14} />} label="学習セッション" value={stats.sessions.total} />
      </div>

      {/* 日別アクティブユーザー */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4">
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
          <TrendingUp size={14} />
          日別アクティブユーザー（直近7日）
        </div>
        <div className="flex items-end gap-1.5 h-24">
          {stats.dailyActiveUsers.map(d => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-600 font-medium">{d.count}</span>
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${(d.count / maxDau) * 72}px`, minHeight: d.count > 0 ? '4px' : '0' }}
              />
              <span className="text-[10px] text-gray-400">{d.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ログイン方法 */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
          <Users size={14} />
          ログイン方法
        </div>
        <div className="flex flex-col gap-2">
          {Object.entries(stats.users.byProvider).map(([provider, count]) => (
            <div key={provider} className="flex items-center justify-between text-sm">
              <span className="text-gray-600 capitalize">{provider}</span>
              <span className="font-medium text-gray-800">{count} 人</span>
            </div>
          ))}
        </div>
      </div>

      {/* ユーザー一覧 */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="flex items-center gap-2 text-gray-500 text-xs p-4 border-b border-gray-100">
          <Users size={14} />
          ユーザー別利用状況（学習セッション順）
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left px-4 py-2">メール</th>
                <th className="text-right px-3 py-2">翻訳</th>
                <th className="text-right px-3 py-2">カード</th>
                <th className="text-right px-3 py-2">セッション</th>
                <th className="text-right px-4 py-2">最終学習</th>
              </tr>
            </thead>
            <tbody>
              {stats.userList.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <div className="text-gray-800 text-xs truncate max-w-[140px]">{u.email}</div>
                    <div className="text-[10px] text-gray-400">{u.provider} · {new Date(u.createdAt).toLocaleDateString('ja-JP')}</div>
                  </td>
                  <td className="text-right px-3 py-2.5 text-gray-700 font-medium">{u.translations}</td>
                  <td className="text-right px-3 py-2.5 text-gray-700 font-medium">{u.cards}</td>
                  <td className="text-right px-3 py-2.5 text-gray-700 font-medium">{u.sessions}</td>
                  <td className="text-right px-4 py-2.5 text-xs text-gray-400">
                    {u.lastSessionAt
                      ? new Date(u.lastSessionAt).toLocaleDateString('ja-JP')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
