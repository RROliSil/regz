import { useState, useEffect } from 'react';
import { Database, Server, Layout, RefreshCw, ShieldCheck, Container, Plus, Trash2, Table } from 'lucide-react';

interface BackendHealth {
  status: string;
  service: string;
  timestamp: string;
  uptime: number;
}

interface DbStatus {
  connected: boolean;
  timestamp?: string;
  postgresVersion?: string;
  error?: string;
}

interface ItemTeste {
  id: number;
  nome: string;
  descricao: string;
  criado_em: string;
}

export function App() {
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastCheck, setLastCheck] = useState<string>('');

  // Estados para a tabela 'teste'
  const [itensTeste, setItensTeste] = useState<ItemTeste[]>([]);
  const [nomeInput, setNomeInput] = useState('');
  const [descricaoInput, setDescricaoInput] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      // Check Backend Health
      const healthRes = await fetch('/api/health');
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setBackendHealth(healthData);
      } else {
        setBackendHealth(null);
      }

      // Check PostgreSQL Status
      const dbRes = await fetch('/api/db-status');
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setDbStatus(dbData);
      } else {
        setDbStatus({ connected: false, error: 'Falha de conexão com a API' });
      }

      // Buscar itens da tabela 'teste'
      fetchItensTeste();
    } catch (err) {
      setBackendHealth(null);
      setDbStatus({ connected: false, error: 'Serviço Backend Inacessível' });
    } finally {
      setLoading(false);
      setLastCheck(new Date().toLocaleTimeString());
    }
  };

  const fetchItensTeste = async () => {
    try {
      const res = await fetch('/api/teste');
      if (res.ok) {
        const data = await res.json();
        setItensTeste(data);
      }
    } catch (err) {
      console.error('Erro ao buscar itens da tabela teste:', err);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeInput.trim()) return;

    setAddingItem(true);
    try {
      const res = await fetch('/api/teste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeInput, descricao: descricaoInput })
      });
      if (res.ok) {
        setNomeInput('');
        setDescricaoInput('');
        fetchItensTeste();
      }
    } catch (err) {
      console.error('Erro ao inserir item na tabela teste:', err);
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      const res = await fetch(`/api/teste/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchItensTeste();
      }
    } catch (err) {
      console.error('Erro ao deletar item:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
            padding: '12px',
            borderRadius: '16px',
            display: 'flex',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
          }}>
            <Container size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Regz <span className="text-gradient">Platform</span>
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Estrutura inicial completa: Frontend (React + Vite + TS), Backend (Node + Express + TS) e PostgreSQL orquestrados via Docker Compose.
        </p>
      </header>

      {/* Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Status do Ecossistema</h2>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>
            Última verificação: {lastCheck || 'Carregando...'}
          </span>
        </div>
        <button onClick={fetchStatus} className="btn-primary" disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
          {loading ? 'Verificando...' : 'Atualizar Status'}
        </button>
      </div>

      {/* Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        {/* Frontend Card */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '12px', borderRadius: '14px', color: '#38bdf8' }}>
              <Layout size={26} />
            </div>
            <span className="status-badge online">
              <span className="pulse-dot"></span> Online (Nginx)
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Frontend SPA</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            React 18 + Vite + TypeScript rodando em servidor Nginx otimizado.
          </p>
          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '16px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            <strong>Container:</strong> regz-frontend (Porta 8180)
          </div>
        </div>

        {/* Backend Card */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(129, 140, 248, 0.15)', padding: '12px', borderRadius: '14px', color: '#818cf8' }}>
              <Server size={26} />
            </div>
            {backendHealth ? (
              <span className="status-badge online">
                <span className="pulse-dot"></span> Ativo
              </span>
            ) : (
              <span className="status-badge offline">
                <span className="pulse-dot"></span> Inativo
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Backend API</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Node.js + Express + TypeScript com RESTful APIs e verificação de saúde.
          </p>
          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '16px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            <strong>Uptime:</strong> {backendHealth ? `${Math.floor(backendHealth.uptime)}s` : 'Desconectado'} | <strong>Porta:</strong> 4001
          </div>
        </div>

        {/* PostgreSQL Card */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(52, 211, 153, 0.15)', padding: '12px', borderRadius: '14px', color: '#34d399' }}>
              <Database size={26} />
            </div>
            {dbStatus?.connected ? (
              <span className="status-badge online">
                <span className="pulse-dot"></span> Conectado
              </span>
            ) : (
              <span className="status-badge offline">
                <span className="pulse-dot"></span> Desconectado
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>PostgreSQL DB</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Imagem <code style={{ color: '#38bdf8' }}>postgres:15-alpine</code> no banco <code style={{ color: '#34d399' }}>regz_db</code>.
          </p>
          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '16px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            <strong>Database:</strong> regz_db | <strong>Porta:</strong> 5434
          </div>
        </div>
      </div>

      {/* Tabela 'teste' Section */}
      <section className="glass-panel" style={{ padding: '32px', marginBottom: '48px' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Table color="#38bdf8" /> Gerenciador da Tabela <span style={{ color: '#38bdf8' }}>"teste"</span> (PostgreSQL)
        </h3>

        {/* Form para adicionar item na tabela teste */}
        <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Nome do registro *"
            value={nomeInput}
            onChange={(e) => setNomeInput(e.target.value)}
            required
            style={{
              flex: '1 min-width 200px',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid var(--card-border)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: '#ffffff',
              fontSize: '0.95rem'
            }}
          />
          <input
            type="text"
            placeholder="Descrição (opcional)"
            value={descricaoInput}
            onChange={(e) => setDescricaoInput(e.target.value)}
            style={{
              flex: '2 min-width 250px',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid var(--card-border)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: '#ffffff',
              fontSize: '0.95rem'
            }}
          />
          <button type="submit" className="btn-primary" disabled={addingItem}>
            <Plus size={18} />
            {addingItem ? 'Gravando...' : 'Adicionar Linha'}
          </button>
        </form>

        {/* Tabela de exibição de dados */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>ID</th>
                <th style={{ padding: '12px 16px' }}>Nome</th>
                <th style={{ padding: '12px 16px' }}>Descrição</th>
                <th style={{ padding: '12px 16px' }}>Criado Em</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {itensTeste.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    Nenhum registro encontrado na tabela "teste". Adicione uma linha acima!
                  </td>
                </tr>
              ) : (
                itensTeste.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#38bdf8' }}>#{item.id}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{item.nome}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{item.descricao || '-'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                      {new Date(item.criado_em).toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        style={{
                          background: 'rgba(251, 113, 133, 0.15)',
                          color: '#fb7185',
                          border: '1px solid rgba(251, 113, 133, 0.3)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.85rem'
                        }}
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck color="#818cf8" /> Especificações Técnicas Inicializadas
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>ORQUESTRAÇÃO</div>
            <div style={{ fontWeight: 600, marginTop: '4px' }}>Docker Compose v3.8</div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>FRONTEND SERVER</div>
            <div style={{ fontWeight: 600, marginTop: '4px' }}>Nginx Alpine Multi-Stage</div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>BACKEND RUNTIME</div>
            <div style={{ fontWeight: 600, marginTop: '4px' }}>Node 20 Alpine</div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>BANCO DE DADOS</div>
            <div style={{ fontWeight: 600, marginTop: '4px' }}>PostgreSQL 15 Alpine</div>
          </div>
        </div>
      </section>

      <footer style={{ marginTop: '40px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
        Projeto Regz &bull; Estrutura pronta para produção
      </footer>
    </div>
  );
}

export default App;
