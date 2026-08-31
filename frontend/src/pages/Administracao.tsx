import React, { useState, useEffect } from 'react';
import { Usuario, PerfilAcesso, Licenca } from '../types/auth';
import { Users, Shield, Plus, Trash2, Edit, Check, AlertCircle, Loader2, UserCheck, UserX, Home, Sliders, ShieldCheck, FileBarChart, Settings, Briefcase, X, Key, Copy, RefreshCw, Calendar, Award, CheckCircle2, XCircle, AlertTriangle, Eye, EyeOff, Building2, MapPin, Palette, Upload, History, FileSpreadsheet, Filter, Search, Info } from 'lucide-react';

interface UserColumnWidths {
  nome: number;
  email: number;
  perfil: number;
  licenca: number;
  senha: number;
  acoes: number;
}

interface LicencaColumnWidths {
  chave: number;
  usuario: number;
  plano: number;
  validade: number;
  status: number;
  acoes: number;
}

export interface Empresa {
  id: number;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  logo_url?: string;
  cor_primaria?: string;
  cor_secundaria?: string;
  cor_destaque?: string;
  status: string;
  db_tipo?: string;
  db_uri?: string;
  db_host?: string;
  db_port?: number;
  db_user?: string;
  db_pass?: string;
  db_name?: string;
  total_usuarios?: number;
  licencas_ativas?: number;
  total_licencas?: number;
  criado_em: string;
}

export interface LogAuditoria {
  id: number;
  empresa_id: number;
  usuario_id?: number | null;
  usuario_nome: string;
  usuario_email: string;
  acao: string;
  entidade: string;
  registro_id?: string | null;
  detalhes: any;
  ip?: string;
  criado_em: string;
}

interface EmpresaColumnWidths {
  logo: number;
  empresa: number;
  cnpj: number;
  local: number;
  cores: number;
  licencas: number;
  status: number;
  acoes: number;
}

export interface SystemModuleConfig {
  id: string;
  label: string;
  iconName: string;
}

export const SYSTEM_MODULES: SystemModuleConfig[] = [
  { id: 'home', label: 'Home', iconName: 'Home' },
  { id: 'colaboradores', label: 'Colaboradores', iconName: 'Users' },
  { id: 'campos', label: 'Campos', iconName: 'Sliders' },
  { id: 'administracao', label: 'Administração', iconName: 'ShieldCheck' },
  { id: 'relatorios', label: 'Relatórios', iconName: 'FileBarChart' },
  { id: 'configuracoes', label: 'Configurações', iconName: 'Settings' },
  { id: 'departamentos', label: 'Departamentos', iconName: 'Briefcase' }
];

const getModuleIcon = (iconName: string) => {
  switch (iconName) {
    case 'Home': return <Home size={16} color="#5e5eee" />;
    case 'Users': return <Users size={16} color="#5e5eee" />;
    case 'Sliders': return <Sliders size={16} color="#5e5eee" />;
    case 'ShieldCheck': return <ShieldCheck size={16} color="#a855f7" />;
    case 'FileBarChart': return <FileBarChart size={16} color="#34d399" />;
    case 'Settings': return <Settings size={16} color="#fb7185" />;
    case 'Briefcase': return <Briefcase size={16} color="#f59e0b" />;
    default: return <Home size={16} color="#5e5eee" />;
  }
};

import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';

