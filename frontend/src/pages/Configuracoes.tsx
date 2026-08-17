import React, { useState, useEffect } from 'react';
import { Server, Database, Layout, RefreshCw, Shield, Info, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Configuracoes: React.FC = () => {
  const { usuario } = useAuth();
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
      {/* Header da Página */}
      <header className="page-header" style={{ marginBottom: '28px' }}>
        <div>
          <h1 className="page-title">
            Configurações do <span className="text-gradient">Sistema</span>
          </h1>
          <p className="page-description">
            Painel exclusivo de administração. Diagnóstico de servidores, status do banco de dados e informações do ambiente.
          </p>
        </div>
        <button onClick={checkStatus} className="btn-primary" disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
          {loading ? 'Verificando...' : 'Atualizar Status'}
        </button>
      </header>

      {/* Grid de Monitoramento do Ecossistema */}
      <div className="status-grid" style={{ marginBottom: '32px' }}>
        {/* Card Frontend */}
        <div className="glass-panel card-status">
          <div className="card-status-header">
            <div className="icon-wrapper cyan"><Layout size={24} /></div>
            <span className="status-badge online"><span className="pulse-dot"></span> Online</span>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '12px', marginBottom: '4px' }}>Frontend React + Vite</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Servidor Nginx na porta 8180</p>
        </div>

        {/* Card Backend */}
        <div className="glass-panel card-status">
          <div className="card-status-header">
            <div className="icon-wrapper purple"><Server size={24} /></div>
            {backendStatus ? (
              <span className="status-badge online"><span className="pulse-dot"></span> Ativo</span>
            ) : (
              <span className="status-badge offline"><span className="pulse-dot"></span> Inativo</span>
            )}
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '12px', marginBottom: '4px' }}>Backend Express API</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Node.js na porta 4001</p>
        </div>

        {/* Card Banco de Dados */}
        <div className="glass-panel card-status">
          <div className="card-status-header">
            <div className="icon-wrapper emerald"><Database size={24} /></div>
            {dbStatus ? (
              <span className="status-badge online"><span className="pulse-dot"></span> Conectado</span>
            ) : (
              <span className="status-badge offline"><span className="pulse-dot"></span> Desconectado</span>
            )}
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '12px', marginBottom: '4px' }}>PostgreSQL 15</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Banco regz_db na porta 5434</p>
        </div>
      </div>

      {/* Painel de Informações do Ambiente e Sessão */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--card-border)', paddingBottom: '16px' }}>
          <Info size={22} color="#5e5eee" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Informações Gerais do Ambiente</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="info-box-ambiente" style={{ padding: '16px 20px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Aplicação</span>
            <span className="info-box-valor" style={{ fontSize: '1rem', fontWeight: 700 }}>Regz - Gestão de Pessoas</span>
          </div>

          <div className="info-box-ambiente" style={{ padding: '16px 20px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Ambiente de Implantação</span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#5e5eee' }}>Docker / Portainer.io</span>
          </div>

          <div className="info-box-ambiente" style={{ padding: '16px 20px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Usuário Autenticado</span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#a855f7', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={16} /> {usuario?.nome} ({usuario?.perfil?.nome || 'Administrador'})
            </span>
          </div>

          <div className="info-box-ambiente" style={{ padding: '16px 20px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Status Geral dos Serviços</span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: backendStatus && dbStatus ? '#34d399' : '#fb7185', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {backendStatus && dbStatus ? (
                <>
                  <CheckCircle2 size={16} /> Todos os sistemas operacionais
                </>
              ) : (
                <>
                  <XCircle size={16} /> Atenção aos serviços de backend
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
