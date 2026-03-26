'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import HistoryList from '@/components/HistoryList';
import { getTranslations } from '@/lib/storage';
import type { Translation } from '@/types';

export default function HistoryPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [query, setQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  const load = async () => {
    const all = await getTranslations();
    setTranslations(all);
    setIsLoaded(true);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = query
    ? translations.filter(t => {
        const q = query.toLowerCase();
        return t.sourceText.toLowerCase().includes(q) || t.translatedText.toLowerCase().includes(q);
      })
    : translations;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">履歴</h1>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="検索..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      <HistoryList translations={filtered} onUpdate={load} />
    </div>
  );
}
