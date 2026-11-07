import { WordContent } from '../types';
import { associationsHsk1, wordsHsk1 } from './words-hsk1';

const createdAt = (day: number) => new Date(Date.UTC(2026, 0, day)).toISOString();

export const words: WordContent[] = wordsHsk1
  .map((word, index) => ({
    ...word,
    id: word.id || word.hanzi,
    keyIds: word.keyIds || [],
    createdAt: createdAt(index)
  }));

export const associations: Record<string, string> = {
  ...associationsHsk1
};
