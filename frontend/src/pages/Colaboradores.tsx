import React, { useState, useEffect, useRef } from 'react';
import { Colaborador } from '../types/colaborador';
import { UserPlus, Search, Edit2, Trash2, MapPin, Upload, Camera, Info, X, Check, Loader2 } from 'lucide-react';

export const Colaboradores: React.FC = () => {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Formulário State
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');

  // Auxiliares
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepError, setCepError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Buscar lista de colaboradores
  const fetchColaboradores = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/colaboradores');
      if (res.ok) {
        const data = await res.json();
        setColaboradores(data);
      }
    } catch (err) {
      console.error('Erro ao carregar colaboradores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColaboradores();
  }, []);

  // Máscara de CPF: 000.000.000-00
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    setCpf(value);
  };

  // Máscara e Busca Automática de CEP via API ViaCEP
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    
    const formattedCep = value.replace(/^(\d{5})(\d)/, '$1-$2');
    setCep(formattedCep);
    setCepError('');

    if (value.length === 8) {
      setBuscandoCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await res.json();

        if (data.erro) {
          setCepError('CEP não encontrado');
        } else {
          setLogradouro(data.logradouro || '');
          setBairro(data.bairro || '');
          setCidade(data.localidade || '');
          setEstado(data.uf || '');
        }
      } catch (err) {
        setCepError('Erro ao consultar CEP');
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  // Handler de Anexo/Upload de Foto
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A foto deve ter no máximo 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Limpar formulário
  const resetForm = () => {
    setEditingId(null);
    setNome('');
    setCpf('');
    setCep('');
    setLogradouro('');
    setNumero('');
    setComplemento('');
    setBairro('');
    setCidade('');
    setEstado('');
    setFotoUrl('');
    setFormError('');
    setCepError('');
  };

  const openNewModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (c: Colaborador) => {
    setEditingId(c.id || null);
    setNome(c.nome);
    setCpf(c.cpf);
    setCep(c.cep || '');
    setLogradouro(c.logradouro || '');
    setNumero(c.numero || '');
    setComplemento(c.complemento || '');
    setBairro(c.bairro || '');
    setCidade(c.cidade || '');
    setEstado(c.estado || '');
    setFotoUrl(c.foto_url || '');
    setFormError('');
    setModalOpen(true);
  };

  // Salvar / Atualizar Colaborador
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nome.trim() || !cpf.trim()) {
      setFormError('Campos Nome e CPF são obrigatórios.');
      return;
    }

    if (cpf.length < 14) {
      setFormError('Preencha o CPF completo (11 dígitos).');
      return;
    }

    setSubmitting(true);
    const payload = {
      nome: nome.trim(),
      cpf: cpf.trim(),
      cep: cep.trim() || null,
      logradouro: logradouro.trim() || null,
      numero: numero.trim() || null,
      complemento: complemento.trim() || null,
      bairro: bairro.trim() || null,
      cidade: cidade.trim() || null,
      estado: estado.trim() || null,
      foto_url: fotoUrl || null
    };

    try {
      const url = editingId ? `/api/colaboradores/${editingId}` : '/api/colaboradores';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Erro ao salvar colaborador');
      } else {
        setModalOpen(false);
        resetForm();
        fetchColaboradores();
      }
    } catch (err) {
      setFormError('Erro de conexão ao salvar colaborador.');
    } finally {
      setSubmitting(false);
    }
  };

  // Excluir Colaborador
  const handleDelete = async (id: number, nome: string) => {
    if (confirm(`Deseja realmente remover o colaborador "${nome}"?`)) {
      try {
        const res = await fetch(`/api/colaboradores/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchColaboradores();
        } else {
          alert('Erro ao excluir colaborador');
        }
      } catch (err) {
        alert('Erro ao comunicar com o servidor');
      }
    }
  };

  // Filtrar Colaboradores por nome ou CPF
  const filteredColaboradores = colaboradores.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf.includes(searchTerm) ||
    (c.cidade && c.cidade.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-content">
      {/* Header da Página */}
      <header className="page-header">
        <div>
          <h1 className="page-title">
            Gestão de <span className="text-gradient">Colaboradores</span>
          </h1>
          <p className="page-description">
            Cadastre e gerencie a equipe de colaboradores com dados pessoais, endereço e foto.
          </p>
        </div>
        <button onClick={openNewModal} className="btn-primary">
          <UserPlus size={18} />
          Novo Colaborador
        </button>
      </header>

      {/* Control Bar (Busca e Contadores) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div className="search-box">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Total: <strong style={{ color: '#38bdf8' }}>{colaboradores.length}</strong> colaborador(es)
        </div>
      </div>

      {/* Tabela de Colaboradores */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Foto</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Endereço</th>
                <th>Cidade / UF</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                      <Loader2 className="spin" size={20} /> Carregando colaboradores...
                    </div>
                  </td>
                </tr>
              ) : filteredColaboradores.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                    {searchTerm ? 'Nenhum colaborador encontrado para a busca.' : 'Nenhum colaborador cadastrado. Clique no botão acima para adicionar.'}
                  </td>
                </tr>
              ) : (
                filteredColaboradores.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="avatar-preview">
                        {c.foto_url ? (
                          <img src={c.foto_url} alt={c.nome} />
                        ) : (
                          <div className="avatar-placeholder">{c.nome.charAt(0).toUpperCase()}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{c.nome}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>ID: #{c.id}</div>
                    </td>
                    <td>
                      <code style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                        {c.cpf}
                      </code>
                    </td>
                    <td>
                      {c.logradouro ? (
                        <div style={{ fontSize: '0.88rem' }}>
                          {c.logradouro}{c.numero ? `, nº ${c.numero}` : ''}
                          {c.bairro ? ` - ${c.bairro}` : ''}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Não informado</span>
                      )}
                    </td>
                    <td>
                      {c.cidade ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                          <MapPin size={14} color="#38bdf8" /> {c.cidade}{c.estado ? `/${c.estado}` : ''}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>-</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(c)}
                          className="btn-action edit"
                          title="Editar Colaborador"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => c.id && handleDelete(c.id, c.nome)}
                          className="btn-action delete"
                          title="Excluir Colaborador"
                        >
                          <Trash2 size={15} />
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

      {/* Modal de Cadastro / Edição */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>{editingId ? 'Editar Colaborador' : 'Novo Colaborador'}</h3>
              <button onClick={() => setModalOpen(false)} className="btn-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {formError && (
                <div className="alert-danger">
                  {formError}
                </div>
              )}

              {/* Upload de Foto de Perfil */}
              <div className="photo-upload-section">
                <div className="photo-avatar-container">
                  {fotoUrl ? (
                    <img src={fotoUrl} alt="Preview da Foto" />
                  ) : (
                    <div className="photo-placeholder-icon">
                      <Camera size={32} />
                    </div>
                  )}
                </div>
                <div className="photo-upload-controls">
                  <label className="btn-upload">
                    <Upload size={16} /> Anexar Foto de Perfil
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {fotoUrl && (
                    <button
                      type="button"
                      onClick={() => setFotoUrl('')}
                      className="btn-remove-photo"
                    >
                      Remover foto
                    </button>
                  )}
                  <span className="upload-hint">Formatos JPG ou PNG (Máx 5MB)</span>
                </div>
              </div>

              {/* Dados Obrigatórios */}
              <div className="form-section-title">Dados Obrigatórios</div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Nome Completo *</label>
                  <input
                    type="text"
                    placeholder="Digite o nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>CPF *</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    maxLength={14}
                    required
                  />
                </div>
              </div>

              {/* Endereço Opcional */}
              <div className="form-section-title" style={{ marginTop: '16px' }}>
                Endereço <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>(Opcional)</span>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>
                    CEP
                    {buscandoCep && <Loader2 size={14} className="spin" style={{ marginLeft: '6px' }} />}
                  </label>
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={cep}
                    onChange={handleCepChange}
                    maxLength={9}
                  />
                  {cepError && <span className="field-error">{cepError}</span>}
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Logradouro / Rua</label>
                  <input
                    type="text"
                    placeholder="Auto-preenchido pelo CEP"
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Número da Casa
                    <span className="tooltip-icon" title="No Brasil, o número da casa indica a distância em metros a partir do início da rua.">
                      <Info size={14} color="#38bdf8" />
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 120 (Distância do início)"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Complemento</label>
                  <input
                    type="text"
                    placeholder="Apto, Bloco, etc."
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Bairro</label>
                  <input
                    type="text"
                    placeholder="Bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Cidade</label>
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Estado (UF)</label>
                  <input
                    type="text"
                    placeholder="UF"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value.toUpperCase())}
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="spin" /> Salvando...
                    </>
                  ) : (
                    <>
                      <Check size={16} /> {editingId ? 'Salvar Alterações' : 'Cadastrar Colaborador'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
