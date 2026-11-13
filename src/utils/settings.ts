import type { Settings } from '../types';

export const defaultSettings: Settings = {
  limit: 10,
  exerciseTypes: ['ru-zh', 'zh-pinyin', 'writing', 'measure'],
  useSrs: true,
  moduleIds: [],
  tagIds: [],
  hskLevels: [],
  order: 'created',
  warmup: true,
  showGrid: true,
  writingMistakeThreshold: 2,
  excludedKeyIds: [],
};

export function sanitizeSettings(settings: Settings): Settings {
  const exerciseTypes = settings.exerciseTypes.filter((type) => defaultSettings.exerciseTypes.includes(type));
  return {
    ...defaultSettings,
    ...settings,
    exerciseTypes: exerciseTypes.length ? exerciseTypes : defaultSettings.exerciseTypes,
  };
}
