import type { CardItem, Rating } from '@/types';

const DAY = 24 * 60 * 60 * 1000;

/**
 * ルール:
 *   完璧   → 2週間後 (14日)
 *   覚えた → 2日後
 *   難しい → 今すぐ（セッション内再出題）
 *   もう一度 → 今すぐ（最優先）
 */
export function calculateNextReview(card: CardItem, rating: Rating): Partial<CardItem> {
  const now = Date.now();
  switch (rating) {
    case 'again':
      return { nextReviewAt: now, lastReviewedAt: now };
    case 'hard':
      return { nextReviewAt: now, lastReviewedAt: now };
    case 'good':
      return { nextReviewAt: now + 2 * DAY, lastReviewedAt: now };
    case 'easy':
      return { nextReviewAt: now + 14 * DAY, lastReviewedAt: now };
  }
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
    easeFactor: 2.5,
    interval: 1,
    nextReviewAt: Date.now(),
    lastReviewedAt: null,
  };
}

export function isDueToday(card: CardItem): boolean {
  return card.nextReviewAt <= Date.now();
}
