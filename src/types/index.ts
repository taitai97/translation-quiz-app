export interface Translation {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  createdAt: number; // timestamp
  inStudyList: boolean;
}

export interface CardItem {
  id: string; // same as Translation.id
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  // SM-2 fields
  repetitions: number;
  easeFactor: number;
  interval: number; // days
  nextReviewAt: number; // timestamp
  lastReviewedAt: number | null;
}

export interface StudyRecord {
  id: string;
  cardId: string;
  rating: 0 | 1 | 2 | 3 | 4 | 5; // SM-2 quality
  reviewedAt: number;
}

export type Rating = 'easy' | 'good' | 'hard' | 'again';
