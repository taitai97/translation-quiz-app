'use client';

import { useEffect, useState, useCallback } from 'react';
import { Info, X } from 'lucide-react';
import FlashCard from '@/components/FlashCard';
import { getCards, saveCard, saveStudyRecord } from '@/lib/storage';
import { calculateNextReview } from '@/lib/spaced-repetition';
import type { CardItem, Rating } from '@/types';

const RULES = [
  { label: 'もう一度', color: 'bg-red-100 text-red-700', desc: '次のカードの後にすぐ再出題（最優先）' },
  { label: '難しい', color: 'bg-orange-100 text-orange-700', desc: '3枚後にもう一度出題' },
  { label: '覚えた', color: 'bg-green-100 text-green-700', desc: '2日後に復習' },
  { label: '完璧', color: 'bg-blue-100 text-blue-700', desc: '2週間後に復習' },
] as const;

function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800">復習ルール</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {RULES.map(r => (
            <div key={r.label} className="flex items-center gap-3">
              <span className={`text-xs font-medium px-3 py-1 rounded-lg shrink-0 ${r.color}`}>
                {r.label}
              </span>
              <span className="text-sm text-gray-600">{r.desc}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400 leading-relaxed">
          学習リストのカードは無限にループします。「覚えた」「完璧」で全カードが終わると、また最初から出題されます。
        </p>
      </div>
    </div>
  );
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sortByDue(cards: CardItem[]): CardItem[] {
  return [...cards].sort((a, b) => a.nextReviewAt - b.nextReviewAt);
}

export default function QuizPage() {
  const [queue, setQueue] = useState<CardItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const load = useCallback(async () => {
    const cards = await getCards();
    setQueue(sortByDue(cards));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRate = useCallback(async (rating: Rating) => {
    const card = queue[0];
    if (!card) return;

    const updates = calculateNextReview(card, rating);
    const updatedCard = { ...card, ...updates };

    await saveCard(updatedCard);
    await saveStudyRecord({
      id: generateId(),
      cardId: card.id,
      rating: rating === 'again' ? 0 : rating === 'hard' ? 2 : rating === 'good' ? 4 : 5,
      reviewedAt: Date.now(),
    });

    setQueue(prev => {
      const rest = prev.slice(1);

      if (rating === 'again') {
        // 最優先：先頭に戻す
        return [updatedCard, ...rest];
      }

      if (rating === 'hard') {
        // すぐに出す：3枚後に挿入
        const insertAt = Math.min(3, rest.length);
        return [
          ...rest.slice(0, insertAt),
          updatedCard,
          ...rest.slice(insertAt),
        ];
      }

      // good / easy: キューから除外。空になったら全カード再ロード
      if (rest.length === 0) {
        // 非同期でリロード
        getCards().then(all => {
          setQueue(sortByDue(all));
        });
        return [];
      }
      return rest;
    });
  }, [queue]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="text-5xl">📚</div>
        <h2 className="text-xl font-bold text-gray-800">学習リストにカードがありません</h2>
        <p className="text-gray-500 text-sm">
          翻訳画面で「学習リストへ」を押してカードを追加しましょう。
        </p>
      </div>
    );
  }

  const currentCard = queue[0];
  const dueCount = queue.filter(c => c.nextReviewAt <= Date.now()).length;

  return (
    <div>
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">クイズ</h1>
          <button
            onClick={() => setShowRules(true)}
            className="text-gray-400 hover:text-blue-500 transition-colors"
            title="復習ルールを見る"
          >
            <Info size={18} />
          </button>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-blue-600">{dueCount} 枚 復習中</p>
          <p className="text-xs text-gray-400">全 {queue.length} 枚</p>
        </div>
      </div>

      {/* 進捗バー（キュー内の残り枚数） */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: dueCount > 0 ? `${((queue.length - dueCount) / queue.length) * 100}%` : '100%' }}
        />
      </div>

      <FlashCard
        card={currentCard}
        onRate={handleRate}
        remaining={queue.length - 1}
      />
    </div>
  );
}
