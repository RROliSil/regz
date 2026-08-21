import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import {
  FileBarChart,
  Printer,
  Search,
  RefreshCw,
  FileSpreadsheet,
  RotateCcw,
  Check,
  Plus,
  Sliders,
  CheckSquare,
  Square,
  Sparkles,
  MapPin,
  Shield
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

type ModoVisualizacao = 'construtor' | 'geo' | 'rbac';

// Definição das colunas cadastrais disponíveis
const COLUNAS_CADASTRAIS = [
  { key: 'id', label: 'ID' },
  { key: 'foto', label: 'Foto' },
  { key: 'nome', label: 'Nome do Colaborador' },
  { key: 'cpf', label: 'CPF' },
  { key: 'cargo', label: 'Cargo / Função' },
  { key: 'email', label: 'E-mail' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'cbo', label: 'CBO' },
  { key: 'endereco', label: 'Endereço Completo' },
  { key: 'cidade_uf', label: 'Cidade / UF' },
  { key: 'criado_em', label: 'Data de Cadastro' },
  { key: 'status', label: 'Status' }
];

export const Relatorios: React.FC = () => {
  const { token } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [modo, setModo] = useState<ModoVisualizacao>('construtor');
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [campos, setCampos] = useState<CampoCustomizado[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);

  // Seleção de Colunas no Construtor Livre (Keys de colunas padrão + IDs/Nomes de campos personalizados com prefixo 'custom_')
  const [colunasSelecionadas, setColunasSelecionadas] = useState<string[]>([
    'nome',
    'cargo',
    'cidade_uf',
    'status'
  ]);

  // Colunas do Relatório Geográfico
  const [geoCols, setGeoCols] = useState<{ [key: string]: boolean }>({
    estado: true,
    cidade: true,
    ativos: true,
    inativos: true,
    total: true,
    percentual: true
  });

  // Colunas do Relatório RBAC
  const [rbacCols, setRbacCols] = useState<{ [key: string]: boolean }>({
    id: true,
    nome: true,
    email: true,
    perfil: true,
    tipo: true,
    status: true
  });

  // Filtros Avançados
  const [search, setSearch] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [filtroCargo, setFiltroCargo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCidade, setFiltroCidade] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [ordenacao, setOrdenacao] = useState<'nome_asc' | 'nome_desc' | 'id_desc' | 'id_asc' | 'data_desc' | 'data_asc'>('nome_asc');

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

  // Atualizar dados com animação
  const handleAtualizarClique = () => {
    setIsSpinning(true);
    carregarDados();
    showSnackbar('Dados do relatório atualizados com sucesso!', 'info');
    setTimeout(() => setIsSpinning(false), 650);
  };

  // Alternar seleção de coluna no Construtor Livre
  const toggleColuna = (colKey: string) => {
    setColunasSelecionadas(prev => {
      if (prev.includes(colKey)) {
        return prev.filter(k => k !== colKey);
      } else {
        return [...prev, colKey];
      }
    });
  };

  // Ações rápidas de seleção de colunas
  const selecionarTodasColunas = () => {
    const todasCadastrais = COLUNAS_CADASTRAIS.map(c => c.key);
    const todasCustom = campos.map(c => `custom_${c.id}`);
    setColunasSelecionadas([...todasCadastrais, ...todasCustom]);
    showSnackbar('Todas as colunas selecionadas!', 'info');
  };

  const limparSelecaoColunas = () => {
    setColunasSelecionadas([]);
    showSnackbar('Seleção de colunas limpa!', 'info');
  };

  const selecionarPadrao = () => {
    setColunasSelecionadas(['nome', 'cargo', 'cidade_uf', 'status']);
    showSnackbar('Colunas padrão aplicadas!', 'info');
  };

  const selecionarNomeECamposCustom = () => {
    const todasCustom = campos.map(c => `custom_${c.id}`);
    setColunasSelecionadas(['nome', ...todasCustom]);
    showSnackbar('Selecionado: Nome + Campos Personalizados!', 'info');
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

      // 6. Busca Textual Geral (inclusive dentro de campos personalizados)
      if (search.trim() !== '') {
        const q = search.toLowerCase();
        const matchNome = c.nome.toLowerCase().includes(q);
        const matchCpf = (c.cpf || '').includes(q);
        const matchEmail = (c.email || '').toLowerCase().includes(q);
        const matchCargo = (c.cargo || '').toLowerCase().includes(q);
        const matchCidade = (c.cidade || '').toLowerCase().includes(q);
        const matchLogradouro = (c.logradouro || '').toLowerCase().includes(q);
        const matchBairro = (c.bairro || '').toLowerCase().includes(q);

        // Busca nos campos customizados
        let matchCustom = false;
        if (c.campos_customizados) {
          matchCustom = Object.values(c.campos_customizados).some(v =>
            String(v || '').toLowerCase().includes(q)
          );
        }

        if (!matchNome && !matchCpf && !matchEmail && !matchCargo && !matchCidade && !matchLogradouro && !matchBairro && !matchCustom) {
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
  }, [colaboradores, filtroStatus, filtroCargo, filtroEstado, filtroCidade, dataInicio, dataFim, search, ordenacao]);

  // Agrupamento Geográfico
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

  // Definição das colunas ativas no Construtor Livre
  const colunasAtivasConstrutor = useMemo(() => {
    const lista: { key: string; label: string; isCustom: boolean; customField?: CampoCustomizado }[] = [];

    colunasSelecionadas.forEach(key => {
      if (key.startsWith('custom_')) {
        const campoId = parseInt(key.replace('custom_', ''), 10);
        const campo = campos.find(c => c.id === campoId);
        if (campo) {
          lista.push({ key, label: campo.nome, isCustom: true, customField: campo });
        }
      } else {
        const cad = COLUNAS_CADASTRAIS.find(c => c.key === key);
        if (cad) {
          lista.push({ key, label: cad.label, isCustom: false });
        }
      }
    });

    return lista;
  }, [colunasSelecionadas, campos]);

  // Obter o valor de uma célula no Construtor
  const getValorCelula = (c: Colaborador, col: { key: string; label: string; isCustom: boolean; customField?: CampoCustomizado }): string => {
    if (col.isCustom && col.customField) {
      return getCustomFieldValue(c, col.customField);
    }

    switch (col.key) {
      case 'id': return `#${c.id}`;
      case 'foto': return c.foto_url || '';
      case 'nome': return c.nome;
      case 'cpf': return c.cpf || '-';
      case 'cargo': return c.cargo || '-';
      case 'email': return c.email || '-';
      case 'telefone': return c.telefone || '-';
      case 'cbo': return c.cbo_codigo || '-';
      case 'endereco': return c.logradouro ? `${c.logradouro}, ${c.numero || 'S/N'} - ${c.bairro || ''}` : '-';
      case 'cidade_uf': return c.cidade ? `${c.cidade} - ${c.estado || ''}` : '-';
      case 'criado_em': return c.criado_em ? new Date(c.criado_em).toLocaleDateString('pt-BR') : '-';
      case 'status': return c.ativo !== false ? 'Ativo' : 'Inativo';
      default: return '-';
    }
  };

  // Exportar para Excel / CSV respeitando 100% as colunas ativas
  const exportarCSV = () => {
    let headersCSV: string[] = [];
    let rowsCSV: string[][] = [];

    if (modo === 'construtor') {
      if (colunasAtivasConstrutor.length === 0) {
        showSnackbar('Selecione ao menos 1 coluna para exportar o relatório!', 'error');
        return;
      }

      headersCSV = colunasAtivasConstrutor.map(c => c.label);
      rowsCSV = colaboradoresFiltrados.map(colab => {
        return colunasAtivasConstrutor.map(col => {
          if (col.key === 'foto') return colab.foto_url || '';
          return getValorCelula(colab, col);
        });
      });
    } else if (modo === 'geo') {
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
    } else if (modo === 'rbac') {
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
    link.setAttribute('download', `relatorio_${modo}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSnackbar('Relatório exportado para Excel (CSV) com sucesso!', 'success');
  };

  const imprimirPDF = () => {
    if (modo === 'construtor' && colunasAtivasConstrutor.length === 0) {
      showSnackbar('Selecione ao menos 1 coluna para imprimir o relatório!', 'error');
      return;
    }
    window.print();
  };

  return (
    <div className="relatorios-container" style={{ padding: '28px 32px', width: '100%', boxSizing: 'border-box' }}>
      {/* Cabeçalho da Página (Oculto na Impressão) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <FileBarChart size={32} color="#6366f1" /> Painel de Relatórios & Construtor de Visões
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px', marginBottom: 0 }}>
            Monte relatórios personalizados selecionando livremente qualquer coluna e campo dinâmico, com filtros avançados e exportação em PDF e Excel.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Abas de Modo de Relatório */}
          <div style={{ display: 'flex', background: 'var(--card-bg)', padding: '4px', borderRadius: '12px', border: '1px solid var(--accent-purple)', gap: '4px' }}>
            <button
              onClick={() => setModo('construtor')}
              style={{
                background: modo === 'construtor' ? '#6366f1' : 'transparent',
                color: modo === 'construtor' ? '#ffffff' : 'var(--text-main)',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <Sparkles size={15} /> Construtor de Relatório
            </button>

            <button
              onClick={() => setModo('geo')}
              style={{
                background: modo === 'geo' ? '#6366f1' : 'transparent',
                color: modo === 'geo' ? '#ffffff' : 'var(--text-main)',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <MapPin size={15} /> Distribuição Geográfica
            </button>

            <button
              onClick={() => setModo('rbac')}
              style={{
                background: modo === 'rbac' ? '#6366f1' : 'transparent',
                color: modo === 'rbac' ? '#ffffff' : 'var(--text-main)',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <Shield size={15} /> Usuários (RBAC)
            </button>
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

      {/* PAINEL VISUAL ABERTO: CONSTRUTOR DE COLUNAS (SEM DROPDOWN) */}
      {modo === 'construtor' && (
        <div className="glass-panel no-print" style={{ padding: '22px 24px', borderRadius: '18px', marginBottom: '24px', border: '1px solid rgba(99, 102, 241, 0.35)', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
          {/* Cabeçalho do Construtor */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                <Sliders size={18} color="#818cf8" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                  Quais colunas você deseja exibir no relatório?
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Clique nas colunas abaixo para ativar ou desativar. O relatório, a impressão e o Excel exibirão <strong>exatamente</strong> as colunas marcadas.
                </span>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={selecionarTodasColunas}
                className="btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <CheckSquare size={13} color="#34d399" /> Selecionar Todas
              </button>
              <button
                type="button"
                onClick={selecionarPadrao}
                className="btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <RotateCcw size={13} color="#818cf8" /> Padrão
              </button>
              {campos.length > 0 && (
                <button
                  type="button"
                  onClick={selecionarNomeECamposCustom}
                  className="btn-secondary"
                  style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px', borderColor: '#38bdf8', color: '#38bdf8' }}
                >
                  <Sparkles size={13} /> Nome + Campos Personalizados
                </button>
              )}
              <button
                type="button"
                onClick={limparSelecaoColunas}
                className="btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px', color: '#fb7185' }}
              >
                <Square size={13} /> Limpar
              </button>
            </div>
          </div>

          {/* Grupo 1: Dados Cadastrais Básicos */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
              📋 Dados Cadastrais do Colaborador
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {COLUNAS_CADASTRAIS.map(col => {
                const ativa = colunasSelecionadas.includes(col.key);
                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => toggleColuna(col.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: ativa ? '1.5px solid #6366f1' : '1px solid var(--card-border)',
                      background: ativa ? 'rgba(99, 102, 241, 0.25)' : 'rgba(30, 41, 59, 0.4)',
                      color: ativa ? '#f8fafc' : 'var(--text-muted)',
                      boxShadow: ativa ? '0 0 12px rgba(99, 102, 241, 0.3)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {ativa ? <Check size={14} color="#38bdf8" /> : <Plus size={14} color="var(--text-muted)" />}
                    <span>{col.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grupo 2: Campos Personalizados Criados */}
          {campos.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                🧩 Campos Personalizados Cadastrados ({campos.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {campos.map(cmp => {
                  const key = `custom_${cmp.id}`;
                  const ativa = colunasSelecionadas.includes(key);
                  return (
                    <button
                      key={cmp.id}
                      type="button"
                      onClick={() => toggleColuna(key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: ativa ? '1.5px solid #38bdf8' : '1px solid var(--card-border)',
                        background: ativa ? 'rgba(56, 189, 248, 0.22)' : 'rgba(30, 41, 59, 0.4)',
                        color: ativa ? '#ffffff' : 'var(--text-muted)',
                        boxShadow: ativa ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {ativa ? <Check size={14} color="#34d399" /> : <Plus size={14} color="var(--text-muted)" />}
                      <span>{cmp.nome}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.75, background: 'rgba(0,0,0,0.25)', padding: '1px 6px', borderRadius: '4px' }}>
                        {cmp.tipo}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resumo da Seleção Atual */}
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span>
              Colunas ativas no relatório: <strong style={{ color: '#38bdf8' }}>{colunasAtivasConstrutor.length}</strong> de {COLUNAS_CADASTRAIS.length + campos.length}
            </span>
            <span style={{ fontStyle: 'italic' }}>
              Ordem de exibição: {colunasAtivasConstrutor.map(c => c.label).join(' → ') || 'Nenhuma coluna selecionada'}
            </span>
          </div>
        </div>
      )}

      {/* PAINEL DE SELEÇÃO DE COLUNAS DO MODO GEOGRÁFICO */}
      {modo === 'geo' && (
        <div className="glass-panel no-print" style={{ padding: '16px 20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', marginBottom: '10px' }}>
            Colunas Visíveis no Relatório Geográfico
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              { key: 'estado', label: 'Estado (UF)' },
              { key: 'cidade', label: 'Cidade / Município' },
              { key: 'ativos', label: 'Colaboradores Ativos' },
              { key: 'inativos', label: 'Colaboradores Inativos' },
              { key: 'total', label: 'Total Geral' },
              { key: 'percentual', label: '% do Headcount' }
            ].map(col => (
              <button
                key={col.key}
                type="button"
                onClick={() => setGeoCols(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: geoCols[col.key] ? '1.5px solid #6366f1' : '1px solid var(--card-border)',
                  background: geoCols[col.key] ? 'rgba(99, 102, 241, 0.25)' : 'rgba(30, 41, 59, 0.4)',
                  color: geoCols[col.key] ? '#f8fafc' : 'var(--text-muted)'
                }}
              >
                {geoCols[col.key] ? <Check size={13} color="#38bdf8" /> : <Plus size={13} color="var(--text-muted)" />}
                <span>{col.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PAINEL DE SELEÇÃO DE COLUNAS DO MODO RBAC */}
      {modo === 'rbac' && (
        <div className="glass-panel no-print" style={{ padding: '16px 20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', marginBottom: '10px' }}>
            Colunas Visíveis no Relatório de Usuários (RBAC)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              { key: 'id', label: 'ID do Usuário' },
              { key: 'nome', label: 'Nome do Usuário' },
              { key: 'email', label: 'E-mail' },
              { key: 'perfil', label: 'Perfil de Acesso' },
              { key: 'tipo', label: 'Tipo (Admin/Padrão)' },
              { key: 'status', label: 'Status' }
            ].map(col => (
              <button
                key={col.key}
                type="button"
                onClick={() => setRbacCols(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: rbacCols[col.key] ? '1.5px solid #6366f1' : '1px solid var(--card-border)',
                  background: rbacCols[col.key] ? 'rgba(99, 102, 241, 0.25)' : 'rgba(30, 41, 59, 0.4)',
                  color: rbacCols[col.key] ? '#f8fafc' : 'var(--text-muted)'
                }}
              >
                {rbacCols[col.key] ? <Check size={13} color="#38bdf8" /> : <Plus size={13} color="var(--text-muted)" />}
                <span>{col.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PAINEL DE FILTROS AVANÇADOS (Oculto na Impressão) */}
      {modo !== 'rbac' && (
        <div className="glass-panel no-print" style={{ padding: '18px 24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
            {/* 1. Busca Geral */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Busca Rápida</label>
              <div className="search-box" style={{ width: '100%' }}>
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Nome, CPF, Cargo, PIX..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', color: 'inherit' }}
                />
              </div>
            </div>

            {/* 2. Filtro de Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</label>
              <select
                value={filtroStatus}
                onChange={e => setFiltroStatus(e.target.value as any)}
                className="custom-select-small"
                style={{ width: '100%', height: '38px' }}
              >
                <option value="todos">Todos os Status</option>
                <option value="ativos">🟢 Apenas Ativos</option>
                <option value="inativos">🔴 Apenas Inativos</option>
              </select>
            </div>

            {/* 3. Filtro de Cargo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cargo / Função</label>
              <select
                value={filtroCargo}
                onChange={e => setFiltroCargo(e.target.value)}
                className="custom-select-small"
                style={{ width: '100%', height: '38px' }}
              >
                <option value="todos">Todos os Cargos ({listaCargos.length})</option>
                {listaCargos.map(cargo => (
                  <option key={cargo} value={cargo}>{cargo}</option>
                ))}
              </select>
            </div>

            {/* 4. Filtro de Estado (UF) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estado (UF)</label>
              <select
                value={filtroEstado}
                onChange={e => {
                  setFiltroEstado(e.target.value);
                  setFiltroCidade('todos');
                }}
                className="custom-select-small"
                style={{ width: '100%', height: '38px' }}
              >
                <option value="todos">Todas as UFs ({listaEstados.length})</option>
                {listaEstados.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            {/* 5. Filtro de Cidade */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cidade</label>
              <select
                value={filtroCidade}
                onChange={e => setFiltroCidade(e.target.value)}
                className="custom-select-small"
                style={{ width: '100%', height: '38px' }}
                disabled={listaCidades.length === 0}
              >
                <option value="todos">Todas as Cidades ({listaCidades.length})</option>
                {listaCidades.map(cid => (
                  <option key={cid} value={cid}>{cid}</option>
                ))}
              </select>
            </div>

            {/* 6. Período: De */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>De (Cadastro)</label>
              <input
                type="date"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className="custom-select-small"
                style={{ width: '100%', height: '38px' }}
              />
            </div>

            {/* 7. Período: Até */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Até (Cadastro)</label>
              <input
                type="date"
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
                className="custom-select-small"
                style={{ width: '100%', height: '38px' }}
              />
            </div>

            {/* 8. Ordenação & Reset */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ordem</label>
                <select
                  value={ordenacao}
                  onChange={e => setOrdenacao(e.target.value as any)}
                  className="custom-select-small"
                  style={{ width: '100%', height: '38px' }}
                >
                  <option value="nome_asc">Nome (A - Z)</option>
                  <option value="nome_desc">Nome (Z - A)</option>
                  <option value="id_desc">ID (Mais Recente)</option>
                  <option value="id_asc">ID (Mais Antigo)</option>
                  <option value="data_desc">Data (Decrescente)</option>
                  <option value="data_asc">Data (Crescente)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleResetFiltros}
                className="btn-secondary"
                style={{ height: '38px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '5px', marginTop: 'auto' }}
                title="Limpar todos os filtros"
              >
                <RotateCcw size={15} /> Limpar
              </button>
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
            {modo === 'construtor' && 'Relatório Personalizado de Colaboradores & Campos'}
            {modo === 'geo' && 'Relatório de Distribuição Geográfica'}
            {modo === 'rbac' && 'Relatório de Usuários e Permissões (RBAC)'}
          </p>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Gerado em: {new Date().toLocaleString('pt-BR')} • {modo === 'construtor' ? `${colunasAtivasConstrutor.length} colunas exibidas` : ''}
          </span>
        </div>

        {/* Resumo e Indicadores do Relatório */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              {modo === 'construtor' && 'Relatório Personalizado de Colaboradores'}
              {modo === 'geo' && 'Relatório de Distribuição Geográfica'}
              {modo === 'rbac' && 'Relatório de Usuários do Sistema (RBAC)'}
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Total de registros listados: <strong>{modo === 'rbac' ? usuarios.length : modo === 'geo' ? dadosGeo.length : colaboradoresFiltrados.length}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
            {modo === 'construtor' && (
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
            <p>Carregando dados do relatório...</p>
          </div>
        ) : (
          <div className="table-flex-wrapper" style={{ overflowX: 'auto' }}>
            {/* MODO 1: CONSTRUTOR LIVRE DE COLUNAS */}
            {modo === 'construtor' && (
              <>
                {colunasAtivasConstrutor.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                    <Sliders size={36} color="#818cf8" style={{ marginBottom: '12px', opacity: 0.7 }} />
                    <h3 style={{ margin: '0 0 6px 0', color: '#f8fafc' }}>Nenhuma coluna selecionada</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                      Clique nas colunas desejadas no painel acima para construir o seu relatório personalizado.
                    </p>
                  </div>
                ) : (
                  <table className="custom-table">
                    <thead>
                      <tr>
                        {colunasAtivasConstrutor.map(col => (
                          <th key={col.key}>
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {colaboradoresFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={colunasAtivasConstrutor.length} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                            Nenhum colaborador encontrado com os filtros aplicados.
                          </td>
                        </tr>
                      ) : (
                        colaboradoresFiltrados.map(c => (
                          <tr key={c.id}>
                            {colunasAtivasConstrutor.map(col => {
                              // Renderização específica para foto
                              if (col.key === 'foto') {
                                return (
                                  <td key={col.key}>
                                    {c.foto_url ? (
                                      <img src={c.foto_url} alt={c.nome} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontSize: '0.8rem', fontWeight: 700 }}>
                                        {c.nome.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                  </td>
                                );
                              }

                              // Renderização específica para status
                              if (col.key === 'status') {
                                return (
                                  <td key={col.key}>
                                    <span style={{
                                      color: c.ativo !== false ? '#34d399' : '#fb7185',
                                      fontWeight: 700,
                                      fontSize: '0.78rem'
                                    }}>
                                      {c.ativo !== false ? 'ATIVO' : 'INATIVO'}
                                    </span>
                                  </td>
                                );
                              }

                              // Renderização específica para cargo
                              if (col.key === 'cargo') {
                                return (
                                  <td key={col.key}>
                                    <span className="cargo-badge" style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>
                                      {c.cargo || 'Não definido'}
                                    </span>
                                  </td>
                                );
                              }

                              // Renderização para campos personalizados e demais valores
                              const val = getValorCelula(c, col);
                              return (
                                <td key={col.key} style={col.key === 'nome' ? { fontWeight: 600 } : undefined}>
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
              </>
            )}

            {/* MODO 2: DISTRIBUIÇÃO GEOGRÁFICA */}
            {modo === 'geo' && (
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
                      <td colSpan={Object.values(geoCols).filter(Boolean).length || 4} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
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

            {/* MODO 3: USUÁRIOS E PERFIS (RBAC) */}
            {modo === 'rbac' && (
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
                      <td colSpan={Object.values(rbacCols).filter(Boolean).length || 6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
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
