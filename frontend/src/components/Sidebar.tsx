import React from 'react';
import { Home, Users, Briefcase, FileBarChart, Settings, Container, Plus } from 'lucide-react';

interface SidebarProps {
  activeTab: 'home' | 'colaboradores';
  setActiveTab: (tab: 'home' | 'colaboradores') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
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
        
        <button
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={20} />
          <span>Home</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'colaboradores' ? 'active' : ''}`}
          onClick={() => setActiveTab('colaboradores')}
        >
          <Users size={20} />
          <span>Colaboradores</span>
        </button>

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
