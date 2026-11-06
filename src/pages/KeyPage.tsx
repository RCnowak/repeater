import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import CharacterAnimation from '../components/CharacterAnimation';
import { useDictionary } from '../components/DictionaryProvider';
import WordCard from '../components/WordCard';
import styles from './KeyPage.module.scss';

export default function KeyPage() {
  const { keyId } = useParams();
  const { keys, words, tags } = useDictionary();
  const key = keys.find((item) => item.id === keyId);

  if (!key) return <div className="empty-state"><h2>Ключ не найден</h2><Link to="/keys">Вернуться к ключам</Link></div>;

  const childKeys = key.childKeyIds.flatMap((childId) => {
    const child = keys.find((item) => item.id === childId);
    return child ? [child] : [];
  });
  const relatedWords = words.filter((word) => word.keyIds.includes(key.id));
  const symbols = [key.symbol, ...(key.variants ?? [])];

  return (
    <div className="page">
      <Link to="/keys" className={styles.back}><ArrowLeft size={17} /> Все ключи</Link>
      <section className={styles.hero}>
        <span className={`${styles.hero__symbol} chinese`}>{key.symbol}</span>
        <div><span>{key.pinyin || 'Без пиньиня'}</span><h1>{key.translation || 'Ключ'}</h1>{key.variants?.length ? <div className={`${styles.hero__variants} chinese`}>Варианты: {key.variants.join(' · ')}</div> : null}</div>
      </section>

      <section className={styles.section}>
        <h2>Начертание{symbols.length > 1 ? ' вариантов' : ''}</h2>
        <CharacterAnimation key={key.id} hanzi={symbols.join('')} />
      </section>

      <section className={styles.section}>
        <div className="section-heading"><h2>Состав ключа</h2><span>{childKeys.length}</span></div>
        {childKeys.length ? (
          <div className={styles.children}>
            {childKeys.map((child) => <Link key={child.id} to={`/keys/${child.id}`}><span className="chinese">{child.symbol}</span><strong>{child.pinyin}</strong><small>{child.translation}</small></Link>)}
          </div>
        ) : <div className={styles.primitive}>Базовый ключ — не состоит из других ключей базы</div>}
      </section>

      <section className={styles.section}>
        <div className="section-heading"><h2>Слова с этим ключом</h2><span>{relatedWords.length}</span></div>
        <div className={styles.words}>{relatedWords.map((word) => <WordCard key={word.id} word={word} keys={keys} tags={tags} />)}</div>
        {!relatedWords.length && <div className="empty-state"><p>В базе пока нет связанных слов.</p></div>}
      </section>
    </div>
  );
}
