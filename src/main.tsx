import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { DictionaryProvider } from './components/DictionaryProvider';
import './styles/global.scss';

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DictionaryProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </DictionaryProvider>
  </React.StrictMode>,
);
