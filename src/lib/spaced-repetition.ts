import type { CardItem, Rating } from '@/types';

const INITIAL_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

/**
 * SM-2アルゴリズム（簡易版）
 * rating -> SM-2 quality mapping:
 *   again -> 0, hard -> 2, good -> 4, easy -> 5
 */
function ratingToQuality(rating: Rating): number {
  switch (rating) {
    case 'again': return 0;
    case 'hard': return 2;
    case 'good': return 4;
    case 'easy': return 5;
  }
}

export function calculateNextReview(card: CardItem, rating: Rating): Partial<CardItem> {
  const q = ratingToQuality(rating);
  const now = Date.now();

  let { repetitions, easeFactor, interval } = card;

  if (q < 3) {
    // 失敗 → リセット
    repetitions = 0;
    interval = 1;
  } else {
    // 成功 → インターバル計算
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // EF更新
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < MIN_EASE_FACTOR) easeFactor = MIN_EASE_FACTOR;

  const nextReviewAt = now + interval * 24 * 60 * 60 * 1000;

  return {
    repetitions,
    easeFactor,
    interval,
    nextReviewAt,
    lastReviewedAt: now,
  };
}

export function createNewCard(translation: {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}): CardItem {
  return {
    id: translation.id,
    sourceText: translation.sourceText,
    translatedText: translation.translatedText,
    sourceLang: translation.sourceLang,
    targetLang: translation.targetLang,
    repetitions: 0,
    easeFactor: INITIAL_EASE_FACTOR,
    interval: 1,
    nextReviewAt: Date.now(), // 今すぐ復習
    lastReviewedAt: null,
  };
}

export function isDueToday(card: CardItem): boolean {
  return card.nextReviewAt <= Date.now();
}
