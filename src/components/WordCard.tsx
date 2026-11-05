import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Key, Tag, Word } from '../types';
import styles from './WordCard.module.scss';

interface WordCardProps {
  word: Word;
  keys: Key[];
  tags: Tag[];
}

export default function WordCard({ word, keys, tags }: WordCardProps) {
  return (
    <article className={styles.card}>
      <Link to={`/words/${word.id}`} className={styles.card__main}>
        <span className={`${styles.card__hanzi} chinese`}>{word.hanzi}</span>
        <span className={styles.card__content}>
          <strong>{word.pinyin}</strong>
          <span>{word.translation}</span>
          <span className={styles.card__tags}>
            {word.hskLevel && <i>HSK {word.hskLevel}</i>}
            {word.tags.slice(0, 2).map((tagId) => <i key={tagId}>{tags.find((tag) => tag.id === tagId)?.name}</i>)}
          </span>
        </span>
        <ChevronRight size={18} className={styles.card__arrow} />
      </Link>
      {word.keyIds.length > 0 && (
        <div className={styles.card__keys}>
          <span>Ключи:</span>
          {word.keyIds.slice(0, 5).map((keyId) => {
            const key = keys.find((item) => item.id === keyId);
            return key ? <Link className="chinese" key={key.id} to={`/keys/${key.id}`}>{key.symbol}</Link> : null;
          })}
        </div>
      )}
    </article>
  );
}
