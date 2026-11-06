import HanziWriter from 'hanzi-writer';
import { RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { loadHanziCharacter } from '../utils/hanziData';
import styles from './CharacterAnimation.module.scss';

interface CharacterAnimationProps {
  hanzi: string;
}

export default function CharacterAnimation({ hanzi }: CharacterAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const writersRef = useRef<HanziWriter[]>([]);
  const [error, setError] = useState(false);
  const characters = Array.from(hanzi);
  const animationRunRef = useRef(0);

  const playFrom = (index: number, run: number) => {
    if (run !== animationRunRef.current) return;
    const writer = writersRef.current[index];
    if (!writer) return;
    void writer.animateCharacter({ onComplete: () => playFrom(index + 1, run) });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setError(false);
    const writers = characters.map((character) => {
      const target = document.createElement('div');
      target.className = styles.character;
      container.appendChild(target);
      return HanziWriter.create(target, character, {
        width: 96,
        height: 96,
        padding: 10,
        showCharacter: false,
        showOutline: true,
        strokeColor: '#353d35',
        outlineColor: '#e4e2d9',
        delayBetweenStrokes: 180,
        charDataLoader: loadHanziCharacter,
        onLoadCharDataError: () => setError(true),
      });
    });
    writersRef.current = writers;
    const run = ++animationRunRef.current;
    playFrom(0, run);
    return () => {
      animationRunRef.current += 1;
      writers.forEach((writer) => { void writer.pauseAnimation(); });
      writersRef.current = [];
      container.replaceChildren();
    };
  }, [hanzi]);

  const replay = () => {
    const run = ++animationRunRef.current;
    playFrom(0, run);
  };

  return (
    <div className={styles.animation}>
      <div ref={containerRef} className={styles.animation__characters} aria-label={`Порядок черт: ${hanzi}`} />
      {error && <p className={styles.animation__error}>Для части иероглифов нет локальных данных начертания.</p>}
      <button className={`secondary-button ${styles.animation__replay}`} type="button" onClick={replay}><RotateCcw size={15} /> Повторить анимацию</button>
    </div>
  );
}
