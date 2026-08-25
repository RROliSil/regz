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

