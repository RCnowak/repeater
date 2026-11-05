import { PenLine, RotateCcw, Search, Trash2, X } from 'lucide-react';
import { useRef, useState, type PointerEvent } from 'react';
import styles from './HandwritingInput.module.scss';

type Point = [number, number];
type Stroke = Point[];

interface HandwritingInputProps {
  onSelect: (character: string) => void;
  onClose: () => void;
}

let lookupInitialization: Promise<boolean> | null = null;

function initializeLookup() {
  if (lookupInitialization) return lookupInitialization;
  lookupInitialization = new Promise<boolean>((resolve) => {
    const initialize = () => {
      if (!window.HanziLookup) {
        resolve(false);
        return;
      }
      window.HanziLookup.init('mmah', `${import.meta.env.BASE_URL}data/mmah.json`, resolve);
    };
    if (window.HanziLookup) {
      initialize();
      return;
    }
    const script = document.createElement('script');
    script.src = `${import.meta.env.BASE_URL}vendor/hanzilookup.min.js`;
    script.onload = initialize;
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
  return lookupInitialization;
}

export default function HandwritingInput({ onSelect, onClose }: HandwritingInputProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [matches, setMatches] = useState<string[]>([]);
  const [status, setStatus] = useState('Нарисуй иероглиф в поле');

  const redraw = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#353d35';
    context.lineWidth = 7;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    strokesRef.current.forEach((stroke) => {
      if (!stroke.length) return;
      context.beginPath();
      context.moveTo(...stroke[0]);
      stroke.slice(1).forEach((point) => context.lineTo(...point));
      if (stroke.length === 1) context.lineTo(stroke[0][0] + 0.1, stroke[0][1]);
      context.stroke();
    });
  };

  const pointFromEvent = (event: PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return [
      (event.clientX - rect.left) * (event.currentTarget.width / rect.width),
      (event.clientY - rect.top) * (event.currentTarget.height / rect.height),
    ];
  };

  const startStroke = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    strokesRef.current.push([pointFromEvent(event)]);
    setStrokeCount(strokesRef.current.length);
    setMatches([]);
    redraw();
  };

  const continueStroke = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    strokesRef.current[strokesRef.current.length - 1]?.push(pointFromEvent(event));
    redraw();
  };

  const clear = () => {
    strokesRef.current = [];
    setStrokeCount(0);
    setMatches([]);
    setStatus('Нарисуй иероглиф в поле');
    redraw();
  };

  const recognize = async () => {
    if (!strokesRef.current.length) return;
    setStatus('Загружаем модель распознавания…');
    const initialized = await initializeLookup();
    if (!initialized || !window.HanziLookup) {
      setStatus('Модель недоступна. Открой приложение онлайн один раз, чтобы сохранить её.');
      return;
    }
    setStatus('Распознаём…');
    const analyzed = new window.HanziLookup.AnalyzedCharacter(strokesRef.current);
    const matcher = new window.HanziLookup.Matcher('mmah');
    matcher.match(analyzed, 8, (results) => {
      setMatches(results.map((result) => result.character));
      setStatus(results.length ? 'Выбери подходящий вариант' : 'Ничего не найдено, попробуй ещё раз');
    });
  };

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-label="Рукописный ввод иероглифа" onClick={(event) => event.stopPropagation()}>
        <header><div><span>Рукописный ввод · 手写</span><h2>Нарисуй иероглиф</h2></div><button type="button" onClick={onClose} aria-label="Закрыть"><X size={20} /></button></header>
        <div className={styles.canvasWrap}>
          <canvas
            ref={canvasRef}
            width="300"
            height="300"
            onPointerDown={startStroke}
            onPointerMove={continueStroke}
            onPointerUp={() => { drawingRef.current = false; }}
            onPointerCancel={() => { drawingRef.current = false; }}
            aria-label="Поле для рисования иероглифа"
          />
          <span className={styles.canvasWrap__horizontal} />
          <span className={styles.canvasWrap__vertical} />
        </div>
        <p className={styles.status}><PenLine size={13} /> {status}</p>
        <div className={styles.tools}>
          <button type="button" disabled={!strokeCount} onClick={() => { strokesRef.current.pop(); setStrokeCount(strokesRef.current.length); redraw(); }}><RotateCcw size={15} /> Отменить</button>
          <button type="button" disabled={!strokeCount} onClick={clear}><Trash2 size={15} /> Очистить</button>
        </div>
        {matches.length > 0 && <div className={styles.matches}>{matches.map((character) => <button className="chinese" key={character} type="button" onClick={() => onSelect(character)}>{character}</button>)}</div>}
        <button className="primary-button" type="button" disabled={!strokeCount} onClick={recognize}><Search size={17} /> Распознать</button>
      </section>
    </div>
  );
}
