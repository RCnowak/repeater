import Dexie, { type Table } from 'dexie';
import { seedKeys, seedModules, seedTags, seedWordUserData, seedWords } from '../data/seed';
import type { ExerciseType, Key, Module, ReviewEntry, Tag, WordContent, WordUserData } from '../types';

class RepeaterDatabase extends Dexie {
  words!: Table<WordContent, string>;
  wordData!: Table<WordUserData, string>;
  keys!: Table<Key, string>;
  modules!: Table<Module, string>;
  tags!: Table<Tag, string>;
  reviews!: Table<ReviewEntry, string>;

  constructor() {
    super('repeater-chinese');
    this.version(1).stores({
      words: 'id, moduleId, hskLevel, createdAt, *tags, *keyIds',
      wordData: 'wordId, srs.nextReview, srs.wrongCount',
      keys: 'id, createdAt, *childKeyIds',
      modules: 'id, hskLevel, order',
      tags: 'id, name',
      reviews: 'id, wordId, reviewedAt',
    });
  }
}

export const db = new RepeaterDatabase();

let databaseInitialization: Promise<void> | null = null;

export function initializeDatabase() {
  if (!databaseInitialization) {
    databaseInitialization = (async () => {
      await Promise.all([
        db.words.bulkPut(seedWords),
        db.keys.bulkPut(seedKeys),
        db.modules.bulkPut(seedModules),
        db.tags.bulkPut(seedTags),
      ]);
      const existingUserData = await db.wordData.toArray();
      const existingIds = new Set(existingUserData.map((item) => item.wordId));
      const missingUserData = seedWordUserData.filter((item) => !existingIds.has(item.wordId));
      if (missingUserData.length) await db.wordData.bulkAdd(missingUserData);
    })();
  }
  return databaseInitialization;
}

const reviewIntervals = [0, 1, 2, 4, 7, 15, 30];

export async function recordReview(wordId: string, correct: boolean, exerciseType: ExerciseType) {
  const now = new Date();
  await db.transaction('rw', [db.wordData, db.reviews], async () => {
    const current = await db.wordData.get(wordId);
    if (!current) throw new Error(`Word data not found: ${wordId}`);
    const box = correct ? Math.min(current.srs.box + 1, reviewIntervals.length - 1) : Math.max(current.srs.box - 1, 0);
    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + reviewIntervals[box]);
    await db.wordData.put({
      ...current,
      srs: {
        box,
        lastReview: now.toISOString(),
        nextReview: nextReview.toISOString(),
        correctStreak: correct ? current.srs.correctStreak + 1 : 0,
        wrongCount: current.srs.wrongCount + (correct ? 0 : 1),
      },
    });
    await db.reviews.add({
      id: window.crypto.randomUUID(),
      wordId,
      reviewedAt: now.toISOString(),
      correct,
      exerciseType,
    });
  });
}
