'use client';

import { useEffect, useState, useCallback } from 'react';
import FlashCard from '@/components/FlashCard';
import { getCards, saveCard, saveStudyRecord } from '@/lib/storage';
import { calculateNextReview } from '@/lib/spaced-repetition';
import type { CardItem, Rating } from '@/types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sortByDue(cards: CardItem[]): CardItem[] {
  return [...cards].sort((a, b) => a.nextReviewAt - b.nextReviewAt);
}

export default function QuizPage() {
  const [queue, setQueue] = useState<CardItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">クイズ</h1>
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
