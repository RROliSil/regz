import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Sliders, ShieldCheck, Briefcase, FileBarChart, Settings, Container, ChevronLeft, ChevronRight, LogOut, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { usuario, logout, temPermissao } = useAuth();
  const { theme, cycleTheme } = useTheme();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Botão Flutuante de Encolher / Expandir Menu na Divisa Vertical Superior */}
      <button
        onClick={onToggle}
        className="sidebar-toggle-btn"
        title={collapsed ? "Expandir Menu Lateral" : "Recolher Menu Lateral"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* App Logo & Header */}
      <div className="sidebar-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div className="brand-logo" title="Regz Gestão de Pessoas">
            <Container size={24} color="#ffffff" />
          </div>
          {!collapsed && (
            <div className="brand-info">
              <span className="brand-title">Regz</span>
              <span className="brand-subtitle">Gestão de Pessoas</span>
            </div>
          )}
        </div>

        {/* Botão de Tema (Regz / Sol / Lua) sem texto */}
        <button
          onClick={cycleTheme}
          className="theme-toggle-btn"
          title={
            theme === 'dark' ? 'Modo Noturno (Clique para alternar para Modo Claro)' :
            theme === 'light' ? 'Modo Claro (Clique para alternar para Modo Nublado)' :
            'Modo Nublado (Clique para alternar para Modo Noturno)'
          }
        >
          {theme === 'dark' && <Container size={18} />}
          {theme === 'light' && <Sun size={18} />}
          {theme === 'cloud' && <Moon size={18} />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navegação Principal</div>
        
        {temPermissao('home') && (
          <NavLink
            to="/home"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title="Home"
          >
            <Home size={20} style={{ flexShrink: 0 }} />
            <span>Home</span>
          </NavLink>
        )}

        {temPermissao('colaboradores') && (
          <NavLink
            to="/colaboradores"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title="Colaboradores"
          >
            <Users size={20} style={{ flexShrink: 0 }} />
            <span>Colaboradores</span>
          </NavLink>
        )}

        {temPermissao('campos') && (
          <NavLink
            to="/campos"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title="Campos"
          >
            <Sliders size={20} style={{ flexShrink: 0 }} />
            <span>Campos</span>
          </NavLink>
        )}

        {/* Aba de Administração */}
        {temPermissao('administracao') && (
          <NavLink
            to="/administracao"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title="Administração"
          >
            <ShieldCheck size={20} style={{ flexShrink: 0 }} />
            <span>Administração</span>
          </NavLink>
        )}

        {/* Aba Configurações (Exclusiva para Perfil Administrador) */}
        {usuario?.perfil?.is_admin && (
          <NavLink
            to="/configuracoes"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title="Configurações"
          >
            <Settings size={20} style={{ flexShrink: 0 }} />
            <span>Configurações</span>
          </NavLink>
        )}

        {/* Espaços para Futuras Abas */}
        <div className="nav-section-label" style={{ marginTop: '24px' }}>Módulos Futuros</div>
        
        <div className="nav-item disabled" title="Departamentos (Em breve)">
          <Briefcase size={20} style={{ flexShrink: 0 }} />
          <span>Departamentos</span>
          <span className="badge-soon">Em breve</span>
        </div>

        <div className="nav-item disabled" title="Relatórios (Em breve)">
          <FileBarChart size={20} style={{ flexShrink: 0 }} />
          <span>Relatórios</span>
          <span className="badge-soon">Em breve</span>
        </div>
      </nav>

      {/* Footer com Perfil do Usuário e Botão de Logout */}
      <div className="sidebar-footer">
        {usuario && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            width: '100%',
            padding: '8px 10px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '12px',
            border: '1px solid var(--card-border)'
          }}>
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '6px', borderRadius: '50%', color: '#818cf8' }}>
                  <User size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {usuario.nome}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {usuario.perfil?.nome || 'Usuário'}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={logout}
              className="btn-action delete"
              style={{ padding: '6px 8px', borderRadius: '8px' }}
              title="Sair do Sistema"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
