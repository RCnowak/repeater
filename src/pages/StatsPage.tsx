import { BookOpen, CalendarCheck, Check, Flame, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDictionary } from '../components/DictionaryProvider';
import styles from './StatsPage.module.scss';

function localDay(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateStreak(reviewDays: Set<string>) {
  const cursor = new Date();
  if (!reviewDays.has(localDay(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (reviewDays.has(localDay(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function StatsPage() {
  const { words, reviews } = useDictionary();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);
  cutoff.setHours(0, 0, 0, 0);
  const recentReviews = reviews.filter((review) => new Date(review.reviewedAt) >= cutoff);
  const reviewDays = new Set(reviews.map((review) => localDay(new Date(review.reviewedAt))));
  const streak = calculateStreak(reviewDays);
  const wordsWithMistakes = words.filter((word) => word.srs.wrongCount > 0).length;
  const latestReviews = [...reviews].sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt)).slice(0, 6);

  return (
    <div className="page">
      <div className="page-heading">
        <span className="page-heading__eyebrow">Твоя активность</span>
        <h1>Статистика</h1>
        <p>Регулярность важнее длительности каждого занятия</p>
      </div>

      <section className={styles.streak}>
        <span><Flame size={26} /></span>
        <div><strong>{streak}</strong><p>{streak === 1 ? 'день' : 'дней'} непрерывных тренировок</p></div>
        <small>{streak ? 'Так держать!' : 'Начни сегодня'}</small>
      </section>

      <section className={styles.metrics}>
        <div><span><CalendarCheck size={20} /></span><strong>{recentReviews.length}</strong><p>повторов за 7 дней</p></div>
        <div><span><X size={20} /></span><strong>{wordsWithMistakes}</strong><p>слов с ошибками</p></div>
        <div><span><BookOpen size={20} /></span><strong>{words.length}</strong><p>слов в базе</p></div>
      </section>

      <section className={styles.history}>
        <div className="section-heading"><h2>Последние ответы</h2><span>{reviews.length} всего</span></div>
        {latestReviews.length ? <div className={styles.history__list}>{latestReviews.map((review) => {
          const word = words.find((item) => item.id === review.wordId);
          return <Link to={`/words/${review.wordId}`} key={review.id}><span className={`${styles.history__result} ${review.correct ? styles['history__result--correct'] : ''}`}>{review.correct ? <Check size={15} /> : <X size={15} />}</span><span className={`${styles.history__hanzi} chinese`}>{word?.hanzi || '—'}</span><div><strong>{word?.translation || 'Слово удалено'}</strong><small>{new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(review.reviewedAt))}</small></div></Link>;
        })}</div> : <div className={styles.history__empty}><p>Здесь появятся результаты после первой тренировки.</p><Link className="primary-button" to="/training">Начать тренировку</Link></div>}
      </section>
    </div>
  );
}
