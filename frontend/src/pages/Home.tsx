import React, { useState, useEffect } from 'react';
import { Server, Database, Layout, Activity, Sparkles, RefreshCw } from 'lucide-react';

export const Home: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<boolean | null>(null);
  const [dbStatus, setDbStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const hRes = await fetch('/api/health');
      setBackendStatus(hRes.ok);

      const dRes = await fetch('/api/db-status');
      setDbStatus(dRes.ok);
    } catch {
      setBackendStatus(false);
      setDbStatus(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="page-content">
      {/* Page Header */}
      <header className="page-header">
        <div>
          <h1 className="page-title">
            Painel <span className="text-gradient">Home</span>
          </h1>
          <p className="page-description">
            Visão geral da plataforma Regz. Espaços e módulos em branco preparados para futura definição.
          </p>
        </div>
        <button onClick={checkStatus} className="btn-primary" disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
          {loading ? 'Verificando...' : 'Atualizar Status'}
        </button>
      </header>

      {/* Grid de Monitoramento do Ecossistema */}
      <div className="status-grid">
        <div className="glass-panel card-status">
          <div className="card-status-header">
            <div className="icon-wrapper cyan"><Layout size={24} /></div>
            <span className="status-badge online"><span className="pulse-dot"></span> Online</span>
          </div>
          <h3>Frontend React + Vite</h3>
          <p>Servidor Nginx na porta 8180</p>
        </div>

        <div className="glass-panel card-status">
          <div className="card-status-header">
            <div className="icon-wrapper purple"><Server size={24} /></div>
            {backendStatus ? (
              <span className="status-badge online"><span className="pulse-dot"></span> Ativo</span>
            ) : (
              <span className="status-badge offline"><span className="pulse-dot"></span> Inativo</span>
            )}
          </div>
          <h3>Backend Express API</h3>
          <p>Node.js na porta 4001</p>
        </div>

        <div className="glass-panel card-status">
          <div className="card-status-header">
            <div className="icon-wrapper emerald"><Database size={24} /></div>
            {dbStatus ? (
              <span className="status-badge online"><span className="pulse-dot"></span> Conectado</span>
            ) : (
              <span className="status-badge offline"><span className="pulse-dot"></span> Desconectado</span>
            )}
          </div>
          <h3>PostgreSQL 15</h3>
          <p>Banco regz_db na porta 5434</p>
        </div>
      </div>

      {/* Seções em Branco / Placeholders para Futura Definição */}
      <div className="blank-widgets-grid">
        <div className="glass-panel blank-card">
          <div className="blank-card-content">
            <Sparkles size={32} color="#818cf8" style={{ marginBottom: '12px', opacity: 0.6 }} />
            <h4>Espaço em Branco #1</h4>
            <p>Este card está reservado para futuros gráficos, indicadores (KPIs) ou avisos da plataforma.</p>
            <div className="dashed-placeholder">Aguardando definição de conteúdo</div>
          </div>
        </div>

        <div className="glass-panel blank-card">
          <div className="blank-card-content">
            <Activity size={32} color="#38bdf8" style={{ marginBottom: '12px', opacity: 0.6 }} />
            <h4>Espaço em Branco #2</h4>
            <p>Este card está reservado para resumos de atividades recentes ou relatórios em tempo real.</p>
            <div className="dashed-placeholder">Aguardando definição de conteúdo</div>
          </div>
        </div>

        <div className="glass-panel blank-card full-width">
          <div className="blank-card-content">
            <Layout size={36} color="#34d399" style={{ marginBottom: '12px', opacity: 0.6 }} />
            <h4>Painel Principal Principal (Em Aberto)</h4>
            <p>Espaço amplo preparado para receber tabelas executivas, métricas de RH ou feed de notícias da empresa.</p>
            <div className="dashed-placeholder large">Aguardando definição de módulo pelo usuário</div>
          </div>
        </div>
      </div>
    </div>
  );
};
