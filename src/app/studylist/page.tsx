'use client';

import { useEffect, useState } from 'react';
import HistoryList from '@/components/HistoryList';
import { getTranslations } from '@/lib/storage';
import type { Translation } from '@/types';

export default function StudyListPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const load = async () => {
    const all = await getTranslations();
    setTranslations(all.filter(t => t.inStudyList));
    setIsLoaded(true);
  };

  useEffect(() => {
    load();
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">学習リスト</h1>
      <p className="text-sm text-gray-500 mb-4">{translations.length} 枚</p>
      <HistoryList translations={translations} onUpdate={load} />
    </div>
  );
}
