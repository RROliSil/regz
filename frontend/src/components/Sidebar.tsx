import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Sliders, Briefcase, FileBarChart, Settings, Container, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
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
        <div className="brand-logo" title="Regz Gestão de Pessoas">
          <Container size={24} color="#ffffff" />
        </div>
        <div className="brand-info">
          <span className="brand-title">Regz</span>
          <span className="brand-subtitle">Gestão de Pessoas</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navegação Principal</div>
        
        <NavLink
          to="/home"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          title="Home"
        >
          <Home size={20} style={{ flexShrink: 0 }} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/colaboradores"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          title="Colaboradores"
        >
          <Users size={20} style={{ flexShrink: 0 }} />
          <span>Colaboradores</span>
        </NavLink>

        <NavLink
          to="/campos"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          title="Campos"
        >
          <Sliders size={20} style={{ flexShrink: 0 }} />
          <span>Campos</span>
        </NavLink>

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

        <div className="nav-item disabled" title="Configurações (Em breve)">
          <Settings size={20} style={{ flexShrink: 0 }} />
          <span>Configurações</span>
          <span className="badge-soon">Em breve</span>
        </div>
      </nav>

      {/* Placeholder para Nova Aba */}
      <div className="sidebar-footer">
        <div className="add-tab-placeholder" title="Adicionar Nova Aba">
          <Plus size={16} style={{ flexShrink: 0 }} />
          <span>+ Nova Aba</span>
        </div>
      </div>
    </aside>
  );
};
