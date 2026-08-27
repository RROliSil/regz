import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  Sparkles,
  MapPin,
  Shield,
  Bookmark,
  Save,
  Star,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Eraser,
  Download,
  FileText
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
  ativo?: boolean;
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

export interface RelatorioSalvo {
  id: number;
  nome: string;
  descricao?: string | null;
  icone?: string;
  modo?: string;
  colunas: string[];
  filtros: {
    status?: 'todos' | 'ativos' | 'inativos';
    cargo?: string;
    estado?: string;
    cidade?: string;
    search?: string;
    ordenacao?: any;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
    dataInicio?: string;
    dataFim?: string;
  };
  is_padrao?: boolean;
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

// Larguras padrão de colunas da tabela de relatórios (em pixels)
const DEFAULT_RELATORIO_WIDTHS: Record<string, number> = {
  foto: 65,
  nome: 240,
  cpf: 150,
  cargo: 190,
  email: 220,
  telefone: 150,
  cbo: 160,
  endereco: 260,
  cidade_uf: 180,
  criado_em: 150,
  status: 120,
  // Geo
  estado: 130,
  cidade: 220,
  ativos: 120,
  inativos: 120,
  total: 130,
  percentual: 150,
  // RBAC
  id: 80,
  perfil: 180,
  tipo: 140
};

export const Relatorios: React.FC = () => {
  const { token } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [modo, setModo] = useState<ModoVisualizacao>('construtor');
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [campos, setCampos] = useState<CampoCustomizado[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [relatoriosSalvos, setRelatoriosSalvos] = useState<RelatorioSalvo[]>([]);
  const [modeloAtivoId, setModeloAtivoId] = useState<number | null>(null);
  const [modalSalvarAberto, setModalSalvarAberto] = useState(false);
  const [nomeNovoModelo, setNomeNovoModelo] = useState('');
  const [descNovoModelo, setDescNovoModelo] = useState('');
  const [salvandoModelo, setSalvandoModelo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);

  // Redimensionamento manual de colunas com persistência em LocalStorage
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('regz_relatorios_column_widths');
      if (saved) return { ...DEFAULT_RELATORIO_WIDTHS, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Erro ao carregar regz_relatorios_column_widths:', e);
    }
    return DEFAULT_RELATORIO_WIDTHS;
  });

