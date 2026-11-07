import type { Module, Tag, WordUserData } from '../types';
import { associations, words } from './words'

export const seedModules: Module[] = [];

export const seedTags: Tag[] = [
  { id: 'people', name: 'Люди' },
  { id: 'education', name: 'Учёба' },
  { id: 'time', name: 'Время' },
  { id: 'food', name: 'Еда и напитки' },
  { id: 'animals', name: 'Животные' },
  { id: 'verbs', name: 'Глаголы' },
  { id: 'places', name: 'Места' },
  { id: 'numbers', name: 'Числа' },
  { id: 'colors', name: 'Цвета' },
  { id: 'adjectives', name: 'Прилагательные' },
  { id: 'body-parts', name: 'Части тела' },
  { id: 'counting-words', name: 'Счетные слова' },
  { id: 'phrases', name: 'Фразы и реч обороты' },
  { id: 'geography', name: 'Города, страны и языки' },
  { id: 'adverbs', name: 'Наречия' },
  { id: 'word-parts', name: 'Частицы, суффиксы и междометия' },
  { id: 'directions', name: 'Направления' },
  { id: 'pronouns', name: 'Местоимения' },
  { id: 'weather', name: 'Погода' },
  { id: 'family', name: 'Семья' },
  { id: 'questions', name: 'Вопросы' },
  { id: 'communication', name: 'Общение' },
  { id: 'work', name: 'Работа и профессии' },
  { id: 'shopping', name: 'Покупки и деньги' },
  { id: 'names', name: 'Имена' },
  { id: 'health', name: 'Здоровье' },
  { id: 'home', name: 'Дом и вещи' },
  { id: 'emotions', name: 'Эмоции' },
  { id: 'transport', name: 'Транспорт' },
  { id: 'technology', name: 'Техника' },
  { id: 'clothes', name: 'Одежда' },
];

export { keys as seedKeys} from './keys';
export { words as seedWords} from './words';


export const seedWordUserData: WordUserData[] = words.map((word) => ({
  wordId: word.id,
  associations: associations[word.id],
  srs: {
    box: 0,
    lastReview: null,
    nextReview: word.createdAt,
    correctStreak: 0,
    wrongCount: 0,
  },
}));
