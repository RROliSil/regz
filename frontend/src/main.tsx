import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Interceptor global para fetch: injeta Authorization JWT e ngrok-skip-browser-warning em rotas internas + trata 401
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  let isInternal = false;
  let requestPath = '';
  try {
    if (typeof input === 'string') {
      if (input.startsWith('/') || input.startsWith(window.location.origin)) {
        isInternal = true;
        requestPath = input.startsWith('/') ? input : new URL(input).pathname;
      }
    } else if (input instanceof URL) {
      if (input.origin === window.location.origin) {
        isInternal = true;
        requestPath = input.pathname;
      }
    } else if (input instanceof Request) {
      if (input.url.startsWith('/') || input.url.startsWith(window.location.origin)) {
        isInternal = true;
        requestPath = input.url.startsWith('/') ? input.url : new URL(input.url).pathname;
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
    const isLoginEndpoint = requestPath.startsWith('/api/auth/login');
    const savedToken = localStorage.getItem('regz_token');
    if (requestPath.startsWith('/api/') && !isLoginEndpoint && savedToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${savedToken}`);
    }
    customInit.headers = headers;
    const response = await originalFetch(input, customInit);

    if (response.status === 401 && requestPath.startsWith('/api/') && !isLoginEndpoint && savedToken) {
      localStorage.removeItem('regz_token');
      window.dispatchEvent(new CustomEvent('regz:unauthorized'));
    }
    return response;
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


