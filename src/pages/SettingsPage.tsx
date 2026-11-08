import { Check, Database, Save, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDictionary } from '../components/DictionaryProvider';
import useLocalStorage from '../hooks/useLocalStorage';
import type { ExerciseType, Settings } from '../types';
import { defaultSettings, sanitizeSettings } from '../utils/settings';
import styles from './SettingsPage.module.scss';

const exerciseOptions: { id: ExerciseType; label: string }[] = [
  { id: 'ru-zh', label: 'Перевод → китайский' },
  { id: 'zh-pinyin', label: 'Китайский → пиньинь' },
  { id: 'writing', label: 'Начертание' },
  { id: 'measure', label: 'Счётное слово' },
];

export default function SettingsPage() {
  const { tags } = useDictionary();
  const [storedSettings, setSettings] = useLocalStorage<Settings>('repeater-settings', defaultSettings);
  const settings = sanitizeSettings(storedSettings);
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Settings>({ defaultValues: settings });

  const save = (values: Settings) => {
    setSettings(values);
    setSaved(true);
  };

  return (
    <div className="page">
      <div className="page-heading">
        <span className="page-heading__eyebrow">Под себя</span>
        <h1>Настройки</h1>
        <p>Эти параметры будут использоваться по умолчанию при каждой новой тренировке.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit(save)} onChange={() => setSaved(false)}>
        <section className={styles.section}>
          <h2><Settings2 size={17} /> Тренировка</h2>
          <label className={styles.field}>Лимит слов по умолчанию<input type="number" min="1" max="100" {...register('limit', { required: true, valueAsNumber: true, min: 1, max: 100 })} /></label>
          <label className={styles.field}>Порядок слов<select {...register('order')}><option value="created">По дате добавления</option><option value="wrong">Сначала проблемные</option></select></label>
          <label className={styles.field}>Ошибка в начертании после<select {...register('writingMistakeThreshold', { valueAsNumber: true })}><option value="1">1 ошибки</option><option value="2">2 ошибок</option><option value="3">3 ошибок</option></select></label>
          <label className={styles.switch}><span><strong>Учитывать SRS</strong><small>Показывать слова по расписанию</small></span><input type="checkbox" {...register('useSrs')} /></label>
          <label className={styles.switch}><span><strong>Разминка с ключами</strong><small>Начинать с начертания ключей выбранных слов</small></span><input type="checkbox" {...register('warmup')} /></label>
          <label className={styles.switch}><span><strong>Иероглифический квадрат</strong><small>Показывать направляющие при начертании</small></span><input type="checkbox" {...register('showGrid')} /></label>
        </section>

        <section className={styles.section}>
          <h2>Упражнения</h2>
          <div className={styles.options}>
            {exerciseOptions.map((exercise) => <label key={exercise.id}><input type="checkbox" value={exercise.id} {...register('exerciseTypes', { validate: (value) => value.length > 0 || 'Выбери хотя бы одно упражнение' })} /><span>{exercise.label}</span></label>)}
          </div>
          {errors.exerciseTypes && <p className={styles.error}>{errors.exerciseTypes.message}</p>}
        </section>

        <section className={styles.section}>
          <h2>Теги по умолчанию</h2>
          <p className={styles.hint}>Если ничего не выбрано, тренируются все теги.</p>
          <div className={styles.options}>
            {tags.map((tag) => <label key={tag.id}><input type="checkbox" value={tag.id} {...register('tagIds')} /><span>{tag.name}</span></label>)}
          </div>
        </section>

        <button className="primary-button" type="submit"><Save size={17} /> Сохранить настройки</button>
        {saved && <p className={styles.saved} role="status"><Check size={15} /> Настройки сохранены</p>}
      </form>

      <aside className={styles.storage}><Database size={18} /><p><strong>Только на этом устройстве</strong>Словарь, настройки и прогресс хранятся локально и доступны offline.</p></aside>
    </div>
  );
}
