import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { AccessibilityModal } from './components/AccessibilityModal';
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
import { Loader2, Eye, AlertTriangle, Menu, ShieldAlert, LogOut } from 'lucide-react';

const RouteTitleTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    let title = 'Regz - Gestão de Pessoas';

    if (path.includes('/home')) {
      title = 'Regz - Home & Indicadores';
    } else if (path.includes('/colaboradores')) {
      title = 'Regz - Gestão de Colaboradores';
    } else if (path.includes('/campos')) {
      title = 'Regz - Campos Personalizados';
    } else if (path.includes('/relatorios')) {
      title = 'Regz - Modelos & Relatórios';
    } else if (path.includes('/administracao')) {
      title = 'Regz - Administração & Acessos';
    } else if (path.includes('/configuracoes')) {
      title = 'Regz - Configurações do Sistema';
    } else if (path.includes('/superadmrgz')) {
      title = 'Regz - Portal Super Admin Master';
    } else if (path.includes('/login') || path.includes('/regz')) {
      title = 'Regz - Acesso ao Sistema';
    }

    document.title = title;
  }, [location]);

  return null;
};

const ProtectedLayout: React.FC = () => {
  const { usuario, loading, temPermissao, logout } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('regz_sidebar_collapsed') === 'true';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Segurança: confiar exclusivamente na flag is_super_admin validada pelo backend
  const isSuperAdmin = Boolean(usuario?.is_super_admin);

  useEffect(() => {
    if (isSuperAdmin) {
      document.documentElement.setAttribute('data-theme', 'padrao');
    }
  }, [isSuperAdmin]);

  const getFirstAllowedPath = (): string | null => {
    if (temPermissao('colaboradores', 'leitura')) return '/colaboradores';
    if (temPermissao('home', 'leitura')) return '/home';
    if (temPermissao('campos', 'leitura')) return '/campos';
    if (temPermissao('relatorios', 'leitura')) return '/relatorios';
    if (temPermissao('administracao', 'leitura')) return '/administracao';
    if (usuario?.perfil?.is_admin) return '/configuracoes';
    return null;
  };

  const firstAllowedPath = getFirstAllowedPath();

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
  const hasTopBanner = !!(usuario?.sem_licenca || usuario?.licenca_expirada || isSomenteLeitura);

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
    return <Navigate to="/Regz" replace />;
  }

  if (isSuperAdmin) {
    if (location.pathname !== '/superadmrgz') {
      return <Navigate to="/superadmrgz" replace />;
    }
    return <SuperAdmin />;
  }

  if (!firstAllowedPath) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-gradient)', padding: '24px' }}>
        <div className="glass-panel" style={{ maxWidth: '460px', width: '100%', padding: '32px', textAlign: 'center', borderRadius: '20px' }}>
          <ShieldAlert size={44} color="#f59e0b" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ margin: '0 0 10px 0', fontSize: '1.35rem', fontWeight: 800 }}>Sem Permissões Atribuídas</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '24px', lineHeight: 1.5 }}>
            Seu perfil de acesso atual ({usuario.perfil?.nome || 'Sem Perfil'}) não possui permissão de visualização em nenhum módulo do sistema. Contate o Administrador.
          </p>
          <button onClick={logout} className="btn-primary" style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={16} /> Sair do Sistema
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Backdrop escuro para Drawer Mobile/Tablet */}
      {mobileMenuOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Menu Lateral Fixo (Desktop) / Drawer Deslizante (Mobile & Tablet <= 960px) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Conteúdo Principal Ajustado Dinamicamente ao Menu Lateral e a qualquer largura de tela */}
      <main className={`main-viewport ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ padding: 0 }}>
        {/* Barra Superior Mobile/Tablet (exibida apenas <= 960px) */}
        <div className="mobile-topbar no-print">
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menu de navegação"
          >
            <Menu size={22} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <img src="/logo.png" alt="Regz" style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover' }} />
            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>Regz</span>
          </div>
        </div>

        {/* Banner Top Alert de Licença Ausente / Expirada (Modo Somente Leitura Forçado) */}
        {usuario?.sem_licenca ? (
          <div
            className={`status-top-banner ${sidebarCollapsed ? 'collapsed' : ''}`}
            style={{
              background: 'linear-gradient(90deg, #854d0e 0%, #a16207 50%, #ca8a04 100%)',
              borderBottom: '1px solid #eab308',
              color: '#fef9c3',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
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
          <div
            className={`status-top-banner ${sidebarCollapsed ? 'collapsed' : ''}`}
            style={{
              background: 'linear-gradient(90deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
              borderBottom: '1px solid #ef4444',
              color: '#fee2e2',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
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
          <div
            className={`status-top-banner ${sidebarCollapsed ? 'collapsed' : ''}`}
            style={{
              background: 'linear-gradient(90deg, #78350f 0%, #92400e 50%, #b45309 100%)',
              borderBottom: '1px solid #f59e0b',
              color: '#fef3c7',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
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

        <div className={`viewport-content-shell ${hasTopBanner ? 'has-banner' : ''}`}>
          <Routes>
            <Route path="/" element={<Navigate to={firstAllowedPath} replace />} />
            <Route path="/home" element={<RequireAuth aba="home" fallbackPath={firstAllowedPath}><Home /></RequireAuth>} />
            <Route path="/colaboradores" element={<RequireAuth aba="colaboradores" fallbackPath={firstAllowedPath}><Colaboradores /></RequireAuth>} />
            <Route path="/campos" element={<RequireAuth aba="campos" fallbackPath={firstAllowedPath}><Campos /></RequireAuth>} />
            <Route path="/administracao" element={<RequireAuth aba="administracao" fallbackPath={firstAllowedPath}><Administracao /></RequireAuth>} />
            <Route path="/relatorios" element={<RequireAuth aba="relatorios" fallbackPath={firstAllowedPath}><Relatorios /></RequireAuth>} />
            <Route path="/configuracoes" element={<RequireAdmin fallbackPath={firstAllowedPath}><Configuracoes /></RequireAdmin>} />
            <Route path="*" element={<Navigate to={firstAllowedPath} replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const RequireAdmin: React.FC<{ fallbackPath: string; children: JSX.Element }> = ({ fallbackPath, children }) => {
  const { usuario } = useAuth();
  
  if (!usuario?.perfil?.is_admin) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

const RequireAuth: React.FC<{ aba: keyof PermissoesAba; fallbackPath: string; children: JSX.Element }> = ({ aba, fallbackPath, children }) => {
  const { temPermissao } = useAuth();
  
  if (!temPermissao(aba, 'leitura')) {
    return <Navigate to={fallbackPath} replace />;
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
    return <Navigate to={usuario.is_super_admin ? "/superadmrgz" : "/"} replace />;
  }

  return <Login />;
};

export function App() {
  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <AuthProvider>
          <SnackbarProvider>
            <BrowserRouter>
              <RouteTitleTracker />
              <Routes>
                <Route path="/Regz" element={<LoginRoute />} />
                <Route path="/regz" element={<LoginRoute />} />
                <Route path="/login" element={<Navigate to="/Regz" replace />} />
                <Route path="/regz/login" element={<Navigate to="/Regz" replace />} />
                <Route path="/*" element={<ProtectedLayout />} />
              </Routes>
              <AccessibilityModal />
            </BrowserRouter>
          </SnackbarProvider>
        </AuthProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}

export default App;
