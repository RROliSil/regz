import React, { useState, useEffect } from 'react';
import { Usuario, PerfilAcesso } from '../types/auth';
import { Users, Shield, Plus, Trash2, Edit, Check, AlertCircle, Loader2, UserCheck, UserX, Home, Sliders, ShieldCheck, FileBarChart, Settings, Briefcase, X } from 'lucide-react';

interface UserColumnWidths {
  nome: number;
  email: number;
  perfil: number;
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

  const [subTab, setSubTab] = useState<'usuarios' | 'perfis'>('usuarios');

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

  // Listener para fechar modais exclusivamente ao pressionar a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modalUserOpen) setModalUserOpen(false);
        if (modalPerfilOpen) setModalPerfilOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalUserOpen, modalPerfilOpen]);

  // Estados para Largura Arrastável de Colunas na Tabela de Usuários (com LocalStorage por Usuário)
  const [userColumnWidths, setUserColumnWidths] = useState<UserColumnWidths>({
    nome: 260,
    email: 260,
    perfil: 200,
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
      const newWidth = Math.max(80, startWidth + deltaX);
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

  useEffect(() => {
    fetchUsuarios();
    fetchPerfis();
  }, []);

  // Handlers de Usuários
  const handleOpenNewUser = () => {
    setEditingUserId(null);
    setUserNome('');
    setUserEmail('');
    setUserSenha('');
    setUserPerfilId(perfis[0]?.id || '');
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

      {/* Sub-Navegação (Abas Internas: Usuários | Perfis de Acesso) */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
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
      </div>

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
                  <th style={{ width: `${userColumnWidths.acoes}px`, textAlign: 'center', position: 'relative' }}>
                    Ações
                    <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'acoes')} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingUsuarios ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
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
                    <td style={{ textAlign: 'center' }}>
                      {(() => {
                        const pObj = u.perfil || perfis.find(p => p.id === u.perfil_id);
                        const isUserAdminTotal = pObj?.is_admin || pObj?.nome === 'Administrador Total';
                        if (isUserAdminTotal) {
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
        <div className="modal-backdrop" onClick={() => setModalPerfilOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px', padding: '24px' }}>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                <label className="checkbox-label" style={{ margin: 0, fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={perfilAtivo}
                    onChange={(e) => setPerfilAtivo(e.target.checked)}
                    disabled={submittingPerfil}
                  />
                  <span>PERFIL ATIVO</span>
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
    </div>
  );
};
