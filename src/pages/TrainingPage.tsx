import { ArrowRight, Check, CheckCircle2, Play, RotateCcw, Settings2, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDictionary } from '../components/DictionaryProvider';
import WritingExercise from '../components/WritingExercise';
import { recordReview } from '../db/database';
import useLocalStorage from '../hooks/useLocalStorage';
import type { ExerciseType, Settings, Word } from '../types';
import { isPinyinCorrect } from '../utils/pinyin';
import { defaultSettings, sanitizeSettings } from '../utils/settings';
import styles from './TrainingPage.module.scss';

const exerciseLabels: { id: ExerciseType; title: string; description: string }[] = [
  { id: 'ru-zh', title: 'Перевод → китайский', description: 'Иероглифы и пиньинь' },
  { id: 'zh-pinyin', title: 'Китайский → пиньинь', description: 'Произношение с тонами' },
  { id: 'writing', title: 'Начертание', description: 'Перевод без подсказки контура' },
  { id: 'measure', title: 'Счётное слово', description: 'Для существительных' },
];

function availableExercises(word: Word, selected: ExerciseType[]) {
  return selected.filter((type) => type !== 'measure' || Boolean(word.measureWord));
}

function chooseExercise(word: Word, selected: ExerciseType[]) {
  const available = availableExercises(word, selected);
  return available[Math.floor(Math.random() * available.length)] ?? 'zh-pinyin';
}

