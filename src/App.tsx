import { Navigate, Route, Routes } from 'react-router-dom';
import { useDictionary } from './components/DictionaryProvider';
import Layout from './components/Layout';
import DictionaryPage from './pages/DictionaryPage';
import WordPage from './pages/WordPage';
import KeysPage from './pages/KeysPage';
import KeyPage from './pages/KeyPage';
import TrainingPage from './pages/TrainingPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const { loading, error } = useDictionary();

  if (loading || error) {
    return (
      <div className="app-state">
        <span className="app-state__logo">汉</span>
        <h1>{error || 'Открываем словарь'}</h1>
        {!error && <p>Загружаем локальную базу…</p>}
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DictionaryPage />} />
        <Route path="words/:wordId" element={<WordPage />} />
        <Route path="keys" element={<KeysPage />} />
        <Route path="keys/:keyId" element={<KeyPage />} />
        <Route path="training" element={<TrainingPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
