import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, Sliders, Shield, UserPlus, MapPin, Loader2, User, ChevronRight } from 'lucide-react';
import { Colaborador } from '../types/colaborador';
import { CampoCustomizado } from '../types/auth';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [campos, setCampos] = useState<CampoCustomizado[]>([]);
  const [usuariosCount, setUsuariosCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [colabRes, camposRes, userRes] = await Promise.all([
          fetch('/api/colaboradores'),
          fetch('/api/campos-customizados'),
          fetch('/api/usuarios')
        ]);

        if (colabRes.ok) {
          const colabData = await colabRes.json();
          setColaboradores(colabData);
        }

        if (camposRes.ok) {
          const camposData = await camposRes.json();
          setCampos(camposData);
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setUsuariosCount(userData.length || 0);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cálculos das estatísticas de RH
  const totalColaboradores = colaboradores.length;
  const colaboradoresAtivos = colaboradores.filter(c => c.ativo !== false).length;
  const colaboradoresInativos = totalColaboradores - colaboradoresAtivos;

  // Distribuição por Cargo
  const cargosMap: Record<string, number> = {};
  colaboradores.forEach(c => {
    const cargoNome = c.cargo || 'Não especificado';
    cargosMap[cargoNome] = (cargosMap[cargoNome] || 0) + 1;
  });

  const topCargos = Object.entries(cargosMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Distribuição por Cidade
  const cidadesMap: Record<string, number> = {};
  colaboradores.forEach(c => {
    if (c.cidade) {
      const citState = `${c.cidade} - ${c.estado || 'UF'}`;
      cidadesMap[citState] = (cidadesMap[citState] || 0) + 1;
    }
  });

  const topCidades = Object.entries(cidadesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Últimos 5 colaboradores
  const ultimosColaboradores = [...colaboradores]
    .slice(0, 5);

  return (
    <div className="page-content">
      {/* Header da Página */}
      <header className="page-header" style={{ marginBottom: '28px' }}>
        <div>
          <h1 className="page-title">
            Painel de <span className="text-gradient">Gestão & Indicadores</span>
          </h1>
          <p className="page-description">
            Visão geral executiva em tempo real do quadro de colaboradores, distribuição de cargos e dados organizacionais.
          </p>
        </div>

        {/* Atalhos Rápidos */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/colaboradores')}
            className="btn-primary"
            style={{ fontSize: '0.88rem' }}
          >
            <UserPlus size={16} /> Novo Colaborador
          </button>
        </div>
      </header>

      {/* Grid de KPIs / Indicadores Chave */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* KPI 1: Colaboradores */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Colaboradores</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginTop: '6px', marginBottom: '2px' }}>
                {loading ? <Loader2 className="spin" size={20} /> : totalColaboradores}
              </h2>
            </div>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '10px', borderRadius: '12px' }}>
              <Users size={24} />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '12px', display: 'flex', gap: '12px' }}>
            <span style={{ color: '#34d399', fontWeight: 600 }}>● {colaboradoresAtivos} Ativos</span>
            {colaboradoresInativos > 0 && <span style={{ color: '#fb7185', fontWeight: 600 }}>● {colaboradoresInativos} Inativos</span>}
          </div>
        </div>

        {/* KPI 2: Cargos */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cargos Registrados</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginTop: '6px', marginBottom: '2px' }}>
                {loading ? <Loader2 className="spin" size={20} /> : Object.keys(cargosMap).length}
              </h2>
            </div>
            <div style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '10px', borderRadius: '12px' }}>
              <Briefcase size={24} />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '12px' }}>
            Funções e CBOs em uso na equipe
          </div>
        </div>

        {/* KPI 3: Campos Customizados */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Campos Dinâmicos</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginTop: '6px', marginBottom: '2px' }}>
                {loading ? <Loader2 className="spin" size={20} /> : campos.length}
              </h2>
            </div>
            <div style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '10px', borderRadius: '12px' }}>
              <Sliders size={24} />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '12px' }}>
            Campos ativos no formulário
          </div>
        </div>

        {/* KPI 4: Usuários do Sistema */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Usuários de Acesso</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginTop: '6px', marginBottom: '2px' }}>
                {loading ? <Loader2 className="spin" size={20} /> : usuariosCount}
              </h2>
            </div>
            <div style={{ background: 'rgba(251, 146, 60, 0.15)', color: '#fb923c', padding: '10px', borderRadius: '12px' }}>
              <Shield size={24} />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '12px' }}>
            Contas de acesso cadastradas
          </div>
        </div>

      </div>

      {/* Grid Médio: Distribuição de Cargos & Cidades */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        
        {/* Painel Top Cargos */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase size={20} color="#c084fc" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Principais Cargos na Equipe</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Qtd. Pessoas</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              <Loader2 className="spin" size={20} /> Carregando estatísticas...
            </div>
          ) : topCargos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)', fontSize: '0.88rem' }}>
              Nenhum colaborador cadastrado ainda.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topCargos.map(([cargoNome, count], idx) => {
                const pct = totalColaboradores > 0 ? Math.round((count / totalColaboradores) * 100) : 0;
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '75%' }}>
                        {cargoNome}
                      </span>
                      <span style={{ color: '#c084fc', fontWeight: 700 }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', height: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #a855f7 0%, #38bdf8 100%)',
                          borderRadius: '6px',
                          transition: 'width 0.6s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Painel Distribuição Geográfica */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={20} color="#38bdf8" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Concentração por Cidade</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Cidades</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              <Loader2 className="spin" size={20} /> Carregando cidades...
            </div>
          ) : topCidades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)', fontSize: '0.88rem' }}>
              Nenhum endereço de colaborador informado.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {topCidades.map(([cidadeEstado, count], idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.5)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '6px', borderRadius: '8px' }}>
                      <MapPin size={16} />
                    </div>
                    <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>{cidadeEstado}</span>
                  </div>
                  <span style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                    {count} {count === 1 ? 'pessoa' : 'pessoas'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Painel Inferior: Últimas Adições */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={18} color="#34d399" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Últimos Colaboradores Cadastrados</h3>
          </div>
          <button
            onClick={() => navigate('/colaboradores')}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            Ver todos <ChevronRight size={14} />
          </button>
        </div>

        <div className="table-flex-wrapper" style={{ overflowX: 'hidden' }}>
          <table className="custom-table" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '220px' }}>Colaborador</th>
                <th style={{ width: '200px' }}>Cargo</th>
                <th style={{ width: '180px' }}>Cidade / UF</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '30px' }}>
                    <Loader2 className="spin" size={20} /> Carregando colaboradores recentes...
                  </td>
                </tr>
              ) : ultimosColaboradores.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                    Nenhum colaborador registrado até o momento.
                  </td>
                </tr>
              ) : (
                ultimosColaboradores.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          {c.foto_url ? (
                            <img src={c.foto_url} alt={c.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <User size={16} color="#818cf8" />
                          )}
                        </div>
                        <span style={{ fontWeight: 600, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                        {c.cargo || '-'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        {c.cidade ? `${c.cidade} - ${c.estado || ''}` : '-'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {c.ativo !== false ? (
                        <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                          Ativo
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(251, 113, 133, 0.15)', color: '#fb7185', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                          Inativo
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
