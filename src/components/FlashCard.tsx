'use client';

import { useState } from 'react';
import type { CardItem, Rating } from '@/types';
import { getLangName } from '@/lib/deepl';
import { pinyin } from 'pinyin-pro';

function isChinese(langCode: string): boolean {
  return langCode === 'ZH-HANT' || langCode === 'ZH' || langCode === 'ZH-HANS';
}

interface FlashCardProps {
  card: CardItem;
  onRate: (rating: Rating) => void;
  remaining: number;
}

export default function FlashCard({ card, onRate, remaining }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => setIsFlipped(true);

  const handleRate = (rating: Rating) => {
    setIsFlipped(false);
    onRate(rating);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-gray-500">残り {remaining} 枚</p>

      {/* カード */}
      <div
        className="w-full max-w-sm"
        style={{ perspective: '1000px' }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '220px',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.5s ease',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* 表面 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
            }}
            className="bg-white border-2 border-blue-200 rounded-2xl shadow-md flex flex-col items-center justify-center p-6 cursor-pointer"
            onClick={handleFlip}
          >
            <span className="text-xs text-gray-400 mb-3">{getLangName(card.sourceLang)}</span>
            <p className="text-xl font-semibold text-center text-gray-800 leading-snug">
              {card.sourceText}
            </p>
            {!isFlipped && (
              <p className="mt-6 text-xs text-blue-500">タップして翻訳を確認</p>
            )}
          </div>

          {/* 裏面 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="bg-blue-50 border-2 border-blue-400 rounded-2xl shadow-md flex flex-col items-center justify-center p-6"
          >
            <span className="text-xs text-gray-400 mb-3">{getLangName(card.targetLang)}</span>
            <p className="text-xl font-semibold text-center text-blue-800 leading-snug">
              {card.translatedText}
            </p>
            {isChinese(card.targetLang) && (
              <p className="mt-2 text-sm text-blue-400 text-center leading-relaxed">
                {pinyin(card.translatedText, { toneType: 'symbol', separator: ' ' })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 評価ボタン */}
      {isFlipped ? (
        <div className="w-full max-w-sm grid grid-cols-2 gap-3">
          <button
            onClick={() => handleRate('again')}
            className="py-3 rounded-xl bg-red-100 text-red-700 font-medium hover:bg-red-200 transition-colors"
          >
            もう一度
          </button>
          <button
            onClick={() => handleRate('hard')}
            className="py-3 rounded-xl bg-orange-100 text-orange-700 font-medium hover:bg-orange-200 transition-colors"
          >
            難しい
          </button>
          <button
            onClick={() => handleRate('good')}
            className="py-3 rounded-xl bg-green-100 text-green-700 font-medium hover:bg-green-200 transition-colors"
          >
            覚えた
          </button>
          <button
            onClick={() => handleRate('easy')}
            className="py-3 rounded-xl bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition-colors"
          >
            完璧
          </button>
        </div>
      ) : (
        <button
          onClick={handleFlip}
          className="w-full max-w-sm py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          翻訳を見る
        </button>
      )}
    </div>
  );
}
