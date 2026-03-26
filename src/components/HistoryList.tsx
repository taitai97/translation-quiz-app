'use client';

import { useState } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import type { Translation } from '@/types';
import { getLangName } from '@/lib/deepl';
import { updateTranslationStudyList, deleteTranslation, saveCard, deleteCard } from '@/lib/storage';
import { createNewCard } from '@/lib/spaced-repetition';

interface HistoryListProps {
  translations: Translation[];
  onUpdate: () => void;
}

export default function HistoryList({ translations, onUpdate }: HistoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const toggleStudyList = async (t: Translation) => {
    const next = !t.inStudyList;
    await updateTranslationStudyList(t.id, next);
    if (next) {
      await saveCard(createNewCard(t));
    } else {
      await deleteCard(t.id);
    }
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteTranslation(id);
    await deleteCard(id);
    setDeletingId(null);
    setConfirmId(null);
    onUpdate();
  };

  if (translations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-lg">翻訳履歴がありません</p>
        <p className="text-sm mt-1">翻訳画面でテキストを翻訳すると、ここに表示されます</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {translations.map(t => (
        <div
          key={t.id}
          className={`border rounded-xl p-4 bg-white shadow-sm transition-opacity ${
            deletingId === t.id ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-1">
                {getLangName(t.sourceLang)} → {getLangName(t.targetLang)} ·{' '}
                {new Date(t.createdAt).toLocaleDateString('ja-JP')}
              </p>
              <p className="text-sm font-medium text-gray-800 truncate">{t.sourceText}</p>
              <p className="text-sm text-gray-600 mt-1 truncate">{t.translatedText}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              {confirmId === t.id ? (
                <>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deletingId === t.id}
                    className="px-2 py-1 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    削除
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    キャンセル
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => toggleStudyList(t)}
                    title={t.inStudyList ? '学習リストから削除' : '学習リストへ追加'}
                    className={`p-1.5 rounded-lg transition-colors ${
                      t.inStudyList
                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {t.inStudyList ? <Minus size={16} /> : <Plus size={16} />}
                  </button>
                  <button
                    onClick={() => setConfirmId(t.id)}
                    title="削除"
                    className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
          {t.inStudyList && (
            <span className="mt-2 inline-block text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              学習リスト
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
