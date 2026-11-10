export interface SrsState {
  box: number;
  lastReview: string | null;
  nextReview: string;
  correctStreak: number;
  wrongCount: number;
  suspended?: boolean;
}

export interface BaseWordContent {
  id?: string;
  hanzi: string;
  pinyin: string;
  translation: string;
  moduleId?: string;
  hskLevel?: number;
  tags: string[];
  keyIds?: string[];
  measureWord?: string;
}
export interface WordContent extends BaseWordContent {
  id: string;
  createdAt: string;
  keyIds: string[];
}

export interface WordUserData {
  wordId: string;
  associations?: string;
  examples?: string;
  notes?: string;
  srs: SrsState;
}

export interface Word extends WordContent {
  associations?: string;
  examples?: string;
  notes?: string;
  srs: SrsState;
}

export interface Key {
  id: string;
  symbol: string;
  variants?: string[];
  pinyin?: string;
  translation?: string;
  childKeyIds: string[];
  createdAt: string;
}

export interface Module {
  id: string;
  title: string;
  hskLevel: number;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
}

export type ExerciseType = 'ru-zh' | 'zh-pinyin' | 'writing' | 'measure';
export type TrainingOrder = 'created' | 'wrong';

export interface Settings {
  limit: number;
  exerciseTypes: ExerciseType[];
  useSrs: boolean;
  moduleIds: string[];
  tagIds: string[];
  order: TrainingOrder;
  warmup: boolean;
  showGrid: boolean;
  writingMistakeThreshold: number;
  excludedKeyIds: string[];
}

export interface ReviewEntry {
  id: string;
  wordId: string;
  reviewedAt: string;
  correct: boolean;
  exerciseType: ExerciseType;
}
