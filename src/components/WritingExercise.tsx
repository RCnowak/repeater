import HanziWriter from 'hanzi-writer';
import { PenLine } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getHanziCharacters } from '../utils/hanzi';
import { loadHanziCharacter } from '../utils/hanziData';
import styles from './WritingExercise.module.scss';

interface WritingExerciseProps {
  id: string;
  hanzi: string;
  showGrid: boolean;
  mistakeThreshold: number;
  onFinish: (correct: boolean) => void;
}

export default function WritingExercise({ id, hanzi, showGrid, mistakeThreshold, onFinish }: WritingExerciseProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const onFinishRef = useRef(onFinish);
  const mistakesRef = useRef(0);
  const [characterIndex, setCharacterIndex] = useState(0);
  const [error, setError] = useState(false);
  const characters = getHanziCharacters(hanzi);
  onFinishRef.current = onFinish;

  useEffect(() => {
    mistakesRef.current = 0;
    setCharacterIndex(0);
  }, [id]);

  useEffect(() => {
    const target = targetRef.current;
    const character = characters[characterIndex];
    if (!target || !character) return;
    setError(false);
    const writer = HanziWriter.create(target, character, {
      width: 280,
      height: 280,
      padding: 22,
      showCharacter: false,
      showOutline: false,
      strokeColor: '#353d35',
      outlineColor: '#deddd4',
      drawingColor: '#b75542',
      highlightColor: '#d8a68f',
      drawingWidth: 10,
      showHintAfterMisses: mistakeThreshold,
      charDataLoader: loadHanziCharacter,
      onLoadCharDataError: () => setError(true),
    });
    writerRef.current = writer;
    writer.quiz({
      onMistake: (strokeData) => {
        if (mistakesRef.current + strokeData.totalMistakes >= mistakeThreshold) onFinishRef.current(false);
      },
      onComplete: (summary) => {
        const totalMistakes = mistakesRef.current + summary.totalMistakes;
        if (characterIndex < characters.length - 1) {
          mistakesRef.current = totalMistakes;
          setCharacterIndex((index) => index + 1);
        } else {
          onFinishRef.current(totalMistakes < mistakeThreshold);
        }
      },
    });
    return () => {
      writer.cancelQuiz();
      writerRef.current = null;
      target.replaceChildren();
    };
  }, [characterIndex, id, mistakeThreshold]);

  return (
    <div className={`${styles.writing} ${showGrid ? styles['writing--grid'] : ''}`}>
      <div className={styles.writing__meta}><PenLine size={15} /><span>Напиши иероглиф по памяти</span><small>{characterIndex + 1} / {characters.length}</small></div>
      {characters.length > 1 && <div className={styles.writing__completed} aria-live="polite"><span>Готово:</span>{characterIndex === 0 ? <small>—</small> : characters.slice(0, characterIndex).map((character, index) => <b className="chinese" key={`${character}-${index}`}>{character}</b>)}</div>}
      <div ref={targetRef} className={styles.writing__target} />
      {error && <p className={styles.writing__error}>Нет данных начертания для этого иероглифа. Можно пропустить упражнение.</p>}
      <p>Пиши черты в правильном порядке. После {mistakeThreshold} ошибок появится ответ.</p>
    </div>
  );
}
