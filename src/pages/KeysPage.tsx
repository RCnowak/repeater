import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDictionary } from '../components/DictionaryProvider';
import styles from './KeysPage.module.scss';

export default function KeysPage() {
  const { keys, words } = useDictionary();

  return (
    <div className="page">
      <div className="page-heading">
        <span className="page-heading__eyebrow">Состав иероглифов · {keys.length}</span>
        <h1>Ключи</h1>
        <p>Смысловые части помогают понимать и запоминать иероглифы</p>
      </div>
      <div className={styles.grid}>
        {keys.map((key) => {
          const wordCount = words.filter((word) => word.keyIds.includes(key.id)).length;
          return (
            <Link to={`/keys/${key.id}`} key={key.id} className={styles.key}>
              <div className={`${styles.key__symbol} chinese`}>{key.symbol}</div>
              {key.variants?.length ? <div className={`${styles.key__variants} chinese`}><span>также:</span>{key.variants.map((variant) => <b key={variant}>{variant}</b>)}</div> : null}
              <strong>{key.pinyin || '—'}</strong>
              <p>{key.translation || 'Значение не указано'}</p>
              <span>{wordCount} слов <ChevronRight size={13} /></span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
