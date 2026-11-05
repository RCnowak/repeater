import HanziWriter, { type CharacterJson } from 'hanzi-writer';
import { RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import styles from './CharacterAnimation.module.scss';

interface CharacterAnimationProps {
  hanzi: string;
}

export default function CharacterAnimation({ hanzi }: CharacterAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const writersRef = useRef<HanziWriter[]>([]);
  const [error, setError] = useState(false);
  const characters = Array.from(hanzi);

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
        charDataLoader: async (char) => {
          const response = await fetch(`${import.meta.env.BASE_URL}hanzi/${encodeURIComponent(char)}.json`);
          if (!response.ok) throw new Error(`Character data not found: ${char}`);
          return await response.json() as CharacterJson;
        },
        onLoadCharDataError: () => setError(true),
      });
    });
    writersRef.current = writers;
    writers.forEach((writer) => { void writer.animateCharacter(); });
    return () => {
      writers.forEach((writer) => { void writer.pauseAnimation(); });
      writersRef.current = [];
      container.replaceChildren();
    };
  }, [hanzi]);

  const replay = () => {
    writersRef.current.forEach((writer) => { void writer.animateCharacter(); });
  };

  return (
    <div className={styles.animation}>
      <div ref={containerRef} className={styles.animation__characters} aria-label={`Порядок черт: ${hanzi}`} />
      {error && <p className={styles.animation__error}>Для части иероглифов нет локальных данных начертания.</p>}
      <button className={`secondary-button ${styles.animation__replay}`} type="button" onClick={replay}><RotateCcw size={15} /> Повторить анимацию</button>
    </div>
  );
}
