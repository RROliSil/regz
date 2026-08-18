import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FileBarChart,
  Printer,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

interface Colaborador {
  id: number;
  nome: string;
  cpf?: string | null;
  email?: string | null;
  telefone?: string | null;
  cargo?: string | null;
  cbo_codigo?: string | null;
  cidade?: string | null;
  estado?: string | null;
  ativo: boolean;
  campos_customizados?: Record<string, any>;
  criado_em?: string;
}

interface CampoCustomizado {
  id: number;
  nome: string;
  tipo: string;
  opcoes?: string | null;
}

interface PerfilAcesso {
  id: number;
  nome: string;
  is_admin: boolean;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
  perfil?: PerfilAcesso;
}

type TipoRelatorio = 'headcount' | 'campos' | 'geo' | 'rbac';

export const Relatorios: React.FC = () => {
  const { token } = useAuth();

  const [tipo, setTipo] = useState<TipoRelatorio>('headcount');
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [campos, setCampos] = useState<CampoCustomizado[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);

  // Disparar rotação de 360 graus ao clicar
  const handleAtualizarClique = () => {
    setIsSpinning(true);
    carregarDados();
    setTimeout(() => setIsSpinning(false), 650);
  };

  // Filtros
  const [search, setSearch] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [filtroCargo, setFiltroCargo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Carregar dados da API
  const carregarDados = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [colabRes, camposRes, userRes] = await Promise.all([
        fetch('/api/colaboradores', { headers }),
        fetch('/api/campos', { headers }),
        fetch('/api/usuarios', { headers })
      ]);

      if (colabRes.ok) {
        const data = await colabRes.json();
        setColaboradores(Array.isArray(data) ? data : []);
      }
      if (camposRes.ok) {
        const data = await camposRes.json();
        setCampos(Array.isArray(data) ? data : []);
      }
      if (userRes.ok) {
        const data = await userRes.json();
        setUsuarios(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados para relatórios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [token]);

  // Lista de cargos e estados únicos para os filtros
  const listaCargos = useMemo(() => {
    const set = new Set<string>();
    colaboradores.forEach(c => {
      if (c.cargo) set.add(c.cargo);
    });
    return Array.from(set).sort();
  }, [colaboradores]);

  const listaEstados = useMemo(() => {
    const set = new Set<string>();
    colaboradores.forEach(c => {
      if (c.estado) set.add(c.estado);
    });
    return Array.from(set).sort();
  }, [colaboradores]);

  // Filtragem dos Colaboradores
  const colaboradoresFiltrados = useMemo(() => {
    return colaboradores.filter(c => {
      // Status
      if (filtroStatus === 'ativos' && c.ativo === false) return false;
      if (filtroStatus === 'inativos' && c.ativo !== false) return false;

      // Cargo
      if (filtroCargo !== 'todos' && c.cargo !== filtroCargo) return false;

      // Estado
      if (filtroEstado !== 'todos' && c.estado !== filtroEstado) return false;

      // Busca por nome, email ou cidade
      if (search.trim() !== '') {
        const query = search.toLowerCase();
        const nomeMatch = c.nome.toLowerCase().includes(query);
        const emailMatch = (c.email || '').toLowerCase().includes(query);
        const cidadeMatch = (c.cidade || '').toLowerCase().includes(query);
        const cargoMatch = (c.cargo || '').toLowerCase().includes(query);
        if (!nomeMatch && !emailMatch && !cidadeMatch && !cargoMatch) return false;
      }

      return true;
    });
  }, [colaboradores, filtroStatus, filtroCargo, filtroEstado, search]);

  // Exportar para CSV / Excel
  const exportarCSV = () => {
    let headersCSV: string[] = [];
    let rowsCSV: string[][] = [];

    if (tipo === 'headcount') {
      headersCSV = ['ID', 'Nome', 'CPF', 'E-mail', 'Telefone', 'Cargo / Função', 'CBO', 'Cidade', 'Estado', 'Status'];
      rowsCSV = colaboradoresFiltrados.map(c => [
        String(c.id),
        c.nome,
        c.cpf || '',
        c.email || '',
        c.telefone || '',
        c.cargo || '',
        c.cbo_codigo || '',
        c.cidade || '',
        c.estado || '',
        c.ativo !== false ? 'Ativo' : 'Inativo'
      ]);
    } else if (tipo === 'campos') {
      const nomesCampos = campos.map(cmp => cmp.nome);
      headersCSV = ['ID', 'Nome Colaborador', 'Cargo', ...nomesCampos];
      rowsCSV = colaboradoresFiltrados.map(c => {
        const valoresCustom = campos.map(cmp => {
          const val = c.campos_customizados?.[cmp.nome];
          if (val === true) return 'Sim';
          if (val === false) return 'Não';
          return val !== undefined && val !== null ? String(val) : '-';
        });
        return [String(c.id), c.nome, c.cargo || '', ...valoresCustom];
      });
    } else if (tipo === 'geo') {
      headersCSV = ['Estado (UF)', 'Cidade', 'Total Colaboradores Ativos'];
      const mapGeo: Record<string, number> = {};
      colaboradoresFiltrados.filter(c => c.ativo !== false).forEach(c => {
        const key = `${c.estado || 'UF'} | ${c.cidade || 'Não Informada'}`;
        mapGeo[key] = (mapGeo[key] || 0) + 1;
      });
      rowsCSV = Object.entries(mapGeo).map(([key, count]) => {
        const [uf, cid] = key.split(' | ');
        return [uf, cid, String(count)];
      });
    } else if (tipo === 'rbac') {
      headersCSV = ['ID Usuário', 'Nome do Usuário', 'E-mail', 'Perfil de Acesso', 'Status'];
      rowsCSV = usuarios.map(u => [
        String(u.id),
        u.nome,
        u.email,
        u.perfil?.nome || 'Sem Perfil',
        u.ativo !== false ? 'Ativo' : 'Inativo'
      ]);
    }

    // Criar conteúdo em formato CSV com suporte UTF-8 BOM
    const content = [headersCSV.join(';'), ...rowsCSV.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${tipo}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Imprimir / Baixar em PDF Executivo
  const imprimirPDF = () => {
    window.print();
  };

  return (
    <div className="relatorios-container" style={{ padding: '28px 32px', width: '100%', boxSizing: 'border-box' }}>
      {/* Cabeçalho da Página (Oculto na Impressão) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileBarChart size={32} color="#6366f1" /> Painel de Relatórios & Exportações
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Gere visões consolidadas e exporte dados em PDF Executivo, Excel ou CSV.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Seletor Dropdown de Tipo de Relatório */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--card-bg)', padding: '6px 14px', borderRadius: '12px', border: '1px solid var(--accent-purple)' }}>
            <FileBarChart size={18} color="#818cf8" />
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value as TipoRelatorio)}
              className="relatorio-type-select"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.92rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer',
                paddingRight: '8px'
              }}
            >
              <option value="headcount">📋 Quadro de Colaboradores (Headcount)</option>
              <option value="campos">🧩 Campos Personalizados</option>
              <option value="geo">🗺️ Distribuição Geográfica (Cidades & UFs)</option>
              <option value="rbac">🔒 Usuários e Perfis (RBAC)</option>
            </select>
          </div>

          <button onClick={handleAtualizarClique} className="btn-secondary btn-relatorio-sec btn-icon-refresh" title="Atualizar Dados">
            <RefreshCw size={16} className={isSpinning || loading ? "spin-360" : ""} />
          </button>
          <button onClick={exportarCSV} className="btn-secondary btn-export-excel" title="Exportar Tabela para Excel/CSV">
            <FileSpreadsheet size={16} /> Exportar Excel (CSV)
          </button>
          <button onClick={imprimirPDF} className="btn-primary" title="Imprimir ou Salvar em PDF A4">
            <Printer size={16} /> PDF / Imprimir
          </button>
        </div>
      </div>

      {/* Painel de Filtros (Oculto na Impressão) */}
      {tipo !== 'rbac' && (
        <div className="glass-panel no-print" style={{ padding: '18px 24px', borderRadius: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }} className="search-box">
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Filtrar por Nome, E-mail ou Cidade..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', color: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={16} color="var(--text-muted)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
                <select
                  value={filtroStatus}
                  onChange={e => setFiltroStatus(e.target.value as any)}
                  className="custom-select-small"
                >
                  <option value="todos">Todos</option>
                  <option value="ativos">Apenas Ativos</option>
                  <option value="inativos">Apenas Inativos</option>
                </select>
              </div>

              {listaCargos.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cargo:</span>
                  <select
                    value={filtroCargo}
                    onChange={e => setFiltroCargo(e.target.value)}
                    className="custom-select-small"
                  >
                    <option value="todos">Todos os Cargos ({listaCargos.length})</option>
                    {listaCargos.map(cargo => (
                      <option key={cargo} value={cargo}>{cargo}</option>
                    ))}
                  </select>
                </div>
              )}

              {listaEstados.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estado:</span>
                  <select
                    value={filtroEstado}
                    onChange={e => setFiltroEstado(e.target.value)}
                    className="custom-select-small"
                  >
                    <option value="todos">Todos os UFs ({listaEstados.length})</option>
                    {listaEstados.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ÁREA DE IMPRESSÃO / PRÉ-VISUALIZAÇÃO DO RELATÓRIO */}
      <div className="printable-report-area glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
        {/* Cabeçalho exclusivo para a impressão em PDF */}
        <div className="pdf-header-only" style={{ marginBottom: '20px', borderBottom: '2px solid #6366f1', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '1.6rem', color: '#0f172a', margin: 0 }}>REGZ GESTÃO DE PESSOAS</h2>
          <p style={{ fontSize: '0.9rem', color: '#475569', margin: '4px 0' }}>
            Relatório de {tipo === 'headcount' ? 'Quadro de Colaboradores' : tipo === 'campos' ? 'Campos Personalizados' : tipo === 'geo' ? 'Distribuição Geográfica' : 'Usuários e Permissões (RBAC)'}
          </p>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Gerado em: {new Date().toLocaleString('pt-BR')}</span>
        </div>

        {/* Resumo de Indicadores da Pré-visualização */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {tipo === 'headcount' && 'Relatório do Quadro de Colaboradores'}
              {tipo === 'campos' && 'Relatório de Campos Personalizados'}
              {tipo === 'geo' && 'Relatório de Distribuição Geográfica'}
              {tipo === 'rbac' && 'Relatório de Usuários do Sistema (RBAC)'}
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Total de registros listados: <strong>{tipo === 'rbac' ? usuarios.length : colaboradoresFiltrados.length}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
            {tipo !== 'rbac' && (
              <>
                <span style={{ color: '#34d399', fontWeight: 600 }}>
                  ● {colaboradoresFiltrados.filter(c => c.ativo !== false).length} Ativos
                </span>
                <span style={{ color: '#fb7185', fontWeight: 600 }}>
                  ● {colaboradoresFiltrados.filter(c => c.ativo === false).length} Inativos
                </span>
              </>
            )}
          </div>
        </div>

        {/* Tabela do Relatório Selecionado */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <RefreshCw className="spin" size={28} color="#6366f1" style={{ marginBottom: '8px' }} />
            <p>Carregando registros do relatório...</p>
          </div>
        ) : (
          <div className="table-flex-wrapper" style={{ overflowX: 'auto' }}>
            {/* TIPO 1: HEADCOUNT */}
            {tipo === 'headcount' && (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>ID</th>
                    <th>Nome do Colaborador</th>
                    <th>CPF</th>
                    <th>Cargo / Função</th>
                    <th>Cidade / UF</th>
                    <th style={{ textAlign: 'center', width: '100px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {colaboradoresFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        Nenhum colaborador encontrado com os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    colaboradoresFiltrados.map(c => (
                      <tr key={c.id}>
                        <td>#{c.id}</td>
                        <td style={{ fontWeight: 600 }}>{c.nome}</td>
                        <td>{c.cpf || '-'}</td>
                        <td>
                          <span className="cargo-badge" style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>
                            {c.cargo || 'Não definido'}
                          </span>
                        </td>
                        <td>{c.cidade ? `${c.cidade} - ${c.estado || ''}` : '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            color: c.ativo !== false ? '#34d399' : '#fb7185',
                            fontWeight: 700,
                            fontSize: '0.78rem'
                          }}>
                            {c.ativo !== false ? 'ATIVO' : 'INATIVO'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* TIPO 2: CAMPOS PERSONALIZADOS */}
            {tipo === 'campos' && (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Colaborador</th>
                    <th>Cargo</th>
                    {campos.map(cmp => (
                      <th key={cmp.id}>{cmp.nome}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {colaboradoresFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={campos.length + 2} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  ) : (
                    colaboradoresFiltrados.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.nome}</td>
                        <td>{c.cargo || '-'}</td>
                        {campos.map(cmp => {
                          const val = c.campos_customizados?.[cmp.nome];
                          return (
                            <td key={cmp.id}>
                              {val === true ? (
                                <span style={{ color: '#34d399', fontWeight: 600 }}>✓ Sim</span>
                              ) : val === false ? (
                                <span style={{ color: '#fb7185' }}>✗ Não</span>
                              ) : (
                                val !== undefined && val !== null ? String(val) : '-'
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* TIPO 3: DISTRIBUIÇÃO GEOGRÁFICA */}
            {tipo === 'geo' && (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Estado (UF)</th>
                    <th>Cidade / Município</th>
                    <th style={{ textAlign: 'right' }}>Total de Colaboradores Ativos</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const mapGeo: Record<string, number> = {};
                    colaboradoresFiltrados.filter(c => c.ativo !== false).forEach(c => {
                      const key = `${c.estado || 'UF sem cadastro'} | ${c.cidade || 'Cidade não informada'}`;
                      mapGeo[key] = (mapGeo[key] || 0) + 1;
                    });
                    const entries = Object.entries(mapGeo).sort((a, b) => b[1] - a[1]);

                    if (entries.length === 0) {
                      return (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                            Nenhum registro geográfico localizado.
                          </td>
                        </tr>
                      );
                    }

                    return entries.map(([key, count]) => {
                      const [uf, cid] = key.split(' | ');
                      return (
                        <tr key={key}>
                          <td style={{ fontWeight: 700, color: 'var(--accent-purple)' }}>{uf}</td>
                          <td>{cid}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>{count} colaboradores</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            )}

            {/* TIPO 4: USUÁRIOS E RBAC */}
            {tipo === 'rbac' && (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>ID</th>
                    <th>Nome do Usuário</th>
                    <th>E-mail</th>
                    <th>Perfil de Acesso</th>
                    <th style={{ textAlign: 'center', width: '100px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td style={{ fontWeight: 600 }}>{u.nome}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge-perfil ${u.perfil?.is_admin ? 'admin' : u.perfil?.nome.toLowerCase().includes('rh') ? 'gestor-rh' : u.perfil?.nome.toLowerCase().includes('operador') ? 'operador' : u.perfil?.nome.toLowerCase().includes('consulta') ? 'consulta' : 'outro'}`}>
                          {u.perfil?.nome || 'Sem Perfil'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ color: u.ativo !== false ? '#34d399' : '#fb7185', fontWeight: 700, fontSize: '0.78rem' }}>
                          {u.ativo !== false ? 'ATIVO' : 'INATIVO'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
