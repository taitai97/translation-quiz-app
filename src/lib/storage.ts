import { createClient } from './supabase';
import type { Translation, CardItem, StudyRecord } from '@/types';

const CACHE_KEYS = {
  translations: 'cache_translations',
  cards: 'cache_cards',
};

function saveCache<T>(key: string, data: T) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

function loadCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function getUserId(): Promise<string> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Not authenticated');
  return session.user.id;
}

// ─── Translation CRUD ───────────────────────────────────────────────────────

export async function saveTranslation(translation: Translation): Promise<void> {
  const supabase = createClient();
  const userId = await getUserId();
  await supabase.from('translations').upsert({
    id: translation.id,
    user_id: userId,
    source_text: translation.sourceText,
    translated_text: translation.translatedText,
    source_lang: translation.sourceLang,
    target_lang: translation.targetLang,
    created_at: translation.createdAt,
    in_study_list: translation.inStudyList,
  });
}

export async function getTranslations(): Promise<Translation[]> {
  try {
    const supabase = createClient();
    const userId = await getUserId();
    const { data } = await supabase
      .from('translations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    const result = (data ?? []).map(rowToTranslation);
    saveCache(CACHE_KEYS.translations, result);
    return result;
  } catch {
    return loadCache<Translation[]>(CACHE_KEYS.translations) ?? [];
  }
}

export async function updateTranslationStudyList(id: string, inStudyList: boolean): Promise<void> {
  const supabase = createClient();
  const userId = await getUserId();
  await supabase
    .from('translations')
    .update({ in_study_list: inStudyList })
    .eq('id', id)
    .eq('user_id', userId);
}

export async function deleteTranslation(id: string): Promise<void> {
  const supabase = createClient();
  const userId = await getUserId();
  await supabase.from('translations').delete().eq('id', id).eq('user_id', userId);
}

// ─── CardItem CRUD ──────────────────────────────────────────────────────────

export async function saveCard(card: CardItem): Promise<void> {
  const supabase = createClient();
  const userId = await getUserId();
  await supabase.from('cards').upsert({
    id: card.id,
    user_id: userId,
    source_text: card.sourceText,
    translated_text: card.translatedText,
    source_lang: card.sourceLang,
    target_lang: card.targetLang,
    next_review_at: card.nextReviewAt,
    interval: card.interval,
    ease_factor: card.easeFactor,
    repetitions: card.repetitions,
    last_reviewed_at: card.lastReviewedAt,
    created_at: card.nextReviewAt,
    in_study_list: true,
  });
}

export async function getCards(): Promise<CardItem[]> {
  try {
    const supabase = createClient();
    const userId = await getUserId();
    const { data } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId);
    const result = (data ?? []).map(rowToCard);
    saveCache(CACHE_KEYS.cards, result);
    return result;
  } catch {
    return loadCache<CardItem[]>(CACHE_KEYS.cards) ?? [];
  }
}

export async function getDueCards(): Promise<CardItem[]> {
  const cards = await getCards();
  return cards.filter(c => c.nextReviewAt <= Date.now());
}

export async function deleteCard(id: string): Promise<void> {
  const supabase = createClient();
  const userId = await getUserId();
  await supabase.from('cards').delete().eq('id', id).eq('user_id', userId);
}

// ─── StudyRecord ────────────────────────────────────────────────────────────

export async function saveStudyRecord(record: StudyRecord): Promise<void> {
  const supabase = createClient();
  const userId = await getUserId();
  await supabase.from('study_records').upsert({
    id: record.id,
    user_id: userId,
    card_id: record.cardId,
    rating: record.rating,
    reviewed_at: record.reviewedAt,
  });
}

// ─── Row mappers ─────────────────────────────────────────────────────────────

function rowToTranslation(row: Record<string, unknown>): Translation {
  return {
    id: row.id as string,
    sourceText: row.source_text as string,
    translatedText: row.translated_text as string,
    sourceLang: row.source_lang as string,
    targetLang: row.target_lang as string,
    createdAt: row.created_at as number,
    inStudyList: row.in_study_list as boolean,
  };
}

function rowToCard(row: Record<string, unknown>): CardItem {
  return {
    id: row.id as string,
    sourceText: row.source_text as string,
    translatedText: row.translated_text as string,
    sourceLang: row.source_lang as string,
    targetLang: row.target_lang as string,
    nextReviewAt: row.next_review_at as number,
    interval: row.interval as number,
    easeFactor: row.ease_factor as number,
    repetitions: row.repetitions as number,
    lastReviewedAt: row.last_reviewed_at as number | null,
  };
}
