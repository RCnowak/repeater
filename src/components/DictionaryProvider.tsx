import { useLiveQuery } from 'dexie-react-hooks';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { db, initializeDatabase } from '../db/database';
import type { Key, Module, ReviewEntry, Tag, Word } from '../types';

interface DictionaryContextValue {
  words: Word[];
  keys: Key[];
  modules: Module[];
  tags: Tag[];
  reviews: ReviewEntry[];
  loading: boolean;
  error: string | null;
}

const DictionaryContext = createContext<DictionaryContextValue | null>(null);

export function DictionaryProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDatabase().then(() => setReady(true)).catch(() => setError('Не удалось открыть локальную базу данных'));
  }, []);

  const data = useLiveQuery(async () => {
    if (!ready) return undefined;
    const [content, userData, keys, modules, tags, reviews] = await Promise.all([
      db.words.toArray(),
      db.wordData.toArray(),
      db.keys.toArray(),
      db.modules.orderBy('order').toArray(),
      db.tags.toArray(),
      db.reviews.toArray(),
    ]);
    const userDataById = new Map(userData.map((item) => [item.wordId, item]));
    const words = content.flatMap((word) => {
      const personal = userDataById.get(word.id);
      return personal ? [{ ...word, ...personal, id: word.id }] : [];
    });
    return { words, keys, modules, tags, reviews };
  }, [ready]);

  const value = useMemo<DictionaryContextValue>(() => ({
    words: data?.words ?? [],
    keys: data?.keys ?? [],
    modules: data?.modules ?? [],
    tags: data?.tags ?? [],
    reviews: data?.reviews ?? [],
    loading: !ready || !data,
    error,
  }), [data, ready, error]);

  return <DictionaryContext.Provider value={value}>{children}</DictionaryContext.Provider>;
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (!context) throw new Error('useDictionary must be used inside DictionaryProvider');
  return context;
}
