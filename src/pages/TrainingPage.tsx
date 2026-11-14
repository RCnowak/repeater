import { ArrowRight, AudioLines, Ban, Check, CheckCircle2, Hash, HelpCircle, Languages, Lightbulb, PenLine, Play, RotateCcw, Settings2, X, XCircle, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import CharacterAnimation from '../components/CharacterAnimation';
import { useDictionary } from '../components/DictionaryProvider';
import WritingExercise from '../components/WritingExercise';
import { recordReview, setWordSuspended } from '../db/database';
import useLocalStorage from '../hooks/useLocalStorage';
import type { ExerciseType, Key, Settings, Word } from '../types';
import { getHanziCharacters, hasHanziGap, normalizeHanziAnswer } from '../utils/hanzi';
import { isPinyinCorrect } from '../utils/pinyin';
import { defaultSettings, sanitizeSettings } from '../utils/settings';
import styles from './TrainingPage.module.scss';

const exerciseLabels: { id: ExerciseType; title: string; description: string; icon: LucideIcon }[] = [
  { id: 'ru-zh', title: 'Перевод → китайский', description: 'Иероглифы и пиньинь', icon: Languages },
  { id: 'zh-pinyin', title: 'Китайский → пиньинь', description: 'Произношение с тонами', icon: AudioLines },
  { id: 'writing', title: 'Начертание', description: 'Перевод без подсказки контура', icon: PenLine },
  { id: 'measure', title: 'Счётное слово', description: 'Для существительных', icon: Hash },
];

function availableExercises(word: Word, selected: ExerciseType[]) {
  return selected.filter((type) => type !== 'measure' || Boolean(word.measureWord));
}

function chooseExercise(word: Word, selected: ExerciseType[]) {
  const available = availableExercises(word, selected);
  return available[Math.floor(Math.random() * available.length)] ?? 'zh-pinyin';
}

const unsupportedWarmupKeys = new Set([
  '⺁', '⺉', '⺙', '⺣', '⺤', '⺧', '⺩', '⺷', '⺹', '⻂', '⻐', '⻠', '朩', '龵', '⻊', '龷',
  '𠂉', '𠃓', '𢀖', '𡨄', '𡗗', '𫠣', '⺛', '㐫',
]);

function getWarmupKeys(words: Word[], keys: Key[], excludedKeyIds: string[]) {
  const keysById = new Map(keys.map((key) => [key.id, key]));
  const visited = new Set<string>();
  const result: Key[] = [];
  const visit = (keyId: string) => {
    if (visited.has(keyId)) return;
    visited.add(keyId);
    const key = keysById.get(keyId);
    if (!key) return;
    key.childKeyIds.forEach(visit);
    if (!excludedKeyIds.includes(key.id) && !unsupportedWarmupKeys.has(key.id)) result.push(key);
  };
  words.forEach((word) => word.keyIds.forEach(visit));
  return result;
}

export default function TrainingPage() {
  const { words, keys, tags } = useDictionary();
  const [storedSettings, setSettings] = useLocalStorage<Settings>('repeater-settings', defaultSettings);
  const settings = sanitizeSettings(storedSettings);
  const { register, handleSubmit, watch } = useForm<Settings>({ defaultValues: settings });
  const selectedTagCount = watch('tagIds').length;
  const selectedHskCount = watch('hskLevels').length;
  const [sessionWords, setSessionWords] = useState<Word[] | null>(null);
  const [index, setIndex] = useState(0);
  const [exercise, setExercise] = useState<ExerciseType>('ru-zh');
  const [hanziAnswer, setHanziAnswer] = useState('');
  const [pinyinAnswer, setPinyinAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [associationOpen, setAssociationOpen] = useState(false);
  const [warmupKeys, setWarmupKeys] = useState<Key[]>([]);
  const [warmupIndex, setWarmupIndex] = useState(0);
  const [warmupActive, setWarmupActive] = useState(false);
  const dueCount = words.filter((word) => !word.srs.suspended && new Date(word.srs.nextReview) <= new Date()).length;

  const startSession = (values: Settings) => {
    const now = new Date();
    const selected = words
      .filter((word) => !word.srs.suspended)
      .filter((word) => !values.hskLevels.length || values.hskLevels.some((level) => level === 'none' ? !word.hskLevel : word.hskLevel === level))
      .filter((word) => !values.tagIds.length || values.tagIds.some((tagId) => word.tags.includes(tagId)))
      .filter((word) => !values.useSrs || new Date(word.srs.nextReview) <= now)
      .filter((word) => availableExercises(word, values.exerciseTypes).length > 0)
      .sort((first, second) => values.order === 'wrong'
        ? second.srs.wrongCount - first.srs.wrongCount || first.createdAt.localeCompare(second.createdAt)
        : first.createdAt.localeCompare(second.createdAt))
      .slice(0, values.limit);
    const warmup = values.warmup ? getWarmupKeys(selected, keys, values.excludedKeyIds) : [];
    setSettings(values);
    setSessionWords(selected);
    setWarmupKeys(warmup);
    setWarmupIndex(0);
    setWarmupActive(warmup.length > 0);
    setIndex(0);
    setCorrectCount(0);
    setCompleted(false);
    setFeedback(null);
    setAssociationOpen(false);
    setHanziAnswer('');
    setPinyinAnswer('');
    if (selected.length) setExercise(chooseExercise(selected[0], values.exerciseTypes));
  };

  const finishAnswer = async (correct: boolean) => {
    if (!sessionWords || feedback) return;
    await recordReview(sessionWords[index].id, correct, exercise);
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) setCorrectCount((count) => count + 1);
  };

  const checkAnswer = () => {
    if (!sessionWords) return;
    const word = sessionWords[index];
    let correct = false;
    if (exercise === 'ru-zh') correct = normalizeHanziAnswer(hanziAnswer) === normalizeHanziAnswer(word.hanzi) && isPinyinCorrect(pinyinAnswer, word.pinyin);
    if (exercise === 'zh-pinyin') correct = isPinyinCorrect(pinyinAnswer, word.pinyin);
    if (exercise === 'measure') correct = hanziAnswer.trim() === word.measureWord;
    void finishAnswer(correct);
  };

  const nextWord = () => {
    if (!sessionWords) return;
    if (index === sessionWords.length - 1) {
      setCompleted(true);
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setExercise(chooseExercise(sessionWords[nextIndex], settings.exerciseTypes));
    setHanziAnswer('');
    setPinyinAnswer('');
    setFeedback(null);
    setAssociationOpen(false);
  };

  const suspendCurrentWord = async () => {
    if (!sessionWords) return;
    await setWordSuspended(sessionWords[index].id, true);
    nextWord();
  };

  const exitSession = () => {
    setSessionWords(null);
    setWarmupActive(false);
    setCompleted(false);
    setFeedback(null);
    setAssociationOpen(false);
  };

  const nextWarmupKey = () => {
    if (warmupIndex === warmupKeys.length - 1) {
      setWarmupActive(false);
    } else {
      setWarmupIndex((current) => current + 1);
    }
    setFeedback(null);
  };

  const excludeWarmupKey = () => {
    const keyId = warmupKeys[warmupIndex].id;
    setSettings({ ...settings, excludedKeyIds: [...new Set([...settings.excludedKeyIds, keyId])] });
    nextWarmupKey();
  };

  if (!sessionWords) {
    return (
      <div className="page">
        <div className="page-heading">
          <span className="page-heading__eyebrow">Тренировка · {dueCount} к повторению</span>
          <h1>Настрой занятие</h1>
          <p>Выбери упражнения и темп. Прогресс сохранится на устройстве.</p>
        </div>
        <form onSubmit={handleSubmit(startSession)} className={styles.setup}>
          <details className={styles.setup__section}>
            <summary><span className={styles.setup__title}><CheckCircle2 size={17} /> Типы упражнений</span></summary>
            <div className={styles.exerciseOptions}>
              {exerciseLabels.map((item) => <label key={item.id}><input type="checkbox" value={item.id} {...register('exerciseTypes', { validate: (value) => value.length > 0 || 'Выбери хотя бы один тип' })} /><span><strong>{item.title}</strong><small>{item.description}</small></span></label>)}
            </div>
          </details>

          <details className={styles.setup__section}>
            <summary><span className={styles.setup__title}><Settings2 size={17} /> Параметры</span></summary>
            <label className={styles.field}>Лимит слов<input type="number" min="1" max="100" {...register('limit', { required: true, valueAsNumber: true, min: 1, max: 100 })} /></label>
            <label className={styles.field}>Порядок слов<select {...register('order')}><option value="created">По дате добавления</option><option value="wrong">Сначала проблемные</option></select></label>
            <label className={styles.field}>Ошибка в начертании после<select {...register('writingMistakeThreshold', { valueAsNumber: true })}><option value="1">1 ошибки</option><option value="2">2 ошибок</option><option value="3">3 ошибок</option></select></label>
            <label className={styles.switch}><span><strong>Учитывать SRS</strong><small>Только слова, которые пора повторить</small></span><input type="checkbox" {...register('useSrs')} /></label>
            <label className={styles.switch}><span><strong>Разминка с ключами</strong><small>Сначала начертать ключи выбранных слов</small></span><input type="checkbox" {...register('warmup')} /></label>
            <label className={styles.switch}><span><strong>Иероглифический квадрат</strong><small>Направляющие в поле начертания</small></span><input type="checkbox" {...register('showGrid')} /></label>
          </details>

          <details className={styles.setup__section}>
            <summary><span className={styles.setup__title}>HSK</span><small>Выбрано: {selectedHskCount}</small></summary>
            <div className={styles.tagOptions}>{[1, 2, 3, 4, 5, 6].map((level) => <label key={level}><input type="checkbox" value={level} {...register('hskLevels')} /><span>HSK {level}</span></label>)}<label><input type="checkbox" value="none" {...register('hskLevels')} /><span>Не указано</span></label></div>
          </details>

          <details className={styles.setup__section}>
            <summary><span className={styles.setup__title}>Теги</span><small>Выбрано: {selectedTagCount}</small></summary>
            <div className={styles.tagOptions}>{tags.map((tag) => <label key={tag.id}><input type="checkbox" value={tag.id} {...register('tagIds')} /><span>{tag.name}</span></label>)}</div>
          </details>

          <button className="primary-button" type="submit"><Play size={18} /> Начать тренировку</button>
        </form>
      </div>
    );
  }

  if (!sessionWords.length) {
    return <div className={styles.sessionState}><CheckCircle2 size={42} /><h1>Нет слов для тренировки</h1><p>Измени фильтры или отключи SRS, чтобы потренироваться без очереди.</p><button className="primary-button" onClick={exitSession}>Изменить настройки</button></div>;
  }

  if (completed) {
    return <div className={styles.sessionState}><span className={styles.sessionState__icon}>好</span><span className={styles.sessionState__eyebrow}>Занятие завершено</span><h1>很好! Отлично!</h1><p>Повторено слов: {sessionWords.length}<br />Без ошибок: {correctCount}</p><div className={styles.sessionState__score}><strong>{Math.round((correctCount / sessionWords.length) * 100)}%</strong><span>точность</span></div><button className="primary-button" onClick={exitSession}><RotateCcw size={17} /> Новая тренировка</button></div>;
  }

  if (warmupActive) {
    const key = warmupKeys[warmupIndex];
    return (
      <div className={styles.session}>
        <header><button type="button" onClick={exitSession} aria-label="Завершить"><X size={20} /></button><div><strong>Разминка</strong><span>{warmupIndex + 1} из {warmupKeys.length}</span></div><span /></header>
        <div className={styles.progress}><span style={{ width: `${((warmupIndex + 1) / warmupKeys.length) * 100}%` }} /></div>
        <section className={styles.question}>
          <span className={styles.question__type}><PenLine size={14} /> Начертание ключа</span>
          <h1>{key.translation || 'Ключ'}</h1>
          <p>Начертай ключ перед тренировкой слов</p>
          {!feedback && <WritingExercise key={key.id} id={`warmup-${key.id}`} hanzi={key.symbol} showGrid={settings.showGrid} mistakeThreshold={settings.writingMistakeThreshold} onFinish={(correct) => setFeedback(correct ? 'correct' : 'wrong')} />}
          {!feedback && <div className={styles.sessionActions}><button type="button" onClick={() => setFeedback('wrong')}><HelpCircle size={16} /> Не помню</button><button type="button" onClick={excludeWarmupKey}><Ban size={15} /> Не повторять</button></div>}
          {feedback && <div className={`${styles.feedback} ${feedback === 'wrong' ? styles['feedback--wrong'] : ''}`}><span>{feedback === 'correct' ? <Check size={20} /> : <XCircle size={20} />}</span><div><strong>{feedback === 'correct' ? 'Верно!' : 'Нужно ещё повторить'}</strong><p><b className="chinese">{key.symbol}</b>{key.pinyin ? ` · ${key.pinyin}` : ''}</p></div></div>}
          {feedback && <button className="primary-button" type="button" onClick={nextWarmupKey}>{warmupIndex === warmupKeys.length - 1 ? 'К словам' : 'Дальше'} <ArrowRight size={17} /></button>}
          {feedback && <button className={`secondary-button ${styles.resultExclude}`} type="button" onClick={excludeWarmupKey}><Ban size={15} /> Не повторять</button>}
        </section>
      </div>
    );
  }

  const word = sessionWords[index];
  const prompt = exercise === 'zh-pinyin' ? word.hanzi : word.translation;
  const task = exercise === 'ru-zh' ? 'Напиши слово иероглифами и пиньинем' : exercise === 'zh-pinyin' ? 'Введи пиньинь с тонами' : exercise === 'measure' ? 'Введи счётное слово' : 'Начертай перевод без подсказки контура';
  const hasSameTranslation = words.some((candidate) => candidate.id !== word.id && candidate.translation.trim().toLowerCase() === word.translation.trim().toLowerCase());
  const characterCount = getHanziCharacters(word.hanzi).length;
  const exerciseMeta = exerciseLabels.find((item) => item.id === exercise)!;
  const ExerciseIcon = exerciseMeta.icon;

  return (
    <div className={styles.session}>
      <header><button type="button" onClick={exitSession} aria-label="Завершить"><X size={20} /></button><div><strong>Тренировка</strong><span>{index + 1} из {sessionWords.length}</span></div><span /></header>
      <div className={styles.progress}><span style={{ width: `${((index + 1) / sessionWords.length) * 100}%` }} /></div>
      <section className={styles.question}>
        <span className={styles.question__type}><ExerciseIcon size={14} /> {exerciseMeta.title}</span>
        <h1 className={exercise === 'zh-pinyin' ? 'chinese' : ''}>{prompt}</h1>
        {hasSameTranslation && <span className={styles.question__length}>Иероглифов: {characterCount}</span>}
        <p>{task}</p>

        {word.associations && <div className={styles.association}><button type="button" onClick={() => setAssociationOpen((open) => !open)} aria-expanded={associationOpen} aria-controls="training-association"><Lightbulb size={15} /> {associationOpen ? 'Скрыть подсказку' : 'Показать ассоциацию'}</button>{associationOpen && <p id="training-association">{word.associations}</p>}</div>}

        {exercise === 'writing' && !feedback && <WritingExercise key={`${word.id}-${index}`} id={word.id} hanzi={word.hanzi} showGrid={settings.showGrid} mistakeThreshold={settings.writingMistakeThreshold} onFinish={(correct) => void finishAnswer(correct)} />}
        {exercise !== 'writing' && (
          <div className={styles.answers}>
            {hasHanziGap(word.hanzi) && <small className={styles.answers__hint}>Вводи только иероглифы — точки и многоточие не нужны.</small>}
            {(exercise === 'ru-zh' || exercise === 'measure') && <input className="chinese" value={hanziAnswer} onChange={(event) => setHanziAnswer(event.target.value)} placeholder={exercise === 'measure' ? '个, 本, 只…' : 'Иероглифы'} disabled={Boolean(feedback)} autoComplete="off" />}
            {(exercise === 'ru-zh' || exercise === 'zh-pinyin') && <input value={pinyinAnswer} onChange={(event) => setPinyinAnswer(event.target.value)} placeholder="ni3 hao3 или nǐ hǎo" disabled={Boolean(feedback)} autoComplete="off" />}
            {!feedback && <button className="primary-button" type="button" onClick={checkAnswer} disabled={exercise === 'ru-zh' ? !hanziAnswer || !pinyinAnswer : exercise === 'zh-pinyin' ? !pinyinAnswer : !hanziAnswer}>Проверить <ArrowRight size={17} /></button>}
          </div>
        )}

        {!feedback && <div className={styles.sessionActions}><button type="button" onClick={() => void finishAnswer(false)}><HelpCircle size={16} /> Не помню</button><button type="button" onClick={() => void suspendCurrentWord()}><Ban size={15} /> Не повторять больше</button></div>}

        {feedback && (
          <div className={`${styles.feedback} ${feedback === 'wrong' ? styles['feedback--wrong'] : ''}`}>
            <span>{feedback === 'correct' ? <Check size={20} /> : <XCircle size={20} />}</span>
            <div><strong>{feedback === 'correct' ? 'Верно!' : 'Нужно ещё повторить'}</strong><p><b className="chinese">{word.hanzi}</b> · {word.pinyin}<br />{word.translation}{word.measureWord ? ` · 一${word.measureWord}` : ''}</p></div>
          </div>
        )}
        {feedback && <div className={styles.resultAnimation}><CharacterAnimation key={`${word.id}-${index}-result`} hanzi={word.hanzi} showGrid={settings.showGrid} /></div>}
        {feedback && <button className="primary-button" type="button" onClick={nextWord}>{index === sessionWords.length - 1 ? 'Завершить' : 'Дальше'} <ArrowRight size={17} /></button>}
        {feedback && <button className={`secondary-button ${styles.resultExclude}`} type="button" onClick={() => void suspendCurrentWord()}><Ban size={15} /> Не повторять</button>}
      </section>
    </div>
  );
}