export const Administracao: React.FC = () => {
  const { usuario, temPermissao } = useAuth();
  const { showSnackbar } = useSnackbar();
  const podeEditar = temPermissao('administracao', 'escrita');
  const isSuperAdmin = !!(usuario?.is_super_admin || (usuario?.email && usuario.email.toLowerCase() === 'admin@regz.app') || usuario?.nome === 'Administrador Regz');
  const isUserAdminTag = !!usuario?.perfil?.is_admin;

  const [subTab, setSubTab] = useState<'usuarios' | 'perfis' | 'licencas' | 'empresas' | 'auditoria'>('usuarios');

  // Estados de Logs de Auditoria
  const [logsAuditoria, setLogsAuditoria] = useState<LogAuditoria[]>([]);
  const [loadingAuditoria, setLoadingAuditoria] = useState(false);
  const [filtroAuditoriaAcao, setFiltroAuditoriaAcao] = useState('todos');
  const [filtroAuditoriaEntidade, setFiltroAuditoriaEntidade] = useState('todos');
  const [searchAuditoria, setSearchAuditoria] = useState('');
  const [dataInicioAuditoria, setDataInicioAuditoria] = useState('');
  const [dataFimAuditoria, setDataFimAuditoria] = useState('');
  const [logModalDetalhe, setLogModalDetalhe] = useState<LogAuditoria | null>(null);

  useEffect(() => {
    if ((subTab === 'licencas' || subTab === 'empresas') && !isSuperAdmin) {
      setSubTab('usuarios');
    }
  }, [subTab, isSuperAdmin]);

  // Helper para renderizar a Badge de Perfil com cores tematicas (Admin com brilho, outros sem brilho)
  const renderPerfilBadge = (nome: string, isAdmin?: boolean) => {
    if (isAdmin) {
      return (
        <span className="badge-perfil admin">
          <Shield size={12} /> ADMIN
        </span>
      );
    }

    const nomeLower = (nome || '').toLowerCase();
    let variant = 'outro';

    if (nomeLower.includes('rh') || nomeLower.includes('gestor')) {
      variant = 'gestor-rh';
    } else if (nomeLower.includes('operador')) {
      variant = 'operador';
    } else if (nomeLower.includes('consulta')) {
      variant = 'consulta';
    }

    return (
      <span className={`badge-perfil ${variant}`}>
        {nome || 'Sem Perfil'}
      </span>
    );
  };

  // Estados de Usuários
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [modalUserOpen, setModalUserOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  // Estados de Perfis
  const [perfis, setPerfis] = useState<PerfilAcesso[]>([]);
  const [loadingPerfis, setLoadingPerfis] = useState(true);
  const [modalPerfilOpen, setModalPerfilOpen] = useState(false);
  const [editingPerfilId, setEditingPerfilId] = useState<number | null>(null);

  // Estados de Licenças
  const [licencas, setLicencas] = useState<Licenca[]>([]);
  const [loadingLicencas, setLoadingLicencas] = useState(true);
  const [modalLicencaOpen, setModalLicencaOpen] = useState(false);
  const [newLicencaUsuarioId, setNewLicencaUsuarioId] = useState<string>('');
  const [newLicencaTipo, setNewLicencaTipo] = useState<string>('Enterprise');
  const [newLicencaValidade, setNewLicencaValidade] = useState<number>(30);
  const [submittingLicenca, setSubmittingLicenca] = useState(false);
  const [licencaSuccess, setLicencaSuccess] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Estados de Empresas (Super Admin)
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [modalEmpresaOpen, setModalEmpresaOpen] = useState(false);
  const [editingEmpresaId, setEditingEmpresaId] = useState<number | null>(null);

  const [empresaRazaoSocial, setEmpresaRazaoSocial] = useState('');
  const [empresaNomeFantasia, setEmpresaNomeFantasia] = useState('');
  const [empresaCnpj, setEmpresaCnpj] = useState('');
  const [empresaCep, setEmpresaCep] = useState('');
  const [empresaLogradouro, setEmpresaLogradouro] = useState('');
  const [empresaNumero, setEmpresaNumero] = useState('');
  const [empresaComplemento, setEmpresaComplemento] = useState('');
  const [empresaBairro, setEmpresaBairro] = useState('');
  const [empresaCidade, setEmpresaCidade] = useState('');
  const [empresaEstado, setEmpresaEstado] = useState('');
  const [empresaLogoUrl, setEmpresaLogoUrl] = useState('');
  const [empresaCorPrimaria, setEmpresaCorPrimaria] = useState('#6366f1');
  const [empresaCorSecundaria, setEmpresaCorSecundaria] = useState('#38bdf8');
  const [empresaCorDestaque, setEmpresaCorDestaque] = useState('#34d399');
  const [empresaStatus, setEmpresaStatus] = useState('Ativa');
  const [buscandoCepEmpresa, setBuscandoCepEmpresa] = useState(false);
  const [cepErrorEmpresa, setCepErrorEmpresa] = useState('');
  const [submittingEmpresa, setSubmittingEmpresa] = useState(false);

  // Modal Licenças da Empresa
  const [modalEmpresaLicencasOpen, setModalEmpresaLicencasOpen] = useState(false);
  const [selectedEmpresaLicencas, setSelectedEmpresaLicencas] = useState<Empresa | null>(null);
  const [empresaLicencasList, setEmpresaLicencasList] = useState<Licenca[]>([]);
  const [loadingEmpresaLicencas, setLoadingEmpresaLicencas] = useState(false);

  // Listener para fechar modais exclusivamente ao pressionar a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modalUserOpen) setModalUserOpen(false);
        if (modalPerfilOpen) setModalPerfilOpen(false);
        if (modalLicencaOpen) setModalLicencaOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalUserOpen, modalPerfilOpen, modalLicencaOpen]);

  // Estados para Largura Arrastável de Colunas na Tabela de Usuários (com LocalStorage por Usuário)
  const [userColumnWidths, setUserColumnWidths] = useState<UserColumnWidths>({
    nome: 200,
    email: 200,
    perfil: 140,
    licenca: 220,
    senha: 180,
    acoes: 165
  });

  const totalUserTableWidth = (userColumnWidths.nome || 200) +
    (userColumnWidths.email || 200) +
    (userColumnWidths.perfil || 140) +
    (userColumnWidths.licenca || 220) +
    (userColumnWidths.senha || 180) +
    (userColumnWidths.acoes || 165);

  // Carregar larguras salvas do LocalStorage específicas do usuário logado
  const [licencaColumnWidths, setLicencaColumnWidths] = useState<LicencaColumnWidths>({
    chave: 260,
    usuario: 220,
    plano: 150,
    validade: 150,
    status: 120,
    acoes: 165
  });

  const totalLicTableWidth = (licencaColumnWidths.chave || 260) +
    (licencaColumnWidths.usuario || 220) +
    (licencaColumnWidths.plano || 150) +
    (licencaColumnWidths.validade || 150) +
    (licencaColumnWidths.status || 120) +
    (licencaColumnWidths.acoes || 165);

  const [empresaColumnWidths, setEmpresaColumnWidths] = useState<EmpresaColumnWidths>({
    logo: 70,
    empresa: 220,
    cnpj: 160,
    local: 220,
    cores: 140,
    licencas: 130,
    status: 110,
    acoes: 165
  });

  const totalEmpresaTableWidth = (empresaColumnWidths.logo || 70) +
    (empresaColumnWidths.empresa || 220) +
    (empresaColumnWidths.cnpj || 160) +
    (empresaColumnWidths.local || 220) +
    (empresaColumnWidths.cores || 140) +
    (empresaColumnWidths.licencas || 130) +
    (empresaColumnWidths.status || 110) +
    (empresaColumnWidths.acoes || 165);

  useEffect(() => {
    if (usuario?.id) {
      const saved = localStorage.getItem(`regz_user_column_widths_${usuario.id}`);
      if (saved) {
        try {
          setUserColumnWidths(JSON.parse(saved));
        } catch (e) {
          /* fallback para padrao */
        }
      }
      const savedLic = localStorage.getItem(`regz_licenca_column_widths_${usuario.id}`);
      if (savedLic) {
        try {
          setLicencaColumnWidths(JSON.parse(savedLic));
        } catch (e) {
          /* fallback para padrao */
        }
      }
    }
  }, [usuario?.id]);

  const [resizingCol, setResizingCol] = useState<keyof UserColumnWidths | null>(null);
  const [resizingLicCol, setResizingLicCol] = useState<keyof LicencaColumnWidths | null>(null);
  const [startX, setStartX] = useState<number>(0);
  const [startWidth, setStartWidth] = useState<number>(0);

  // Modal de Renovação/Alteração de Licença
  const [modalRenovarOpen, setModalRenovarOpen] = useState(false);
  const [selectedLicencaRenovar, setSelectedLicencaRenovar] = useState<Licenca | null>(null);
  const [renovarOpcao, setRenovarOpcao] = useState<'renovar_30' | 'upgrade_120' | 'upgrade_365' | 'downgrade_trial' | 'add_120' | 'add_365'>('renovar_30');
  const [submittingRenovar, setSubmittingRenovar] = useState(false);

  // Form de Usuário
  const [userNome, setUserNome] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userSenha, setUserSenha] = useState('');
  const [userPerfilId, setUserPerfilId] = useState<number | ''>('');
  const [userChaveLicenca, setUserChaveLicenca] = useState('');
  const [userAtivo, setUserAtivo] = useState(true);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [submittingUser, setSubmittingUser] = useState(false);

  // Form de Criar / Editar Perfil
  const [perfilNome, setPerfilNome] = useState('');
  const [perfilDescricao, setPerfilDescricao] = useState('');
  const [perfilAtivo, setPerfilAtivo] = useState(true);
  const [perfilIsAdmin, setPerfilIsAdmin] = useState(false);
  const [perfilPermissoes, setPerfilPermissoes] = useState<Record<string, 'sem_acesso' | 'leitura' | 'escrita'>>({
    home: 'escrita',
    colaboradores: 'escrita',
    campos: 'escrita',
    administracao: 'sem_acesso',
    relatorios: 'escrita',
    configuracoes: 'sem_acesso',
    departamentos: 'sem_acesso'
  });
  const [perfilError, setPerfilError] = useState('');
  const [perfilSuccess, setPerfilSuccess] = useState('');
  const [submittingPerfil, setSubmittingPerfil] = useState(false);

  // Estado para visibilidade da chave de licenca por ID (Mascara com olho revelador para Admin)
  const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({});

  const handleToggleKeyVisibility = (licId: number) => {
    if (!isUserAdminTag) return;
    setVisibleKeys(prev => ({ ...prev, [licId]: !prev[licId] }));
  };

  const [resizingEmpCol, setResizingEmpCol] = useState<keyof EmpresaColumnWidths | null>(null);

  // Arraste de Redimensionamento de Colunas
  const handleMouseDownResize = (e: React.MouseEvent, colKey: keyof UserColumnWidths) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingCol(colKey);
    setStartX(e.clientX);
    setStartWidth(userColumnWidths[colKey]);
  };

  const handleMouseDownResizeLic = (e: React.MouseEvent, colKey: keyof LicencaColumnWidths) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingLicCol(colKey);
    setStartX(e.clientX);
    setStartWidth(licencaColumnWidths[colKey]);
  };

  const handleMouseDownResizeEmp = (e: React.MouseEvent, colKey: keyof EmpresaColumnWidths) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingEmpCol(colKey);
    setStartX(e.clientX);
    setStartWidth(empresaColumnWidths[colKey]);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingCol) {
        const deltaX = e.clientX - startX;
        const newWidth = Math.max(80, startWidth + deltaX);
        setUserColumnWidths(prev => {
          const next = { ...prev, [resizingCol]: newWidth };
          if (usuario?.id) {
            localStorage.setItem(`regz_user_column_widths_${usuario.id}`, JSON.stringify(next));
          }
          return next;
        });
      } else if (resizingLicCol) {
        const deltaX = e.clientX - startX;
        const newWidth = Math.max(80, startWidth + deltaX);
        setLicencaColumnWidths(prev => {
          const next = { ...prev, [resizingLicCol]: newWidth };
          if (usuario?.id) {
            localStorage.setItem(`regz_licenca_column_widths_${usuario.id}`, JSON.stringify(next));
          }
          return next;
        });
      } else if (resizingEmpCol) {
        const deltaX = e.clientX - startX;
        const newWidth = Math.max(70, startWidth + deltaX);
        setEmpresaColumnWidths(prev => {
          const next = { ...prev, [resizingEmpCol]: newWidth };
          if (usuario?.id) {
            localStorage.setItem(`regz_empresa_column_widths_${usuario.id}`, JSON.stringify(next));
          }
          return next;
        });
      }
    };

    const handleMouseUp = () => {
      if (resizingCol) setResizingCol(null);
      if (resizingLicCol) setResizingLicCol(null);
      if (resizingEmpCol) setResizingEmpCol(null);
    };

    if (resizingCol || resizingLicCol || resizingEmpCol) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingCol, resizingLicCol, resizingEmpCol, startX, startWidth, usuario?.id]);

  const getAuthHeaders = () => {
    const savedToken = localStorage.getItem('regz_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`;
    if (usuario?.empresa_id) headers['x-empresa-id'] = String(usuario.empresa_id);
    return headers;
  };

  // Carregar dados da API
  const fetchUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const res = await fetch('/api/usuarios', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      }
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const fetchPerfis = async () => {
    setLoadingPerfis(true);
    try {
      const res = await fetch('/api/perfis-acesso', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setPerfis(data);
      }
    } catch (err) {
      console.error('Erro ao buscar perfis:', err);
    } finally {
      setLoadingPerfis(false);
    }
  };

  const fetchLicencas = async () => {
    setLoadingLicencas(true);
    try {
      const res = await fetch('/api/licencas', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setLicencas(data);
      }
    } catch (err) {
      console.error('Erro ao buscar chaves de licença:', err);
    } finally {
      setLoadingLicencas(false);
    }
  };

  const fetchEmpresas = async () => {
    setLoadingEmpresas(true);
    try {
      const res = await fetch('/api/empresas', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setEmpresas(data);
      }
    } catch (err) {
      console.error('Erro ao buscar empresas:', err);
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const fetchAuditoria = async () => {
    setLoadingAuditoria(true);
    try {
      const params = new URLSearchParams();
      if (filtroAuditoriaAcao !== 'todos') params.append('acao', filtroAuditoriaAcao);
      if (filtroAuditoriaEntidade !== 'todos') params.append('entidade', filtroAuditoriaEntidade);
      if (searchAuditoria.trim()) params.append('q', searchAuditoria.trim());
      if (dataInicioAuditoria) params.append('data_inicio', dataInicioAuditoria);
      if (dataFimAuditoria) params.append('data_fim', dataFimAuditoria);
      params.append('limit', '150');

      const res = await fetch(`/api/auditoria?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setLogsAuditoria(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Erro ao buscar logs de auditoria:', err);
    } finally {
      setLoadingAuditoria(false);
    }
  };

  const exportarAuditoriaCSV = () => {
    if (logsAuditoria.length === 0) {
      showSnackbar('Nenhum log de auditoria para exportar.', 'info');
      return;
    }
    const headers = ['ID', 'Data/Hora', 'Usuário', 'E-mail', 'Ação', 'Entidade', 'Registro ID', 'IP', 'Detalhes'];
    const rows = logsAuditoria.map(l => [
      l.id,
      new Date(l.criado_em).toLocaleString('pt-BR'),
      `"${(l.usuario_nome || '').replace(/"/g, '""')}"`,
      `"${(l.usuario_email || '').replace(/"/g, '""')}"`,
      l.acao,
      l.entidade,
      l.registro_id || '-',
      l.ip || '-',
      `"${(typeof l.detalhes === 'object' ? JSON.stringify(l.detalhes) : String(l.detalhes || '')).replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `logs_auditoria_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar('Logs de auditoria exportados com sucesso!', 'success');
  };

  const renderAuditoriaAcaoBadge = (acao: string) => {
    switch (acao) {
      case 'LOGIN':
        return <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>LOGIN</span>;
      case 'CRIAR':
      case 'CRIAR_CAMPO':
      case 'CRIAR_PERFIL':
      case 'CRIAR_RELATORIO_SALVO':
        return <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>{acao}</span>;
      case 'EDITAR':
      case 'EDITAR_PERFIL':
        return <span style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>{acao}</span>;
      case 'INATIVAR':
        return <span style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#f97316', border: '1px solid rgba(249, 115, 22, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>INATIVAR</span>;
      case 'REATIVAR':
        return <span style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#14b8a6', border: '1px solid rgba(20, 184, 166, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>REATIVAR</span>;
      case 'EXCLUIR':
      case 'EXCLUIR_CAMPO':
      case 'EXCLUIR_PERFIL':
      case 'EXCLUIR_RELATORIO_SALVO':
        return <span style={{ background: 'rgba(251, 113, 133, 0.15)', color: '#fb7185', border: '1px solid rgba(251, 113, 133, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>{acao}</span>;
      default:
        return <span style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', border: '1px solid var(--card-border)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>{acao}</span>;
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchPerfis();
    fetchLicencas();
    fetchEmpresas();
    fetchAuditoria();
  }, []);

  useEffect(() => {
    if (subTab === 'auditoria') {
      fetchAuditoria();
    }
  }, [subTab, filtroAuditoriaAcao, filtroAuditoriaEntidade, dataInicioAuditoria, dataFimAuditoria]);

  const handleCopyKey = (chave: string) => {
    navigator.clipboard.writeText(chave);
    setCopiedKey(chave);
    showSnackbar('Chave copiada para a área de transferência!', 'info');
    setTimeout(() => setCopiedKey(null), 3000);
  };

  const handleCreateLicenca = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLicenca(true);
    try {
      const res = await fetch('/api/licencas', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          usuario_id: newLicencaUsuarioId ? parseInt(newLicencaUsuarioId, 10) : null,
          tipo_licenca: newLicencaTipo,
          validade_dias: newLicencaValidade
        })
      });

      if (res.ok) {
        setLicencaSuccess('Nova chave de licença gerada e ativada com sucesso!');
        showSnackbar('Nova chave de licença gerada e ativada com sucesso!', 'success');
        setModalLicencaOpen(false);
        fetchLicencas();
        fetchUsuarios();
        setTimeout(() => setLicencaSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Erro ao criar licença:', err);
    } finally {
      setSubmittingLicenca(false);
    }
  };

  const handleOpenModalRenovar = (lic: Licenca) => {
    if (!isUserAdminTag) {
      alert('Apenas perfis com a TAG de Administrador podem renovar chaves de licença.');
      return;
    }
    setSelectedLicencaRenovar(lic);
    const isTrial = lic.tipo_licenca === 'Trial' || lic.tipo_licenca === 'Dev / Trial';
    setRenovarOpcao(isTrial ? 'renovar_30' : 'add_120');
    setModalRenovarOpen(true);
  };

  const handleConfirmarRenovacao = async () => {
    if (!selectedLicencaRenovar) return;
    setSubmittingRenovar(true);

    try {
      let dias = 30;
      let tipo_licenca: string | undefined = undefined;
      let redefinir = false;

      if (renovarOpcao === 'renovar_30') {
        dias = 30;
        tipo_licenca = 'Trial';
      } else if (renovarOpcao === 'upgrade_120') {
        dias = 120;
        tipo_licenca = 'Enterprise';
      } else if (renovarOpcao === 'upgrade_365') {
        dias = 365;
        tipo_licenca = 'Enterprise';
      } else if (renovarOpcao === 'downgrade_trial') {
        dias = 30;
        tipo_licenca = 'Trial';
        redefinir = true;
      } else if (renovarOpcao === 'add_120') {
        dias = 120;
        tipo_licenca = 'Enterprise';
      } else if (renovarOpcao === 'add_365') {
        dias = 365;
        tipo_licenca = 'Enterprise';
      }

      const res = await fetch(`/api/licencas/${selectedLicencaRenovar.id}/renovar`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ dias, tipo_licenca, redefinir })
      });
      if (res.ok) {
        setLicencaSuccess(`Licença de ${selectedLicencaRenovar.usuario_nome || 'Usuário'} atualizada com sucesso!`);
        showSnackbar(`Licença de ${selectedLicencaRenovar.usuario_nome || 'Usuário'} atualizada com sucesso!`, 'success');
        setModalRenovarOpen(false);
        setSelectedLicencaRenovar(null);
        fetchLicencas();
        fetchUsuarios();
        setTimeout(() => setLicencaSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Erro ao renovar licença:', err);
    } finally {
      setSubmittingRenovar(false);
    }
  };

  const handleToggleStatusLicenca = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'Ativa' ? 'Suspensa' : 'Ativa';
    try {
      const res = await fetch(`/api/licencas/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setLicencaSuccess(`Status da licença alterado para ${nextStatus}!`);
        showSnackbar(`Status da licença alterado para ${nextStatus}!`, 'success');
        fetchLicencas();
        fetchUsuarios();
        setTimeout(() => setLicencaSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Erro ao alterar status da licença:', err);
    }
  };

  const handleDeleteLicenca = async (id: number, chave: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a chave de licença ${chave}?`)) return;
    try {
      const res = await fetch(`/api/licencas/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        setLicencaSuccess('Chave de licença removida com sucesso!');
        showSnackbar('Chave de licença removida com sucesso!', 'success');
        fetchLicencas();
        fetchUsuarios();
        setTimeout(() => setLicencaSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Erro ao excluir licença:', err);
    }
  };

  // Handlers de Usuários (Criação de novos usuários mantida exclusivamente no Super Admin)

  const handleOpenEditUser = (u: Usuario) => {
    setEditingUserId(u.id);
    setUserNome(u.nome);
    setUserEmail(u.email);
    setUserSenha('');
    setUserPerfilId(u.perfil_id || '');
    setUserChaveLicenca(u.chave_licenca || '');
    setUserAtivo(u.ativo);
    setUserError('');
    setModalUserOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');

    if (!userNome.trim() || !userEmail.trim()) {
      setUserError('Nome e E-mail são obrigatórios.');
      return;
    }

    if (!editingUserId && (!userSenha || userSenha.length < 6)) {
      setUserError('A senha inicial deve ter pelo menos 6 caracteres.');
      return;
    }

    setSubmittingUser(true);
    try {
      const url = editingUserId ? `/api/usuarios/${editingUserId}` : '/api/usuarios';
      const method = editingUserId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          nome: userNome.trim(),
          email: userEmail.trim(),
          senha: userSenha.trim() || undefined,
          perfil_id: userPerfilId ? Number(userPerfilId) : null,
          chave_licenca: userChaveLicenca.trim() || null,
          ativo: userAtivo
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setUserError(data.error || 'Erro ao salvar usuário');
      } else {
        setModalUserOpen(false);
        setUserSuccess(`Usuário ${data.nome} salvo com sucesso!`);
        showSnackbar(`Usuário "${data.nome}" salvo com sucesso!`, 'success');
        fetchUsuarios();
        setTimeout(() => setUserSuccess(''), 3000);
      }
    } catch (err) {
      setUserError('Erro de conexão ao salvar usuário');
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleToggleUserStatus = async (id: number, statusAtual: boolean) => {
    try {
      const res = await fetch(`/api/usuarios/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ativo: !statusAtual })
      });
      if (res.ok) {
        showSnackbar(`Status do usuário alterado para ${!statusAtual ? 'Ativo' : 'Inativo'}!`, 'success');
        fetchUsuarios();
      }
    } catch (err) {
      alert('Erro ao alterar status');
    }
  };

  // Handlers de Perfis
  const handleOpenNewPerfil = () => {
    setEditingPerfilId(null);
    setPerfilNome('');
    setPerfilDescricao('');
    setPerfilAtivo(true);
    setPerfilIsAdmin(false);

    const initialPerms: Record<string, 'sem_acesso' | 'leitura' | 'escrita'> = {};
    SYSTEM_MODULES.forEach(m => {
      initialPerms[m.id] = m.id === 'administracao' ? 'sem_acesso' : 'escrita';
    });
    setPerfilPermissoes(initialPerms);
    setPerfilError('');
    setModalPerfilOpen(true);
  };

  const handleOpenEditPerfil = (p: PerfilAcesso) => {
    setEditingPerfilId(p.id);
    setPerfilNome(p.nome || '');
    setPerfilDescricao(p.descricao || '');
    setPerfilAtivo(true);
    setPerfilIsAdmin(!!p.is_admin);

    const initialPerms: Record<string, 'sem_acesso' | 'leitura' | 'escrita'> = {};
    SYSTEM_MODULES.forEach(m => {
      initialPerms[m.id] = (p.permissoes as any)?.[m.id] || (p.is_admin ? 'escrita' : 'sem_acesso');
    });
    setPerfilPermissoes(initialPerms);
    setPerfilError('');
    setModalPerfilOpen(true);
  };

  const handleSavePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setPerfilError('');
    setPerfilSuccess('');

    if (!perfilNome.trim()) {
      setPerfilError('Digite o nome do perfil de acesso.');
      return;
    }

    setSubmittingPerfil(true);
    try {
      const isEdit = editingPerfilId !== null;
      const url = isEdit ? `/api/perfis-acesso/${editingPerfilId}` : '/api/perfis-acesso';
      const method = isEdit ? 'PUT' : 'POST';

      let finalPerms = { ...perfilPermissoes };
      if (perfilIsAdmin) {
        SYSTEM_MODULES.forEach(m => {
          finalPerms[m.id] = 'escrita';
        });
      }

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          nome: perfilNome.trim(),
          descricao: perfilDescricao.trim() || null,
          is_admin: perfilIsAdmin,
          permissoes: finalPerms
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setPerfilError(data.error || 'Erro ao salvar perfil');
      } else {
        setModalPerfilOpen(false);
        const msg = isEdit ? `Perfil "${data.nome}" atualizado com sucesso!` : `Perfil "${data.nome}" criado com sucesso!`;
        setPerfilSuccess(msg);
        showSnackbar(msg, 'success');
        fetchPerfis();
        fetchUsuarios();
        setTimeout(() => setPerfilSuccess(''), 3000);
      }
    } catch (err) {
      setPerfilError('Erro de conexão ao salvar perfil');
    } finally {
      setSubmittingPerfil(false);
    }
  };

  const handleDeletePerfil = async (id: number, nome: string) => {
    if (window.confirm(`Deseja realmente excluir o perfil "${nome}"?`)) {
      try {
        const res = await fetch(`/api/perfis-acesso/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
        const data = await res.json();
        if (res.ok) {
          showSnackbar(`Perfil "${nome}" excluído com sucesso!`, 'success');
          fetchPerfis();
        } else {
          alert(data.error || 'Erro ao excluir perfil');
        }
      } catch (err) {
        alert('Erro ao excluir perfil');
      }
    }
  };

  // Handlers de Gestão de Empresas (Super Admin)
  const handleOpenCreateEmpresa = () => {
    setEditingEmpresaId(null);
    setEmpresaRazaoSocial('');
    setEmpresaNomeFantasia('');
    setEmpresaCnpj('');
    setEmpresaCep('');
    setEmpresaLogradouro('');
    setEmpresaNumero('');
    setEmpresaComplemento('');
    setEmpresaBairro('');
    setEmpresaCidade('');
    setEmpresaEstado('');
    setEmpresaLogoUrl('');
    setEmpresaCorPrimaria('#6366f1');
    setEmpresaCorSecundaria('#38bdf8');
    setEmpresaCorDestaque('#34d399');
    setEmpresaStatus('Ativa');
    setCepErrorEmpresa('');
    setModalEmpresaOpen(true);
  };

  const handleOpenEditEmpresa = (emp: Empresa) => {
    setEditingEmpresaId(emp.id);
    setEmpresaRazaoSocial(emp.razao_social || '');
    setEmpresaNomeFantasia(emp.nome_fantasia || '');
    setEmpresaCnpj(emp.cnpj || '');
    setEmpresaCep(emp.cep || '');
    setEmpresaLogradouro(emp.logradouro || '');
    setEmpresaNumero(emp.numero || '');
    setEmpresaComplemento(emp.complemento || '');
    setEmpresaBairro(emp.bairro || '');
    setEmpresaCidade(emp.cidade || '');
    setEmpresaEstado(emp.estado || '');
    setEmpresaLogoUrl(emp.logo_url || '');
    setEmpresaCorPrimaria(emp.cor_primaria || '#6366f1');
    setEmpresaCorSecundaria(emp.cor_secundaria || '#38bdf8');
    setEmpresaCorDestaque(emp.cor_destaque || '#34d399');
    setEmpresaStatus(emp.status || 'Ativa');
    setCepErrorEmpresa('');
    setModalEmpresaOpen(true);
  };

  const handleCepEmpresaChange = async (val: string) => {
    const formattedCep = val.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').substring(0, 9);
    setEmpresaCep(formattedCep);
    setCepErrorEmpresa('');

    const rawDigits = val.replace(/\D/g, '');
    if (rawDigits.length === 8) {
      setBuscandoCepEmpresa(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${rawDigits}/json/`);
        const data = await res.json();
        if (data.erro) {
          setCepErrorEmpresa('CEP não encontrado');
        } else {
          setEmpresaLogradouro(data.logradouro || '');
          setEmpresaBairro(data.bairro || '');
          setEmpresaCidade(data.localidade || '');
          setEmpresaEstado(data.uf || '');
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      } finally {
        setBuscandoCepEmpresa(false);
      }
    }
  };

  const handleCnpjChange = (val: string) => {
    const digits = val.replace(/\D/g, '').substring(0, 14);
    const formatted = digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
    setEmpresaCnpj(formatted);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem da logo deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEmpresaLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingEmpresa(true);

    try {
      const payload = {
        razao_social: empresaRazaoSocial,
        nome_fantasia: empresaNomeFantasia,
        cnpj: empresaCnpj,
        cep: empresaCep,
        logradouro: empresaLogradouro,
        numero: empresaNumero,
        complemento: empresaComplemento,
        bairro: empresaBairro,
        cidade: empresaCidade,
        estado: empresaEstado,
        logo_url: empresaLogoUrl,
        cor_primaria: empresaCorPrimaria,
        cor_secundaria: empresaCorSecundaria,
        cor_destaque: empresaCorDestaque,
        status: empresaStatus
      };

      const url = editingEmpresaId ? `/api/empresas/${editingEmpresaId}` : '/api/empresas';
      const method = editingEmpresaId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const msg = editingEmpresaId ? 'Empresa atualizada com sucesso!' : 'Nova empresa cadastrada com sucesso!';
        setLicencaSuccess(msg);
        showSnackbar(msg, 'success');
        setModalEmpresaOpen(false);
        fetchEmpresas();
        setTimeout(() => setLicencaSuccess(null), 4000);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Erro ao salvar empresa');
      }
    } catch (err) {
      console.error('Erro ao salvar empresa:', err);
    } finally {
      setSubmittingEmpresa(false);
    }
  };

  const handleDeleteEmpresa = async (id: number, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a empresa "${nome}"?`)) return;
    try {
      const res = await fetch(`/api/empresas/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        setLicencaSuccess('Empresa removida com sucesso!');
        showSnackbar(`Empresa "${nome}" removida com sucesso!`, 'success');
        fetchEmpresas();
        setTimeout(() => setLicencaSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Erro ao excluir empresa:', err);
    }
  };

  const handleOpenEmpresaLicencas = async (emp: Empresa) => {
    setSelectedEmpresaLicencas(emp);
    setLoadingEmpresaLicencas(true);
    setModalEmpresaLicencasOpen(true);
    try {
      const res = await fetch(`/api/empresas/${emp.id}/licencas`);
      if (res.ok) {
        const data = await res.json();
        setEmpresaLicencasList(data);
      }
    } catch (err) {
      console.error('Erro ao buscar licenças da empresa:', err);
    } finally {
      setLoadingEmpresaLicencas(false);
    }
  };

  return (
    <div className="page-content">
      {/* Header da Página */}
      <header className="page-header" style={{ marginBottom: '28px' }}>
        <div>
          <h1 className="page-title">
            Painel de <span className="text-gradient">Administração & Acessos</span>
          </h1>
          <p className="page-description">
            Gerencie contas de usuários e controle de permissões por perfil (RBAC).
          </p>
        </div>
      </header>

      {/* Sub-Navegação (Abas Internas: Usuários | Perfis de Acesso | Chaves de Licença) */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSubTab('usuarios')}
          className={subTab === 'usuarios' ? 'btn-primary' : 'btn-secondary admin-subtab-btn'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Users size={18} /> Usuários do Sistema ({usuarios.filter(u => !(u.is_super_admin || (u.email && u.email.toLowerCase() === 'admin@regz.app') || u.nome === 'Administrador Regz')).length})
        </button>
        <button
          onClick={() => setSubTab('perfis')}
          className={subTab === 'perfis' ? 'btn-primary' : 'btn-secondary admin-subtab-btn'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Shield size={18} /> Perfis de Acesso & Permissões ({perfis.length})
        </button>
        <button
          onClick={() => setSubTab('auditoria')}
          className={subTab === 'auditoria' ? 'btn-primary' : 'btn-secondary admin-subtab-btn'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <History size={18} color={subTab === 'auditoria' ? '#ffffff' : '#34d399'} /> Logs de Auditoria ({logsAuditoria.length})
        </button>
        {isSuperAdmin && (
          <>
            <button
              onClick={() => setSubTab('empresas')}
              className={subTab === 'empresas' ? 'btn-primary' : 'btn-secondary admin-subtab-btn'}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Building2 size={18} color={subTab === 'empresas' ? '#ffffff' : '#818cf8'} /> Empresas (Super Admin) ({empresas.length})
            </button>
            <button
              onClick={() => setSubTab('licencas')}
              className={subTab === 'licencas' ? 'btn-primary' : 'btn-secondary admin-subtab-btn'}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Key size={18} color={subTab === 'licencas' ? '#ffffff' : '#38bdf8'} /> Chaves de Licença ({licencas.length})
            </button>
          </>
        )}
      </div>

      {licencaSuccess && (
        <div style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {licencaSuccess}
        </div>
      )}

      {userSuccess && (
        <div style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {userSuccess}
        </div>
      )}

      {perfilSuccess && (
        <div style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {perfilSuccess}
        </div>
      )}

      {/* ======================================================== */}
      {/* CONTEÚDO DA ABA: USUÁRIOS (COM COLUNAS EXIBÍVEIS E ARRASTÁVEIS) */}
      {/* ======================================================== */}
      {subTab === 'usuarios' && (
        <div className="glass-panel" style={{ padding: '0', overflow: 'visible', position: 'relative' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 100 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={20} color="#5e5eee" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Usuários Cadastrados ({usuarios.filter(u => !(u.is_super_admin || (u.email && u.email.toLowerCase() === 'admin@regz.app') || u.nome === 'Administrador Regz')).length})
              </h3>
            </div>

            {/* Criar novos usuários é uma atribuição exclusiva do Licenciador Master (Super Admin Regz) no card da empresa */}
          </div>

          <div className="table-flex-wrapper" style={{ overflowX: 'auto' }}>
            <table className="custom-table" style={{ tableLayout: 'fixed', minWidth: `${totalUserTableWidth}px`, width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: `${userColumnWidths.nome}px`, position: 'relative' }}>
                    Nome do Usuário
                    <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'nome')} />
                  </th>
                  <th style={{ width: `${userColumnWidths.email}px`, position: 'relative' }}>
                    E-mail
                    <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'email')} />
                  </th>
                  <th style={{ width: `${userColumnWidths.perfil}px`, position: 'relative' }}>
                    Perfil
                    <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'perfil')} />
                  </th>
                  <th style={{ width: `${userColumnWidths.licenca}px`, position: 'relative' }}>
                    Licença
                    <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'licenca')} />
                  </th>
                  <th style={{ width: `${userColumnWidths.senha}px`, position: 'relative' }}>
                    Validade
                    <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'senha')} />
                  </th>
                  <th className="col-acoes" style={{ textAlign: 'center', width: `${userColumnWidths.acoes || 165}px`, minWidth: '165px' }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingUsuarios ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                      <Loader2 className="spin" size={20} /> Carregando usuários...
                    </td>
                  </tr>
                ) : usuarios
                  .filter(u => !(u.is_super_admin || (u.email && u.email.toLowerCase() === 'admin@regz.app') || u.nome === 'Administrador Regz'))
                  .map((u) => (
                  <tr key={u.id}>
                    <td>
                      <span className="usuario-nome">{u.nome}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{u.email}</span>
                    </td>
                    <td>
                      {(() => {
                        const pObj = u.perfil || perfis.find(p => p.id === u.perfil_id);
                        return renderPerfilBadge(pObj?.nome || 'Sem Perfil', pObj?.is_admin);
                      })()}
                    </td>
                    <td>
                      {(() => {
                        const isRowSuperAdmin = !!(u.is_super_admin || (u.email && u.email.toLowerCase() === 'admin@regz.app') || u.nome === 'Administrador Regz');
                        if (isRowSuperAdmin) {
                          return (
                            <span style={{ fontSize: '0.88rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                              -
                            </span>
                          );
                        }
                        if (!u.chave_licenca) {
                          return (
                            <span style={{ fontSize: '0.78rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              🔴 Sem Licença
                            </span>
                          );
                        }
                        const isTrial = u.tipo_licenca === 'Trial' || u.tipo_licenca === 'Dev / Trial';
                        if (isTrial) {
                          return (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', background: 'rgba(20, 184, 166, 0.18)', color: '#2dd4bf', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, border: '1px solid rgba(20, 184, 166, 0.35)', whiteSpace: 'nowrap' }}>
                              <Key size={13} style={{ flexShrink: 0 }} />
                              Trial (30d)
                            </span>
                          );
                        }
                        return (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.18)', color: '#a5b4fc', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, border: '1px solid rgba(99, 102, 241, 0.35)', whiteSpace: 'nowrap' }}>
                            <Award size={13} style={{ flexShrink: 0 }} />
                            Enterprise
                          </span>
                        );
                      })()}
                    </td>
                    <td>
                      {(() => {
                        const dias = typeof u.dias_restantes_licenca === 'number'
                          ? u.dias_restantes_licenca
                          : (typeof u.dias_para_expirar === 'number' ? u.dias_para_expirar : 30);

                        if (dias <= 0) {
                          return (
                            <span style={{ fontSize: '0.78rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, whiteSpace: 'nowrap' }} title={`Licença expirada há ${Math.abs(dias)}d`}>
                              🔴 ({dias}d)
                            </span>
                          );
                        }
                        if (dias <= 5) {
                          return (
                            <span style={{ fontSize: '0.78rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, whiteSpace: 'nowrap' }} title={`Expira em ${dias} dias`}>
                              🟡 ({dias}d)
                            </span>
                          );
                        }
                        return (
                          <span style={{ fontSize: '0.78rem', background: 'rgba(52, 211, 153, 0.12)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, whiteSpace: 'nowrap' }} title={`Expira em ${dias} dias`}>
                            🟢 ({dias}d)
                          </span>
                        );
                      })()}
                    </td>
                    <td style={{ textAlign: 'center', width: `${userColumnWidths.acoes || 165}px`, minWidth: '165px' }}>
                      {(() => {
                        const isRowSuperAdmin = !!(u.is_super_admin || (u.email && u.email.toLowerCase() === 'admin@regz.app') || u.nome === 'Administrador Regz');
                        if (isRowSuperAdmin) {
                          return (
                            <span style={{ fontSize: '0.88rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                              -
                            </span>
                          );
                        }
                        return (
                          <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              onClick={() => podeEditar && handleToggleUserStatus(u.id, u.ativo)}
                              className="btn-action"
                              disabled={!podeEditar}
                              style={{
                                background: u.ativo ? 'rgba(251, 113, 133, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                                color: u.ativo ? '#fb7185' : '#34d399',
                                opacity: podeEditar ? 1 : 0.4,
                                cursor: podeEditar ? 'pointer' : 'not-allowed'
                              }}
                              title={podeEditar ? (u.ativo ? 'Inativar Usuário' : 'Ativar Usuário') : 'Ação desativada: Seu perfil permite apenas visualização'}
                            >
                              {u.ativo ? <UserX size={14} /> : <UserCheck size={14} />}
                            </button>
                            <button
                              onClick={() => podeEditar && handleOpenEditUser(u)}
                              className="btn-action map"
                              disabled={!podeEditar}
                              style={{ opacity: podeEditar ? 1 : 0.4, cursor: podeEditar ? 'pointer' : 'not-allowed' }}
                              title={podeEditar ? "Editar Usuário" : "Ação desativada: Seu perfil permite apenas visualização"}
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONTEÚDO DA ABA: PERFIS DE ACESSO (TABELA LIMPA COM BOTÃO DE LÁPIS) */}
      {/* ======================================================== */}
      {subTab === 'perfis' && (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={20} color="#a855f7" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Perfis de Acesso Cadastrados ({perfis.length})</h3>
            </div>
            <button
              onClick={handleOpenNewPerfil}
              className="btn-primary"
              disabled={!podeEditar}
              style={{ fontSize: '0.88rem', opacity: podeEditar ? 1 : 0.5, cursor: podeEditar ? 'pointer' : 'not-allowed' }}
              title={podeEditar ? 'Novo Perfil de Acesso' : 'Ação desativada: Seu perfil permite apenas visualização'}
            >
              <Plus size={16} /> Novo Perfil de Acesso
            </button>
          </div>

          <div className="table-flex-wrapper" style={{ overflowX: 'hidden' }}>
            <table className="custom-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '220px' }}>Perfil</th>
                  <th>Descrição</th>
                  <th style={{ width: '320px' }}>Módulos Liberados</th>
                  <th style={{ textAlign: 'center', width: '120px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loadingPerfis ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                      <Loader2 className="spin" size={20} /> Carregando perfis...
                    </td>
                  </tr>
                ) : perfis.map((p) => {
                  const isAdmin = p.is_admin;
                  const permissoes = p.permissoes || {};

                  // Contagem de módulos ativos
                  const modulosLiberados = p.is_admin
                    ? SYSTEM_MODULES.map(m => m.label)
                    : SYSTEM_MODULES.filter(m => (permissoes as any)[m.id] && (permissoes as any)[m.id] !== 'sem_acesso').map(m => m.label);

                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {renderPerfilBadge(p.nome, p.is_admin)}
                        </div>
                      </td>

                      <td>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                          {p.descricao || (isAdmin ? 'Acesso ilimitado a todos os módulos e configurações' : 'Sem descrição informada')}
                        </span>
                      </td>

                      <td>
                        {isAdmin ? (
                          <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, background: 'rgba(129, 140, 248, 0.15)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(129, 140, 248, 0.3)' }}>
                            Todos os Módulos (Acesso Total)
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {modulosLiberados.length > 0 ? (
                              modulosLiberados.map(mLabel => (
                                <span key={mLabel} style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-purple)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.25)', fontWeight: 600 }}>
                                  {mLabel}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Nenhum módulo liberado</span>
                            )}
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => podeEditar && handleOpenEditPerfil(p)}
                            className="btn-action map"
                            disabled={!podeEditar}
                            style={{ opacity: podeEditar ? 1 : 0.4, cursor: podeEditar ? 'pointer' : 'not-allowed' }}
                            title={podeEditar ? "Editar Perfil (RBAC)" : "Ação desativada: Seu perfil permite apenas visualização"}
                          >
                            <Edit size={14} />
                          </button>

                          {!isAdmin ? (
                            <button
                              onClick={() => podeEditar && handleDeletePerfil(p.id, p.nome)}
                              className="btn-action delete"
                              disabled={!podeEditar}
                              style={{ opacity: podeEditar ? 1 : 0.4, cursor: podeEditar ? 'pointer' : 'not-allowed' }}
                              title={podeEditar ? "Excluir Perfil de Acesso" : "Ação desativada: Seu perfil permite apenas visualização"}
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.88rem', color: 'var(--text-dim)', fontWeight: 600, display: 'inline-block', width: '28px', textAlign: 'center' }}>
                              -
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONTEÚDO DA ABA: CHAVES DE LICENÇA (LICENCIAMENTO) */}
      {/* ======================================================== */}
      {subTab === 'licencas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Cards de Resumo de Licenças */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '12px', borderRadius: '12px', color: '#38bdf8' }}>
                <Key size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total de Chaves</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{licencas.length}</h4>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(52, 211, 153, 0.15)', padding: '12px', borderRadius: '12px', color: '#34d399' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Licenças Ativas</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
                  {licencas.filter(l => l.status === 'Ativa' && l.dias_restantes > 0).length}
                </h4>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '12px', borderRadius: '12px', color: '#f87171' }}>
                <XCircle size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Expiradas / Suspensas</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f87171' }}>
                  {licencas.filter(l => l.status !== 'Ativa' || l.dias_restantes <= 0).length}
                </h4>
              </div>
            </div>
          </div>

          {/* Tabela de Chaves de Licença */}
          <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Key size={20} color="#38bdf8" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Gerenciador de Licenças ({licencas.length})</h3>
              </div>

              <button
                onClick={() => podeEditar && isUserAdminTag && setModalLicencaOpen(true)}
                className="btn-primary"
                disabled={!podeEditar || !isUserAdminTag}
                style={{ fontSize: '0.88rem', opacity: (podeEditar && isUserAdminTag) ? 1 : 0.5, cursor: (podeEditar && isUserAdminTag) ? 'pointer' : 'not-allowed' }}
                title={isUserAdminTag ? 'Gerar Nova Licença' : 'Apenas perfis com a TAG de Administrador podem gerenciar chaves de licença'}
              >
                <Plus size={16} /> Gerar Nova Licença
              </button>
            </div>

            <div className="table-flex-wrapper" style={{ overflowX: 'auto' }}>
              <table className="custom-table" style={{ tableLayout: 'fixed', minWidth: `${totalLicTableWidth}px`, width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: `${licencaColumnWidths.chave}px`, position: 'relative' }}>
                      Chave de Licença
                      <div className="resizer" onMouseDown={(e) => handleMouseDownResizeLic(e, 'chave')} />
                    </th>
                    <th style={{ width: `${licencaColumnWidths.usuario}px`, position: 'relative' }}>
                      Usuário Vinculado
                      <div className="resizer" onMouseDown={(e) => handleMouseDownResizeLic(e, 'usuario')} />
                    </th>
                    <th style={{ width: `${licencaColumnWidths.plano}px`, position: 'relative' }}>
                      Plano
                      <div className="resizer" onMouseDown={(e) => handleMouseDownResizeLic(e, 'plano')} />
                    </th>
                    <th style={{ width: `${licencaColumnWidths.validade}px`, position: 'relative' }}>
                      Validade
                      <div className="resizer" onMouseDown={(e) => handleMouseDownResizeLic(e, 'validade')} />
                    </th>
                    <th style={{ width: `${licencaColumnWidths.status}px`, position: 'relative' }}>
                      Status
                      <div className="resizer" onMouseDown={(e) => handleMouseDownResizeLic(e, 'status')} />
                    </th>
                    <th className="col-acoes" style={{ textAlign: 'center', width: `${licencaColumnWidths.acoes || 165}px`, minWidth: '165px' }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingLicencas ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                        <Loader2 className="spin" size={20} /> Carregando chaves de licença...
                      </td>
                    </tr>
                  ) : licencas.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        Nenhuma chave de licença encontrada.
                      </td>
                    </tr>
                  ) : licencas.map((lic) => {
                    const isExpirada = lic.dias_restantes <= 0 || lic.status === 'Expirada';
                    const isSuspensa = lic.status === 'Suspensa';

                    return (
                      <tr key={lic.id}>
                        <td style={{ width: `${licencaColumnWidths.chave}px` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <code style={{ fontFamily: 'monospace', fontSize: '0.88rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)', fontWeight: 700 }}>
                              {visibleKeys[lic.id] && isUserAdminTag ? lic.chave : 'REGZ-2026-••••-••••-••••'}
                            </code>
                            <button
                              onClick={() => handleToggleKeyVisibility(lic.id)}
                              className="btn-action map"
                              disabled={!isUserAdminTag}
                              style={{ padding: '4px 6px', opacity: isUserAdminTag ? 1 : 0.4, cursor: isUserAdminTag ? 'pointer' : 'not-allowed' }}
                              title={isUserAdminTag ? (visibleKeys[lic.id] ? 'Ocultar Chave' : 'Revelar Chave de Licença') : 'Apenas o perfil Administrador pode revelar a licença'}
                            >
                              {visibleKeys[lic.id] && isUserAdminTag ? <EyeOff size={13} color="#fca5a5" /> : <Eye size={13} color="#38bdf8" />}
                            </button>
                            {visibleKeys[lic.id] && isUserAdminTag && (
                              <button
                                onClick={() => handleCopyKey(lic.chave)}
                                className="btn-action map"
                                style={{ padding: '4px 6px' }}
                                title={copiedKey === lic.chave ? 'Copiada!' : 'Copiar Chave'}
                              >
                                {copiedKey === lic.chave ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                              </button>
                            )}
                          </div>
                        </td>

                        <td style={{ width: `${licencaColumnWidths.usuario}px` }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{lic.usuario_nome}</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{lic.usuario_email}</span>
                          </div>
                        </td>

                        <td style={{ width: `${licencaColumnWidths.plano}px`, whiteSpace: 'nowrap' }}>
                          {lic.tipo_licenca === 'Trial' || lic.tipo_licenca === 'Dev / Trial' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', background: 'rgba(20, 184, 166, 0.18)', color: '#2dd4bf', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, border: '1px solid rgba(20, 184, 166, 0.35)', whiteSpace: 'nowrap' }}>
                              <Key size={13} style={{ flexShrink: 0 }} />
                              Trial (30d)
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.18)', color: '#a5b4fc', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, border: '1px solid rgba(99, 102, 241, 0.35)', whiteSpace: 'nowrap' }}>
                              <Award size={13} style={{ flexShrink: 0 }} />
                              Enterprise
                            </span>
                          )}
                        </td>

                        <td style={{ width: `${licencaColumnWidths.validade}px` }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={13} color="var(--text-dim)" />
                              {new Date(lic.data_expiracao).toLocaleDateString('pt-BR')}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: isExpirada ? '#f87171' : 'var(--text-dim)' }}>
                              {isExpirada ? `Expirada há ${Math.abs(lic.dias_restantes)}d` : `Faltam ${lic.dias_restantes} dias`}
                            </span>
                          </div>
                        </td>

                        <td style={{ width: `${licencaColumnWidths.status}px` }}>
                          {isSuspensa ? (
                            <span style={{ fontSize: '0.78rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                              Suspensa
                            </span>
                          ) : isExpirada ? (
                            <span style={{ fontSize: '0.78rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                              Expirada
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.78rem', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                              Ativa
                            </span>
                          )}
                        </td>

                        <td className="col-acoes" style={{ textAlign: 'center', width: `${licencaColumnWidths.acoes || 165}px`, minWidth: '165px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                            <button
                              onClick={() => podeEditar && isUserAdminTag && handleOpenModalRenovar(lic)}
                              className="btn-action map"
                              disabled={!podeEditar || !isUserAdminTag}
                              style={{ opacity: (podeEditar && isUserAdminTag) ? 1 : 0.4, cursor: (podeEditar && isUserAdminTag) ? 'pointer' : 'not-allowed' }}
                              title={isUserAdminTag ? "Renovar / Alterar Licença" : "Apenas perfis com a TAG de Administrador podem gerenciar chaves de licença"}
                            >
                              <RefreshCw size={14} />
                            </button>

                            <button
                              onClick={() => podeEditar && isUserAdminTag && handleToggleStatusLicenca(lic.id, lic.status)}
                              className="btn-action"
                              disabled={!podeEditar || !isUserAdminTag}
                              style={{
                                background: lic.status === 'Ativa' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                                color: lic.status === 'Ativa' ? '#fbbf24' : '#34d399',
                                opacity: (podeEditar && isUserAdminTag) ? 1 : 0.4,
                                cursor: (podeEditar && isUserAdminTag) ? 'pointer' : 'not-allowed'
                              }}
                              title={isUserAdminTag ? (lic.status === 'Ativa' ? 'Suspender Licença' : 'Ativar Licença') : 'Apenas perfis com a TAG de Administrador podem gerenciar chaves de licença'}
                            >
                              {lic.status === 'Ativa' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                            </button>

                            <button
                              onClick={() => podeEditar && isUserAdminTag && handleDeleteLicenca(lic.id, lic.chave)}
                              className="btn-action delete"
                              disabled={!podeEditar || !isUserAdminTag}
                              style={{ opacity: (podeEditar && isUserAdminTag) ? 1 : 0.4, cursor: (podeEditar && isUserAdminTag) ? 'pointer' : 'not-allowed' }}
                              title={isUserAdminTag ? "Excluir Licença" : "Apenas perfis com a TAG de Administrador podem gerenciar chaves de licença"}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ABA DE EMPRESAS (TENANTS - SUPER ADMIN) */}
      {/* ======================================================== */}
      {subTab === 'empresas' && isSuperAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Cards de Métricas de Empresas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '14px', borderRadius: '12px', color: '#818cf8' }}>
                <Building2 size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL DE EMPRESAS</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.6rem', fontWeight: 800 }}>{empresas.length}</h3>
              </div>
            </div>

            <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
              <div style={{ background: 'rgba(52, 211, 153, 0.15)', padding: '14px', borderRadius: '12px', color: '#34d399' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>LICENÇAS ATIVAS PLATAFORMA</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.6rem', fontWeight: 800 }}>
                  {empresas.reduce((acc, emp) => acc + (emp.licencas_ativas || 0), 0)}
                </h3>
              </div>
            </div>

            <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '14px', borderRadius: '12px', color: '#38bdf8' }}>
                <Award size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>EMPRESAS ATIVAS</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.6rem', fontWeight: 800 }}>
                  {empresas.filter(e => e.status === 'Ativa').length}
                </h3>
              </div>
            </div>
          </div>

          {/* Tabela de Empresas */}
          <div className="custom-table-container" style={{ position: 'relative', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={20} color="#818cf8" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Gestão Multi-Empresas ({empresas.length})</h3>
              </div>
              <button
                onClick={handleOpenCreateEmpresa}
                className="btn-primary"
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={16} /> Cadastrar Nova Empresa
              </button>
            </div>

            <div className="table-flex-wrapper" style={{ overflowX: 'auto', width: '100%' }}>
              <table className="custom-table" style={{ width: '100%', minWidth: `${totalEmpresaTableWidth}px`, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ width: `${empresaColumnWidths.logo}px`, position: 'relative' }}>Logo</th>
                    <th style={{ width: `${empresaColumnWidths.empresa}px`, position: 'relative' }}>
                      Empresa / Razão Social
                      <div className="resizer" onMouseDown={(e) => handleMouseDownResizeEmp(e, 'empresa')} />
                    </th>
                    <th style={{ width: `${empresaColumnWidths.cnpj}px`, position: 'relative' }}>
                      CNPJ
                      <div className="resizer" onMouseDown={(e) => handleMouseDownResizeEmp(e, 'cnpj')} />
                    </th>
                    <th style={{ width: `${empresaColumnWidths.local}px`, position: 'relative' }}>
                      Local / Endereço
                      <div className="resizer" onMouseDown={(e) => handleMouseDownResizeEmp(e, 'local')} />
                    </th>
                    <th style={{ width: `${empresaColumnWidths.cores}px`, position: 'relative' }}>
                      Tema (3 Cores)
                      <div className="resizer" onMouseDown={(e) => handleMouseDownResizeEmp(e, 'cores')} />
                    </th>
                    <th style={{ width: `${empresaColumnWidths.licencas}px`, position: 'relative' }}>
                      Licenças
                      <div className="resizer" onMouseDown={(e) => handleMouseDownResizeEmp(e, 'licencas')} />
                    </th>
                    <th style={{ width: `${empresaColumnWidths.status}px`, position: 'relative' }}>
                      Status
                      <div className="resizer" onMouseDown={(e) => handleMouseDownResizeEmp(e, 'status')} />
                    </th>
                    <th className="col-acoes" style={{ textAlign: 'center', width: `${empresaColumnWidths.acoes || 165}px`, minWidth: '165px' }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingEmpresas ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                        <Loader2 className="spin" size={24} color="#818cf8" style={{ margin: '0 auto' }} />
                        <span style={{ display: 'block', marginTop: '8px', color: 'var(--text-dim)' }}>Carregando empresas...</span>
                      </td>
                    </tr>
                  ) : empresas.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                        Nenhuma empresa cadastrada. Clique em "+ Cadastrar Nova Empresa" para começar.
                      </td>
                    </tr>
                  ) : (
                    empresas.map((emp) => (
                      <tr key={emp.id}>
                        <td style={{ width: `${empresaColumnWidths.logo}px`, textAlign: 'center' }}>
                          {emp.logo_url ? (
                            <img src={emp.logo_url} alt={emp.nome_fantasia} className="empresa-logo-avatar" style={{ objectFit: 'cover' }} />
                          ) : (
                            <div className="empresa-logo-avatar" style={{ background: emp.cor_primaria || '#6366f1', color: '#ffffff' }}>
                              {(emp.nome_fantasia || 'E').substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </td>

                        <td style={{ width: `${empresaColumnWidths.empresa}px` }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{emp.nome_fantasia}</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{emp.razao_social}</span>
                          </div>
                        </td>

                        <td style={{ width: `${empresaColumnWidths.cnpj}px`, fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem' }}>
                          {emp.cnpj}
                        </td>

                        <td style={{ width: `${empresaColumnWidths.local}px` }}>
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem' }}>
                            <span style={{ fontWeight: 600 }}>{emp.cidade ? `${emp.cidade} - ${emp.estado}` : 'Sem endereço'}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                              {emp.logradouro ? `${emp.logradouro}, ${emp.numero || 'S/N'}` : ''} {emp.cep ? `(${emp.cep})` : ''}
                            </span>
                          </div>
                        </td>

                        <td style={{ width: `${empresaColumnWidths.cores}px` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="empresa-color-dot" style={{ background: emp.cor_primaria || '#6366f1' }} title={`Primária: ${emp.cor_primaria || '#6366f1'}`} />
                            <span className="empresa-color-dot" style={{ background: emp.cor_secundaria || '#38bdf8' }} title={`Secundária: ${emp.cor_secundaria || '#38bdf8'}`} />
                            <span className="empresa-color-dot" style={{ background: emp.cor_destaque || '#34d399' }} title={`Destaque: ${emp.cor_destaque || '#34d399'}`} />
                          </div>
                        </td>

                        <td style={{ width: `${empresaColumnWidths.licencas}px` }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                            <Key size={12} /> {emp.licencas_ativas || 0} Ativas ({emp.total_licencas || 0} Total)
                          </span>
                        </td>

                        <td style={{ width: `${empresaColumnWidths.status}px` }}>
                          <span style={{
                            fontSize: '0.78rem',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            background: emp.status === 'Ativa' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: emp.status === 'Ativa' ? '#34d399' : '#f87171',
                            border: emp.status === 'Ativa' ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                          }}>
                            {emp.status}
                          </span>
                        </td>

                        <td className="col-acoes" style={{ textAlign: 'center', width: `${empresaColumnWidths.acoes || 165}px`, minWidth: '165px' }}>
                          <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                            <button
                              onClick={() => handleOpenEditEmpresa(emp)}
                              className="btn-action map"
                              title="Editar Empresa"
                            >
                              <Edit size={14} />
                            </button>

                            <button
                              onClick={() => handleOpenEmpresaLicencas(emp)}
                              className="btn-action"
                              style={{ background: 'rgba(99, 102, 241, 0.18)', color: '#a5b4fc' }}
                              title="Gerenciar Licenças da Empresa"
                            >
                              <Key size={14} />
                            </button>

                            <button
                              onClick={() => handleDeleteEmpresa(emp.id, emp.nome_fantasia)}
                              className="btn-action delete"
                              title="Excluir Empresa"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ABA DE LOGS DE AUDITORIA DE USUÁRIOS */}
      {/* ======================================================== */}
      {subTab === 'auditoria' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Métricas Rápidas de Auditoria */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderRadius: '16px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '12px', borderRadius: '12px' }}>
                <History size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total de Eventos</span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '1.5rem', fontWeight: 800 }}>{logsAuditoria.length}</h3>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderRadius: '16px' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '12px', borderRadius: '12px' }}>
                <Users size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Logins / Acessos</span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
                  {logsAuditoria.filter(l => l.acao === 'LOGIN').length}
                </h3>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderRadius: '16px' }}>
              <div style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '12px', borderRadius: '12px' }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Colaboradores</span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
                  {logsAuditoria.filter(l => l.entidade === 'colaboradores').length}
                </h3>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderRadius: '16px' }}>
              <div style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', padding: '12px', borderRadius: '12px' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Segurança & Perfis</span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#a855f7' }}>
                  {logsAuditoria.filter(l => l.entidade === 'perfis_acesso' || l.entidade === 'usuarios').length}
                </h3>
              </div>
            </div>
          </div>

          {/* Painel Principal de Filtros e Tabela de Auditoria */}
          <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', borderRadius: '18px' }}>
            
            {/* Barra de Filtros */}
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <History size={20} color="#34d399" />
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Histórico & Rastreabilidade de Operações</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={exportarAuditoriaCSV}
                    className="btn-secondary btn-auditoria-action btn-auditoria-csv"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '7px 14px' }}
                    title="Exportar registros filtrados para planilha Excel/CSV"
                  >
                    <FileSpreadsheet size={15} color="#34d399" /> Exportar CSV
                  </button>
                  <button
                    onClick={fetchAuditoria}
                    className="btn-secondary btn-auditoria-action btn-auditoria-refresh"
                    style={{ padding: '7px 12px', display: 'flex', alignItems: 'center' }}
                    title="Atualizar Logs"
                  >
                    <RefreshCw size={15} className={loadingAuditoria ? 'spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Controles de Filtro */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Buscar por usuário, e-mail, ação ou detalhe..."
                    value={searchAuditoria}
                    onChange={e => setSearchAuditoria(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') fetchAuditoria(); }}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      borderRadius: '8px',
                      border: '1px solid var(--card-border)',
                      background: 'rgba(0, 0, 0, 0.2)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Filter size={14} color="var(--text-muted)" />
                  <select
                    value={filtroAuditoriaAcao}
                    onChange={e => setFiltroAuditoriaAcao(e.target.value)}
                    className="custom-select"
                    style={{ padding: '7px 12px', fontSize: '0.82rem', borderRadius: '8px' }}
                  >
                    <option value="todos">Todas as Ações</option>
                    <option value="LOGIN">LOGIN</option>
                    <option value="CRIAR">CRIAR</option>
                    <option value="EDITAR">EDITAR</option>
                    <option value="INATIVAR">INATIVAR</option>
                    <option value="REATIVAR">REATIVAR</option>
                    <option value="EXCLUIR">EXCLUIR</option>
                    <option value="CRIAR_CAMPO">CRIAR CAMPO</option>
                    <option value="EXCLUIR_CAMPO">EXCLUIR CAMPO</option>
                    <option value="CRIAR_RELATORIO_SALVO">CRIAR MODELO RELATÓRIO</option>
                    <option value="EXCLUIR_RELATORIO_SALVO">EXCLUIR MODELO RELATÓRIO</option>
                  </select>
                </div>

                <select
                  value={filtroAuditoriaEntidade}
                  onChange={e => setFiltroAuditoriaEntidade(e.target.value)}
                  className="custom-select"
                  style={{ padding: '7px 12px', fontSize: '0.82rem', borderRadius: '8px' }}
                >
                  <option value="todos">Todos os Módulos</option>
                  <option value="auth">Autenticação (Auth)</option>
                  <option value="colaboradores">Colaboradores</option>
                  <option value="campos_customizados">Campos Customizados</option>
                  <option value="relatorios_salvos">Relatórios Salvos</option>
                  <option value="perfis_acesso">Perfis de Acesso</option>
                  <option value="usuarios">Usuários</option>
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>De:</span>
                  <input
                    type="date"
                    value={dataInicioAuditoria}
                    onChange={e => setDataInicioAuditoria(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'rgba(0, 0, 0, 0.2)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Até:</span>
                  <input
                    type="date"
                    value={dataFimAuditoria}
                    onChange={e => setDataFimAuditoria(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'rgba(0, 0, 0, 0.2)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                  />
                </div>

                <button
                  onClick={fetchAuditoria}
                  className="btn-primary"
                  style={{ padding: '7px 14px', fontSize: '0.82rem', borderRadius: '8px' }}
                >
                  Filtrar
                </button>
              </div>
            </div>

            {/* Tabela de Logs */}
            <div className="table-flex-wrapper" style={{ overflowX: 'auto', width: '100%' }}>
              <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ width: '150px' }}>Data / Hora</th>
                    <th style={{ width: '220px' }}>Usuário Responsável</th>
                    <th style={{ width: '130px' }}>Ação</th>
                    <th style={{ width: '160px' }}>Módulo / Entidade</th>
                    <th style={{ width: '100px' }}>ID Registro</th>
                    <th style={{ width: '120px' }}>IP</th>
                    <th>Resumo da Operação</th>
                    <th style={{ textAlign: 'center', width: '90px' }}>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingAuditoria ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                        <Loader2 className="spin" size={24} color="#34d399" style={{ margin: '0 auto' }} />
                        <span style={{ display: 'block', marginTop: '8px', color: 'var(--text-dim)' }}>Carregando trilha de auditoria...</span>
                      </td>
                    </tr>
                  ) : logsAuditoria.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                        Nenhum log de auditoria encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    logsAuditoria.map(log => {
                      const dateFormatted = new Date(log.criado_em).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      });

                      const detalhesStr = typeof log.detalhes === 'object' ? JSON.stringify(log.detalhes) : String(log.detalhes || '');

                      return (
                        <tr key={log.id}>
                          <td style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                            {dateFormatted}
                          </td>

                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{log.usuario_nome}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{log.usuario_email}</span>
                            </div>
                          </td>

                          <td>
                            {renderAuditoriaAcaoBadge(log.acao)}
                          </td>

                          <td>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                              {log.entidade.replace(/_/g, ' ')}
                            </span>
                          </td>

                          <td style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                            {log.registro_id ? `#${log.registro_id}` : '-'}
                          </td>

                          <td style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                            {log.ip || '-'}
                          </td>

                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={detalhesStr}>
                            {detalhesStr}
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => setLogModalDetalhe(log)}
                              className="btn-action map"
                              style={{ display: 'inline-flex', padding: '6px', borderRadius: '6px' }}
                              title="Inspecionar parâmetros completos deste evento"
                            >
                              <Info size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DETALHES COMPLETOS DE LOG DE AUDITORIA */}
      {logModalDetalhe && (
        <div className="modal-backdrop" onClick={() => setLogModalDetalhe(null)}>
          <div 
            className="modal-content glass-panel" 
            style={{ maxWidth: '560px', width: '92%', padding: '24px', borderRadius: '20px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                  <Info size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Detalhes do Evento #{logModalDetalhe.id}</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Registro de trilha de auditoria</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLogModalDetalhe(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>AÇÃO</span>
                  <div style={{ marginTop: '4px' }}>{renderAuditoriaAcaoBadge(logModalDetalhe.acao)}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>MÓDULO / ENTIDADE</span>
                  <div style={{ marginTop: '4px', fontWeight: 700, color: 'var(--text-main)' }}>{logModalDetalhe.entidade}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>RESPONSÁVEL</span>
                  <div style={{ marginTop: '4px', fontWeight: 700 }}>{logModalDetalhe.usuario_nome}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{logModalDetalhe.usuario_email}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>DATA / HORA</span>
                  <div style={{ marginTop: '4px', fontWeight: 600, fontFamily: 'monospace' }}>
                    {new Date(logModalDetalhe.criado_em).toLocaleString('pt-BR')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>IP: {logModalDetalhe.ip || '-'}</div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                  PARÂMETROS & DADOS REGISTRADOS (JSON)
                </span>
                <pre style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid var(--card-border)',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace',
                  color: '#34d399',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {JSON.stringify(logModalDetalhe.detalhes, null, 2)}
                </pre>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setLogModalDetalhe(null)}
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.88rem' }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE CADASTRO DE USUÁRIO */}
      {/* ======================================================== */}
      {modalUserOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editingUserId ? 'Editar Usuário' : 'Novo Usuário do Sistema'}</h3>
              <button onClick={() => setModalUserOpen(false)} className="btn-close">
                ✕
              </button>
            </div>

            {userError && (
              <div className="alert-danger" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {userError}
              </div>
            )}

            <form onSubmit={handleSaveUser} className="modal-form">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Nome do usuário"
                  value={userNome}
                  onChange={(e) => setUserNome(e.target.value)}
                  disabled={submittingUser}
                  required
                />
              </div>

              <div className="form-group">
                <label>E-mail de Acesso *</label>
                <input
                  type="email"
                  placeholder="email@empresa.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  disabled={submittingUser}
                  required
                />
              </div>

              <div className="form-group">
                <label>{editingUserId ? 'Nova Senha (Deixe em branco para não alterar)' : 'Senha de Acesso *'}</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={userSenha}
                  onChange={(e) => setUserSenha(e.target.value)}
                  disabled={submittingUser}
                  required={!editingUserId}
                />
              </div>

              <div className="form-group">
                <label>Perfil de Acesso *</label>
                <select
                  value={userPerfilId}
                  onChange={(e: any) => setUserPerfilId(e.target.value)}
                  className="custom-select"
                  disabled={submittingUser}
                  required
                >
                  <option value="">Selecione um perfil...</option>
                  {perfis.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} {p.is_admin ? '(Admin)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label" style={{ margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={userAtivo}
                    onChange={(e) => setUserAtivo(e.target.checked)}
                    disabled={submittingUser}
                  />
                  <span>Usuário Ativo (Pode acessar o sistema)</span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setModalUserOpen(false)} className="btn-secondary" disabled={submittingUser}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={submittingUser}>
                  {submittingUser ? <Loader2 size={16} className="spin" /> : <Check size={16} />} Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE PERFIL DE ACESSO (RBAC) */}
      {/* ======================================================== */}
      {modalPerfilOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '620px', padding: '24px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {editingPerfilId ? 'EDITAR PERFIL (RBAC)' : 'CRIAR NOVO PERFIL DE ACESSO'}
              </h3>
              <button onClick={() => setModalPerfilOpen(false)} className="btn-close" title="Fechar">
                <X size={20} />
              </button>
            </div>

            {perfilError && (
              <div className="alert-danger" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {perfilError}
              </div>
            )}

            <form onSubmit={handleSavePerfil} className="modal-form">
              <div className="form-group">
                <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                  NOME DO PERFIL *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Gestor de R.H., Operador, Consulta..."
                  value={perfilNome}
                  onChange={(e) => setPerfilNome(e.target.value)}
                  disabled={submittingPerfil || (editingPerfilId !== null && perfis.find(p => p.id === editingPerfilId)?.is_admin)}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                  DESCRIÇÃO DO PERFIL
                </label>
                <input
                  type="text"
                  placeholder="Descreva a finalidade e escopo deste perfil..."
                  value={perfilDescricao}
                  onChange={(e) => setPerfilDescricao(e.target.value)}
                  disabled={submittingPerfil}
                />
              </div>

              {(() => {
                const isAdminProfile = perfilIsAdmin || (editingPerfilId !== null && perfis.find(p => p.id === editingPerfilId)?.is_admin);

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                    <label className="checkbox-label" style={{ margin: 0, fontWeight: 700, opacity: isAdminProfile ? 0.6 : 1, cursor: isAdminProfile ? 'not-allowed' : 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isAdminProfile ? true : perfilAtivo}
                        onChange={(e) => {
                          if (!isAdminProfile) {
                            setPerfilAtivo(e.target.checked);
                          }
                        }}
                        disabled={submittingPerfil || isAdminProfile}
                        style={{ cursor: isAdminProfile ? 'not-allowed' : 'pointer' }}
                      />
                      <span>PERFIL ATIVO {isAdminProfile ? '(Obrigatório para Admin)' : ''}</span>
                    </label>

                    <label className="checkbox-label" style={{
                      margin: 0,
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: perfilIsAdmin ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.4)',
                      border: perfilIsAdmin ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--card-border)',
                      transition: 'all 0.2s ease'
                    }}>
                      <input
                        type="checkbox"
                        checked={perfilIsAdmin}
                        onChange={(e) => {
                          const isAdminChecked = e.target.checked;
                          setPerfilIsAdmin(isAdminChecked);
                          if (isAdminChecked) {
                            setPerfilAtivo(true);
                            const fullPerms: Record<string, 'escrita'> = {};
                            SYSTEM_MODULES.forEach(m => { fullPerms[m.id] = 'escrita'; });
                            setPerfilPermissoes(fullPerms);
                          }
                        }}
                        disabled={submittingPerfil || (editingPerfilId !== null && perfis.find(p => p.id === editingPerfilId)?.is_admin)}
                      />
                      <span style={{ fontWeight: 700, color: perfilIsAdmin ? '#818cf8' : 'var(--text-muted)' }}>
                        ACESSO TOTAL (ADMINISTRADOR TI)
                      </span>
                    </label>
                  </div>
                );
              })()}

              {/* MATRIZ DE PERMISSÕES POR MÓDULO */}
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', color: 'var(--text-dim)' }}>
                  MATRIZ DE PERMISSÕES
                </h4>

                <div className="rbac-matrix-box" style={{ borderRadius: '12px', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--card-border)' }}>
                        <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700, color: 'var(--text-muted)' }}>Módulo e Recurso</th>
                        <th style={{ textAlign: 'center', width: '100px', padding: '10px 14px', fontWeight: 700, color: 'var(--text-muted)' }}>LEITURA</th>
                        <th style={{ textAlign: 'center', width: '100px', padding: '10px 14px', fontWeight: 700, color: 'var(--text-muted)' }}>ESCRITA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SYSTEM_MODULES.map((mod) => {
                        const nivel = perfilIsAdmin ? 'escrita' : (perfilPermissoes[mod.id] || 'sem_acesso');
                        const isLeitura = nivel === 'leitura' || nivel === 'escrita';
                        const isEscrita = nivel === 'escrita';

                        return (
                          <tr key={mod.id} style={{ borderBottom: '1px solid var(--card-border)', background: 'rgba(255, 255, 255, 0.015)' }}>
                            <td style={{ padding: '10px 14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {getModuleIcon(mod.iconName)}
                              <span>{mod.label}</span>
                            </td>

                            <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                              <input
                                type="checkbox"
                                checked={isLeitura}
                                disabled={perfilIsAdmin || submittingPerfil}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setPerfilPermissoes(prev => ({
                                    ...prev,
                                    [mod.id]: checked ? (prev[mod.id] === 'escrita' ? 'escrita' : 'leitura') : 'sem_acesso'
                                  }));
                                }}
                                style={{ cursor: perfilIsAdmin ? 'not-allowed' : 'pointer', accentColor: '#5e5eee', width: '16px', height: '16px' }}
                              />
                            </td>

                            <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                              <input
                                type="checkbox"
                                checked={isEscrita}
                                disabled={perfilIsAdmin || submittingPerfil}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setPerfilPermissoes(prev => ({
                                    ...prev,
                                    [mod.id]: checked ? 'escrita' : (isLeitura ? 'leitura' : 'sem_acesso')
                                  }));
                                }}
                                style={{ cursor: perfilIsAdmin ? 'not-allowed' : 'pointer', accentColor: '#34d399', width: '16px', height: '16px' }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalPerfilOpen(false)} className="btn-secondary" disabled={submittingPerfil}>
                  CANCELAR
                </button>
                <button type="submit" className="btn-primary" disabled={submittingPerfil}>
                  {submittingPerfil ? <Loader2 size={16} className="spin" /> : <Check size={16} />} {editingPerfilId ? 'SALVAR PERFIL' : 'CRIAR PERFIL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE GERAÇÃO DE NOVA CHAVE DE LICENÇA */}
      {/* ======================================================== */}
      {modalLicencaOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '540px', padding: '24px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>GERAR NOVA CHAVE DE LICENÇA</h3>
              <button onClick={() => setModalLicencaOpen(false)} className="btn-close" title="Fechar">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLicenca} className="modal-form">
              <div className="form-group">
                <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                  VINCULAR A UM USUÁRIO (OPCIONAL)
                </label>
                <select
                  value={newLicencaUsuarioId}
                  onChange={(e) => setNewLicencaUsuarioId(e.target.value)}
                  className="custom-select"
                  disabled={submittingLicenca}
                >
                  <option value="">Selecione um usuário para vincular...</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                  TIPO / PLANO DE LICENÇA *
                </label>
                <select
                  value={newLicencaTipo}
                  onChange={(e) => {
                    const tipo = e.target.value;
                    setNewLicencaTipo(tipo);
                    if (tipo === 'Trial') setNewLicencaValidade(30);
                    else if (tipo === 'Enterprise') setNewLicencaValidade(120);
                  }}
                  className="custom-select"
                  disabled={submittingLicenca}
                  required
                >
                  <option value="Enterprise">Enterprise (Acesso Completo - 120d ou 365d)</option>
                  <option value="Trial">Trial (Acesso Completo - 30d)</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                  DURAÇÃO DA LICENÇA *
                </label>
                <select
                  value={newLicencaValidade}
                  onChange={(e) => setNewLicencaValidade(parseInt(e.target.value, 10))}
                  className="custom-select"
                  disabled={submittingLicenca || newLicencaTipo === 'Trial'}
                  required
                >
                  {newLicencaTipo === 'Trial' ? (
                    <option value={30}>30 Dias (Fixo para Trial)</option>
                  ) : (
                    <>
                      <option value={120}>120 Dias (Enterprise - 4 Meses)</option>
                      <option value={365}>365 Dias (Enterprise - 1 Ano)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="modal-footer" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalLicencaOpen(false)} className="btn-secondary" disabled={submittingLicenca}>
                  CANCELAR
                </button>
                <button type="submit" className="btn-primary" disabled={submittingLicenca}>
                  {submittingLicenca ? <Loader2 size={16} className="spin" /> : <Key size={16} />} GERAR LICENÇA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de Renovação / Alteração de Licença */}
      {modalRenovarOpen && selectedLicencaRenovar && (
        <div className="renovar-modal-backdrop">
          <div className="renovar-modal-card">
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '10px', borderRadius: '10px', display: 'flex' }}>
                  <RefreshCw size={20} color="#a5b4fc" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Renovar / Alterar Licença</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Gerencie o plano e prazo de validade da chave</span>
                </div>
              </div>
              <button onClick={() => setModalRenovarOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <div className="renovar-info-box">
              <div className="renovar-info-row">
                <span className="renovar-info-label">Usuário Vinculado:</span>
                <span className="renovar-info-val">{selectedLicencaRenovar.usuario_nome || 'Não Vinculado'}</span>
              </div>
              <div className="renovar-info-row">
                <span className="renovar-info-label">Plano Atual:</span>
                {selectedLicencaRenovar.tipo_licenca === 'Trial' || selectedLicencaRenovar.tipo_licenca === 'Dev / Trial' ? (
                  <span style={{ fontSize: '0.78rem', background: 'rgba(20, 184, 166, 0.18)', color: '#2dd4bf', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, border: '1px solid rgba(20, 184, 166, 0.35)' }}>
                    Trial (30d)
                  </span>
                ) : (
                  <span style={{ fontSize: '0.78rem', background: 'rgba(99, 102, 241, 0.18)', color: '#a5b4fc', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, border: '1px solid rgba(99, 102, 241, 0.35)' }}>
                    Enterprise
                  </span>
                )}
              </div>
              <div className="renovar-info-row">
                <span className="renovar-info-label">Validade Atual:</span>
                <span className="renovar-info-val" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  {new Date(selectedLicencaRenovar.data_expiracao).toLocaleDateString('pt-BR')} ({selectedLicencaRenovar.dias_restantes} dias faltantes)
                </span>
              </div>
            </div>

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>
              Selecione a Ação de Renovação / Alteração:
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {(selectedLicencaRenovar.tipo_licenca === 'Trial' || selectedLicencaRenovar.tipo_licenca === 'Dev / Trial') ? (
                <>
                  <div 
                    onClick={() => setRenovarOpcao('renovar_30')}
                    className={`renovar-option-card ${renovarOpcao === 'renovar_30' ? 'selected-teal' : ''}`}
                  >
                    <input type="radio" checked={renovarOpcao === 'renovar_30'} onChange={() => setRenovarOpcao('renovar_30')} style={{ cursor: 'pointer' }} />
                    <div style={{ flex: 1 }}>
                      <div className="renovar-option-title teal" style={{ color: '#2dd4bf' }}>
                        <RefreshCw size={14} /> Renovar +30 Dias (Manter Plano Trial)
                      </div>
                      <div className="renovar-option-desc">
                        Adiciona +30 dias ao prazo de validade mantendo o plano Trial.
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => setRenovarOpcao('upgrade_120')}
                    className={`renovar-option-card ${renovarOpcao === 'upgrade_120' ? 'selected-indigo' : ''}`}
                  >
                    <input type="radio" checked={renovarOpcao === 'upgrade_120'} onChange={() => setRenovarOpcao('upgrade_120')} style={{ cursor: 'pointer' }} />
                    <div style={{ flex: 1 }}>
                      <div className="renovar-option-title indigo" style={{ color: '#a5b4fc' }}>
                        <Award size={14} /> Upgrade para Plano Enterprise (+120 Dias / 4 Meses)
                      </div>
                      <div className="renovar-option-desc">
                        Converte a licença para Enterprise e adiciona 120 dias de validade.
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => setRenovarOpcao('upgrade_365')}
                    className={`renovar-option-card ${renovarOpcao === 'upgrade_365' ? 'selected-sky' : ''}`}
                  >
                    <input type="radio" checked={renovarOpcao === 'upgrade_365'} onChange={() => setRenovarOpcao('upgrade_365')} style={{ cursor: 'pointer' }} />
                    <div style={{ flex: 1 }}>
                      <div className="renovar-option-title sky" style={{ color: '#38bdf8' }}>
                        <Award size={14} /> Upgrade para Plano Enterprise (+365 Dias / 1 Ano)
                      </div>
                      <div className="renovar-option-desc">
                        Converte a licença para Enterprise e adiciona 365 dias (1 ano) de validade.
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div 
                    onClick={() => setRenovarOpcao('downgrade_trial')}
                    className={`renovar-option-card ${renovarOpcao === 'downgrade_trial' ? 'selected-teal' : ''}`}
                  >
                    <input type="radio" checked={renovarOpcao === 'downgrade_trial'} onChange={() => setRenovarOpcao('downgrade_trial')} style={{ cursor: 'pointer' }} />
                    <div style={{ flex: 1 }}>
                      <div className="renovar-option-title teal" style={{ color: '#2dd4bf' }}>
                        <Key size={14} /> Converter para Plano Trial (30 Dias)
                      </div>
                      <div className="renovar-option-desc">
                        Altera a licença para o plano Trial e redefine o prazo para 30 dias a partir de hoje.
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => setRenovarOpcao('add_120')}
                    className={`renovar-option-card ${renovarOpcao === 'add_120' ? 'selected-indigo' : ''}`}
                  >
                    <input type="radio" checked={renovarOpcao === 'add_120'} onChange={() => setRenovarOpcao('add_120')} style={{ cursor: 'pointer' }} />
                    <div style={{ flex: 1 }}>
                      <div className="renovar-option-title indigo" style={{ color: '#a5b4fc' }}>
                        <RefreshCw size={14} /> Adicionar +120 Dias ao Plano Enterprise (4 Meses)
                      </div>
                      <div className="renovar-option-desc">
                        Estende a validade da licença Enterprise por mais 120 dias.
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => setRenovarOpcao('add_365')}
                    className={`renovar-option-card ${renovarOpcao === 'add_365' ? 'selected-sky' : ''}`}
                  >
                    <input type="radio" checked={renovarOpcao === 'add_365'} onChange={() => setRenovarOpcao('add_365')} style={{ cursor: 'pointer' }} />
                    <div style={{ flex: 1 }}>
                      <div className="renovar-option-title sky" style={{ color: '#38bdf8' }}>
                        <Award size={14} /> Adicionar +365 Dias ao Plano Enterprise (1 Ano)
                      </div>
                      <div className="renovar-option-desc">
                        Estende a validade da licença Enterprise por mais 365 dias (1 ano completo).
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setModalRenovarOpen(false)}
                className="btn-secondary"
                disabled={submittingRenovar}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}
              >
                CANCELAR
              </button>
              <button
                onClick={handleConfirmarRenovacao}
                className="btn-primary"
                disabled={submittingRenovar}
                style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {submittingRenovar ? <Loader2 className="spin" size={16} /> : <Check size={16} />}
                CONFIRMAR RENOVAÇÃO
              </button>
            </div>

          </div>
        </div>
      )}
      {/* ======================================================== */}
      {/* MODAL DE CADASTRO / EDIÇÃO DE EMPRESA */}
      {/* ======================================================== */}
      {modalEmpresaOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '680px', width: '90%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={22} color="#818cf8" />
                <h3>{editingEmpresaId ? 'Editar Empresa' : 'Cadastrar Nova Empresa (Super Admin)'}</h3>
              </div>
              <button onClick={() => setModalEmpresaOpen(false)} className="btn-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmpresa} className="modal-form" autoComplete="off" data-lpignore="true" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>Razão Social *</label>
                  <input
                    type="text"
                    value={empresaRazaoSocial}
                    onChange={(e) => setEmpresaRazaoSocial(e.target.value)}
                    placeholder="Ex: Empresa Exemplo LTDA"
                    autoComplete="off"
                    data-lpignore="true"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nome Fantasia *</label>
                  <input
                    type="text"
                    value={empresaNomeFantasia}
                    onChange={(e) => setEmpresaNomeFantasia(e.target.value)}
                    placeholder="Ex: Empresa Exemplo"
                    autoComplete="off"
                    data-lpignore="true"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>CNPJ *</label>
                  <input
                    type="text"
                    value={empresaCnpj}
                    onChange={(e) => handleCnpjChange(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    autoComplete="off"
                    data-lpignore="true"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status da Empresa</label>
                  <select value={empresaStatus} onChange={(e) => setEmpresaStatus(e.target.value)}>
                    <option value="Ativa">Ativa (Acesso Liberado)</option>
                    <option value="Inativa">Inativa (Bloqueada)</option>
                  </select>
                </div>
              </div>

              {/* Seção Endereço com Busca CEP ViaCEP */}
              <div style={{ background: 'var(--bg-hover)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 700, fontSize: '0.9rem', color: '#818cf8' }}>
                  <MapPin size={16} /> Endereço & Localização (ViaCEP)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 100px', gap: '12px', marginBottom: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>CEP</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={empresaCep}
                        onChange={(e) => handleCepEmpresaChange(e.target.value)}
                        placeholder="00000-000"
                        maxLength={9}
                        autoComplete="off"
                        data-lpignore="true"
                      />
                      {buscandoCepEmpresa && (
                        <Loader2 className="spin" size={14} style={{ position: 'absolute', right: '10px', top: '12px', color: '#818cf8' }} />
                      )}
                    </div>
                    {cepErrorEmpresa && <span style={{ fontSize: '0.72rem', color: '#f87171', marginTop: '2px', display: 'block' }}>{cepErrorEmpresa}</span>}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Logradouro / Rua</label>
                    <input
                      type="text"
                      value={empresaLogradouro}
                      onChange={(e) => setEmpresaLogradouro(e.target.value)}
                      placeholder="Ex: Av. Paulista"
                      autoComplete="off"
                      data-lpignore="true"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Número</label>
                    <input
                      type="text"
                      value={empresaNumero}
                      onChange={(e) => setEmpresaNumero(e.target.value)}
                      placeholder="1000"
                      autoComplete="off"
                      data-lpignore="true"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Bairro</label>
                    <input
                      type="text"
                      value={empresaBairro}
                      onChange={(e) => setEmpresaBairro(e.target.value)}
                      placeholder="Bairro"
                      autoComplete="off"
                      data-lpignore="true"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Cidade</label>
                    <input
                      type="text"
                      value={empresaCidade}
                      onChange={(e) => setEmpresaCidade(e.target.value)}
                      placeholder="Cidade"
                      autoComplete="off"
                      data-lpignore="true"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label>UF</label>
                    <input
                      type="text"
                      value={empresaEstado}
                      onChange={(e) => setEmpresaEstado(e.target.value.toUpperCase())}
                      placeholder="SP"
                      maxLength={2}
                      autoComplete="off"
                      data-lpignore="true"
                    />
                  </div>
                </div>
              </div>

              {/* Seção Logotipo */}
              <div className="form-group">
                <label>Logotipo da Empresa</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {empresaLogoUrl ? (
                    <img src={empresaLogoUrl} alt="Logo Preview" style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: empresaCorPrimaria, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      {(empresaNomeFantasia || 'E').substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      type="text"
                      value={empresaLogoUrl}
                      onChange={(e) => setEmpresaLogoUrl(e.target.value)}
                      placeholder="Cole a URL do logotipo da empresa ou selecione abaixo"
                      style={{ fontSize: '0.82rem' }}
                    />
                    <label className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', width: 'fit-content', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Upload size={13} /> Fazer Upload de Imagem
                      <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Seção Personalização do Tema (Paleta de 3 Cores) */}
              <div style={{ background: 'var(--bg-hover)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 700, fontSize: '0.9rem', color: '#38bdf8' }}>
                  <Palette size={16} /> Paleta de Cores do Cliente (Tema Personalizado)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.78rem' }}>Cor Primária</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={empresaCorPrimaria}
                        onChange={(e) => setEmpresaCorPrimaria(e.target.value)}
                        style={{ width: '36px', height: '36px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                      />
                      <input
                        type="text"
                        value={empresaCorPrimaria}
                        onChange={(e) => setEmpresaCorPrimaria(e.target.value)}
                        style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.78rem' }}>Cor Secundária</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={empresaCorSecundaria}
                        onChange={(e) => setEmpresaCorSecundaria(e.target.value)}
                        style={{ width: '36px', height: '36px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                      />
                      <input
                        type="text"
                        value={empresaCorSecundaria}
                        onChange={(e) => setEmpresaCorSecundaria(e.target.value)}
                        style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.78rem' }}>Cor Destaque</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={empresaCorDestaque}
                        onChange={(e) => setEmpresaCorDestaque(e.target.value)}
                        style={{ width: '36px', height: '36px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                      />
                      <input
                        type="text"
                        value={empresaCorDestaque}
                        onChange={(e) => setEmpresaCorDestaque(e.target.value)}
                        style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Live Theme Preview Box */}
                <div style={{ background: 'var(--bg-card)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Pré-Visualização do Tema do Cliente
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button type="button" style={{ background: empresaCorPrimaria, color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'default' }}>
                      Botão Primário
                    </button>
                    <span style={{ background: `${empresaCorSecundaria}25`, color: empresaCorSecundaria, border: `1px solid ${empresaCorSecundaria}50`, padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                      Badge Secundária
                    </span>
                    <span style={{ color: empresaCorDestaque, fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> Destaque Ativo
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setModalEmpresaOpen(false)}
                  className="btn-secondary"
                  disabled={submittingEmpresa}
                  style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submittingEmpresa}
                  style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {submittingEmpresa ? <Loader2 className="spin" size={16} /> : <Check size={16} />}
                  {editingEmpresaId ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR EMPRESA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE LICENÇAS DA EMPRESA */}
      {/* ======================================================== */}
      {modalEmpresaLicencasOpen && selectedEmpresaLicencas && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '640px', width: '90%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Key size={20} color="#818cf8" />
                <h3>Licenças da Empresa - {selectedEmpresaLicencas.nome_fantasia}</h3>
              </div>
              <button onClick={() => setModalEmpresaLicencasOpen(false)} className="btn-close">
                ✕
              </button>
            </div>

            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {loadingEmpresaLicencas ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <Loader2 className="spin" size={24} color="#818cf8" style={{ margin: '0 auto' }} />
                  <span style={{ display: 'block', marginTop: '8px', color: 'var(--text-dim)' }}>Carregando licenças da empresa...</span>
                </div>
              ) : empresaLicencasList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                  Nenhuma chave de licença vinculada a esta empresa.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
                  {empresaLicencasList.map((lic) => (
                    <div key={lic.id} style={{ background: 'var(--bg-hover)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: '#818cf8' }}>{lic.chave}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                          Usuário: {lic.usuario_nome ? `${lic.usuario_nome} (${lic.usuario_email})` : 'Não Atribuído'}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: lic.dias_restantes < 0 ? '#f87171' : 'var(--text-dim)' }}>
                          Validade: {new Date(lic.data_expiracao).toLocaleDateString('pt-BR')} ({lic.dias_restantes < 0 ? 'Expirada' : `${lic.dias_restantes} dias restantes`})
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.78rem',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        background: lic.status === 'Ativa' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: lic.status === 'Ativa' ? '#34d399' : '#f87171'
                      }}>
                        {lic.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setModalEmpresaLicencasOpen(false)}
                className="btn-secondary"
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
