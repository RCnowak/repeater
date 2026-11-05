import { BarChart3, BookOpen, Database, Grid2X2, Play } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './Layout.module.scss';

const navigation = [
  { to: '/', label: 'Словарь', icon: BookOpen, end: true },
  { to: '/keys', label: 'Ключи', icon: Grid2X2 },
  { to: '/training', label: 'Тренировка', icon: Play, primary: true },
  { to: '/stats', label: 'Статистика', icon: BarChart3 },
];

export default function Layout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <NavLink to="/" className={styles.brand} aria-label="Повтори — словарь">
          <span className={styles.brand__mark}>汉</span>
          <span>повтори<small>китайский словарь</small></span>
        </NavLink>
        <span className={styles.offline}><Database size={14} /> локально</span>
      </header>
      <main><Outlet /></main>
      <nav className={styles.navigation} aria-label="Основная навигация">
        {navigation.map(({ to, label, icon: Icon, primary, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `${styles.navigation__item} ${primary ? styles['navigation__item--primary'] : ''} ${isActive ? styles['navigation__item--active'] : ''}`}
          >
            <span className={styles.navigation__icon}><Icon size={primary ? 23 : 21} strokeWidth={primary ? 2.2 : 1.9} /></span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
