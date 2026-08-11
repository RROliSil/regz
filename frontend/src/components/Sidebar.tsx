import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Sliders, Briefcase, FileBarChart, Settings, Container, Plus } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      {/* App Logo & Header */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Container size={26} color="#ffffff" />
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
        >
          <Home size={20} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/colaboradores"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Users size={20} />
          <span>Colaboradores</span>
        </NavLink>

        <NavLink
          to="/campos"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Sliders size={20} />
          <span>Campos</span>
        </NavLink>

        {/* Espaços para Futuras Abas */}
        <div className="nav-section-label" style={{ marginTop: '24px' }}>Módulos Futuros</div>
        
        <div className="nav-item disabled" title="Em breve">
          <Briefcase size={20} />
          <span>Departamentos</span>
          <span className="badge-soon">Em breve</span>
        </div>

        <div className="nav-item disabled" title="Em breve">
          <FileBarChart size={20} />
          <span>Relatórios</span>
          <span className="badge-soon">Em breve</span>
        </div>

        <div className="nav-item disabled" title="Em breve">
          <Settings size={20} />
          <span>Configurações</span>
          <span className="badge-soon">Em breve</span>
        </div>
      </nav>

      {/* Placeholder para Nova Aba */}
      <div className="sidebar-footer">
        <div className="add-tab-placeholder">
          <Plus size={16} />
          <span>+ Nova Aba</span>
        </div>
      </div>
    </aside>
  );
};