export default function TrainingPage() {
  const { words } = useDictionary();
  const [storedSettings, setSettings] = useLocalStorage<Settings>('repeater-settings', defaultSettings);
  const settings = sanitizeSettings(storedSettings);
  const { register, handleSubmit } = useForm<Settings>({ defaultValues: settings });
  const [sessionWords, setSessionWords] = useState<Word[] | null>(null);
  const [index, setIndex] = useState(0);
  const [exercise, setExercise] = useState<ExerciseType>('ru-zh');
  const [hanziAnswer, setHanziAnswer] = useState('');
  const [pinyinAnswer, setPinyinAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const dueCount = words.filter((word) => new Date(word.srs.nextReview) <= new Date()).length;

  const startSession = (values: Settings) => {
    const now = new Date();
    const selected = words
      .filter((word) => !values.useSrs || new Date(word.srs.nextReview) <= now)
      .filter((word) => availableExercises(word, values.exerciseTypes).length > 0)
      .sort((first, second) => values.order === 'wrong'
        ? second.srs.wrongCount - first.srs.wrongCount || first.createdAt.localeCompare(second.createdAt)
        : first.createdAt.localeCompare(second.createdAt))
      .slice(0, values.limit);
    setSettings(values);
    setSessionWords(selected);
    setIndex(0);
    setCorrectCount(0);
    setCompleted(false);
    setFeedback(null);
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
    if (exercise === 'ru-zh') correct = hanziAnswer.trim() === word.hanzi && isPinyinCorrect(pinyinAnswer, word.pinyin);
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
  };

  const exitSession = () => {
    setSessionWords(null);
    setCompleted(false);
    setFeedback(null);
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
          <section className={styles.setup__section}>
            <h2><CheckCircle2 size={17} /> Типы упражнений</h2>
            <div className={styles.exerciseOptions}>
              {exerciseLabels.map((item) => <label key={item.id}><input type="checkbox" value={item.id} {...register('exerciseTypes', { validate: (value) => value.length > 0 || 'Выбери хотя бы один тип' })} /><span><strong>{item.title}</strong><small>{item.description}</small></span></label>)}
            </div>
          </section>

          <section className={styles.setup__section}>
            <h2><Settings2 size={17} /> Параметры</h2>
            <label className={styles.field}>Лимит слов<input type="number" min="1" max="100" {...register('limit', { required: true, valueAsNumber: true, min: 1, max: 100 })} /></label>
            <label className={styles.field}>Порядок слов<select {...register('order')}><option value="created">По дате добавления</option><option value="wrong">Сначала проблемные</option></select></label>
            <label className={styles.switch}><span><strong>Учитывать SRS</strong><small>Только слова, которые пора повторить</small></span><input type="checkbox" {...register('useSrs')} /></label>
          </section>

          <button className="primary-button" type="submit"><Play size={18} /> Начать тренировку</button>
        </form>
      </div>
    );
  }

  if (!sessionWords.length) {
    return <div className={styles.sessionState}><CheckCircle2 size={42} /><h1>Сейчас всё повторено</h1><p>По расписанию нет доступных слов. Отключи SRS в настройках, чтобы потренироваться без очереди.</p><button className="primary-button" onClick={exitSession}>Изменить настройки</button></div>;
  }

  if (completed) {
    return <div className={styles.sessionState}><span className={styles.sessionState__icon}>好</span><span className={styles.sessionState__eyebrow}>Занятие завершено</span><h1>很好! Отлично!</h1><p>Повторено слов: {sessionWords.length}<br />Без ошибок: {correctCount}</p><div className={styles.sessionState__score}><strong>{Math.round((correctCount / sessionWords.length) * 100)}%</strong><span>точность</span></div><button className="primary-button" onClick={exitSession}><RotateCcw size={17} /> Новая тренировка</button></div>;
  }

  const word = sessionWords[index];
  const prompt = exercise === 'zh-pinyin' ? word.hanzi : word.translation;
  const task = exercise === 'ru-zh' ? 'Напиши слово иероглифами и пиньинем' : exercise === 'zh-pinyin' ? 'Введи пиньинь с тонами' : exercise === 'measure' ? 'Введи счётное слово' : 'Начертай перевод без подсказки контура';

  return (
    <div className={styles.session}>
      <header><button type="button" onClick={exitSession} aria-label="Завершить"><X size={20} /></button><div><strong>Тренировка</strong><span>{index + 1} из {sessionWords.length}</span></div><span /></header>
      <div className={styles.progress}><span style={{ width: `${((index + 1) / sessionWords.length) * 100}%` }} /></div>
      <section className={styles.question}>
        <span className={styles.question__type}>{exerciseLabels.find((item) => item.id === exercise)?.title}</span>
        <h1 className={exercise === 'zh-pinyin' ? 'chinese' : ''}>{prompt}</h1>
        <p>{task}</p>

        {exercise === 'writing' && !feedback && <WritingExercise key={`${word.id}-${index}`} word={word} onFinish={(correct) => void finishAnswer(correct)} />}
        {exercise !== 'writing' && (
          <div className={styles.answers}>
            {(exercise === 'ru-zh' || exercise === 'measure') && <input className="chinese" value={hanziAnswer} onChange={(event) => setHanziAnswer(event.target.value)} placeholder={exercise === 'measure' ? '个, 本, 只…' : 'Иероглифы'} disabled={Boolean(feedback)} autoComplete="off" />}
            {(exercise === 'ru-zh' || exercise === 'zh-pinyin') && <input value={pinyinAnswer} onChange={(event) => setPinyinAnswer(event.target.value)} placeholder="ni3 hao3 или nǐ hǎo" disabled={Boolean(feedback)} autoComplete="off" />}
            {!feedback && <button className="primary-button" type="button" onClick={checkAnswer} disabled={exercise === 'ru-zh' ? !hanziAnswer || !pinyinAnswer : exercise === 'zh-pinyin' ? !pinyinAnswer : !hanziAnswer}>Проверить <ArrowRight size={17} /></button>}
          </div>
        )}

        {feedback && (
          <div className={`${styles.feedback} ${feedback === 'wrong' ? styles['feedback--wrong'] : ''}`}>
            <span>{feedback === 'correct' ? <Check size={20} /> : <XCircle size={20} />}</span>
            <div><strong>{feedback === 'correct' ? 'Верно!' : 'Нужно ещё повторить'}</strong><p><b className="chinese">{word.hanzi}</b> · {word.pinyin}<br />{word.translation}{word.measureWord ? ` · 一${word.measureWord}` : ''}</p></div>
          </div>
        )}
        {feedback && <button className="primary-button" type="button" onClick={nextWord}>{index === sessionWords.length - 1 ? 'Завершить' : 'Дальше'} <ArrowRight size={17} /></button>}
      </section>
    </div>
  );
}
