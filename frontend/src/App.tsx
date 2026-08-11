import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Colaboradores } from './pages/Colaboradores';
import { Campos } from './pages/Campos';
import { Administracao } from './pages/Administracao';
import { Login } from './pages/Login';
import { PermissoesAba } from './types/auth';
import { Loader2, Eye } from 'lucide-react';

const ProtectedLayout: React.FC = () => {
  const { usuario, loading, temPermissao } = useAuth();
  const location = useLocation();
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

  const getAbaByPath = (path: string): keyof PermissoesAba | null => {
    if (path.includes('/home')) return 'home';
    if (path.includes('/colaboradores')) return 'colaboradores';
    if (path.includes('/campos')) return 'campos';
    if (path.includes('/administracao')) return 'administracao';
    return null;
  };

  const abaAtual = getAbaByPath(location.pathname);
  const isSomenteLeitura = abaAtual ? (temPermissao(abaAtual, 'leitura') && !temPermissao(abaAtual, 'escrita')) : false;

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
      <main className={`main-viewport ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ padding: 0 }}>
        {/* Banner Top Alert de Modo Somente Leitura */}
        {isSomenteLeitura && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(234, 179, 8, 0.15) 0%, rgba(245, 158, 11, 0.25) 100%)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#fbbf24',
            padding: '10px 24px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            zIndex: 10,
            position: 'sticky',
            top: 0,
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={18} color="#fbbf24" />
              <span>
                <strong>Modo Somente Leitura:</strong> Seu perfil de acesso ({usuario.perfil?.nome || 'Consulta'}) possui permissão apenas de visualização nesta aba. Alterações e adições estão desativadas.
              </span>
            </div>
            <span style={{
              background: 'rgba(245, 158, 11, 0.25)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '20px',
              padding: '3px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap'
            }}>
              👁️ Somente Leitura
            </span>
          </div>
        )}

        <div style={{ padding: '24px 32px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/colaboradores" replace />} />
            <Route path="/home" element={<RequireAuth aba="home"><Home /></RequireAuth>} />
            <Route path="/colaboradores" element={<RequireAuth aba="colaboradores"><Colaboradores /></RequireAuth>} />
            <Route path="/campos" element={<RequireAuth aba="campos"><Campos /></RequireAuth>} />
            <Route path="/administracao" element={<RequireAuth aba="administracao"><Administracao /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/colaboradores" replace />} />
          </Routes>
        </div>
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
