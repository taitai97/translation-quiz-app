'use client';

import { useEffect, useState, useCallback } from 'react';
import { Info, X } from 'lucide-react';
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
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-800">使い方</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">👆</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">カードをタップ</p>
              <p className="text-sm text-gray-500">翻訳を表示／元の文に戻す</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">👈</span>
            <div>
              <p className="text-sm font-semibold text-red-600">左スワイプ = 覚えてない</p>
              <p className="text-sm text-gray-500">1問後にまた出題される</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">👉</span>
            <div>
              <p className="text-sm font-semibold text-green-600">右スワイプ = 覚えた</p>
              <p className="text-sm text-gray-500">2日後に復習</p>
            </div>
          </div>
        </div>

        <p className="mt-5 text-xs text-gray-400 leading-relaxed border-t pt-4">
          「覚えた」で全カードが消えると、また最初からループします。学習リストのカードを無限に練習できます。
        </p>
      </div>
    </div>
  );
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

  // クイズ画面ではスクロールを無効化
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleRate = useCallback(async (rating: Rating) => {
    const card = queue[0];
    if (!card) return;

    const updates = calculateNextReview(card, rating);
    const updatedCard = { ...card, ...updates };

    // UIを即時更新（awaitより先に呼ぶことでカード切替がスムーズになる）
    setQueue(prev => {
      const rest = prev.slice(1);

      if (rating === 'again') {
        // 1問後に再出題（先頭ではなく2番目に挿入）
        if (rest.length === 0) return [updatedCard];
        return [rest[0], updatedCard, ...rest.slice(1)];
      }

      if (rating === 'hard') {
        const insertAt = Math.min(3, rest.length);
        return [
          ...rest.slice(0, insertAt),
          updatedCard,
          ...rest.slice(insertAt),
        ];
      }

      // good / easy: キューから除外。空になったら全カード再ロード
      if (rest.length === 0) {
        getCards().then(all => {
          setQueue(sortByDue(all));
        });
        return [];
      }
      return rest;
    });

    // DB書き込みはUI更新後にバックグラウンドで実行
    await saveCard(updatedCard);
    await saveStudyRecord({
      id: generateId(),
      cardId: card.id,
      rating: rating === 'again' ? 0 : rating === 'hard' ? 2 : rating === 'good' ? 4 : 5,
      reviewedAt: Date.now(),
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
            title="使い方を見る"
          >
            <Info size={18} />
          </button>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-blue-600">{dueCount} 枚 復習中</p>
          <p className="text-xs text-gray-400">全 {queue.length} 枚</p>
        </div>
      </div>

      {/* 進捗バー */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: dueCount > 0 ? `${((queue.length - dueCount) / queue.length) * 100}%` : '100%' }}
        />
      </div>

      <FlashCard
        key={currentCard.id}
        card={currentCard}
        onRate={handleRate}
        remaining={queue.length - 1}
      />
    </div>
  );
}
