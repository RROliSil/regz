import React, { useState, useEffect } from 'react';
import { Usuario, PerfilAcesso, Licenca } from '../types/auth';
import { Users, Shield, Plus, Trash2, Edit, Check, AlertCircle, Loader2, UserCheck, UserX, Home, Sliders, ShieldCheck, FileBarChart, Settings, Briefcase, X, Key, Copy, RefreshCw, Calendar, Award, CheckCircle2, XCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface UserColumnWidths {
  nome: number;
  email: number;
  perfil: number;
  licenca: number;
  senha: number;
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

export const Administracao: React.FC = () => {
  const { usuario, temPermissao } = useAuth();
  const podeEditar = temPermissao('administracao', 'escrita');
  const isSuperAdmin = !!(usuario?.is_super_admin || (usuario?.email && usuario.email.toLowerCase() === 'admin@regz.app') || usuario?.nome === 'Administrador Regz');
  const isUserAdminTag = !!usuario?.perfil?.is_admin;

  const [subTab, setSubTab] = useState<'usuarios' | 'perfis' | 'licencas'>('usuarios');

  useEffect(() => {
    if (subTab === 'licencas' && !isSuperAdmin) {
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
    acoes: 140
  });

  // Carregar larguras salvas do LocalStorage específicas do usuário logado
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
    }
  }, [usuario?.id]);

  const [resizingCol, setResizingCol] = useState<keyof UserColumnWidths | null>(null);
  const [startX, setStartX] = useState<number>(0);
  const [startWidth, setStartWidth] = useState<number>(0);

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

  // Arraste de Redimensionamento de Colunas
  const handleMouseDownResize = (e: React.MouseEvent, colKey: keyof UserColumnWidths) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingCol(colKey);
    setStartX(e.clientX);
    setStartWidth(userColumnWidths[colKey]);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingCol) return;
      const deltaX = e.clientX - startX;
      const newWidth = Math.min(300, Math.max(70, startWidth + deltaX));
      setUserColumnWidths(prev => {
        const next = { ...prev, [resizingCol]: newWidth };
        if (usuario?.id) {
          localStorage.setItem(`regz_user_column_widths_${usuario.id}`, JSON.stringify(next));
        }
        return next;
      });
    };

    const handleMouseUp = () => {
      if (resizingCol) {
        setResizingCol(null);
      }
    };

    if (resizingCol) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingCol, startX, startWidth, usuario?.id]);

  // Carregar dados da API
  const fetchUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const res = await fetch('/api/usuarios');
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
      const res = await fetch('/api/perfis-acesso');
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
      const res = await fetch('/api/licencas');
      if (res.ok) {
        const data = await res.json();
        setLicencas(data);
      }
    } catch (err) {
      console.error('Erro ao buscar licenças:', err);
    } finally {
      setLoadingLicencas(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchPerfis();
    fetchLicencas();
  }, []);

  const handleRenovarSenha = async (usuarioId: number) => {
    try {
      const res = await fetch(`/api/usuarios/${usuarioId}/renovar-senha`, { method: 'POST' });
      if (res.ok) {
        setUserSuccess('Validade da senha renovada por mais 30 dias com sucesso!');
        fetchUsuarios();
        setTimeout(() => setUserSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Erro ao renovar senha:', err);
    }
  };

  const handleCopyKey = (chave: string) => {
    navigator.clipboard.writeText(chave);
    setCopiedKey(chave);
    setTimeout(() => setCopiedKey(null), 3000);
  };

  const handleCreateLicenca = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLicenca(true);
    try {
      const res = await fetch('/api/licencas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: newLicencaUsuarioId ? parseInt(newLicencaUsuarioId, 10) : null,
          tipo_licenca: newLicencaTipo,
          validade_dias: newLicencaValidade
        })
      });

      if (res.ok) {
        setLicencaSuccess('Nova chave de licença gerada e ativada com sucesso!');
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

  const handleRenovarLicenca = async (id: number, dias: number = 30) => {
    if (!isUserAdminTag) {
      alert('Apenas perfis com a TAG de Administrador podem renovar chaves de licença.');
      return;
    }

    try {
      const res = await fetch(`/api/licencas/${id}/renovar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dias })
      });
      if (res.ok) {
        setLicencaSuccess(`Prazo da chave de licença renovado por +${dias} dias com sucesso!`);
        fetchLicencas();
        fetchUsuarios();
        setTimeout(() => setLicencaSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Erro ao renovar licença:', err);
    }
  };

  const handleToggleStatusLicenca = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'Ativa' ? 'Suspensa' : 'Ativa';
    try {
      const res = await fetch(`/api/licencas/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setLicencaSuccess(`Status da licença alterado para ${nextStatus}!`);
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
      const res = await fetch(`/api/licencas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLicencaSuccess('Chave de licença removida com sucesso!');
        fetchLicencas();
        fetchUsuarios();
        setTimeout(() => setLicencaSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Erro ao excluir licença:', err);
    }
  };

  // Handlers de Usuários
  const handleOpenNewUser = () => {
    setEditingUserId(null);
    setUserNome('');
    setUserEmail('');
    setUserSenha('');
    setUserPerfilId(perfis[0]?.id || '');
    setUserChaveLicenca('');
    setUserAtivo(true);
    setUserError('');
    setModalUserOpen(true);
  };

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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !statusAtual })
      });
      if (res.ok) fetchUsuarios();
    } catch (err) {
      alert('Erro ao alterar status');
    }
  };

  const handleDeleteUser = async (id: number, nome: string) => {
    if (confirm(`Deseja realmente remover permanentemente o usuário "${nome}"?`)) {
      try {
        const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
        if (res.ok) fetchUsuarios();
      } catch (err) {
        alert('Erro ao remover usuário');
      }
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
        headers: { 'Content-Type': 'application/json' },
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
        setPerfilSuccess(isEdit ? `Perfil "${data.nome}" atualizado com sucesso!` : `Perfil "${data.nome}" criado com sucesso!`);
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
    if (confirm(`Deseja realmente excluir o perfil "${nome}"?`)) {
      try {
        const res = await fetch(`/api/perfis-acesso/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
          fetchPerfis();
        } else {
          alert(data.error || 'Erro ao excluir perfil');
        }
      } catch (err) {
        alert('Erro ao excluir perfil');
      }
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
          <Users size={18} /> Usuários do Sistema ({usuarios.length})
        </button>
        <button
          onClick={() => setSubTab('perfis')}
          className={subTab === 'perfis' ? 'btn-primary' : 'btn-secondary admin-subtab-btn'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Shield size={18} /> Perfis de Acesso & Permissões ({perfis.length})
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => setSubTab('licencas')}
            className={subTab === 'licencas' ? 'btn-primary' : 'btn-secondary admin-subtab-btn'}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Key size={18} color={subTab === 'licencas' ? '#ffffff' : '#38bdf8'} /> Chaves de Licença ({licencas.length})
          </button>
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
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Usuários Cadastrados ({usuarios.length})</h3>
            </div>

            <button
              onClick={handleOpenNewUser}
              className="btn-primary"
              disabled={!podeEditar}
              style={{ fontSize: '0.88rem', opacity: podeEditar ? 1 : 0.5, cursor: podeEditar ? 'pointer' : 'not-allowed' }}
              title={podeEditar ? 'Cadastrar Usuário' : 'Ação desativada: Seu perfil permite apenas visualização'}
            >
              <Plus size={16} /> Novo Usuário
            </button>
          </div>

          <div className="table-flex-wrapper" style={{ overflowX: 'hidden' }}>
            <table className="custom-table" style={{ tableLayout: 'fixed', width: '100%' }}>
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
                    Exp.
                    <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'senha')} />
                  </th>
                  <th style={{ width: '150px', minWidth: '150px', maxWidth: '150px', textAlign: 'center', position: 'sticky', right: 0, zIndex: 10, background: '#0f172a' }}>
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
                ) : usuarios.map((u) => (
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
                        const dias = typeof u.dias_para_expirar === 'number' ? u.dias_para_expirar : 30;
                        if (dias <= 0) {
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.78rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                🔴 ({dias}d)
                              </span>
                              {podeEditar && (
                                <button
                                  onClick={() => handleRenovarSenha(u.id)}
                                  className="btn-action map"
                                  title="Renovar Validade da Senha por +30 Dias"
                                  style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <RefreshCw size={12} /> +30d
                                </button>
                              )}
                            </div>
                          );
                        }
                        if (dias <= 5) {
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.78rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                🟡 ({dias}d)
                              </span>
                              {podeEditar && (
                                <button
                                  onClick={() => handleRenovarSenha(u.id)}
                                  className="btn-action map"
                                  title="Renovar Validade por +30 Dias"
                                  style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <RefreshCw size={12} /> +30d
                                </button>
                              )}
                            </div>
                          );
                        }
                        return (
                          <span style={{ fontSize: '0.78rem', background: 'rgba(52, 211, 153, 0.12)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            🟢 ({dias}d)
                          </span>
                        );
                      })()}
                    </td>
                    <td style={{ width: '150px', minWidth: '150px', maxWidth: '150px', textAlign: 'center', position: 'sticky', right: 0, zIndex: 5, background: '#0f172a' }}>
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
                            <button
                              onClick={() => podeEditar && handleDeleteUser(u.id, u.nome)}
                              className="btn-action delete"
                              disabled={!podeEditar}
                              style={{ opacity: podeEditar ? 1 : 0.4, cursor: podeEditar ? 'pointer' : 'not-allowed' }}
                              title={podeEditar ? "Excluir Usuário" : "Ação desativada: Seu perfil permite apenas visualização"}
                            >
                              <Trash2 size={14} />
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
              <table className="custom-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '250px' }}>Chave de Licença</th>
                    <th>Usuário Vinculado</th>
                    <th style={{ width: '160px' }}>Plano</th>
                    <th style={{ width: '200px' }}>Validade / Vencimento</th>
                    <th style={{ width: '120px' }}>Status</th>
                    <th style={{ textAlign: 'center', width: '160px', minWidth: '160px' }}>Ações</th>
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
                        <td>
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

                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{lic.usuario_nome}</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{lic.usuario_email}</span>
                          </div>
                        </td>

                        <td style={{ whiteSpace: 'nowrap' }}>
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

                        <td>
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

                        <td>
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

                        <td style={{ textAlign: 'center', width: '160px', minWidth: '160px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                            <button
                              onClick={() => {
                                if (!podeEditar || !isUserAdminTag) return;
                                const isTrialLic = lic.tipo_licenca === 'Trial' || lic.tipo_licenca === 'Dev / Trial';
                                if (isTrialLic) {
                                  if (window.confirm("Renovar licença Trial por +30 dias?")) {
                                    handleRenovarLicenca(lic.id, 30);
                                  }
                                } else {
                                  const opcao = window.prompt("Escolha o prazo de renovação para licença Enterprise:\nDigite 120 (120 dias - 4 Meses) ou 365 (365 dias - 1 Ano)", "120");
                                  if (!opcao) return;
                                  const diasNum = parseInt(opcao, 10);
                                  if ([120, 365].includes(diasNum)) {
                                    handleRenovarLicenca(lic.id, diasNum);
                                  } else {
                                    alert("Prazo inválido. Escolha 120 ou 365 dias.");
                                  }
                                }
                              }}
                              className="btn-action map"
                              disabled={!podeEditar || !isUserAdminTag}
                              style={{ opacity: (podeEditar && isUserAdminTag) ? 1 : 0.4, cursor: (podeEditar && isUserAdminTag) ? 'pointer' : 'not-allowed' }}
                              title={isUserAdminTag ? "Renovar Licença (120 ou 365 dias)" : "Apenas perfis com a TAG de Administrador podem gerenciar chaves de licença"}
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={14} color="#38bdf8" /> Chave de Licença (Vínculo)
                </label>
                <input
                  type="text"
                  placeholder="Ex: REGZ-2026-F9A8-12B4-90C3"
                  value={userChaveLicenca}
                  onChange={(e) => setUserChaveLicenca(e.target.value)}
                  disabled={submittingUser}
                  style={{ fontFamily: 'monospace', color: '#38bdf8' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  Informe a chave de licença ativa vinculada a este usuário (Usuários Administradores são isentos).
                </span>
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
    </div>
  );
};
