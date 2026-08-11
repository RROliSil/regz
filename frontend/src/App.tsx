import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Colaboradores } from './pages/Colaboradores';
import { Campos } from './pages/Campos';
import { Administracao } from './pages/Administracao';
import { Login } from './pages/Login';
import { PermissoesAba } from './types/auth';
import { Loader2 } from 'lucide-react';

const ProtectedLayout: React.FC = () => {
  const { usuario, loading } = useAuth();
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#ffffff' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem' }}>
          <Loader2 className="spin" size={24} color="#6366f1" /> Carregando Regz Gestão...
        </div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      {/* Menu Lateral Fixo com Suporte a Encolher / Expandir */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Conteúdo Principal Ajustado Dinamicamente ao Menu Lateral */}
      <main className={`main-viewport ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/colaboradores" replace />} />
          <Route path="/home" element={<RequireAuth aba="home"><Home /></RequireAuth>} />
          <Route path="/colaboradores" element={<RequireAuth aba="colaboradores"><Colaboradores /></RequireAuth>} />
          <Route path="/campos" element={<RequireAuth aba="campos"><Campos /></RequireAuth>} />
          <Route path="/administracao" element={<RequireAuth aba="administracao"><Administracao /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/colaboradores" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const RequireAuth: React.FC<{ aba: keyof PermissoesAba; children: JSX.Element }> = ({ aba, children }) => {
  const { temPermissao } = useAuth();
  
  if (!temPermissao(aba, 'leitura')) {
    return <Navigate to="/colaboradores" replace />;
  }

  return children;
};

const LoginRoute: React.FC = () => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#ffffff' }}>
        <Loader2 className="spin" size={24} color="#6366f1" />
      </div>
    );
  }

  if (usuario) {
    return <Navigate to="/colaboradores" replace />;
  }

  return <Login />;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
