'use client';

import { useState, useRef } from 'react';
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

const SWIPE_THRESHOLD = 80;

export default function FlashCard({ card, onRate, remaining }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [deltaX, setDeltaX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [flyOut, setFlyOut] = useState<'left' | 'right' | null>(null);
  const startXRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const handleFlip = () => {
    if (!hasDraggedRef.current) setIsFlipped(prev => !prev);
  };

  const onDragStart = (clientX: number) => {
    if (!isFlipped) return;
    startXRef.current = clientX;
    hasDraggedRef.current = false;
    setIsDragging(true);
  };

  const onDragMove = (clientX: number) => {
    if (!isDragging) return;
    const dx = clientX - startXRef.current;
    if (Math.abs(dx) > 5) hasDraggedRef.current = true;
    setDeltaX(dx);
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      const dir = deltaX > 0 ? 'right' : 'left';
      setFlyOut(dir);
      setTimeout(() => {
        setFlyOut(null);
        setDeltaX(0);
        setIsFlipped(false);
        hasDraggedRef.current = false;
        onRate(dir === 'right' ? 'good' : 'again');
      }, 350);
    } else {
      setDeltaX(0);
    }
  };

  const rotate = deltaX * 0.07;
  const againOpacity = Math.min(1, Math.max(0, -deltaX / SWIPE_THRESHOLD));
  const goodOpacity = Math.min(1, Math.max(0, deltaX / SWIPE_THRESHOLD));

  const outerStyle: React.CSSProperties = {
    transform: flyOut === 'right'
      ? 'translateX(160%) rotate(25deg)'
      : flyOut === 'left'
      ? 'translateX(-160%) rotate(-25deg)'
      : `translateX(${deltaX}px) rotate(${rotate}deg)`,
    transition: isDragging ? 'none' : 'transform 0.35s ease',
    cursor: isFlipped ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
    userSelect: 'none',
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full select-none">
      <p className="text-sm text-gray-500">残り {remaining} 枚</p>

      {/* カード本体 */}
      <div
        className="relative w-full max-w-sm"
        style={{ height: '260px', perspective: '1000px' }}
      >
        {/* もう一度ラベル */}
        <div
          className="absolute inset-0 flex items-center justify-start pl-6 z-10 pointer-events-none rounded-2xl border-4 border-red-400 bg-red-50"
          style={{ opacity: againOpacity }}
        >
          <span className="text-2xl font-bold text-red-500 rotate-[-15deg]">もう一度</span>
        </div>

        {/* 覚えたラベル */}
        <div
          className="absolute inset-0 flex items-center justify-end pr-6 z-10 pointer-events-none rounded-2xl border-4 border-green-400 bg-green-50"
          style={{ opacity: goodOpacity }}
        >
          <span className="text-2xl font-bold text-green-500 rotate-[15deg]">覚えた ✓</span>
        </div>

        {/* スワイプ対象カード */}
        <div
          style={{ ...outerStyle, position: 'absolute', inset: 0 }}
          onMouseDown={e => onDragStart(e.clientX)}
          onMouseMove={e => onDragMove(e.clientX)}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onTouchStart={e => onDragStart(e.touches[0].clientX)}
          onTouchMove={e => { e.preventDefault(); onDragMove(e.touches[0].clientX); }}
          onTouchEnd={onDragEnd}
          onClick={handleFlip}
        >
          {/* 3D フリップ内側 */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform 0.45s ease',
            }}
          >
            {/* 表面 */}
            <div
              style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}
              className="bg-white border-2 border-blue-200 rounded-2xl shadow-md flex flex-col items-center justify-center p-6"
            >
              <span className="text-xs text-gray-400 mb-3">{getLangName(card.sourceLang)}</span>
              <p className="text-xl font-semibold text-center text-gray-800 leading-snug">
                {card.sourceText}
              </p>
              <p className="mt-6 text-xs text-blue-400">タップして翻訳を確認</p>
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
      </div>

      {/* スワイプヒント */}
      {isFlipped ? (
        <div className="flex justify-between w-full max-w-sm px-2 text-sm font-medium">
          <span className="text-red-400">← もう一度</span>
          <span className="text-green-500">覚えた →</span>
        </div>
      ) : (
        <p className="text-sm text-gray-400">翻訳を確認してからスワイプ</p>
      )}
    </div>
  );
}
