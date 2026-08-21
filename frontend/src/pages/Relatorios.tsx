import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import {
  FileBarChart,
  Printer,
  Search,
  RefreshCw,
  FileSpreadsheet,
  Columns,
  ChevronDown,
  RotateCcw
} from 'lucide-react';

interface Colaborador {
  id: number;
  nome: string;
  cpf?: string | null;
  email?: string | null;
  telefone?: string | null;
  cargo?: string | null;
  cbo_codigo?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  foto_url?: string | null;
  ativo: boolean;
  campos_customizados?: Record<string, any>;
  valores_customizados?: Record<string, any>;
  criado_em?: string;
}

interface CampoCustomizado {
  id: number;
  nome: string;
  tipo: string;
  opcoes?: string | null;
  obrigatorio?: boolean;
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
  const { showSnackbar } = useSnackbar();

  const [tipo, setTipo] = useState<TipoRelatorio>('headcount');
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [campos, setCampos] = useState<CampoCustomizado[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);

  // Filtros Avançados
  const [search, setSearch] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [filtroCargo, setFiltroCargo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCidade, setFiltroCidade] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroCampoId, setFiltroCampoId] = useState<string>('todos');
  const [filtroCampoValor, setFiltroCampoValor] = useState('');
  const [ordenacao, setOrdenacao] = useState<'nome_asc' | 'nome_desc' | 'id_desc' | 'id_asc' | 'data_desc' | 'data_asc'>('nome_asc');

  // Estado do Dropdown de Colunas Visíveis
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);

  // Configuração de Colunas Visíveis para cada Relatório
  const [headcountCols, setHeadcountCols] = useState<{ [key: string]: boolean }>({
    id: true,
    foto: true,
    nome: true,
    cpf: true,
    cargo: true,
    cbo: false,
    endereco: false,
    cidade_uf: true,
    criado_em: true,
    status: true
  });

  const [camposBaseCols, setCamposBaseCols] = useState<{ [key: string]: boolean }>({
    id: true,
    nome: true,
    cargo: true,
    cidade_uf: false,
    status: false
  });

  // Mapa de visibilidade individual de cada campo personalizado (id -> boolean)
  const [camposCustomVisiveis, setCamposCustomVisiveis] = useState<{ [key: number]: boolean }>({});

  const [geoCols, setGeoCols] = useState<{ [key: string]: boolean }>({
    estado: true,
    cidade: true,
    ativos: true,
    inativos: true,
    total: true,
    percentual: true
  });

  const [rbacCols, setRbacCols] = useState<{ [key: string]: boolean }>({
    id: true,
    nome: true,
    email: true,
    perfil: true,
    tipo: true,
    status: true
  });

  // Carregar dados da API
  const carregarDados = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [colabRes, camposRes, userRes] = await Promise.all([
        fetch('/api/colaboradores', { headers }),
        fetch('/api/campos-customizados', { headers }),
        fetch('/api/usuarios', { headers })
      ]);

      if (colabRes.ok) {
        const data = await colabRes.json();
        setColaboradores(Array.isArray(data) ? data : []);
      }
      if (camposRes.ok) {
        const data = await camposRes.json();
        const listaCampos: CampoCustomizado[] = Array.isArray(data) ? data : [];
        setCampos(listaCampos);

        // Inicializar todos os campos personalizados como visíveis por padrão
        const mapa: { [key: number]: boolean } = {};
        listaCampos.forEach(c => {
          mapa[c.id] = true;
        });
        setCamposCustomVisiveis(mapa);
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

  // Disparar rotação de 360 graus ao clicar no atualizar
  const handleAtualizarClique = () => {
    setIsSpinning(true);
    carregarDados();
    showSnackbar('Dados do relatório atualizados com sucesso!', 'info');
    setTimeout(() => setIsSpinning(false), 650);
  };

  // Resetar todos os filtros
  const handleResetFiltros = () => {
    setSearch('');
    setFiltroStatus('todos');
    setFiltroCargo('todos');
    setFiltroEstado('todos');
    setFiltroCidade('todos');
    setDataInicio('');
    setDataFim('');
    setFiltroCampoId('todos');
    setFiltroCampoValor('');
    setOrdenacao('nome_asc');
    showSnackbar('Filtros redefinidos para o padrão!', 'info');
  };

  // Lista de cargos únicos
  const listaCargos = useMemo(() => {
    const set = new Set<string>();
    colaboradores.forEach(c => {
      if (c.cargo && c.cargo.trim()) set.add(c.cargo.trim());
    });
    return Array.from(set).sort();
  }, [colaboradores]);

  // Lista de estados (UFs) únicos
  const listaEstados = useMemo(() => {
    const set = new Set<string>();
    colaboradores.forEach(c => {
      if (c.estado && c.estado.trim()) set.add(c.estado.trim().toUpperCase());
    });
    return Array.from(set).sort();
  }, [colaboradores]);

  // Lista de cidades dependente do estado selecionado
  const listaCidades = useMemo(() => {
    const set = new Set<string>();
    colaboradores.forEach(c => {
      if (filtroEstado !== 'todos' && c.estado?.toUpperCase().trim() !== filtroEstado) {
        return;
      }
      if (c.cidade && c.cidade.trim()) set.add(c.cidade.trim());
    });
    return Array.from(set).sort();
  }, [colaboradores, filtroEstado]);

  // Helper para obter e formatar o valor de um campo customizado
  const getCustomFieldValue = (c: Colaborador, cmp: CampoCustomizado): string => {
    const rawVal = c.campos_customizados?.[cmp.nome] ??
                   c.valores_customizados?.[cmp.id] ??
                   c.valores_customizados?.[String(cmp.id)];

    if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
      return '-';
    }

    const strVal = String(rawVal).trim();
    if (rawVal === true || strVal === 'true' || strVal.toLowerCase() === 'sim') {
      return 'Sim';
    }
    if (rawVal === false || strVal === 'false' || strVal.toLowerCase() === 'não' || strVal.toLowerCase() === 'nao') {
      return 'Não';
    }

    return strVal;
  };

  // Filtragem e Ordenação dos Colaboradores
  const colaboradoresFiltrados = useMemo(() => {
    const filtrados = colaboradores.filter(c => {
      // 1. Status
      if (filtroStatus === 'ativos' && c.ativo === false) return false;
      if (filtroStatus === 'inativos' && c.ativo !== false) return false;

      // 2. Cargo
      if (filtroCargo !== 'todos' && c.cargo?.trim() !== filtroCargo) return false;

      // 3. Estado
      if (filtroEstado !== 'todos' && c.estado?.trim().toUpperCase() !== filtroEstado) return false;

      // 4. Cidade
      if (filtroCidade !== 'todos' && c.cidade?.trim() !== filtroCidade) return false;

      // 5. Período / Data de Cadastro
      if (dataInicio && c.criado_em) {
        const dataColab = c.criado_em.slice(0, 10);
        if (dataColab < dataInicio) return false;
      }
      if (dataFim && c.criado_em) {
        const dataColab = c.criado_em.slice(0, 10);
        if (dataColab > dataFim) return false;
      }

      // 6. Filtro por Campo Personalizado Específico
      if (filtroCampoId !== 'todos') {
        const campoAlvo = campos.find(cmp => String(cmp.id) === filtroCampoId);
        if (campoAlvo) {
          const valColab = getCustomFieldValue(c, campoAlvo);
          if (filtroCampoValor.trim() !== '') {
            if (!valColab.toLowerCase().includes(filtroCampoValor.toLowerCase().trim())) {
              return false;
            }
          } else {
            if (valColab === '-') return false;
          }
        }
      }

      // 7. Busca Textual Geral
      if (search.trim() !== '') {
        const q = search.toLowerCase();
        const matchNome = c.nome.toLowerCase().includes(q);
        const matchCpf = (c.cpf || '').includes(q);
        const matchEmail = (c.email || '').toLowerCase().includes(q);
        const matchCargo = (c.cargo || '').toLowerCase().includes(q);
        const matchCidade = (c.cidade || '').toLowerCase().includes(q);
        const matchLogradouro = (c.logradouro || '').toLowerCase().includes(q);
        const matchBairro = (c.bairro || '').toLowerCase().includes(q);
        if (!matchNome && !matchCpf && !matchEmail && !matchCargo && !matchCidade && !matchLogradouro && !matchBairro) {
          return false;
        }
      }

      return true;
    });

    // Ordenação
    return filtrados.sort((a, b) => {
      if (ordenacao === 'nome_asc') return a.nome.localeCompare(b.nome);
      if (ordenacao === 'nome_desc') return b.nome.localeCompare(a.nome);
      if (ordenacao === 'id_desc') return b.id - a.id;
      if (ordenacao === 'id_asc') return a.id - b.id;
      if (ordenacao === 'data_desc') return (b.criado_em || '').localeCompare(a.criado_em || '');
      if (ordenacao === 'data_asc') return (a.criado_em || '').localeCompare(b.criado_em || '');
      return 0;
    });
  }, [colaboradores, campos, filtroStatus, filtroCargo, filtroEstado, filtroCidade, dataInicio, dataFim, filtroCampoId, filtroCampoValor, search, ordenacao]);

  // Lista de campos personalizados ativos para exibição
  const camposExibicao = useMemo(() => {
    return campos.filter(c => camposCustomVisiveis[c.id] !== false);
  }, [campos, camposCustomVisiveis]);

  // Agrupamento Geográfico com contagens
  const dadosGeo = useMemo(() => {
    const mapGeo: Record<string, { estado: string; cidade: string; ativos: number; inativos: number; total: number }> = {};
    colaboradoresFiltrados.forEach(c => {
      const uf = (c.estado || 'Não Informado').toUpperCase().trim();
      const cid = c.cidade || 'Não Informada';
      const key = `${uf} | ${cid}`;
      if (!mapGeo[key]) {
        mapGeo[key] = { estado: uf, cidade: cid, ativos: 0, inativos: 0, total: 0 };
      }
      if (c.ativo !== false) {
        mapGeo[key].ativos += 1;
      } else {
        mapGeo[key].inativos += 1;
      }
      mapGeo[key].total += 1;
    });

    const totalHeadcount = colaboradoresFiltrados.length || 1;
    return Object.values(mapGeo)
      .map(item => ({
        ...item,
        percentual: ((item.total / totalHeadcount) * 100).toFixed(1) + '%'
      }))
      .sort((a, b) => b.total - a.total || a.estado.localeCompare(b.estado));
  }, [colaboradoresFiltrados]);

  // Exportar para CSV / Excel com sincronização estrita de colunas visíveis
  const exportarCSV = () => {
    let headersCSV: string[] = [];
    let rowsCSV: string[][] = [];

    if (tipo === 'headcount') {
      if (headcountCols.id) headersCSV.push('ID');
      if (headcountCols.nome) headersCSV.push('Nome do Colaborador');
      if (headcountCols.cpf) headersCSV.push('CPF');
      if (headcountCols.cargo) headersCSV.push('Cargo / Função');
      if (headcountCols.cbo) headersCSV.push('CBO');
      if (headcountCols.endereco) headersCSV.push('Endereço Completo');
      if (headcountCols.cidade_uf) headersCSV.push('Cidade / UF');
      if (headcountCols.criado_em) headersCSV.push('Data de Cadastro');
      if (headcountCols.status) headersCSV.push('Status');

      rowsCSV = colaboradoresFiltrados.map(c => {
        const row: string[] = [];
        if (headcountCols.id) row.push(String(c.id));
        if (headcountCols.nome) row.push(c.nome);
        if (headcountCols.cpf) row.push(c.cpf || '');
        if (headcountCols.cargo) row.push(c.cargo || '');
        if (headcountCols.cbo) row.push(c.cbo_codigo || '');
        if (headcountCols.endereco) row.push(`${c.logradouro || ''}, ${c.numero || 'S/N'} - ${c.bairro || ''}`);
        if (headcountCols.cidade_uf) row.push(c.cidade ? `${c.cidade}/${c.estado || ''}` : '');
        if (headcountCols.criado_em) row.push(c.criado_em ? new Date(c.criado_em).toLocaleDateString('pt-BR') : '');
        if (headcountCols.status) row.push(c.ativo !== false ? 'Ativo' : 'Inativo');
        return row;
      });
    } else if (tipo === 'campos') {
      if (camposBaseCols.id) headersCSV.push('ID');
      if (camposBaseCols.nome) headersCSV.push('Nome Colaborador');
      if (camposBaseCols.cargo) headersCSV.push('Cargo');
      if (camposBaseCols.cidade_uf) headersCSV.push('Cidade / UF');
      if (camposBaseCols.status) headersCSV.push('Status');

      camposExibicao.forEach(cmp => headersCSV.push(cmp.nome));

      rowsCSV = colaboradoresFiltrados.map(c => {
        const row: string[] = [];
        if (camposBaseCols.id) row.push(String(c.id));
        if (camposBaseCols.nome) row.push(c.nome);
        if (camposBaseCols.cargo) row.push(c.cargo || '');
        if (camposBaseCols.cidade_uf) row.push(c.cidade ? `${c.cidade}/${c.estado || ''}` : '');
        if (camposBaseCols.status) row.push(c.ativo !== false ? 'Ativo' : 'Inativo');

        camposExibicao.forEach(cmp => {
          row.push(getCustomFieldValue(c, cmp));
        });
        return row;
      });
    } else if (tipo === 'geo') {
      if (geoCols.estado) headersCSV.push('Estado (UF)');
      if (geoCols.cidade) headersCSV.push('Cidade / Município');
      if (geoCols.ativos) headersCSV.push('Colaboradores Ativos');
      if (geoCols.inativos) headersCSV.push('Colaboradores Inativos');
      if (geoCols.total) headersCSV.push('Total de Registros');
      if (geoCols.percentual) headersCSV.push('% do Headcount');

      rowsCSV = dadosGeo.map(g => {
        const row: string[] = [];
        if (geoCols.estado) row.push(g.estado);
        if (geoCols.cidade) row.push(g.cidade);
        if (geoCols.ativos) row.push(String(g.ativos));
        if (geoCols.inativos) row.push(String(g.inativos));
        if (geoCols.total) row.push(String(g.total));
        if (geoCols.percentual) row.push(g.percentual);
        return row;
      });
    } else if (tipo === 'rbac') {
      if (rbacCols.id) headersCSV.push('ID Usuário');
      if (rbacCols.nome) headersCSV.push('Nome do Usuário');
      if (rbacCols.email) headersCSV.push('E-mail');
      if (rbacCols.perfil) headersCSV.push('Perfil de Acesso');
      if (rbacCols.tipo) headersCSV.push('Tipo');
      if (rbacCols.status) headersCSV.push('Status');

      rowsCSV = usuarios.map(u => {
        const row: string[] = [];
        if (rbacCols.id) row.push(String(u.id));
        if (rbacCols.nome) row.push(u.nome);
        if (rbacCols.email) row.push(u.email);
        if (rbacCols.perfil) row.push(u.perfil?.nome || 'Sem Perfil');
        if (rbacCols.tipo) row.push(u.perfil?.is_admin ? 'Administrador' : 'Padrão');
        if (rbacCols.status) row.push(u.ativo !== false ? 'Ativo' : 'Inativo');
        return row;
      });
    }

    const content = [headersCSV.join(';'), ...rowsCSV.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${tipo}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSnackbar('Relatório exportado para Excel (CSV) com sucesso!', 'success');
  };

  const imprimirPDF = () => {
    window.print();
  };

  // Contagem de colunas ativas para o indicador do botão
  const totalColunasAtivas = useMemo(() => {
    if (tipo === 'headcount') {
      return Object.values(headcountCols).filter(Boolean).length;
    } else if (tipo === 'campos') {
      const base = Object.values(camposBaseCols).filter(Boolean).length;
      const custom = camposExibicao.length;
      return base + custom;
    } else if (tipo === 'geo') {
      return Object.values(geoCols).filter(Boolean).length;
    } else {
      return Object.values(rbacCols).filter(Boolean).length;
    }
  }, [tipo, headcountCols, camposBaseCols, camposExibicao, geoCols, rbacCols]);

  return (
    <div className="relatorios-container" style={{ padding: '28px 32px', width: '100%', boxSizing: 'border-box' }}>
      {/* Cabeçalho da Página (Oculto na Impressão) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <FileBarChart size={32} color="#6366f1" /> Painel de Relatórios & Exportações
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px', marginBottom: 0 }}>
            Gere visões consolidadas com filtros dinâmicos, controle total de colunas e exportação executiva em PDF e Excel.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Seletor de Tipo de Relatório */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--card-bg)', padding: '6px 14px', borderRadius: '12px', border: '1px solid var(--accent-purple)' }}>
            <FileBarChart size={18} color="#818cf8" />
            <select
              value={tipo}
              onChange={e => {
                setTipo(e.target.value as TipoRelatorio);
                setColumnsDropdownOpen(false);
              }}
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

          {/* Botão Dropdown de Colunas Visíveis */}
          <div className="dropdown-container" style={{ position: 'relative' }}>
            <button
              onClick={() => setColumnsDropdownOpen(!columnsDropdownOpen)}
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '0.88rem', fontWeight: 600 }}
              title="Exibir ou Ocultar Colunas no Relatório e Impressão"
            >
              <Columns size={16} color="#6366f1" />
              <span>Colunas ({totalColunasAtivas})</span>
              <ChevronDown size={14} />
            </button>

            {columnsDropdownOpen && (
              <div
                className="dropdown-menu glass-panel"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '280px',
                  maxHeight: '380px',
                  overflowY: 'auto',
                  padding: '14px 16px',
                  zIndex: 100,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(99, 102, 241, 0.3)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid var(--card-border)', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>
                    Colunas Visíveis
                  </span>
                </div>

                {/* Colunas do Tipo 1: Headcount */}
                {tipo === 'headcount' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { key: 'id', label: 'ID do Colaborador' },
                      { key: 'foto', label: 'Foto de Perfil' },
                      { key: 'nome', label: 'Nome Completo' },
                      { key: 'cpf', label: 'CPF' },
                      { key: 'cargo', label: 'Cargo / Função' },
                      { key: 'cbo', label: 'Código CBO' },
                      { key: 'endereco', label: 'Endereço Completo' },
                      { key: 'cidade_uf', label: 'Cidade / UF' },
                      { key: 'criado_em', label: 'Data de Cadastro' },
                      { key: 'status', label: 'Status (Ativo/Inativo)' }
                    ].map(col => (
                      <label key={col.key} className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={!!headcountCols[col.key]}
                          onChange={() => setHeadcountCols(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Colunas do Tipo 2: Campos Personalizados */}
                {tipo === 'campos' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Dados Base</div>
                    {[
                      { key: 'id', label: 'ID' },
                      { key: 'nome', label: 'Colaborador' },
                      { key: 'cargo', label: 'Cargo' },
                      { key: 'cidade_uf', label: 'Cidade / UF' },
                      { key: 'status', label: 'Status' }
                    ].map(col => (
                      <label key={col.key} className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={!!camposBaseCols[col.key]}
                          onChange={() => setCamposBaseCols(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid var(--card-border)', paddingTop: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Campos Dinâmicos</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const m: any = {};
                            campos.forEach(c => { m[c.id] = true; });
                            setCamposCustomVisiveis(m);
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Todos
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const m: any = {};
                            campos.forEach(c => { m[c.id] = false; });
                            setCamposCustomVisiveis(m);
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#fb7185', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Nenhum
                        </button>
                      </div>
                    </div>

                    {campos.map(cmp => (
                      <label key={cmp.id} className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={camposCustomVisiveis[cmp.id] !== false}
                          onChange={() => setCamposCustomVisiveis(prev => ({ ...prev, [cmp.id]: !prev[cmp.id] }))}
                        />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cmp.nome}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Colunas do Tipo 3: Geo */}
                {tipo === 'geo' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { key: 'estado', label: 'Estado (UF)' },
                      { key: 'cidade', label: 'Cidade / Município' },
                      { key: 'ativos', label: 'Colaboradores Ativos' },
                      { key: 'inativos', label: 'Colaboradores Inativos' },
                      { key: 'total', label: 'Total de Registros' },
                      { key: 'percentual', label: '% do Headcount' }
                    ].map(col => (
                      <label key={col.key} className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={!!geoCols[col.key]}
                          onChange={() => setGeoCols(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Colunas do Tipo 4: RBAC */}
                {tipo === 'rbac' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { key: 'id', label: 'ID do Usuário' },
                      { key: 'nome', label: 'Nome do Usuário' },
                      { key: 'email', label: 'E-mail' },
                      { key: 'perfil', label: 'Perfil de Acesso' },
                      { key: 'tipo', label: 'Tipo (Admin/Padrão)' },
                      { key: 'status', label: 'Status' }
                    ].map(col => (
                      <label key={col.key} className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={!!rbacCols[col.key]}
                          onChange={() => setRbacCols(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button onClick={exportarCSV} className="btn-secondary btn-export-excel" title="Exportar Tabela para Excel/CSV">
            <FileSpreadsheet size={16} /> Exportar Excel (CSV)
          </button>
          <button onClick={imprimirPDF} className="btn-primary" title="Imprimir ou Salvar em PDF A4">
            <Printer size={16} /> PDF / Imprimir
          </button>
        </div>
      </div>

      {/* PAINEL DE FILTROS AVANÇADOS (Oculto na Impressão) */}
      {tipo !== 'rbac' && (
        <div className="glass-panel no-print" style={{ padding: '20px 24px', borderRadius: '18px', marginBottom: '24px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
            {/* 1. Busca Geral */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Busca Rápida</label>
              <div className="search-box" style={{ width: '100%' }}>
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Nome, CPF, Cargo, Bairro..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', color: 'inherit' }}
                />
              </div>
            </div>

            {/* 2. Filtro de Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status do Colaborador</label>
              <select
                value={filtroStatus}
                onChange={e => setFiltroStatus(e.target.value as any)}
                className="custom-select-small"
                style={{ width: '100%', height: '40px' }}
              >
                <option value="todos">Todos os Status</option>
                <option value="ativos">🟢 Apenas Ativos</option>
                <option value="inativos">🔴 Apenas Inativos</option>
              </select>
            </div>

            {/* 3. Filtro de Cargo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cargo / Função</label>
              <select
                value={filtroCargo}
                onChange={e => setFiltroCargo(e.target.value)}
                className="custom-select-small"
                style={{ width: '100%', height: '40px' }}
              >
                <option value="todos">Todos os Cargos ({listaCargos.length})</option>
                {listaCargos.map(cargo => (
                  <option key={cargo} value={cargo}>{cargo}</option>
                ))}
              </select>
            </div>

            {/* 4. Filtro de Estado (UF) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estado (UF)</label>
              <select
                value={filtroEstado}
                onChange={e => {
                  setFiltroEstado(e.target.value);
                  setFiltroCidade('todos'); // reset cidade ao trocar UF
                }}
                className="custom-select-small"
                style={{ width: '100%', height: '40px' }}
              >
                <option value="todos">Todas as UFs ({listaEstados.length})</option>
                {listaEstados.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            {/* 5. Filtro de Cidade Dinâmica */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cidade / Município</label>
              <select
                value={filtroCidade}
                onChange={e => setFiltroCidade(e.target.value)}
                className="custom-select-small"
                style={{ width: '100%', height: '40px' }}
                disabled={listaCidades.length === 0}
              >
                <option value="todos">Todas as Cidades ({listaCidades.length})</option>
                {listaCidades.map(cid => (
                  <option key={cid} value={cid}>{cid}</option>
                ))}
              </select>
            </div>

            {/* 6. Período: Data Inicial */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cadastrado a partir de</label>
              <input
                type="date"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className="custom-select-small"
                style={{ width: '100%', height: '40px' }}
              />
            </div>

            {/* 7. Período: Data Final */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cadastrado até</label>
              <input
                type="date"
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
                className="custom-select-small"
                style={{ width: '100%', height: '40px' }}
              />
            </div>

            {/* 8. Filtro por Campo Personalizado Específico */}
            {campos.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Filtrar Campo Customizado</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    value={filtroCampoId}
                    onChange={e => setFiltroCampoId(e.target.value)}
                    className="custom-select-small"
                    style={{ flex: 1, height: '40px' }}
                  >
                    <option value="todos">Selecione um Campo...</option>
                    {campos.map(cmp => (
                      <option key={cmp.id} value={String(cmp.id)}>{cmp.nome}</option>
                    ))}
                  </select>

                  {filtroCampoId !== 'todos' && (
                    <input
                      type="text"
                      placeholder="Valor..."
                      value={filtroCampoValor}
                      onChange={e => setFiltroCampoValor(e.target.value)}
                      className="custom-select-small"
                      style={{ width: '100px', height: '40px' }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* 9. Ordenação & Botão Limpar */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ordenação</label>
                <select
                  value={ordenacao}
                  onChange={e => setOrdenacao(e.target.value as any)}
                  className="custom-select-small"
                  style={{ width: '100%', height: '40px' }}
                >
                  <option value="nome_asc">Nome (A - Z)</option>
                  <option value="nome_desc">Nome (Z - A)</option>
                  <option value="id_desc">ID (Mais Recente)</option>
                  <option value="id_asc">ID (Mais Antigo)</option>
                  <option value="data_desc">Data Cadastro (Decrescente)</option>
                  <option value="data_asc">Data Cadastro (Crescente)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleResetFiltros}
                className="btn-secondary"
                style={{ height: '40px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto' }}
                title="Limpar todos os filtros"
              >
                <RotateCcw size={16} /> Limpar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CARDS DE RESUMO E INDICADORES (Oculto na Impressão) */}
      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', borderLeft: '4px solid #6366f1' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Listados</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: '#f8fafc' }}>
            {tipo === 'rbac' ? usuarios.length : colaboradoresFiltrados.length}
          </div>
        </div>

        {tipo !== 'rbac' && (
          <>
            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', borderLeft: '4px solid #34d399' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Colaboradores Ativos</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: '#34d399' }}>
                {colaboradoresFiltrados.filter(c => c.ativo !== false).length}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', borderLeft: '4px solid #fb7185' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Colaboradores Inativos</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: '#fb7185' }}>
                {colaboradoresFiltrados.filter(c => c.ativo === false).length}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', borderLeft: '4px solid #38bdf8' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Cargos Únicos</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: '#38bdf8' }}>
                {listaCargos.length}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', borderLeft: '4px solid #fbbf24' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Municípios Atendidos</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: '#fbbf24' }}>
                {dadosGeo.length}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ÁREA DE IMPRESSÃO / PRÉ-VISUALIZAÇÃO DO RELATÓRIO */}
      <div className="printable-report-area glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
        {/* Cabeçalho exclusivo para a impressão em PDF */}
        <div className="pdf-header-only" style={{ marginBottom: '20px', borderBottom: '2px solid #6366f1', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '1.6rem', color: '#0f172a', margin: 0 }}>REGZ GESTÃO DE PESSOAS</h2>
          <p style={{ fontSize: '0.9rem', color: '#475569', margin: '4px 0' }}>
            Relatório de {tipo === 'headcount' ? 'Quadro de Colaboradores' : tipo === 'campos' ? 'Campos Personalizados' : tipo === 'geo' ? 'Distribuição Geográfica' : 'Usuários e Permissões (RBAC)'}
          </p>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Gerado em: {new Date().toLocaleString('pt-BR')} • {totalColunasAtivas} colunas ativas</span>
        </div>

        {/* Título do Relatório */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              {tipo === 'headcount' && 'Relatório do Quadro de Colaboradores'}
              {tipo === 'campos' && 'Relatório de Campos Personalizados'}
              {tipo === 'geo' && 'Relatório de Distribuição Geográfica'}
              {tipo === 'rbac' && 'Relatório de Usuários do Sistema (RBAC)'}
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Total de registros listados: <strong>{tipo === 'rbac' ? usuarios.length : tipo === 'geo' ? dadosGeo.length : colaboradoresFiltrados.length}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
            {tipo !== 'rbac' && tipo !== 'geo' && (
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
                    {headcountCols.id && <th style={{ width: '60px' }}>ID</th>}
                    {headcountCols.foto && <th style={{ width: '60px' }}>Foto</th>}
                    {headcountCols.nome && <th>Nome do Colaborador</th>}
                    {headcountCols.cpf && <th>CPF</th>}
                    {headcountCols.cargo && <th>Cargo / Função</th>}
                    {headcountCols.cbo && <th>CBO</th>}
                    {headcountCols.endereco && <th>Endereço Completo</th>}
                    {headcountCols.cidade_uf && <th>Cidade / UF</th>}
                    {headcountCols.criado_em && <th>Data Cadastro</th>}
                    {headcountCols.status && <th style={{ textAlign: 'center', width: '100px' }}>Status</th>}
                  </tr>
                </thead>
                <tbody>
                  {colaboradoresFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={totalColunasAtivas || 6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        Nenhum colaborador encontrado com os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    colaboradoresFiltrados.map(c => (
                      <tr key={c.id}>
                        {headcountCols.id && <td>#{c.id}</td>}
                        {headcountCols.foto && (
                          <td>
                            {c.foto_url ? (
                              <img src={c.foto_url} alt={c.nome} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontSize: '0.8rem', fontWeight: 700 }}>
                                {c.nome.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </td>
                        )}
                        {headcountCols.nome && <td style={{ fontWeight: 600 }}>{c.nome}</td>}
                        {headcountCols.cpf && <td>{c.cpf || '-'}</td>}
                        {headcountCols.cargo && (
                          <td>
                            <span className="cargo-badge" style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>
                              {c.cargo || 'Não definido'}
                            </span>
                          </td>
                        )}
                        {headcountCols.cbo && <td>{c.cbo_codigo || '-'}</td>}
                        {headcountCols.endereco && (
                          <td>
                            {c.logradouro ? `${c.logradouro}, ${c.numero || 'S/N'} - ${c.bairro || ''}` : '-'}
                          </td>
                        )}
                        {headcountCols.cidade_uf && <td>{c.cidade ? `${c.cidade} - ${c.estado || ''}` : '-'}</td>}
                        {headcountCols.criado_em && (
                          <td>
                            {c.criado_em ? new Date(c.criado_em).toLocaleDateString('pt-BR') : '-'}
                          </td>
                        )}
                        {headcountCols.status && (
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              color: c.ativo !== false ? '#34d399' : '#fb7185',
                              fontWeight: 700,
                              fontSize: '0.78rem'
                            }}>
                              {c.ativo !== false ? 'ATIVO' : 'INATIVO'}
                            </span>
                          </td>
                        )}
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
                    {camposBaseCols.id && <th style={{ width: '60px' }}>ID</th>}
                    {camposBaseCols.nome && <th>Colaborador</th>}
                    {camposBaseCols.cargo && <th>Cargo</th>}
                    {camposBaseCols.cidade_uf && <th>Cidade / UF</th>}
                    {camposBaseCols.status && <th style={{ textAlign: 'center' }}>Status</th>}
                    {camposExibicao.map(cmp => (
                      <th key={cmp.id}>{cmp.nome}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {colaboradoresFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={totalColunasAtivas || 4} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        Nenhum registro encontrado com os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    colaboradoresFiltrados.map(c => (
                      <tr key={c.id}>
                        {camposBaseCols.id && <td>#{c.id}</td>}
                        {camposBaseCols.nome && <td style={{ fontWeight: 600 }}>{c.nome}</td>}
                        {camposBaseCols.cargo && <td>{c.cargo || '-'}</td>}
                        {camposBaseCols.cidade_uf && <td>{c.cidade ? `${c.cidade}/${c.estado || ''}` : '-'}</td>}
                        {camposBaseCols.status && (
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ color: c.ativo !== false ? '#34d399' : '#fb7185', fontWeight: 700, fontSize: '0.78rem' }}>
                              {c.ativo !== false ? 'ATIVO' : 'INATIVO'}
                            </span>
                          </td>
                        )}
                        {camposExibicao.map(cmp => {
                          const val = getCustomFieldValue(c, cmp);
                          return (
                            <td key={cmp.id}>
                              {val === 'Sim' ? (
                                <span style={{ color: '#34d399', fontWeight: 600 }}>✓ Sim</span>
                              ) : val === 'Não' ? (
                                <span style={{ color: '#fb7185' }}>✗ Não</span>
                              ) : (
                                val
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
                    {geoCols.estado && <th>Estado (UF)</th>}
                    {geoCols.cidade && <th>Cidade / Município</th>}
                    {geoCols.ativos && <th style={{ textAlign: 'right' }}>Ativos</th>}
                    {geoCols.inativos && <th style={{ textAlign: 'right' }}>Inativos</th>}
                    {geoCols.total && <th style={{ textAlign: 'right' }}>Total Geral</th>}
                    {geoCols.percentual && <th style={{ textAlign: 'right' }}>% do Headcount</th>}
                  </tr>
                </thead>
                <tbody>
                  {dadosGeo.length === 0 ? (
                    <tr>
                      <td colSpan={totalColunasAtivas || 4} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        Nenhum registro geográfico encontrado.
                      </td>
                    </tr>
                  ) : (
                    dadosGeo.map(g => (
                      <tr key={`${g.estado}-${g.cidade}`}>
                        {geoCols.estado && <td style={{ fontWeight: 700, color: '#818cf8' }}>{g.estado}</td>}
                        {geoCols.cidade && <td style={{ fontWeight: 600 }}>{g.cidade}</td>}
                        {geoCols.ativos && (
                          <td style={{ textAlign: 'right', color: '#34d399', fontWeight: 700 }}>
                            {g.ativos}
                          </td>
                        )}
                        {geoCols.inativos && (
                          <td style={{ textAlign: 'right', color: '#fb7185', fontWeight: 600 }}>
                            {g.inativos}
                          </td>
                        )}
                        {geoCols.total && (
                          <td style={{ textAlign: 'right', fontWeight: 800, color: '#f8fafc' }}>
                            {g.total}
                          </td>
                        )}
                        {geoCols.percentual && (
                          <td style={{ textAlign: 'right', color: '#38bdf8', fontWeight: 700 }}>
                            {g.percentual}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* TIPO 4: USUÁRIOS E PERFIS (RBAC) */}
            {tipo === 'rbac' && (
              <table className="custom-table">
                <thead>
                  <tr>
                    {rbacCols.id && <th style={{ width: '60px' }}>ID</th>}
                    {rbacCols.nome && <th>Nome do Usuário</th>}
                    {rbacCols.email && <th>E-mail de Acesso</th>}
                    {rbacCols.perfil && <th>Perfil de Acesso</th>}
                    {rbacCols.tipo && <th>Tipo</th>}
                    {rbacCols.status && <th style={{ textAlign: 'center', width: '100px' }}>Status</th>}
                  </tr>
                </thead>
                <tbody>
                  {usuarios.length === 0 ? (
                    <tr>
                      <td colSpan={totalColunasAtivas || 6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        Nenhum usuário cadastrado encontrado.
                      </td>
                    </tr>
                  ) : (
                    usuarios.map(u => (
                      <tr key={u.id}>
                        {rbacCols.id && <td>#{u.id}</td>}
                        {rbacCols.nome && <td style={{ fontWeight: 600 }}>{u.nome}</td>}
                        {rbacCols.email && <td>{u.email}</td>}
                        {rbacCols.perfil && (
                          <td>
                            <span className={`badge-perfil ${u.perfil?.is_admin ? 'admin' : 'gestor-rh'}`}>
                              {u.perfil?.nome || 'Sem Perfil'}
                            </span>
                          </td>
                        )}
                        {rbacCols.tipo && (
                          <td>
                            {u.perfil?.is_admin ? (
                              <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.8rem' }}>Administrador Master</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Usuário Padrão</span>
                            )}
                          </td>
                        )}
                        {rbacCols.status && (
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              color: u.ativo !== false ? '#34d399' : '#fb7185',
                              fontWeight: 700,
                              fontSize: '0.78rem'
                            }}>
                              {u.ativo !== false ? 'ATIVO' : 'INATIVO'}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
