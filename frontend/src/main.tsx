import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Interceptor global para fetch injetando o header ngrok-skip-browser-warning exclusivamente em rotas internas
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  let isInternal = false;
  try {
    if (typeof input === 'string') {
      if (input.startsWith('/') || input.startsWith(window.location.origin)) {
        isInternal = true;
      }
    } else if (input instanceof URL) {
      if (input.origin === window.location.origin) {
        isInternal = true;
      }
    } else if (input instanceof Request) {
      if (input.url.startsWith('/') || input.url.startsWith(window.location.origin)) {
        isInternal = true;
      }
    }
  } catch {
    isInternal = false;
  }

  if (isInternal) {
    const customInit: RequestInit = init ? { ...init } : {};
    const headers = new Headers(customInit.headers || (input instanceof Request ? input.headers : {}));
    if (!headers.has('ngrok-skip-browser-warning')) {
      headers.set('ngrok-skip-browser-warning', 'true');
    }
    customInit.headers = headers;
    return originalFetch(input, customInit);
  }

  return originalFetch(input, init);
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


