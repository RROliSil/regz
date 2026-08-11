import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Colaboradores } from './pages/Colaboradores';
import { Campos } from './pages/Campos';

export function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('regz_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('regz_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <BrowserRouter>
      <div className="app-layout">
        {/* Menu Lateral Fixo com Suporte a Encolher / Expandir */}
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

        {/* Conteúdo Principal Ajustado Dinamicamente ao Menu Lateral */}
        <main className={`main-viewport ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/colaboradores" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/colaboradores" element={<Colaboradores />} />
            <Route path="/campos" element={<Campos />} />
            <Route path="*" element={<Navigate to="/colaboradores" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
