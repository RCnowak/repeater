import { PenLine, Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import HandwritingInput from '../components/HandwritingInput';
import { useDictionary } from '../components/DictionaryProvider';
import WordCard from '../components/WordCard';
import useDebouncedValue from '../hooks/useDebouncedValue';
import { pinyinSearchKey } from '../utils/pinyin';
import styles from './DictionaryPage.module.scss';

export default function DictionaryPage() {
  const { words, keys, tags, modules } = useDictionary();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [hskLevel, setHskLevel] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [handwritingOpen, setHandwritingOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query);
  const normalizedQuery = debouncedQuery.trim().toLowerCase();
  const pinyinQuery = pinyinSearchKey(debouncedQuery);
  const activeFilters = Number(Boolean(hskLevel)) + Number(Boolean(moduleId)) + selectedTags.length;

  const filteredWords = useMemo(() => words.filter((word) => {
    const matchesQuery = !normalizedQuery
      || word.hanzi.includes(normalizedQuery)
      || word.translation.toLowerCase().includes(normalizedQuery)
      || (pinyinQuery && pinyinSearchKey(word.pinyin).includes(pinyinQuery));
    const matchesHsk = !hskLevel || word.hskLevel === Number(hskLevel);
    const matchesModule = !moduleId || word.moduleId === moduleId;
    const matchesTags = selectedTags.every((tagId) => word.tags.includes(tagId));
    return matchesQuery && matchesHsk && matchesModule && matchesTags;
  }), [words, normalizedQuery, pinyinQuery, hskLevel, moduleId, selectedTags]);

  const resetFilters = () => {
    setHskLevel('');
    setModuleId('');
    setSelectedTags([]);
  };

  return (
    <div className="page">
      <div className="page-heading">
        <span className="page-heading__eyebrow">Локальная база · {words.length} слов</span>
        <h1>Словарь</h1>
        <p>Иероглифы, пиньинь и перевод — всегда под рукой</p>
      </div>

      <div className={styles.searchRow}>
        <label className={styles.search}>
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="汉字, pin1yin1 или перевод" aria-label="Поиск по словарю" />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Очистить поиск"><X size={16} /></button>}
        </label>
        <button className={styles.handwritingButton} type="button" onClick={() => setHandwritingOpen(true)} aria-label="Рукописный ввод"><PenLine size={20} /></button>
      </div>

      <div className={styles.toolbar}>
        <button type="button" className={filtersOpen || activeFilters ? styles['toolbar__filter--active'] : ''} onClick={() => setFiltersOpen((value) => !value)}>
          <SlidersHorizontal size={15} /> Фильтры {activeFilters > 0 && <span>{activeFilters}</span>}
        </button>
        <span>Найдено: {filteredWords.length}</span>
      </div>

      {filtersOpen && (
        <section className={styles.filters}>
          <div className={styles.filters__selects}>
            <label>HSK<select value={hskLevel} onChange={(event) => setHskLevel(event.target.value)}><option value="">Любой уровень</option>{[1, 2, 3, 4, 5, 6].map((level) => <option key={level} value={level}>HSK {level}</option>)}</select></label>
            <label>Модуль<select value={moduleId} onChange={(event) => setModuleId(event.target.value)}><option value="">Все модули</option>{modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}</select></label>
          </div>
          <span className={styles.filters__label}>Теги</span>
          <div className={styles.filters__tags}>
            {tags.map((tag) => {
              const selected = selectedTags.includes(tag.id);
              return <button key={tag.id} type="button" className={selected ? styles['filters__tag--selected'] : ''} onClick={() => setSelectedTags((current) => selected ? current.filter((id) => id !== tag.id) : [...current, tag.id])}>{tag.name}</button>;
            })}
          </div>
          {activeFilters > 0 && <button className={styles.filters__reset} type="button" onClick={resetFilters}>Сбросить фильтры</button>}
        </section>
      )}

      <div className={styles.list}>
        {filteredWords.map((word) => <WordCard key={word.id} word={word} keys={keys} tags={tags} />)}
      </div>

      {!filteredWords.length && <div className="empty-state"><Search size={28} /><h2>Слова не найдены</h2><p>Попробуй другой запрос или сбрось фильтры.</p></div>}

      {handwritingOpen && <HandwritingInput onSelect={(character) => { setQuery(character); setHandwritingOpen(false); }} onClose={() => setHandwritingOpen(false)} />}
    </div>
  );
}
