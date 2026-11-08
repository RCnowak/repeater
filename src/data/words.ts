import { WordContent } from '../types';
import { associationsHsk2 } from './hsk2/associations';
import { wordsHsk2 } from './hsk2/words';
import { wordsHsk1 } from './hsk1/words';
import { associationsHsk1 } from './hsk1/associations';

const createdAt = (day: number) => new Date(Date.UTC(2026, 0, day)).toISOString();

export const words: WordContent[] = wordsHsk1
  .concat(wordsHsk2)
  .map((word, index) => ({
    ...word,
    id: word.id || word.hanzi,
    keyIds: word.keyIds || [],
    createdAt: createdAt(index)
  }));

export const associations: Record<string, string> = {
  ...associationsHsk1,
  ...associationsHsk2
};