  const handleMouseDownResize = (e: React.MouseEvent, colKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = columnWidths[colKey] || DEFAULT_RELATORIO_WIDTHS[colKey] || 180;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(60, startWidth + delta);
      setColumnWidths(prev => {
        const updated = { ...prev, [colKey]: newWidth };
        try {
          localStorage.setItem('regz_relatorios_column_widths', JSON.stringify(updated));
        } catch (err) {}
        return updated;
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Orientação da Página para Impressão e PDF (Retrato vs Paisagem)
  const [orientacaoPDF, setOrientacaoPDF] = useState<'portrait' | 'landscape'>(() => {
    try {
      const saved = localStorage.getItem('regz_relatorio_pdf_orientation');
      if (saved === 'landscape' || saved === 'portrait') return saved;
    } catch (e) {}
    return 'portrait';
  });

  const handleSetOrientacaoPDF = (orientacao: 'portrait' | 'landscape') => {
    setOrientacaoPDF(orientacao);
    try {
      localStorage.setItem('regz_relatorio_pdf_orientation', orientacao);
    } catch (e) {}
  };

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

  // Ordenação Interativa por Colunas (sem select estático de Ordem)
  const [sortColumn, setSortColumn] = useState<string>('nome');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Carregar dados da API
  const carregarDados = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [colabRes, camposRes, userRes, relatoriosRes] = await Promise.all([
        fetch('/api/colaboradores', { headers }),
        fetch('/api/campos-customizados', { headers }),
        fetch('/api/usuarios', { headers }),
        fetch('/api/relatorios-salvos', { headers })
      ]);

      if (colabRes.ok) {
        const data = await colabRes.json();
        setColaboradores(Array.isArray(data) ? data : []);
      }
      if (camposRes.ok) {
        const data = await camposRes.json();
        const listaCampos: CampoCustomizado[] = Array.isArray(data) ? data : [];
        setCampos(listaCampos.filter(c => c.ativo !== false));
      }
      if (userRes.ok) {
        const data = await userRes.json();
        setUsuarios(Array.isArray(data) ? data : []);
      }
      if (relatoriosRes.ok) {
        const data = await relatoriosRes.json();
        setRelatoriosSalvos(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados para relatórios:', err);
    } finally {
      setLoading(false);
    }
  };

  const carregarModelosSalvos = async () => {
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/relatorios-salvos', { headers });
      if (res.ok) {
        const data = await res.json();
        setRelatoriosSalvos(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Erro ao carregar modelos salvos:', err);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [token]);

  // Aplicar Modelo Salvo
  const handleAplicarModelo = (modelo: RelatorioSalvo) => {
    setModeloAtivoId(modelo.id);
    const mod = modelo.modo || 'construtor';
    setModo(mod as ModoVisualizacao);
    
    if (mod === 'construtor') {
      if (Array.isArray(modelo.colunas) && modelo.colunas.length > 0) {
        setColunasSelecionadas(modelo.colunas);
      }
      if (modelo.filtros) {
        if (modelo.filtros.status) setFiltroStatus(modelo.filtros.status);
        if (modelo.filtros.cargo) setFiltroCargo(modelo.filtros.cargo);
        if (modelo.filtros.estado) setFiltroEstado(modelo.filtros.estado);
        if (modelo.filtros.cidade) setFiltroCidade(modelo.filtros.cidade);
        if (modelo.filtros.search !== undefined) setSearch(modelo.filtros.search);
        if (modelo.filtros.sortColumn) {
          setSortColumn(modelo.filtros.sortColumn);
          setSortDirection(modelo.filtros.sortDirection || 'asc');
        } else if (modelo.filtros.ordenacao) {
          if (modelo.filtros.ordenacao.includes('nome')) {
            setSortColumn('nome');
            setSortDirection(modelo.filtros.ordenacao.includes('desc') ? 'desc' : 'asc');
          } else if (modelo.filtros.ordenacao.includes('id')) {
            setSortColumn('id');
            setSortDirection(modelo.filtros.ordenacao.includes('desc') ? 'desc' : 'asc');
          } else if (modelo.filtros.ordenacao.includes('data')) {
            setSortColumn('criado_em');
            setSortDirection(modelo.filtros.ordenacao.includes('desc') ? 'desc' : 'asc');
          }
        }
        if (modelo.filtros.dataInicio !== undefined) setDataInicio(modelo.filtros.dataInicio);
        if (modelo.filtros.dataFim !== undefined) setDataFim(modelo.filtros.dataFim);
      }
    } else if (mod === 'geo') {
      if (Array.isArray(modelo.colunas) && modelo.colunas.length > 0) {
        const newGeoCols: { [key: string]: boolean } = {
          estado: false, cidade: false, ativos: false, inativos: false, total: false, percentual: false
        };
        modelo.colunas.forEach(k => { newGeoCols[k] = true; });
        setGeoCols(newGeoCols);
      }
      if (modelo.filtros) {
        if (modelo.filtros.estado) setFiltroEstado(modelo.filtros.estado);
        if (modelo.filtros.cidade) setFiltroCidade(modelo.filtros.cidade);
        if (modelo.filtros.search !== undefined) setSearch(modelo.filtros.search);
      }
    } else if (mod === 'rbac') {
      if (Array.isArray(modelo.colunas) && modelo.colunas.length > 0) {
        const newRbacCols: { [key: string]: boolean } = {
          id: false, nome: false, email: false, perfil: false, tipo: false, status: false
        };
        modelo.colunas.forEach(k => { newRbacCols[k] = true; });
        setRbacCols(newRbacCols);
      }
      if (modelo.filtros && modelo.filtros.search !== undefined) {
        setSearch(modelo.filtros.search);
      }
    }
    showSnackbar(`Modelo "${modelo.nome}" carregado com sucesso!`, 'success');
  };

  // Alternar ordenação ao clicar no cabeçalho de uma coluna
  const handleToggleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  // Salvar Configuração Atual como Novo Modelo
  const handleSalvarNovoModelo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeNovoModelo.trim()) {
      showSnackbar('Por favor, informe o nome do modelo de relatório.', 'error');
      return;
    }

    let colunasSalvas: string[] = [];
    let filtrosSalvos: any = {};

    if (modo === 'construtor') {
      if (colunasSelecionadas.length === 0) {
        showSnackbar('Selecione ao menos 1 coluna para salvar o modelo.', 'error');
        return;
      }
      colunasSalvas = colunasSelecionadas;
      filtrosSalvos = {
        status: filtroStatus,
        cargo: filtroCargo,
        estado: filtroEstado,
        cidade: filtroCidade,
        search,
        sortColumn,
        sortDirection,
        dataInicio,
        dataFim
      };
    } else if (modo === 'geo') {
      colunasSalvas = Object.keys(geoCols).filter(k => geoCols[k]);
      if (colunasSalvas.length === 0) {
        showSnackbar('Selecione ao menos 1 coluna para salvar o modelo.', 'error');
        return;
      }
      filtrosSalvos = { estado: filtroEstado, cidade: filtroCidade, search };
    } else if (modo === 'rbac') {
      colunasSalvas = Object.keys(rbacCols).filter(k => rbacCols[k]);
      if (colunasSalvas.length === 0) {
        showSnackbar('Selecione ao menos 1 coluna para salvar o modelo.', 'error');
        return;
      }
      filtrosSalvos = { search };
    }

    setSalvandoModelo(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const payload = {
        nome: nomeNovoModelo.trim(),
        descricao: descNovoModelo.trim() || null,
        icone: modo === 'geo' ? 'map-pin' : modo === 'rbac' ? 'shield' : 'bookmark',
        modo,
        colunas: colunasSalvas,
        filtros: filtrosSalvos
      };

      const res = await fetch('/api/relatorios-salvos', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setModalSalvarAberto(false);
        setNomeNovoModelo('');
        setDescNovoModelo('');
        showSnackbar(`Modelo "${payload.nome}" salvo com sucesso!`, 'success');
        await carregarModelosSalvos();
      } else {
        const errData = await res.json();
        showSnackbar(errData.error || 'Erro ao salvar modelo de relatório.', 'error');
      }
    } catch (err: any) {
      showSnackbar(err.message || 'Erro de conexão ao salvar modelo.', 'error');
    } finally {
      setSalvandoModelo(false);
    }
  };

  // Excluir Modelo Salvo
  const handleExcluirModelo = async (modeloId: number, modeloNome: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Deseja realmente excluir o modelo "${modeloNome}"?`)) return;

    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/relatorios-salvos/${modeloId}`, {
        method: 'DELETE',
        headers
      });

      if (res.ok) {
        if (modeloAtivoId === modeloId) setModeloAtivoId(null);
        showSnackbar(`Modelo "${modeloNome}" excluído com sucesso!`, 'info');
        await carregarModelosSalvos();
      } else {
        const errData = await res.json();
        showSnackbar(errData.error || 'Erro ao excluir modelo.', 'error');
      }
    } catch (err: any) {
      showSnackbar(err.message || 'Erro ao excluir modelo.', 'error');
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
    setModeloAtivoId(null);
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
    setModeloAtivoId(null);
    const todasCadastrais = COLUNAS_CADASTRAIS.map(c => c.key);
    const todasCustom = campos.map(c => `custom_${c.id}`);
    setColunasSelecionadas([...todasCadastrais, ...todasCustom]);
    showSnackbar('Todas as colunas selecionadas!', 'info');
  };

  const limparSelecaoColunas = () => {
    setColunasSelecionadas([]);
    setModeloAtivoId(null);
    showSnackbar('Seleção de colunas limpa!', 'info');
  };

  const selecionarPadrao = () => {
    setModeloAtivoId(null);
    setColunasSelecionadas(['nome', 'cargo', 'cidade_uf', 'status']);
    showSnackbar('Colunas padrão aplicadas!', 'info');
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
    setSortColumn('nome');
    setSortDirection('asc');
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
        const matchCbo = (c.cbo_codigo || '').toLowerCase().includes(q);
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

        if (!matchNome && !matchCpf && !matchEmail && !matchCargo && !matchCbo && !matchCidade && !matchLogradouro && !matchBairro && !matchCustom) {
          return false;
        }
      }

      return true;
    });

    // Ordenação dinâmica baseada na coluna e direção clicadas
    return filtrados.sort((a, b) => {
      let res = 0;
      if (sortColumn === 'id') {
        res = a.id - b.id;
      } else if (sortColumn === 'nome') {
        res = a.nome.localeCompare(b.nome);
      } else if (sortColumn === 'cpf') {
        res = (a.cpf || '').localeCompare(b.cpf || '');
      } else if (sortColumn === 'cargo') {
        res = (a.cargo || '').localeCompare(b.cargo || '');
      } else if (sortColumn === 'email') {
        res = (a.email || '').localeCompare(b.email || '');
      } else if (sortColumn === 'telefone') {
        res = (a.telefone || '').localeCompare(b.telefone || '');
      } else if (sortColumn === 'cbo') {
        res = (a.cbo_codigo || '').localeCompare(b.cbo_codigo || '');
      } else if (sortColumn === 'cidade_uf') {
        const valA = `${a.cidade || ''} - ${a.estado || ''}`;
        const valB = `${b.cidade || ''} - ${b.estado || ''}`;
        res = valA.localeCompare(valB);
      } else if (sortColumn === 'endereco') {
        const valA = `${a.logradouro || ''} ${a.numero || ''} ${a.bairro || ''}`;
        const valB = `${b.logradouro || ''} ${b.numero || ''} ${b.bairro || ''}`;
        res = valA.localeCompare(valB);
      } else if (sortColumn === 'criado_em') {
        res = (a.criado_em || '').localeCompare(b.criado_em || '');
      } else if (sortColumn === 'status') {
        const valA = a.ativo !== false ? 1 : 0;
        const valB = b.ativo !== false ? 1 : 0;
        res = valA - valB;
      } else if (sortColumn.startsWith('custom_')) {
        const campoId = parseInt(sortColumn.replace('custom_', ''), 10);
        const campoObj = campos.find(cp => cp.id === campoId);
        if (campoObj) {
          const valA = getCustomFieldValue(a, campoObj);
          const valB = getCustomFieldValue(b, campoObj);
          res = valA.localeCompare(valB);
        }
      }
      return sortDirection === 'asc' ? res : -res;
    });
  }, [colaboradores, filtroStatus, filtroCargo, filtroEstado, filtroCidade, dataInicio, dataFim, search, sortColumn, sortDirection, campos]);

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

  // Estados da Pré-visualização do PDF Integrada (Modal na própria página)
  const [modalPreviewPDF, setModalPreviewPDF] = useState(false);
  const [pdfPreviewBlobUrl, setPdfPreviewBlobUrl] = useState<string | null>(null);
  const [pdfDocInstance, setPdfDocInstance] = useState<jsPDF | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>('relatorio_regz.pdf');
  const [gerandoPDF, setGerandoPDF] = useState<boolean>(false);
  const pdfIframeRef = React.useRef<HTMLIFrameElement | null>(null);

  const getLogoBase64 = async (): Promise<string | null> => {
    try {
      const res = await fetch('/logo.png');
      if (!res.ok) return null;
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const gerarDocumentoPDF = async (orientacao: 'portrait' | 'landscape') => {
    const isLandscape = orientacao === 'landscape';
    const doc = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Inserir Logotipo do Regz
    const logoBase64 = await getLogoBase64();
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 14, 10, 15, 15);
    }

    // Título e Cabeçalho Corporativo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('REGZ GESTÃO DE PESSOAS', logoBase64 ? 32 : 14, 16);

    // Subtítulo do modo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const sub = modo === 'construtor' 
      ? 'Relatório Personalizado de Colaboradores & Campos'
      : modo === 'geo'
      ? 'Relatório de Distribuição Geográfica'
      : 'Relatório de Usuários e Permissões (RBAC)';
    doc.text(sub, logoBase64 ? 32 : 14, 21.5);

    // Metadados à Direita
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const dataEmissao = `Gerado em: ${new Date().toLocaleString('pt-BR')}`;
    doc.text(dataEmissao, pageWidth - 14, 16, { align: 'right' });

    const totalRegistros = modo === 'rbac' ? usuarios.length : modo === 'geo' ? dadosGeo.length : colaboradoresFiltrados.length;
    doc.text(`Total: ${totalRegistros} registros`, pageWidth - 14, 21.5, { align: 'right' });

    // Linha divisória estética
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.4);
    doc.line(14, 28, pageWidth - 14, 28);

    // Preparação dos dados para o AutoTable
    let head: string[][] = [];
    let body: string[][] = [];

    if (modo === 'construtor') {
      head = [colunasAtivasConstrutor.map(col => col.label)];
      body = colaboradoresFiltrados.map(c => {
        return colunasAtivasConstrutor.map(col => {
          if (col.key === 'foto') return c.foto_url ? '[FOTO]' : '-';
          if (col.key === 'status') return c.ativo !== false ? 'ATIVO' : 'INATIVO';
          if (col.key === 'cargo') return c.cargo || 'Não definido';
          return String(getValorCelula(c, col) || '-');
        });
      });
    } else if (modo === 'geo') {
      const cols: string[] = [];
      if (geoCols.estado) cols.push('Estado (UF)');
      if (geoCols.cidade) cols.push('Cidade / Município');
      if (geoCols.ativos) cols.push('Colaboradores Ativos');
      head = [cols];
      body = dadosGeo.map(g => {
        const row: string[] = [];
        if (geoCols.estado) row.push(g.estado || '-');
        if (geoCols.cidade) row.push(g.cidade || '-');
        if (geoCols.ativos) row.push(String(g.ativos));
        return row;
      });
    } else if (modo === 'rbac') {
      head = [['Nome do Usuário', 'E-mail Corporativo', 'Perfil de Acesso', 'Status']];
      body = usuarios.map(u => [
        u.nome,
        u.email,
        u.perfil?.nome || 'Sem Perfil',
        u.ativo ? 'ATIVO' : 'INATIVO'
      ]);
    }

    autoTable(doc, {
      startY: 31,
      head: head,
      body: body,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [15, 23, 42],
        lineColor: [203, 213, 225],
        lineWidth: 0.1,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      didParseCell: function(data) {
        if (data.section === 'body') {
          const cellText = String(data.cell.raw || '');
          if (cellText === 'Sim' || cellText === '✓ Sim' || cellText === 'ATIVO') {
            data.cell.styles.textColor = [5, 150, 105]; // Verde #059669
            data.cell.styles.fontStyle = 'bold';
          } else if (cellText === 'Não' || cellText === '✗ Não' || cellText === 'INATIVO') {
            data.cell.styles.textColor = [220, 38, 38]; // Vermelho #dc2626
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      didDrawPage: function(data) {
        // Rodapé com numeração de páginas
        const totalPages = (doc as any).internal.getNumberOfPages();
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Regz Gestão de Pessoas • Página ${data.pageNumber} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 6,
          { align: 'center' }
        );
      },
      margin: { left: 14, right: 14, top: 31, bottom: 12 },
    });

    const fileName = `relatorio_regz_${modo}_${new Date().toISOString().slice(0, 10)}.pdf`;
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    return { doc, fileName, blobUrl };
  };

  const abrirPreviaPDF = async (orientacao: 'portrait' | 'landscape' = orientacaoPDF) => {
    if (modo === 'construtor' && colunasAtivasConstrutor.length === 0) {
      showSnackbar('Selecione ao menos 1 coluna para visualizar o relatório em PDF!', 'error');
      return;
    }

    try {
      setGerandoPDF(true);
      if (pdfPreviewBlobUrl) {
        URL.revokeObjectURL(pdfPreviewBlobUrl);
      }

      const { doc, fileName, blobUrl } = await gerarDocumentoPDF(orientacao);
      setPdfDocInstance(doc);
      setPdfFileName(fileName);
      setPdfPreviewBlobUrl(blobUrl);
      setModalPreviewPDF(true);
    } catch (err) {
      console.error('Erro ao gerar prévia do PDF:', err);
      showSnackbar('Erro ao gerar documento PDF.', 'error');
    } finally {
      setGerandoPDF(false);
    }
  };

  const alternarOrientacaoNoModal = async (novaOrientacao: 'portrait' | 'landscape') => {
    handleSetOrientacaoPDF(novaOrientacao);
    await abrirPreviaPDF(novaOrientacao);
  };

  const baixarPDF = () => {
    if (!pdfDocInstance) return;
    pdfDocInstance.save(pdfFileName);
    showSnackbar('Documento PDF baixado com sucesso!', 'success');
  };

  const imprimirPDFDoModal = () => {
    try {
      const iframe = pdfIframeRef.current;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        return;
      }
    } catch (e) {
      console.warn('Tentativa direta de print via iframe do modal:', e);
    }

    // Impressão limpa via frame oculto sem abertura de guias/janelas
    if (pdfPreviewBlobUrl) {
      let printFrame = document.getElementById('hidden-pdf-print-frame') as HTMLIFrameElement;
      if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'hidden-pdf-print-frame';
        printFrame.style.position = 'fixed';
        printFrame.style.top = '-9999px';
        printFrame.style.left = '-9999px';
        printFrame.style.width = '1px';
        printFrame.style.height = '1px';
        printFrame.style.border = 'none';
        printFrame.style.opacity = '0';
        document.body.appendChild(printFrame);
      }
      printFrame.src = pdfPreviewBlobUrl;
      printFrame.onload = () => {
        setTimeout(() => {
          try {
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
          } catch (err) {
            console.error('Erro ao acionar impressora:', err);
          }
        }, 200);
      };
    }
  };

  const fecharModalPreviewPDF = () => {
    setModalPreviewPDF(false);
    if (pdfPreviewBlobUrl) {
      URL.revokeObjectURL(pdfPreviewBlobUrl);
      setPdfPreviewBlobUrl(null);
    }
    setPdfDocInstance(null);
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
          <div className="relatorio-tab-group">
            <button
              onClick={() => setModo('construtor')}
              className={`relatorio-tab-btn ${modo === 'construtor' ? 'active' : ''}`}
            >
              <Sparkles size={15} /> Construtor de Relatório
            </button>

            <button
              onClick={() => setModo('geo')}
              className={`relatorio-tab-btn ${modo === 'geo' ? 'active' : ''}`}
            >
              <MapPin size={15} /> Distribuição Geográfica
            </button>

            <button
              onClick={() => setModo('rbac')}
              className={`relatorio-tab-btn ${modo === 'rbac' ? 'active' : ''}`}
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

          {/* Seletor de Orientação do PDF / Impressão */}
          <div className="pdf-orientation-toggle" title="Orientação da página para Impressão / PDF">
            <button
              type="button"
              onClick={() => handleSetOrientacaoPDF('portrait')}
              className={`orientation-btn ${orientacaoPDF === 'portrait' ? 'active' : ''}`}
              title="Formato A4 Retrato (Vertical)"
            >
              Retrato
            </button>
            <button
              type="button"
              onClick={() => handleSetOrientacaoPDF('landscape')}
              className={`orientation-btn ${orientacaoPDF === 'landscape' ? 'active' : ''}`}
              title="Formato A4 Paisagem (Horizontal - ideal para tabelas largas)"
            >
              Paisagem
            </button>
          </div>

          <button 
            type="button"
            onClick={() => abrirPreviaPDF()} 
            disabled={gerandoPDF}
            className="btn-primary btn-relatorio-primary" 
            title="Visualizar e Imprimir Relatório em PDF A4"
          >
            {gerandoPDF ? <RefreshCw size={16} className="spin" /> : <Printer size={16} />} Visualizar / Imprimir PDF
          </button>
        </div>
      </div>

      {/* PAINEL VISUAL ABERTO: CONSTRUTOR DE COLUNAS (SEM DROPDOWN) */}
      {modo === 'construtor' && (
        <div className="glass-panel no-print panel-builder-container" style={{ padding: '22px 24px', borderRadius: '18px', marginBottom: '24px' }}>
          
          {/* Seção de Modelos Salvos ("Meus Relatórios") */}
          {(() => {
            const modelosConstrutor = relatoriosSalvos.filter(m => (m.modo || 'construtor') === 'construtor');
            return (
              <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Star size={16} color="#fbbf24" fill="#fbbf24" /> Meus Relatórios & Modelos Salvos ({modelosConstrutor.length})
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNomeNovoModelo('');
                      setDescNovoModelo('');
                      setModalSalvarAberto(true);
                    }}
                    className="btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.78rem', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }}
                  >
                    <Save size={13} /> Salvar Configuração Atual como Modelo
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {modelosConstrutor.map(mod => {
                    const isActive = modeloAtivoId === mod.id;
                    return (
                      <div
                        key={mod.id}
                        onClick={() => handleAplicarModelo(mod)}
                        className={`btn-column-chip ${isActive ? 'active' : ''}`}
                        style={{
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'var(--card-bg)',
                          border: isActive ? '1.5px solid #6366f1' : '1px solid var(--card-border)',
                          position: 'relative'
                        }}
                        title={mod.descricao || mod.nome}
                      >
                        <Bookmark size={13} color={isActive ? "#818cf8" : "var(--text-muted)"} />
                        <span style={{ fontWeight: isActive ? 700 : 500 }}>{mod.nome}</span>
                        {mod.is_padrao ? (
                          <span style={{ fontSize: '0.65rem', padding: '2px 5px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Padrão
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleExcluirModelo(mod.id, mod.nome, e)}
                            style={{ background: 'transparent', border: 'none', padding: '2px', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}
                            title="Excluir este modelo salvo"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Cabeçalho do Construtor */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="builder-header-icon">
                <Sliders size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
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
                className="btn-secondary btn-builder-action"
              >
                <CheckSquare size={13} color="#34d399" /> Selecionar Todas
              </button>
              <button
                type="button"
                onClick={selecionarPadrao}
                className="btn-secondary btn-builder-action"
              >
                <RotateCcw size={13} color="#818cf8" /> Padrão
              </button>
              <button
                type="button"
                onClick={limparSelecaoColunas}
                className="btn-secondary btn-builder-action btn-builder-clear"
                title="Limpar seleção de colunas e redefinir filtros"
              >
                <Eraser size={14} /> Limpar Filtros
              </button>
            </div>
          </div>

          {/* Grupo 1: Dados Cadastrais Básicos */}
          <div style={{ marginBottom: '16px' }}>
            <div className="builder-group-title cadastral">
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
                    className={`btn-column-chip ${ativa ? 'active' : ''}`}
                  >
                    {ativa ? <Check size={14} className="chip-check-icon" /> : <Plus size={14} className="chip-plus-icon" />}
                    <span>{col.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grupo 2: Campos Personalizados Criados */}
          {campos.length > 0 && (
            <div>
              <div className="builder-group-title custom">
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
                      className={`btn-column-chip custom ${ativa ? 'active' : ''}`}
                    >
                      {ativa ? <Check size={14} className="chip-check-icon" /> : <Plus size={14} className="chip-plus-icon" />}
                      <span>{cmp.nome}</span>
                      <span className="chip-type-tag">
                        {cmp.tipo}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resumo da Seleção Atual */}
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span>
              Colunas ativas no relatório: <strong style={{ color: 'var(--text-main)' }}>{colunasAtivasConstrutor.length}</strong> de {COLUNAS_CADASTRAIS.length + campos.length}
            </span>
            <span style={{ fontStyle: 'italic' }}>
              Ordem de exibição: {colunasAtivasConstrutor.map(c => c.label).join(' → ') || 'Nenhuma coluna selecionada'}
            </span>
          </div>
        </div>
      )}

      {/* PAINEL DE SELEÇÃO DE COLUNAS DO MODO GEOGRÁFICO */}
      {modo === 'geo' && (
        <div className="glass-panel no-print panel-builder-container" style={{ padding: '22px 24px', borderRadius: '18px', marginBottom: '24px' }}>
          {/* Seção de Modelos Salvos Geográficos */}
          {(() => {
            const modelosGeo = relatoriosSalvos.filter(m => m.modo === 'geo');
            return (
              <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Star size={16} color="#fbbf24" fill="#fbbf24" /> Meus Relatórios & Modelos Salvos ({modelosGeo.length})
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNomeNovoModelo('');
                      setDescNovoModelo('');
                      setModalSalvarAberto(true);
                    }}
                    className="btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.78rem', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }}
                  >
                    <Save size={13} /> Salvar Configuração Atual como Modelo
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {modelosGeo.map(mod => {
                    const isActive = modeloAtivoId === mod.id;
                    return (
                      <div
                        key={mod.id}
                        onClick={() => handleAplicarModelo(mod)}
                        className={`btn-column-chip ${isActive ? 'active' : ''}`}
                        style={{
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'var(--card-bg)',
                          border: isActive ? '1.5px solid #6366f1' : '1px solid var(--card-border)',
                          position: 'relative'
                        }}
                        title={mod.descricao || mod.nome}
                      >
                        <Bookmark size={13} color={isActive ? "#818cf8" : "var(--text-muted)"} />
                        <span style={{ fontWeight: isActive ? 700 : 500 }}>{mod.nome}</span>
                        {mod.is_padrao ? (
                          <span style={{ fontSize: '0.65rem', padding: '2px 5px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Padrão
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleExcluirModelo(mod.id, mod.nome, e)}
                            style={{ background: 'transparent', border: 'none', padding: '2px', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}
                            title="Excluir este modelo salvo"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
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
                onClick={() => {
                  setModeloAtivoId(null);
                  setGeoCols(prev => ({ ...prev, [col.key]: !prev[col.key] }));
                }}
                className={`btn-column-chip ${geoCols[col.key] ? 'active' : ''}`}
              >
                {geoCols[col.key] ? <Check size={13} className="chip-check-icon" /> : <Plus size={13} className="chip-plus-icon" />}
                <span>{col.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PAINEL DE SELEÇÃO DE COLUNAS DO MODO RBAC */}
      {modo === 'rbac' && (
        <div className="glass-panel no-print panel-builder-container" style={{ padding: '22px 24px', borderRadius: '18px', marginBottom: '24px' }}>
          {/* Seção de Modelos Salvos RBAC */}
          {(() => {
            const modelosRbac = relatoriosSalvos.filter(m => m.modo === 'rbac');
            return (
              <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Star size={16} color="#fbbf24" fill="#fbbf24" /> Meus Relatórios & Modelos Salvos ({modelosRbac.length})
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNomeNovoModelo('');
                      setDescNovoModelo('');
                      setModalSalvarAberto(true);
                    }}
                    className="btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.78rem', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }}
                  >
                    <Save size={13} /> Salvar Configuração Atual como Modelo
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {modelosRbac.map(mod => {
                    const isActive = modeloAtivoId === mod.id;
                    return (
                      <div
                        key={mod.id}
                        onClick={() => handleAplicarModelo(mod)}
                        className={`btn-column-chip ${isActive ? 'active' : ''}`}
                        style={{
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'var(--card-bg)',
                          border: isActive ? '1.5px solid #6366f1' : '1px solid var(--card-border)',
                          position: 'relative'
                        }}
                        title={mod.descricao || mod.nome}
                      >
                        <Bookmark size={13} color={isActive ? "#818cf8" : "var(--text-muted)"} />
                        <span style={{ fontWeight: isActive ? 700 : 500 }}>{mod.nome}</span>
                        {mod.is_padrao ? (
                          <span style={{ fontSize: '0.65rem', padding: '2px 5px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Padrão
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleExcluirModelo(mod.id, mod.nome, e)}
                            style={{ background: 'transparent', border: 'none', padding: '2px', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}
                            title="Excluir este modelo salvo"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
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
                onClick={() => {
                  setModeloAtivoId(null);
                  setRbacCols(prev => ({ ...prev, [col.key]: !prev[col.key] }));
                }}
                className={`btn-column-chip ${rbacCols[col.key] ? 'active' : ''}`}
              >
                {rbacCols[col.key] ? <Check size={13} className="chip-check-icon" /> : <Plus size={13} className="chip-plus-icon" />}
                <span>{col.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PAINEL DE FILTROS AVANÇADOS (Oculto na Impressão) */}
      {modo !== 'rbac' && (
        <div className="glass-panel no-print panel-filtros-container" style={{ padding: '18px 24px', borderRadius: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
            {/* 1. Busca Geral */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Busca Rápida</label>
              <div className="search-box-relatorio">
                <Search size={16} className="search-box-icon" />
                <input
                  type="text"
                  placeholder="Nome, CPF, Cargo, PIX..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
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

            {/* 8. Botão de Limpar Filtros */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'transparent', textTransform: 'uppercase', userSelect: 'none' }}>Ação</label>
              <button
                type="button"
                onClick={handleResetFiltros}
                className="btn-secondary"
                style={{ height: '38px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                title="Limpar todos os filtros da busca"
              >
                <Eraser size={15} /> Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ÁREA DE IMPRESSÃO / PRÉ-VISUALIZAÇÃO DO RELATÓRIO */}
      <div className="printable-report-area glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
        {/* Cabeçalho exclusivo para a impressão em PDF */}
        <div className="pdf-header-only">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img 
              src="/logo.png" 
              alt="Logo Regz" 
              style={{ width: '48px', height: '48px', objectFit: 'contain', flexShrink: 0 }} 
            />
            <div>
              <h2 style={{ fontSize: '1.45rem', color: '#000000', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
                REGZ GESTÃO DE PESSOAS
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#000000', margin: '2px 0' }}>
                {modo === 'construtor' && 'Relatório Personalizado de Colaboradores & Campos'}
                {modo === 'geo' && 'Relatório de Distribuição Geográfica'}
                {modo === 'rbac' && 'Relatório de Usuários e Permissões (RBAC)'}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.78rem', color: '#000000', display: 'block', fontWeight: 600 }}>
              Gerado em: {new Date().toLocaleString('pt-BR')}
            </span>
            {modo === 'construtor' && (
              <span style={{ fontSize: '0.78rem', color: '#000000', display: 'block' }}>
                {colunasAtivasConstrutor.length} colunas exibidas
              </span>
            )}
          </div>
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
                <span className="tag-status-ativo" style={{ color: '#10b981', fontWeight: 600 }}>
                  ● {colaboradoresFiltrados.filter(c => c.ativo !== false).length} Ativos
                </span>
                <span className="tag-status-inativo" style={{ color: '#ef4444', fontWeight: 600 }}>
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
          <div className="table-flex-wrapper table-sticky-wrapper">
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
                        {colunasAtivasConstrutor.map(col => {
                          const isSorted = sortColumn === col.key;
                          const colW = columnWidths[col.key] || DEFAULT_RELATORIO_WIDTHS[col.key] || 180;
                          return (
                            <th 
                              key={col.key}
                              onClick={() => handleToggleSort(col.key)}
                              style={{ 
                                width: `${colW}px`,
                                minWidth: '60px',
                                cursor: 'pointer', 
                                userSelect: 'none',
                                transition: 'all 0.15s ease'
                              }}
                              title={`Clique para ordenar por ${col.label} (${isSorted && sortDirection === 'asc' ? 'Decrescente' : 'Crescente'})`}
                            >
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', width: 'calc(100% - 12px)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <span>{col.label}</span>
                                {isSorted ? (
                                  sortDirection === 'asc' ? (
                                    <ArrowUp size={14} color="#818cf8" style={{ flexShrink: 0 }} />
                                  ) : (
                                    <ArrowDown size={14} color="#818cf8" style={{ flexShrink: 0 }} />
                                  )
                                ) : (
                                  <ArrowUpDown size={13} style={{ opacity: 0.3, flexShrink: 0 }} />
                                )}
                              </div>
                              <div
                                className="resizer"
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => handleMouseDownResize(e, col.key)}
                                title="Arraste para redimensionar a largura da coluna"
                              />
                            </th>
                          );
                        })}
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
                              const colW = columnWidths[col.key] || DEFAULT_RELATORIO_WIDTHS[col.key] || 180;
                              // Renderização específica para foto
                              if (col.key === 'foto') {
                                return (
                                  <td key={col.key} style={{ width: `${colW}px` }}>
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
                                  <td key={col.key} style={{ width: `${colW}px` }}>
                                    <span className={c.ativo !== false ? 'tag-status-ativo' : 'tag-status-inativo'} style={{
                                      color: c.ativo !== false ? '#10b981' : '#ef4444',
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
                                  <td key={col.key} style={{ width: `${colW}px` }}>
                                    <span className="cargo-badge" style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>
                                      {c.cargo || 'Não definido'}
                                    </span>
                                  </td>
                                );
                              }

                              // Renderização para campos personalizados e demais valores
                              const val = getValorCelula(c, col);
                              return (
                                <td key={col.key} style={{ width: `${colW}px`, ...(col.key === 'nome' ? { fontWeight: 600 } : {}) }}>
                                  {val === 'Sim' ? (
                                    <span className="tag-boolean-sim" style={{ color: '#10b981', fontWeight: 700 }}>✓ Sim</span>
                                  ) : val === 'Não' ? (
                                    <span className="tag-boolean-nao" style={{ color: '#ef4444', fontWeight: 700 }}>✗ Não</span>
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
                    {geoCols.estado && (
                      <th style={{ width: `${columnWidths.estado || DEFAULT_RELATORIO_WIDTHS.estado}px` }}>
                        <span>Estado (UF)</span>
                        <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'estado')} title="Arraste para redimensionar coluna" />
                      </th>
                    )}
                    {geoCols.cidade && (
                      <th style={{ width: `${columnWidths.cidade || DEFAULT_RELATORIO_WIDTHS.cidade}px` }}>
                        <span>Cidade / Município</span>
                        <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'cidade')} title="Arraste para redimensionar coluna" />
                      </th>
                    )}
                    {geoCols.ativos && (
                      <th style={{ textAlign: 'right', width: `${columnWidths.ativos || DEFAULT_RELATORIO_WIDTHS.ativos}px` }}>
                        <span>Ativos</span>
                        <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'ativos')} title="Arraste para redimensionar coluna" />
                      </th>
                    )}
                    {geoCols.inativos && (
                      <th style={{ textAlign: 'right', width: `${columnWidths.inativos || DEFAULT_RELATORIO_WIDTHS.inativos}px` }}>
                        <span>Inativos</span>
                        <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'inativos')} title="Arraste para redimensionar coluna" />
                      </th>
                    )}
                    {geoCols.total && (
                      <th style={{ textAlign: 'right', width: `${columnWidths.total || DEFAULT_RELATORIO_WIDTHS.total}px` }}>
                        <span>Total Geral</span>
                        <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'total')} title="Arraste para redimensionar coluna" />
                      </th>
                    )}
                    {geoCols.percentual && (
                      <th style={{ textAlign: 'right', width: `${columnWidths.percentual || DEFAULT_RELATORIO_WIDTHS.percentual}px` }}>
                        <span>% do Headcount</span>
                        <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'percentual')} title="Arraste para redimensionar coluna" />
                      </th>
                    )}
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
                        {geoCols.estado && <td style={{ width: `${columnWidths.estado || DEFAULT_RELATORIO_WIDTHS.estado}px`, fontWeight: 700, color: '#818cf8' }}>{g.estado}</td>}
                        {geoCols.cidade && <td style={{ width: `${columnWidths.cidade || DEFAULT_RELATORIO_WIDTHS.cidade}px`, fontWeight: 600 }}>{g.cidade}</td>}
                        {geoCols.ativos && (
                          <td style={{ width: `${columnWidths.ativos || DEFAULT_RELATORIO_WIDTHS.ativos}px`, textAlign: 'right', color: '#34d399', fontWeight: 700 }}>
                            {g.ativos}
                          </td>
                        )}
                        {geoCols.inativos && (
                          <td style={{ width: `${columnWidths.inativos || DEFAULT_RELATORIO_WIDTHS.inativos}px`, textAlign: 'right', color: '#fb7185', fontWeight: 600 }}>
                            {g.inativos}
                          </td>
                        )}
                        {geoCols.total && (
                          <td style={{ width: `${columnWidths.total || DEFAULT_RELATORIO_WIDTHS.total}px`, textAlign: 'right', fontWeight: 800, color: '#f8fafc' }}>
                            {g.total}
                          </td>
                        )}
                        {geoCols.percentual && (
                          <td style={{ width: `${columnWidths.percentual || DEFAULT_RELATORIO_WIDTHS.percentual}px`, textAlign: 'right', color: '#38bdf8', fontWeight: 700 }}>
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
                    {rbacCols.id && (
                      <th style={{ width: `${columnWidths.id || DEFAULT_RELATORIO_WIDTHS.id}px` }}>
                        <span>ID</span>
                        <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'id')} title="Arraste para redimensionar coluna" />
                      </th>
                    )}
                    {rbacCols.nome && (
                      <th style={{ width: `${columnWidths.nome || DEFAULT_RELATORIO_WIDTHS.nome}px` }}>
                        <span>Nome do Usuário</span>
                        <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'nome')} title="Arraste para redimensionar coluna" />
                      </th>
                    )}
                    {rbacCols.email && (
                      <th style={{ width: `${columnWidths.email || DEFAULT_RELATORIO_WIDTHS.email}px` }}>
                        <span>E-mail de Acesso</span>
                        <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'email')} title="Arraste para redimensionar coluna" />
                      </th>
                    )}
                    {rbacCols.perfil && (
                      <th style={{ width: `${columnWidths.perfil || DEFAULT_RELATORIO_WIDTHS.perfil}px` }}>
                        <span>Perfil de Acesso</span>
                        <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'perfil')} title="Arraste para redimensionar coluna" />
                      </th>
                    )}
                    {rbacCols.tipo && (
                      <th style={{ width: `${columnWidths.tipo || DEFAULT_RELATORIO_WIDTHS.tipo}px` }}>
                        <span>Tipo</span>
                        <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'tipo')} title="Arraste para redimensionar coluna" />
                      </th>
                    )}
                    {rbacCols.status && (
                      <th style={{ textAlign: 'center', width: `${columnWidths.status || DEFAULT_RELATORIO_WIDTHS.status}px` }}>
                        <span>Status</span>
                        <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'status')} title="Arraste para redimensionar coluna" />
                      </th>
                    )}
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
                        {rbacCols.id && <td style={{ width: `${columnWidths.id || DEFAULT_RELATORIO_WIDTHS.id}px` }}>#{u.id}</td>}
                        {rbacCols.nome && <td style={{ width: `${columnWidths.nome || DEFAULT_RELATORIO_WIDTHS.nome}px`, fontWeight: 600 }}>{u.nome}</td>}
                        {rbacCols.email && <td style={{ width: `${columnWidths.email || DEFAULT_RELATORIO_WIDTHS.email}px` }}>{u.email}</td>}
                        {rbacCols.perfil && (
                          <td style={{ width: `${columnWidths.perfil || DEFAULT_RELATORIO_WIDTHS.perfil}px` }}>
                            <span className={`badge-perfil ${u.perfil?.is_admin ? 'admin' : 'gestor-rh'}`}>
                              {u.perfil?.nome || 'Sem Perfil'}
                            </span>
                          </td>
                        )}
                        {rbacCols.tipo && (
                          <td style={{ width: `${columnWidths.tipo || DEFAULT_RELATORIO_WIDTHS.tipo}px` }}>
                            {u.perfil?.is_admin ? (
                              <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.8rem' }}>Administrador Master</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Usuário Padrão</span>
                            )}
                          </td>
                        )}
                        {rbacCols.status && (
                          <td style={{ width: `${columnWidths.status || DEFAULT_RELATORIO_WIDTHS.status}px`, textAlign: 'center' }}>
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

      {/* MODAL PARA SALVAR NOVO MODELO DE RELATÓRIO */}
      {modalSalvarAberto && (
        <div className="modal-overlay" onClick={() => setModalSalvarAberto(false)}>
          <div 
            className="modal-content glass-panel" 
            style={{ maxWidth: '480px', width: '90%', padding: '24px', borderRadius: '20px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                  <Star size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Salvar Modelo de Relatório</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Grave suas colunas e filtros para usar com 1 clique</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalSalvarAberto(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoModelo}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Nome do Modelo *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Aniversariantes do Mês, Financeiro PIX..."
                    value={nomeNovoModelo}
                    onChange={e => setNomeNovoModelo(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--card-border)',
                      background: 'rgba(0, 0, 0, 0.2)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Descrição (Opcional)
                  </label>
                  <textarea
                    placeholder="Breve resumo da finalidade deste relatório..."
                    value={descNovoModelo}
                    onChange={e => setDescNovoModelo(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--card-border)',
                      background: 'rgba(0, 0, 0, 0.2)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box',
                      resize: 'none'
                    }}
                  />
                </div>

                {/* Resumo do que será salvo */}
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.8rem' }}>
                  <div style={{ color: '#818cf8', fontWeight: 700, marginBottom: '4px' }}>⚙️ Configuração a ser salva ({modo === 'construtor' ? 'Construtor de Relatórios' : modo === 'geo' ? 'Distribuição Geográfica' : 'Usuários RBAC'}):</div>
                  {modo === 'construtor' && (
                    <>
                      <div>• <strong>{colunasSelecionadas.length} colunas</strong> selecionadas</div>
                      <div>• Filtros: Status ({filtroStatus}), Cargo ({filtroCargo}), UF ({filtroEstado})</div>
                    </>
                  )}
                  {modo === 'geo' && (
                    <>
                      <div>• <strong>{Object.values(geoCols).filter(Boolean).length} colunas geográficas</strong> ativas</div>
                      <div>• Filtros: UF ({filtroEstado}), Cidade ({filtroCidade})</div>
                    </>
                  )}
                  {modo === 'rbac' && (
                    <>
                      <div>• <strong>{Object.values(rbacCols).filter(Boolean).length} colunas de usuários</strong> ativas</div>
                      <div>• Filtros: Busca ({search || 'nenhuma'})</div>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setModalSalvarAberto(false)}
                    className="btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvandoModelo || !nomeNovoModelo.trim()}
                    className="btn-primary"
                    style={{ padding: '8px 18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {salvandoModelo ? <RefreshCw size={14} className="spin" /> : <Save size={14} />} Salvar Modelo
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL DE PRÉ-VISUALIZAÇÃO DE PDF NA PRÓPRIA PÁGINA */}
      {modalPreviewPDF && pdfPreviewBlobUrl && (
        <div className="modal-overlay pdf-preview-modal-overlay" onClick={fecharModalPreviewPDF}>
          <div 
            className="modal-container pdf-preview-modal-container glass-panel" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header pdf-preview-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '10px', color: '#818cf8' }}>
                  <FileText size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                    Pré-visualização do Relatório em PDF
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Formato Oficial A4 • Documento vetorial pronto para impressão e download
                  </p>
                </div>
              </div>

              {/* Controles: Retrato / Paisagem + Download + Imprimir + Fechar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div className="pdf-orientation-toggle" style={{ margin: 0 }}>
                  <button
                    type="button"
                    onClick={() => alternarOrientacaoNoModal('portrait')}
                    className={`orientation-btn ${orientacaoPDF === 'portrait' ? 'active' : ''}`}
                    disabled={gerandoPDF}
                    title="Alternar para Formato A4 Retrato (Vertical)"
                  >
                    Retrato
                  </button>
                  <button
                    type="button"
                    onClick={() => alternarOrientacaoNoModal('landscape')}
                    className={`orientation-btn ${orientacaoPDF === 'landscape' ? 'active' : ''}`}
                    disabled={gerandoPDF}
                    title="Alternar para Formato A4 Paisagem (Horizontal)"
                  >
                    Paisagem
                  </button>
                </div>

                <button
                  type="button"
                  onClick={baixarPDF}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.85rem' }}
                  title="Baixar arquivo .PDF no seu dispositivo"
                >
                  <Download size={16} /> Baixar PDF
                </button>

                <button
                  type="button"
                  onClick={imprimirPDFDoModal}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.85rem' }}
                  title="Enviar documento para a impressora"
                >
                  <Printer size={16} /> Imprimir
                </button>

                <button
                  type="button"
                  onClick={fecharModalPreviewPDF}
                  className="btn-close"
                  title="Fechar pré-visualização"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="pdf-preview-body">
              {gerandoPDF ? (
                <div style={{ height: '72vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '14px' }}>
                  <RefreshCw size={36} className="spin" color="#6366f1" />
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Renderizando documento PDF...</span>
                </div>
              ) : (
                <iframe
                  ref={pdfIframeRef}
                  src={`${pdfPreviewBlobUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                  title="Pré-visualização do Relatório PDF"
                  className="pdf-preview-iframe"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
