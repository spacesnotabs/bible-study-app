import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { applyTheme, loadTheme } from './platform/storage/theme';
import './app/styles.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('The application root is missing.');
}

applyTheme(loadTheme());

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
