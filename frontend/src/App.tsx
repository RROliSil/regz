import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Colaboradores } from './pages/Colaboradores';
import { Campos } from './pages/Campos';
import { Administracao } from './pages/Administracao';
import { Configuracoes } from './pages/Configuracoes';
import { Relatorios } from './pages/Relatorios';
import { Login } from './pages/Login';
import { SuperAdmin } from './pages/SuperAdmin';
import { PermissoesAba } from './types/auth';
import { Loader2, Eye, AlertTriangle } from 'lucide-react';

const ProtectedLayout: React.FC = () => {
  const { usuario, loading, temPermissao } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('regz_sidebar_collapsed') === 'true';
  });

  const isSuperAdmin = !!(usuario?.is_super_admin || (usuario?.email && usuario.email.toLowerCase() === 'admin@regz.app') || usuario?.nome === 'Administrador Regz');

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
    if (path.includes('/relatorios')) return 'relatorios';
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

  if (isSuperAdmin) {
    return <SuperAdmin />;
  }

  return (
    <div className="app-layout">
      {/* Menu Lateral Fixo com Suporte a Encolher / Expandir */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Conteúdo Principal Ajustado Dinamicamente ao Menu Lateral */}
      <main className={`main-viewport ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ padding: 0 }}>
        {/* Banner Top Alert de Licença Ausente / Expirada (Modo Somente Leitura Forçado) */}
        {usuario?.sem_licenca ? (
          <div style={{
            position: 'fixed',
            top: 0,
            left: sidebarCollapsed ? '80px' : '260px',
            right: 0,
            zIndex: 99999,
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: 'linear-gradient(90deg, #854d0e 0%, #a16207 50%, #ca8a04 100%)',
            borderBottom: '1px solid #eab308',
            color: '#fef9c3',
            padding: '10px 24px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={18} color="#fef08a" />
              <span>
                <strong>SEM LICENÇA VINCULADA:</strong> Sua conta de usuário não possui uma Chave de Licença ativa vinculada! O acesso foi alterado para <u>MODO SOMENTE LEITURA</u>. Contate um Administrador para vincular uma chave válida.
              </span>
            </div>
            <span style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(254, 240, 138, 0.4)',
              color: '#fef9c3',
              borderRadius: '20px',
              padding: '3px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap'
            }}>
              🔑 Licença Necessária
            </span>
          </div>
        ) : usuario?.licenca_expirada ? (
          <div style={{
            position: 'fixed',
            top: 0,
            left: sidebarCollapsed ? '80px' : '260px',
            right: 0,
            zIndex: 99999,
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: 'linear-gradient(90deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
            borderBottom: '1px solid #ef4444',
            color: '#fee2e2',
            padding: '10px 24px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={18} color="#fca5a5" />
              <span>
                <strong>LICENÇA EXPIRADA:</strong> Sua licença de uso do sistema expirou! O acesso foi alterado para <u>MODO SOMENTE LEITURA</u>. Contate um Administrador para renovar ou inserir uma nova chave de licença.
              </span>
            </div>
            <span style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(254, 226, 226, 0.4)',
              color: '#fee2e2',
              borderRadius: '20px',
              padding: '3px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap'
            }}>
              ⚠️ Licença Expirada
            </span>
          </div>
        ) : isSomenteLeitura && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: sidebarCollapsed ? '80px' : '260px',
            right: 0,
            zIndex: 99999,
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: 'linear-gradient(90deg, #78350f 0%, #92400e 50%, #b45309 100%)',
            borderBottom: '1px solid #f59e0b',
            color: '#fef3c7',
            padding: '10px 24px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Eye size={18} color="#fde68a" />
              <span>
                <strong>Modo Somente Leitura:</strong> Seu perfil de acesso ({usuario.perfil?.nome || 'Consulta'}) possui permissão apenas de visualização nesta aba. Alterações e adições estão desativadas.
              </span>
            </div>
            <span style={{
              background: 'rgba(245, 158, 11, 0.3)',
              border: '1px solid rgba(253, 230, 138, 0.5)',
              color: '#fef3c7',
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

        <div style={{ padding: isSomenteLeitura ? '68px 32px 24px 32px' : '24px 32px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/colaboradores" replace />} />
            <Route path="/home" element={<RequireAuth aba="home"><Home /></RequireAuth>} />
            <Route path="/colaboradores" element={<RequireAuth aba="colaboradores"><Colaboradores /></RequireAuth>} />
            <Route path="/campos" element={<RequireAuth aba="campos"><Campos /></RequireAuth>} />
            <Route path="/administracao" element={<RequireAuth aba="administracao"><Administracao /></RequireAuth>} />
            <Route path="/relatorios" element={<RequireAuth aba="relatorios"><Relatorios /></RequireAuth>} />
            <Route path="/configuracoes" element={<RequireAdmin><Configuracoes /></RequireAdmin>} />
            <Route path="*" element={<Navigate to="/colaboradores" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const RequireAdmin: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { usuario } = useAuth();
  
  if (!usuario?.perfil?.is_admin) {
    return <Navigate to="/colaboradores" replace />;
  }

  return children;
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
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
