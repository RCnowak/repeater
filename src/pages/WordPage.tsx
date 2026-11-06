import { ArrowLeft, BookOpen, Link2, Play } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import CharacterAnimation from '../components/CharacterAnimation';
import { useDictionary } from '../components/DictionaryProvider';
import WordCard from '../components/WordCard';
import styles from './WordPage.module.scss';

const splitValues = (value?: string) => value?.split(/[,，]/).map((item) => item.trim()).filter(Boolean) ?? [];

export default function WordPage() {
  const { wordId } = useParams();
  const { words, keys, tags } = useDictionary();
  const word = words.find((item) => item.id === wordId);

  if (!word) return <div className="empty-state"><h2>Слово не найдено</h2><Link to="/">Вернуться в словарь</Link></div>;

  const relatedWords = words.filter((candidate) => candidate.id !== word.id && (
    candidate.hanzi.includes(word.hanzi)
    || word.hanzi.includes(candidate.hanzi)
    || candidate.keyIds.some((keyId) => word.keyIds.includes(keyId))
  ));

  return (
    <div className="page">
      <Link to="/" className={styles.back}><ArrowLeft size={17} /> Словарь</Link>
      <section className={styles.hero}>
        <div className={`${styles.hero__hanzi} chinese`}>{word.hanzi}</div>
        <span className={styles.hero__pinyin}>{word.pinyin}</span>
        <h1>{word.translation}</h1>
        <div className={styles.hero__badges}>
          {word.hskLevel && <span>HSK {word.hskLevel}</span>}
        </div>
      </section>

      <Link to="/training" className={`primary-button ${styles.train}`}><Play size={17} /> Потренировать слова</Link>

      <section className={styles.section}>
        <h2>Разбор слова</h2>
        <dl className={styles.details}>
          <div><dt>Иероглифы</dt><dd className="chinese">{word.hanzi}</dd></div>
          <div><dt>Пиньинь</dt><dd>{word.pinyin}</dd></div>
          {word.measureWord && <div><dt>Счётное слово</dt><dd className="chinese">{word.measureWord}</dd></div>}
          <div><dt>Прогресс SRS</dt><dd>Уровень {word.srs.box} · ошибок {word.srs.wrongCount}</dd></div>
        </dl>
      </section>

      <section className={styles.section}>
        <h2>Начертание</h2>
        <CharacterAnimation key={word.id} hanzi={word.hanzi} />
      </section>

      {word.tags.length > 0 && <section className={styles.section}><h2>Теги</h2><div className={styles.tags}>{word.tags.map((tagId) => <span className="chip" key={tagId}>{tags.find((tag) => tag.id === tagId)?.name}</span>)}</div></section>}

      {word.keyIds.length > 0 && (
        <section className={styles.section}>
          <h2>Ключи</h2>
          <div className={styles.keys}>
            {word.keyIds.map((keyId) => {
              const key = keys.find((item) => item.id === keyId);
              return key ? <Link key={key.id} to={`/keys/${key.id}`}><span className="chinese">{key.symbol}</span><div><strong>{key.pinyin}</strong><small>{key.translation}</small></div></Link> : null;
            })}
          </div>
        </section>
      )}

      {word.associations && <section className={styles.section}><h2><Link2 size={16} /> Ассоциации</h2><ul className={styles.values}>{splitValues(word.associations).map((value) => <li key={value}>{value}</li>)}</ul></section>}
      {word.examples && <section className={styles.section}><h2><BookOpen size={16} /> Примеры</h2><ul className={styles.values}>{splitValues(word.examples).map((value) => <li key={value} className="chinese">{value}</li>)}</ul></section>}

      <section className={styles.related}>
        <div className="section-heading"><h2>Связанные слова</h2><span>{relatedWords.length}</span></div>
        <p>Слова с общими иероглифами, частями и ключами</p>
        <div className={styles.related__list}>{relatedWords.map((related) => <WordCard key={related.id} word={related} keys={keys} tags={tags} />)}</div>
      </section>
    </div>
  );
}
