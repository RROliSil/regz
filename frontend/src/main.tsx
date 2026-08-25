import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Interceptor global para fetch injetando o header ngrok-skip-browser-warning
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  const customInit: RequestInit = init ? { ...init } : {};
  const headers = new Headers(customInit.headers || {});
  if (!headers.has('ngrok-skip-browser-warning')) {
    headers.set('ngrok-skip-browser-warning', 'true');
  }
  customInit.headers = headers;
  return originalFetch(input, customInit);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Registro do Service Worker para PWA e cache de assets estáticos
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registrado com sucesso no escopo:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Falha ao registrar Service Worker:', err);
      });
  });
}


