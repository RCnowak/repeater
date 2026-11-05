import HanziWriter from 'hanzi-writer';
import { PenLine } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CharacterJson } from 'hanzi-writer';
import type { Word } from '../types';
import styles from './WritingExercise.module.scss';

interface WritingExerciseProps {
  word: Word;
  onFinish: (correct: boolean) => void;
}

export default function WritingExercise({ word, onFinish }: WritingExerciseProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const onFinishRef = useRef(onFinish);
  const mistakesRef = useRef(0);
  const [characterIndex, setCharacterIndex] = useState(0);
  const [error, setError] = useState(false);
  const characters = Array.from(word.hanzi);
  onFinishRef.current = onFinish;

  useEffect(() => {
    mistakesRef.current = 0;
    setCharacterIndex(0);
  }, [word.id]);

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
      showOutline: true,
      strokeColor: '#353d35',
      outlineColor: '#deddd4',
      drawingColor: '#b75542',
      highlightColor: '#d8a68f',
      drawingWidth: 7,
      showHintAfterMisses: 2,
      charDataLoader: async (char) => {
        const response = await fetch(`${import.meta.env.BASE_URL}hanzi/${encodeURIComponent(char)}.json`);
        if (!response.ok) throw new Error(`Character data not found: ${char}`);
        return await response.json() as CharacterJson;
      },
      onLoadCharDataError: () => setError(true),
    });
    writerRef.current = writer;
    writer.quiz({
      onComplete: (summary) => {
        const totalMistakes = mistakesRef.current + summary.totalMistakes;
        if (characterIndex < characters.length - 1) {
          mistakesRef.current = totalMistakes;
          setCharacterIndex((index) => index + 1);
        } else {
          onFinishRef.current(totalMistakes === 0);
        }
      },
    });
    return () => {
      writer.cancelQuiz();
      writerRef.current = null;
      target.replaceChildren();
    };
  }, [characterIndex, word.id]);

  return (
    <div className={styles.writing}>
      <div className={styles.writing__meta}><PenLine size={15} /><span>Напиши: <strong className="chinese">{characters[characterIndex]}</strong></span><small>{characterIndex + 1} / {characters.length}</small></div>
      <div ref={targetRef} className={styles.writing__target} />
      {error && <p className={styles.writing__error}>Нет данных начертания для этого иероглифа. Можно пропустить упражнение.</p>}
      <p>Пиши черты в правильном порядке. После двух ошибок появится подсказка.</p>
      <button className="secondary-button" type="button" onClick={() => onFinish(false)}>Пропустить</button>
    </div>
  );
}
