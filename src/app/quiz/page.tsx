'use client';

import { useEffect, useState, useCallback } from 'react';
import FlashCard from '@/components/FlashCard';
import { getDueCards, saveCard, saveStudyRecord } from '@/lib/storage';
import { calculateNextReview } from '@/lib/spaced-repetition';
import type { CardItem, Rating } from '@/types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function QuizPage() {
  const [dueCards, setDueCards] = useState<CardItem[]>([]);
  const [sessionCards, setSessionCards] = useState<CardItem[]>([]); // セッション全カードを保持
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [ratedCount, setRatedCount] = useState(0);

  const load = useCallback(async () => {
    const cards = await getDueCards();
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setDueCards(shuffled);
    setSessionCards(shuffled);
    setCurrentIndex(0);
    setSessionDone(false);
    setRatedCount(0);
    setIsLoaded(true);
  }, []);

  // セッション完了後にもう一度同じカードで練習する
  const replay = useCallback(() => {
    const shuffled = [...sessionCards].sort(() => Math.random() - 0.5);
    setDueCards(shuffled);
    setCurrentIndex(0);
    setSessionDone(false);
    setRatedCount(0);
  }, [sessionCards]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRate = useCallback(async (rating: Rating) => {
    const card = dueCards[currentIndex];
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

    const nextIndex = currentIndex + 1;
    setRatedCount(prev => prev + 1);

    if (nextIndex >= dueCards.length) {
      setSessionDone(true);
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, dueCards]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (dueCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-bold text-gray-800">今日の復習は完了です！</h2>
        <p className="text-gray-500 text-sm">
          復習が必要なカードはありません。<br />
          翻訳したテキストを学習リストに追加しましょう。
        </p>
      </div>
    );
  }

  if (sessionDone) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="text-5xl">✅</div>
        <h2 className="text-xl font-bold text-gray-800">セッション完了！</h2>
        <p className="text-gray-500 text-sm">{ratedCount}枚のカードを復習しました</p>
        <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
          <button
            onClick={replay}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
          >
            もう一度練習する
          </button>
          <button
            onClick={load}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
          >
            新しい復習カードを読み込む
          </button>
        </div>
      </div>
    );
  }

  const currentCard = dueCards[currentIndex];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">クイズ</h1>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {dueCards.length}
        </span>
      </div>

      {/* 進捗バー */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(currentIndex / dueCards.length) * 100}%` }}
        />
      </div>

      <FlashCard
        card={currentCard}
        onRate={handleRate}
        remaining={dueCards.length - currentIndex}
      />
    </div>
  );
}
