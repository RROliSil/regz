import React, { useState, useEffect } from 'react';
import { Usuario, PerfilAcesso, PermissoesAba, PermissaoNivel } from '../types/auth';
import { Users, Shield, Plus, Trash2, Edit, Check, AlertCircle, Loader2, UserCheck, UserX } from 'lucide-react';

export const Administracao: React.FC = () => {
  const [subTab, setSubTab] = useState<'usuarios' | 'perfis'>('usuarios');

  // Estados de Usuários
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [modalUserOpen, setModalUserOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  // Form de Usuário
  const [userNome, setUserNome] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userSenha, setUserSenha] = useState('');
  const [userPerfilId, setUserPerfilId] = useState<number | ''>('');
  const [userAtivo, setUserAtivo] = useState(true);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [submittingUser, setSubmittingUser] = useState(false);

  // Estados de Perfis
  const [perfis, setPerfis] = useState<PerfilAcesso[]>([]);
  const [loadingPerfis, setLoadingPerfis] = useState(true);
  const [modalPerfilOpen, setModalPerfilOpen] = useState(false);
  const [savedRowId, setSavedRowId] = useState<number | null>(null);

  // Form de Criar Novo Perfil
  const [perfilNome, setPerfilNome] = useState('');
  const [perfilDescricao, setPerfilDescricao] = useState('');
  const [perfilIsAdmin, setPerfilIsAdmin] = useState(false);
  const [perfilPermissoes, setPerfilPermissoes] = useState<PermissoesAba>({
    home: 'escrita',
    colaboradores: 'escrita',
    campos: 'escrita',
    administracao: 'sem_acesso'
  });
  const [perfilError, setPerfilError] = useState('');
  const [perfilSuccess, setPerfilSuccess] = useState('');
  const [submittingPerfil, setSubmittingPerfil] = useState(false);

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
    setPerfilNome('');
    setPerfilDescricao('');
    setPerfilIsAdmin(false);
    setPerfilPermissoes({
      home: 'escrita',
      colaboradores: 'escrita',
      campos: 'escrita',
      administracao: 'sem_acesso'
    });
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
      const res = await fetch('/api/perfis-acesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: perfilNome.trim(),
          descricao: perfilDescricao.trim() || null,
          is_admin: perfilIsAdmin,
          permissoes: perfilPermissoes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setPerfilError(data.error || 'Erro ao salvar perfil');
      } else {
        setModalPerfilOpen(false);
        setPerfilSuccess(`Perfil "${data.nome}" criado com sucesso!`);
        fetchPerfis();
        setTimeout(() => setPerfilSuccess(''), 3000);
      }
    } catch (err) {
      setPerfilError('Erro de conexão ao salvar perfil');
    } finally {
      setSubmittingPerfil(false);
    }
  };

  // Atualização Direta de Permissão na Matriz da Tabela
  const handleTogglePermissaoDirect = async (perfil: PerfilAcesso, aba: keyof PermissoesAba, tipo: 'leitura' | 'escrita') => {
    if (perfil.is_admin) return;

    const nivelAtual = perfil.permissoes?.[aba] || 'sem_acesso';
    let novoNivel: PermissaoNivel = 'sem_acesso';

    if (tipo === 'leitura') {
      if (nivelAtual === 'sem_acesso') {
        novoNivel = 'leitura';
      } else if (nivelAtual === 'leitura') {
        novoNivel = 'sem_acesso';
      } else if (nivelAtual === 'escrita') {
        novoNivel = 'sem_acesso';
      }
    } else if (tipo === 'escrita') {
      if (nivelAtual === 'escrita') {
        novoNivel = 'leitura';
      } else {
        novoNivel = 'escrita';
      }
    }

    const novaspermissoes = {
      ...perfil.permissoes,
      [aba]: novoNivel
    };

    // Atualização otimista no estado local
    setPerfis(prev => prev.map(p => p.id === perfil.id ? { ...p, permissoes: novaspermissoes } : p));

    try {
      const res = await fetch(`/api/perfis-acesso/${perfil.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: perfil.nome,
          descricao: perfil.descricao,
          is_admin: perfil.is_admin,
          permissoes: novaspermissoes
        })
      });

      if (res.ok) {
        setSavedRowId(perfil.id);
        setTimeout(() => setSavedRowId(null), 2000);
      } else {
        fetchPerfis(); // Reverter se falhar
      }
    } catch (err) {
      fetchPerfis();
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
          className={subTab === 'usuarios' ? 'btn-primary' : 'btn-secondary'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Users size={18} /> Usuários do Sistema ({usuarios.length})
        </button>
        <button
          onClick={() => setSubTab('perfis')}
          className={subTab === 'perfis' ? 'btn-primary' : 'btn-secondary'}
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
      {/* CONTEÚDO DA ABA: USUÁRIOS */}
      {/* ======================================================== */}
      {subTab === 'usuarios' && (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={20} color="#38bdf8" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Usuários Cadastrados</h3>
            </div>
            <button onClick={handleOpenNewUser} className="btn-primary" style={{ fontSize: '0.88rem' }}>
              <Plus size={16} /> Novo Usuário
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#ID</th>
                  <th>Nome do Usuário</th>
                  <th>E-mail de Acesso</th>
                  <th>Perfil de Acesso</th>
                  <th>Status</th>
                  <th>Data de Cadastro</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsuarios ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                      <Loader2 className="spin" size={20} /> Carregando usuários...
                    </td>
                  </tr>
                ) : usuarios.map((u) => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--text-dim)' }}>#{u.id}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>{u.nome}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{u.email}</span>
                    </td>
                    <td>
                      {u.perfil?.is_admin ? (
                        <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Shield size={12} /> Administrador Total
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                          {u.perfil?.nome || 'Sem Perfil'}
                        </span>
                      )}
                    </td>
                    <td>
                      {u.ativo ? (
                        <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <UserCheck size={14} /> Ativo
                        </span>
                      ) : (
                        <span style={{ color: '#fb7185', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <UserX size={14} /> Inativo
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                      {u.criado_em ? new Date(u.criado_em).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.ativo)}
                          className="btn-action"
                          style={{ background: u.ativo ? 'rgba(251, 113, 133, 0.15)' : 'rgba(52, 211, 153, 0.15)', color: u.ativo ? '#fb7185' : '#34d399' }}
                          title={u.ativo ? 'Inativar Usuário' : 'Ativar Usuário'}
                        >
                          {u.ativo ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="btn-action map"
                          title="Editar Usuário"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.nome)}
                          className="btn-action delete"
                          title="Excluir Usuário"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONTEÚDO DA ABA: PERFIS DE ACESSO (MATRIZ DIRETA COM CHECKBOXES) */}
      {/* ======================================================== */}
      {subTab === 'perfis' && (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={20} color="#a855f7" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Perfis de Acesso & Matriz de Permissões</h3>
            </div>
            <button onClick={handleOpenNewPerfil} className="btn-primary" style={{ fontSize: '0.88rem' }}>
              <Plus size={16} /> Novo Perfil de Acesso
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#ID</th>
                  <th style={{ minWidth: '180px', borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>Nome do Perfil</th>
                  <th style={{ minWidth: '150px', borderRight: '1px solid rgba(255, 255, 255, 0.1)', paddingLeft: '16px' }}>Home</th>
                  <th style={{ minWidth: '150px', borderRight: '1px solid rgba(255, 255, 255, 0.1)', paddingLeft: '16px' }}>Colaboradores</th>
                  <th style={{ minWidth: '150px', borderRight: '1px solid rgba(255, 255, 255, 0.1)', paddingLeft: '16px' }}>Campos</th>
                  <th style={{ minWidth: '150px', borderRight: '1px solid rgba(255, 255, 255, 0.1)', paddingLeft: '16px' }}>Administração</th>
                  <th style={{ textAlign: 'right', minWidth: '80px', paddingRight: '16px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loadingPerfis ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                      <Loader2 className="spin" size={20} /> Carregando matriz de perfis...
                    </td>
                  </tr>
                ) : perfis.map((p) => {
                  const isAdmin = p.is_admin;
                  const permissoes = p.permissoes || { home: 'sem_acesso', colaboradores: 'sem_acesso', campos: 'sem_acesso', administracao: 'sem_acesso' };

                  return (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--text-dim)' }}>#{p.id}</td>
                      <td style={{ borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {p.nome}
                          {isAdmin && (
                            <span style={{ fontSize: '0.7rem', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', padding: '1px 6px', borderRadius: '4px' }}>
                              ADMIN
                            </span>
                          )}
                          {savedRowId === p.id && (
                            <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600, animation: 'fadeIn 0.3s' }}>
                              ✓ Salvo
                            </span>
                          )}
                        </div>
                        {p.descricao && <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>{p.descricao}</div>}
                      </td>

                      {/* Células da Matriz com Checkboxes EMPILHADOS VERTICALMENTE e BORDAS DE DIVISÃO */}
                      {(['home', 'colaboradores', 'campos', 'administracao'] as Array<keyof PermissoesAba>).map((aba) => {
                        const nivel = permissoes[aba] || 'sem_acesso';
                        const isLeitura = isAdmin || nivel === 'leitura' || nivel === 'escrita';
                        const isEscrita = isAdmin || nivel === 'escrita';

                        return (
                          <td key={aba} style={{
                            padding: '12px 16px',
                            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                            verticalAlign: 'middle',
                            background: 'rgba(255, 255, 255, 0.015)'
                          }}>
                            {isAdmin ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', opacity: 0.85, fontSize: '0.84rem', color: '#818cf8', fontWeight: 600 }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                  <input type="checkbox" checked disabled readOnly style={{ accentColor: '#818cf8' }} /> Leitura
                                </span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                  <input type="checkbox" checked disabled readOnly style={{ accentColor: '#818cf8' }} /> Escrita
                                </span>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem' }}>
                                <label style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  cursor: 'pointer',
                                  color: isLeitura ? '#38bdf8' : 'var(--text-muted)',
                                  fontWeight: isLeitura ? 600 : 400,
                                  whiteSpace: 'nowrap'
                                }}>
                                  <input
                                    type="checkbox"
                                    checked={isLeitura}
                                    onChange={() => handleTogglePermissaoDirect(p, aba, 'leitura')}
                                    style={{ cursor: 'pointer', accentColor: '#38bdf8' }}
                                  />
                                  <span>Leitura</span>
                                </label>

                                <label style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  cursor: 'pointer',
                                  color: isEscrita ? '#34d399' : 'var(--text-muted)',
                                  fontWeight: isEscrita ? 600 : 400,
                                  whiteSpace: 'nowrap'
                                }}>
                                  <input
                                    type="checkbox"
                                    checked={isEscrita}
                                    onChange={() => handleTogglePermissaoDirect(p, aba, 'escrita')}
                                    style={{ cursor: 'pointer', accentColor: '#34d399' }}
                                  />
                                  <span>Escrita</span>
                                </label>
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Coluna de Ações (Apenas Botão de Excluir Perfil, Sem Lápis) */}
                      <td style={{ textAlign: 'right' }}>
                        {!isAdmin ? (
                          <button
                            onClick={() => handleDeletePerfil(p.id, p.nome)}
                            className="btn-action delete"
                            title="Excluir Perfil de Acesso"
                          >
                            <Trash2 size={15} />
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Fixo</span>
                        )}
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
        <div className="modal-backdrop" onClick={() => setModalUserOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
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
      {/* MODAL DE CRIAÇÃO DE NOVO PERFIL DE ACESSO */}
      {/* ======================================================== */}
      {modalPerfilOpen && (
        <div className="modal-backdrop" onClick={() => setModalPerfilOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Criar Novo Perfil de Acesso</h3>
              <button onClick={() => setModalPerfilOpen(false)} className="btn-close">
                ✕
              </button>
            </div>

            {perfilError && (
              <div className="alert-danger" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {perfilError}
              </div>
            )}

            <form onSubmit={handleSavePerfil} className="modal-form">
              <div className="form-group">
                <label>Nome do Perfil *</label>
                <input
                  type="text"
                  placeholder="Ex: Operador de Cadastro, Assistente de RH..."
                  value={perfilNome}
                  onChange={(e) => setPerfilNome(e.target.value)}
                  disabled={submittingPerfil}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição do Perfil</label>
                <input
                  type="text"
                  placeholder="Descreva a finalidade deste perfil..."
                  value={perfilDescricao}
                  onChange={(e) => setPerfilDescricao(e.target.value)}
                  disabled={submittingPerfil}
                />
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: '#38bdf8' }}>Permissões Iniciais do Perfil</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(['home', 'colaboradores', 'campos', 'administracao'] as Array<keyof PermissoesAba>).map((aba) => (
                    <div key={aba} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.5)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>Aba {aba}</span>
                      <select
                        value={perfilPermissoes[aba]}
                        onChange={(e: any) => setPerfilPermissoes(prev => ({ ...prev, [aba]: e.target.value }))}
                        className="custom-select-small"
                        disabled={submittingPerfil}
                      >
                        <option value="sem_acesso">Sem Acesso</option>
                        <option value="leitura">Somente Leitura</option>
                        <option value="escrita">Escrita / Controle Total</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setModalPerfilOpen(false)} className="btn-secondary" disabled={submittingPerfil}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={submittingPerfil}>
                  {submittingPerfil ? <Loader2 size={16} className="spin" /> : <Check size={16} />} Criar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
