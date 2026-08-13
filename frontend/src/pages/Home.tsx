import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, UserPlus, MapPin, Loader2, User, ChevronRight, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Colaborador } from '../types/colaborador';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de controle de alternância e expansão
  const [geoMode, setGeoMode] = useState<'cidades' | 'estados'>('cidades');
  const [expandedCargos, setExpandedCargos] = useState(false);
  const [expandedGeo, setExpandedGeo] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const colabRes = await fetch('/api/colaboradores');
        if (colabRes.ok) {
          const colabData = await colabRes.json();
          setColaboradores(colabData);
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

  const sortedCargos = Object.entries(cargosMap).sort((a, b) => b[1] - a[1]);
  const visibleCargos = expandedCargos ? sortedCargos : sortedCargos.slice(0, 5);

  // Distribuição por Cidade e por Estado
  const cidadesMap: Record<string, number> = {};
  const estadosMap: Record<string, number> = {};

  colaboradores.forEach(c => {
    if (c.cidade) {
      const citState = `${c.cidade} - ${c.estado || 'UF'}`;
      cidadesMap[citState] = (cidadesMap[citState] || 0) + 1;
    }
    if (c.estado) {
      const ufName = c.estado.toUpperCase();
      estadosMap[ufName] = (estadosMap[ufName] || 0) + 1;
    }
  });

  const sortedCidades = Object.entries(cidadesMap).sort((a, b) => b[1] - a[1]);
  const sortedEstados = Object.entries(estadosMap).sort((a, b) => b[1] - a[1]);

  const geoList = geoMode === 'cidades' ? sortedCidades : sortedEstados;
  const visibleGeoList = expandedGeo ? geoList : geoList.slice(0, 4);

  // Últimos 5 colaboradores cadastrados
  const ultimosColaboradores = [...colaboradores].slice(0, 5);

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
      </header>

      {/* Card 1: Total Colaboradores (com atalho para criar colaborador) */}
      <div style={{ marginBottom: '28px' }}>
        <div className="glass-panel" style={{ padding: '20px', maxWidth: '360px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Colaboradores</span>
              <h2 className="total-colaboradores-num" style={{ fontSize: '2rem', fontWeight: 800, marginTop: '6px', marginBottom: '2px' }}>
                {loading ? <Loader2 className="spin" size={20} /> : totalColaboradores}
              </h2>
            </div>

            {/* Botão de Ícone Novo Colaborador para abrir diretamente a janela de cadastro */}
            <button
              onClick={() => navigate('/colaboradores', { state: { openNewModal: true, returnToHome: true } })}
              className="btn-icon-primary"
              title="Cadastrar Novo Colaborador"
              style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0 }}
            >
              <UserPlus size={20} />
            </button>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '12px', display: 'flex', gap: '12px' }}>
            <span
              onClick={() => navigate('/colaboradores', { state: { subTab: 'ativos', searchTerm: '' } })}
              style={{ color: '#34d399', fontWeight: 600, cursor: 'pointer' }}
              title="Ver colaboradores ativos"
            >
              ● {colaboradoresAtivos} Ativos
            </span>
            {colaboradoresInativos > 0 && (
              <span
                onClick={() => navigate('/colaboradores', { state: { subTab: 'inativos', searchTerm: '' } })}
                style={{ color: '#fb7185', fontWeight: 600, cursor: 'pointer' }}
                title="Ver colaboradores inativos"
              >
                ● {colaboradoresInativos} Inativos
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card 2: Meio - Últimos Colaboradores Cadastrados */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', marginBottom: '28px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={18} color="#34d399" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Últimos Colaboradores Cadastrados</h3>
          </div>
          <button
            onClick={() => navigate('/colaboradores')}
            className="btn-secondary btn-ver-todos"
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
                  <tr
                    key={c.id}
                    className="clickable-row"
                    onClick={() => navigate('/colaboradores', { state: { editColaborador: c, returnToHome: true } })}
                    title="Clique para abrir e editar o cadastro deste colaborador"
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          {c.foto_url ? (
                            <img src={c.foto_url} alt={c.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <User size={16} color="#818cf8" />
                          )}
                        </div>
                        <span className="colaborador-nome" style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</span>
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
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <span className="badge-novo">Novo</span>
                        <span
                          className={c.ativo !== false ? "status-dot-active" : "status-dot-inactive"}
                          title={c.ativo !== false ? "Status: Ativo" : "Status: Inativo"}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid Inferior: Distribuição de Cargos & Cidades/Estados (alignItems: 'start' para isolar a altura ao expandir) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* Card 3: Cargos na Equipe */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Briefcase size={20} color="#c084fc" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Cargos na Equipe</h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Qtd. Pessoas</span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                <Loader2 className="spin" size={20} /> Carregando estatísticas...
              </div>
            ) : sortedCargos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)', fontSize: '0.88rem' }}>
                Nenhum colaborador cadastrado ainda.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {visibleCargos.map(([cargoNome, count], idx) => {
                  const pct = totalColaboradores > 0 ? Math.round((count / totalColaboradores) * 100) : 0;
                  return (
                    <div
                      key={idx}
                      onClick={() => navigate('/colaboradores', { state: { subTab: 'ativos', searchTerm: cargoNome } })}
                      style={{ cursor: 'pointer' }}
                      title={`Filtrar colaboradores no cargo ${cargoNome}`}
                    >
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
                            background: 'linear-gradient(90deg, #a855f7 0%, #5e5eee 100%)',
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

          {/* Botão de Expansão / Recolhimento no canto inferior direito do card */}
          {sortedCargos.length > 5 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <button
                onClick={() => setExpandedCargos(!expandedCargos)}
                className="btn-ver-todos"
                style={{
                  background: 'rgba(168, 85, 247, 0.12)',
                  color: '#c084fc',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                title={expandedCargos ? "Recolher e mostrar principais cargos" : "Expandir e ver todos os cargos"}
              >
                {expandedCargos ? 'Recolher' : `Ver todos (${sortedCargos.length})`}
                {expandedCargos ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          )}
        </div>

        {/* Card 4: Concentração Geográfica (Cidades / Estados) */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={20} color="#5e5eee" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {geoMode === 'cidades' ? 'Colaboradores por Cidade' : 'Colaboradores por Estado'}
                </h3>
              </div>

              {/* Botão Clicável Cidades <-> Estados com Setinha Dupla Rotacionável */}
              <button
                onClick={() => setGeoMode(prev => prev === 'cidades' ? 'estados' : 'cidades')}
                className="btn-geo-mode"
                title={`Clique para alternar para ${geoMode === 'cidades' ? 'Estados' : 'Cidades'}`}
              >
                {geoMode === 'cidades' ? 'Cidades' : 'Estados'}
                <ArrowUpDown
                  size={14}
                  style={{
                    transition: 'transform 0.3s ease',
                    transform: geoMode === 'estados' ? 'rotate(180deg)' : 'none'
                  }}
                />
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                <Loader2 className="spin" size={20} /> Carregando dados geográficos...
              </div>
            ) : geoList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)', fontSize: '0.88rem' }}>
                Nenhum endereço de colaborador informado.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {visibleGeoList.map(([itemLabel, count], idx) => {
                  const searchTermToApply = geoMode === 'cidades' ? itemLabel.split(' - ')[0] : itemLabel;
                  return (
                    <div
                      key={idx}
                      className="geo-item-row"
                      onClick={() => navigate('/colaboradores', { state: { subTab: 'ativos', searchTerm: searchTermToApply } })}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.5)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer' }}
                      title={`Filtrar colaboradores em ${itemLabel}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="geo-pin-icon">
                          <MapPin size={16} />
                        </div>
                        <span className="geo-item-name" style={{ fontWeight: 600, fontSize: '0.9rem' }}>{itemLabel}</span>
                      </div>
                      <span className="geo-count-badge">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botão de Expansão / Recolhimento no canto inferior direito do card */}
          {geoList.length > 4 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <button
                onClick={() => setExpandedGeo(!expandedGeo)}
                className="btn-ver-todos"
                style={{
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#5e5eee',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                title={expandedGeo ? "Recolher lista" : "Expandir e ver todos os locais"}
              >
                {expandedGeo ? 'Recolher' : `Ver todos (${geoList.length})`}
                {expandedGeo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
