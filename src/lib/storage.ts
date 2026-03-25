'use client';

import { openDB, type IDBPDatabase } from 'idb';
import type { Translation, CardItem, StudyRecord } from '@/types';

const DB_NAME = 'translation-quiz-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 翻訳履歴
        if (!db.objectStoreNames.contains('translations')) {
          const translationStore = db.createObjectStore('translations', { keyPath: 'id' });
          translationStore.createIndex('createdAt', 'createdAt');
          translationStore.createIndex('inStudyList', 'inStudyList');
        }
        // フラッシュカード
        if (!db.objectStoreNames.contains('cards')) {
          const cardStore = db.createObjectStore('cards', { keyPath: 'id' });
          cardStore.createIndex('nextReviewAt', 'nextReviewAt');
        }
        // 学習記録
        if (!db.objectStoreNames.contains('studyRecords')) {
          const recordStore = db.createObjectStore('studyRecords', { keyPath: 'id' });
          recordStore.createIndex('cardId', 'cardId');
          recordStore.createIndex('reviewedAt', 'reviewedAt');
        }
      },
    });
  }
  return dbPromise;
}

// ─── Translation CRUD ───────────────────────────────────────────────────────

export async function saveTranslation(translation: Translation): Promise<void> {
  const db = await getDB();
  await db.put('translations', translation);
}

export async function getTranslations(): Promise<Translation[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('translations', 'createdAt');
  return all.reverse(); // 新しい順
}

export async function getTranslationById(id: string): Promise<Translation | undefined> {
  const db = await getDB();
  return db.get('translations', id);
}

export async function updateTranslationStudyList(id: string, inStudyList: boolean): Promise<void> {
  const db = await getDB();
  const translation = await db.get('translations', id);
  if (translation) {
    await db.put('translations', { ...translation, inStudyList });
  }
}

export async function deleteTranslation(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('translations', id);
}

// ─── CardItem CRUD ──────────────────────────────────────────────────────────

export async function saveCard(card: CardItem): Promise<void> {
  const db = await getDB();
  await db.put('cards', card);
}

export async function getCards(): Promise<CardItem[]> {
  const db = await getDB();
  return db.getAll('cards');
}

export async function getCardById(id: string): Promise<CardItem | undefined> {
  const db = await getDB();
  return db.get('cards', id);
}

export async function getDueCards(): Promise<CardItem[]> {
  const cards = await getCards();
  const now = Date.now();
  return cards.filter(c => c.nextReviewAt <= now);
}

export async function deleteCard(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('cards', id);
}

// ─── StudyRecord ────────────────────────────────────────────────────────────

export async function saveStudyRecord(record: StudyRecord): Promise<void> {
  const db = await getDB();
  await db.put('studyRecords', record);
}
