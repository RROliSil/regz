import React, { useState, useEffect, useRef } from 'react';
import { Colaborador } from '../types/colaborador';
import { UserPlus, Search, Edit2, Trash2, MapPin, Upload, Camera, X, Check, Loader2, RotateCcw, Columns, ChevronDown, Bot, Map, ExternalLink } from 'lucide-react';

interface ColumnConfig {
  foto: boolean;
  nome: boolean;
  cpf: boolean;
  endereco: boolean;
  cidade: boolean;
  criado_em: boolean;
}

export const Colaboradores: React.FC = () => {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'ativos' | 'inativos'>('ativos');

  // Modal Principal de Cadastro / Edição
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Modal Quick Photo (Alteração Rápida de Foto)
  const [quickPhotoModalOpen, setQuickPhotoModalOpen] = useState(false);
  const [targetPhotoColaborador, setTargetPhotoColaborador] = useState<Colaborador | null>(null);

  // Seletor de Colunas Visíveis com LocalStorage
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<ColumnConfig>(() => {
    const saved = localStorage.getItem('regz_visible_columns');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return { foto: true, nome: true, cpf: true, endereco: true, cidade: true, criado_em: false };
  });

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
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [fotoUrl, setFotoUrl] = useState('');

  // Auxiliares
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [gerandoPessoa, setGerandoPessoa] = useState(false);
  const [cepError, setCepError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);

  // Salvar preferências de colunas no LocalStorage
  useEffect(() => {
    localStorage.setItem('regz_visible_columns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Buscar lista completa de colaboradores
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

  // Abrir o endereço do colaborador no Google Maps em nova aba (usando Lat/Long se disponível)
  const openGoogleMaps = (c: Colaborador) => {
    let url = '';
    if (c.latitude && c.longitude) {
      url = `https://www.google.com/maps/search/?api=1&query=${c.latitude},${c.longitude}`;
    } else {
      const addressQuery = [c.logradouro, c.numero ? `nº ${c.numero}` : '', c.bairro, c.cidade, c.estado, c.cep]
        .filter(Boolean)
        .join(', ');
      
      if (!addressQuery) return;
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery)}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Abrir o endereço atual do formulário no Google Maps
  const openCurrentFormGoogleMaps = () => {
    let url = '';
    if (latitude && longitude) {
      url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    } else {
      const addressQuery = [logradouro, numero ? `nº ${numero}` : '', bairro, cidade, estado, cep]
        .filter(Boolean)
        .join(', ');
      if (!addressQuery) return;
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery)}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Autogeocodificação Métrica no Frontend ao alterar CEP ou número
  const triggerGeocoding = async (streetVal?: string, numVal?: string, cityVal?: string, stateVal?: string, cepVal?: string) => {
    const st = streetVal !== undefined ? streetVal : logradouro;
    const num = numVal !== undefined ? numVal : numero;
    const ct = cityVal !== undefined ? cityVal : cidade;
    const uf = stateVal !== undefined ? stateVal : estado;
    const cp = cepVal !== undefined ? cepVal : cep;

    if (!ct && !st && !cp) return;

    try {
      const queryParams = new URLSearchParams({
        logradouro: st || '',
        numero: num || '',
        cidade: ct || '',
        estado: uf || '',
        cep: cp || ''
      });
      const res = await fetch(`/api/geocode?${queryParams.toString()}`);
      if (res.ok) {
        const coords = await res.json();
        if (coords.lat && coords.lon) {
          setLatitude(coords.lat);
          setLongitude(coords.lon);
        }
      }
    } catch (err) {
      console.error('Erro na geocodificação métrica:', err);
    }
  };

  // Função para Gerar Pessoa de Teste via API 4Devs
  const handleGerarPessoa = async (autoSave: boolean = false) => {
    setGerandoPessoa(true);
    try {
      const res = await fetch('/api/gerar-pessoa');
      if (res.ok) {
        const p = await res.json();
        
        if (autoSave) {
          const postRes = await fetch('/api/colaboradores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(p)
          });
          if (postRes.ok) {
            fetchColaboradores();
          } else {
            const errData = await postRes.json();
            alert(errData.error || 'Erro ao auto-cadastrar');
          }
        } else {
          resetForm();
          setNome(p.nome || '');
          setCpf(p.cpf || '');
          setCep(p.cep || '');
          setLogradouro(p.logradouro || '');
          setNumero(p.numero || '');
          setComplemento(p.complemento || '');
          setBairro(p.bairro || '');
          setCidade(p.cidade || '');
          setEstado(p.estado || '');
          setLatitude(p.latitude || null);
          setLongitude(p.longitude || null);
          setFotoUrl(p.foto_url || '');
          setModalOpen(true);
        }
      }
    } catch (err) {
      console.error('Erro ao gerar pessoa 4Devs:', err);
    } finally {
      setGerandoPessoa(false);
    }
  };

  const handleRobotButtonClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      handleGerarPessoa(true);
    } else {
      handleGerarPessoa(false);
    }
  };

  // Máscara de CPF: 000.000.000-00
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    setCpf(value);
  };

  // Máscara e Busca Automática de CEP via ViaCEP API + OpenStreetMap Geocoding
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

          // Disparar geocodificação métrica (Passo 1: CEP -> Coordenadas Base)
          triggerGeocoding(data.logradouro, numero, data.localidade, data.uf, formattedCep);
        }
      } catch (err) {
        setCepError('Erro ao consultar CEP');
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  // Compressão Ultra-Leve de Imagem via Canvas (300x300px, JPEG 0.70 ~25KB)
  const processImageFile = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetSize = 300;
        
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);
          const ultraLightBase64 = canvas.toDataURL('image/jpeg', 0.70);
          callback(ultraLightBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, (base64) => setFotoUrl(base64));
    }
  };

  // Upload rápido de foto via modal quick photo
  const handleQuickPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && targetPhotoColaborador) {
      processImageFile(file, async (base64) => {
        try {
          const res = await fetch(`/api/colaboradores/${targetPhotoColaborador.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...targetPhotoColaborador, foto_url: base64 })
          });
          if (res.ok) {
            setQuickPhotoModalOpen(false);
            fetchColaboradores();
          }
        } catch (err) {
          alert('Erro ao atualizar foto');
        }
      });
    }
  };

  // Remover foto via modal quick photo
  const handleQuickRemovePhoto = async () => {
    if (targetPhotoColaborador) {
      try {
        const res = await fetch(`/api/colaboradores/${targetPhotoColaborador.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...targetPhotoColaborador, foto_url: null })
        });
        if (res.ok) {
          setQuickPhotoModalOpen(false);
          fetchColaboradores();
        }
      } catch (err) {
        alert('Erro ao remover foto');
      }
    }
  };

  // Abrir Modal de Edição Rápida de Foto
  const openQuickPhotoModal = (c: Colaborador) => {
    setTargetPhotoColaborador(c);
    setQuickPhotoModalOpen(true);
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
    setLatitude(null);
    setLongitude(null);
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
    setLatitude(c.latitude ? Number(c.latitude) : null);
    setLongitude(c.longitude ? Number(c.longitude) : null);
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
      latitude: latitude || null,
      longitude: longitude || null,
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

  // Inativar Colaborador (Soft Delete)
  const handleInativar = async (id: number, nome: string) => {
    if (confirm(`Deseja inativar o colaborador "${nome}"? Ele será movido para a aba Inativados.`)) {
      try {
        const res = await fetch(`/api/colaboradores/${id}/inativar`, { method: 'PUT' });
        if (res.ok) {
          fetchColaboradores();
        } else {
          alert('Erro ao inativar colaborador');
        }
      } catch (err) {
        alert('Erro ao comunicar com o servidor');
      }
    }
  };

  // Reativar Colaborador
  const handleReativar = async (id: number, nome: string) => {
    if (confirm(`Deseja reativar o cadastro de "${nome}"?`)) {
      try {
        const res = await fetch(`/api/colaboradores/${id}/reativar`, { method: 'PUT' });
        if (res.ok) {
          fetchColaboradores();
        } else {
          alert('Erro ao reativar colaborador');
        }
      } catch (err) {
        alert('Erro ao comunicar com o servidor');
      }
    }
  };

  // Separar ativos e inativos
  const colaboradoresAtivos = colaboradores.filter(c => c.ativo !== false);
  const colaboradoresInativos = colaboradores.filter(c => c.ativo === false);

  const listTarget = activeSubTab === 'ativos' ? colaboradoresAtivos : colaboradoresInativos;

  // Filtrar Colaboradores por busca
  const filteredColaboradores = listTarget.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf.includes(searchTerm) ||
    (c.cidade && c.cidade.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleColumn = (key: keyof ColumnConfig) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="page-content">
      {/* Header da Página */}
      <header className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="page-title">
            Gestão de <span className="text-gradient">Colaboradores</span>
          </h1>
          <p className="page-description">
            Cadastre e gerencie a equipe de colaboradores com foto ultra-leve, geolocalização e inativação segura.
          </p>
        </div>
      </header>

      {/* Sub-Abas de Navegação e Botões de Ícones no canto direito final */}
      <div className="sub-tabs-container" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className={`sub-tab ${activeSubTab === 'ativos' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('ativos')}
          >
            Colaboradores Ativos
            <span className="sub-tab-badge">{colaboradoresAtivos.length}</span>
          </button>

          <button
            className={`sub-tab ${activeSubTab === 'inativos' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('inativos')}
          >
            Inativados
            <span className="sub-tab-badge danger">{colaboradoresInativos.length}</span>
          </button>
        </div>

        {/* Botões de Ação no canto direito (Novo Colaborador apenas ícone + Robozinho) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={openNewModal}
            className="btn-icon-primary"
            title="Novo Colaborador"
          >
            <UserPlus size={18} />
          </button>

          <button
            onClick={handleRobotButtonClick}
            className="btn-robot"
            title="Gerar Colaborador de Teste (4Devs) | Segure Shift para cadastrar direto"
            disabled={gerandoPessoa}
          >
            <Bot size={20} className={gerandoPessoa ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Control Bar (Busca, Seletor de Colunas e Contadores) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div className="search-box">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Seletor Dropdown de Colunas Visíveis */}
          <div className="dropdown-container" style={{ position: 'relative' }}>
            <button
              onClick={() => setColumnsDropdownOpen(!columnsDropdownOpen)}
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.88rem' }}
            >
              <Columns size={16} /> Colunas <ChevronDown size={14} />
            </button>

            {columnsDropdownOpen && (
              <div className="dropdown-menu glass-panel" style={{ position: 'absolute', right: 0, top: '46px', width: '220px', padding: '12px', zIndex: 50 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px', textTransform: 'uppercase' }}>Exibir Colunas</div>
                <label className="checkbox-label">
                  <input type="checkbox" checked={visibleColumns.foto} onChange={() => toggleColumn('foto')} />
                  <span>Foto de Perfil</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={visibleColumns.nome} onChange={() => toggleColumn('nome')} />
                  <span>Nome</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={visibleColumns.cpf} onChange={() => toggleColumn('cpf')} />
                  <span>CPF</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={visibleColumns.endereco} onChange={() => toggleColumn('endereco')} />
                  <span>Endereço</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={visibleColumns.cidade} onChange={() => toggleColumn('cidade')} />
                  <span>Cidade / UF</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={visibleColumns.criado_em} onChange={() => toggleColumn('criado_em')} />
                  <span>Data de Cadastro</span>
                </label>
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Exibindo: <strong style={{ color: '#38bdf8' }}>{filteredColaboradores.length}</strong> de {listTarget.length}
          </div>
        </div>
      </div>

      {/* Tabela de Colaboradores */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                {visibleColumns.foto && <th style={{ width: '70px' }}>Foto</th>}
                {visibleColumns.nome && <th>Nome</th>}
                {visibleColumns.cpf && <th>CPF</th>}
                {visibleColumns.endereco && <th>Endereço</th>}
                {visibleColumns.cidade && <th>Cidade / UF</th>}
                {visibleColumns.criado_em && <th>Data de Cadastro</th>}
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                      <Loader2 className="spin" size={20} /> Carregando lista...
                    </div>
                  </td>
                </tr>
              ) : filteredColaboradores.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                    {searchTerm 
                      ? 'Nenhum resultado encontrado para a busca.' 
                      : activeSubTab === 'ativos'
                        ? 'Nenhum colaborador ativo no momento.'
                        : 'Nenhum colaborador inativado.'}
                  </td>
                </tr>
              ) : (
                filteredColaboradores.map((c) => (
                  <tr key={c.id} className={c.ativo === false ? 'row-inactive' : ''}>
                    {visibleColumns.foto && (
                      <td>
                        <div 
                          className="avatar-hover-container" 
                          onClick={() => openQuickPhotoModal(c)}
                          title="Clique para alterar ou remover a foto"
                        >
                          <div className="avatar-preview">
                            {c.foto_url ? (
                              <img src={c.foto_url} alt={c.nome} />
                            ) : (
                              <div className="avatar-placeholder">{c.nome.charAt(0).toUpperCase()}</div>
                            )}
                          </div>
                          <div className="avatar-hover-overlay">
                            <Camera size={14} color="#ffffff" />
                          </div>
                        </div>
                      </td>
                    )}

                    {visibleColumns.nome && (
                      <td>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{c.nome}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                          ID: #{c.id} {c.ativo === false && <span className="badge-inactive">Inativo</span>}
                        </div>
                      </td>
                    )}

                    {visibleColumns.cpf && (
                      <td>
                        <code style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                          {c.cpf}
                        </code>
                      </td>
                    )}

                    {visibleColumns.endereco && (
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
                    )}

                    {/* Coluna Cidade / UF com texto limpo */}
                    {visibleColumns.cidade && (
                      <td>
                        {c.cidade ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                            <MapPin size={14} color="#38bdf8" /> {c.cidade}{c.estado ? `/${c.estado}` : ''}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>-</span>
                        )}
                      </td>
                    )}

                    {visibleColumns.criado_em && (
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                        {c.criado_em ? new Date(c.criado_em).toLocaleDateString('pt-BR') : '-'}
                      </td>
                    )}

                    {/* Coluna Ações com Botão Quadrado de Mapa (Google Maps + Geoposição Métrica) */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        {/* Botão de Mapa Quadrado nas Ações */}
                        {(c.cidade || c.logradouro || c.cep) && (
                          <button
                            onClick={() => openGoogleMaps(c)}
                            className="btn-action map"
                            title="Abrir localização no Google Maps"
                          >
                            <Map size={15} />
                          </button>
                        )}

                        {c.ativo !== false ? (
                          <>
                            <button
                              onClick={() => openEditModal(c)}
                              className="btn-action edit"
                              title="Editar Colaborador"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => c.id && handleInativar(c.id, c.nome)}
                              className="btn-action delete"
                              title="Inativar Colaborador (Soft Delete)"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => c.id && handleReativar(c.id, c.nome)}
                            className="btn-action reactivate"
                            title="Reativar Colaborador"
                          >
                            <RotateCcw size={15} /> Reativar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Quick Photo (Alterar / Remover Foto ao Clicar no Hover) */}
      {quickPhotoModalOpen && targetPhotoColaborador && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel" style={{ width: '420px', textAlign: 'center' }}>
            <div className="modal-header">
              <h3>Foto de {targetPhotoColaborador.nome}</h3>
              <button onClick={() => setQuickPhotoModalOpen(false)} className="btn-close">
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '10px 0' }}>
              <div className="avatar-preview-large">
                {targetPhotoColaborador.foto_url ? (
                  <img src={targetPhotoColaborador.foto_url} alt={targetPhotoColaborador.nome} />
                ) : (
                  <div className="avatar-placeholder-large">{targetPhotoColaborador.nome.charAt(0).toUpperCase()}</div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <label className="btn-primary" style={{ justifyContent: 'center', cursor: 'pointer' }}>
                  <Upload size={16} /> Subir Nova Foto (Ultraleve ~25KB)
                  <input
                    type="file"
                    ref={quickFileInputRef}
                    accept="image/*"
                    onChange={handleQuickPhotoUpload}
                    style={{ display: 'none' }}
                  />
                </label>

                {targetPhotoColaborador.foto_url && (
                  <button onClick={handleQuickRemovePhoto} className="btn-secondary" style={{ color: '#fb7185', borderColor: 'rgba(251, 113, 133, 0.3)' }}>
                    <Trash2 size={16} /> Remover Foto Atual
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Principal de Cadastro / Edição */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3>{editingId ? 'Editar Colaborador' : 'Novo Colaborador'}</h3>
                {!editingId && (
                  <button
                    type="button"
                    onClick={() => handleGerarPessoa(false)}
                    className="btn-robot"
                    title="Sortear outra pessoa (4Devs)"
                    disabled={gerandoPessoa}
                    style={{ width: '36px', height: '36px' }}
                  >
                    <Bot size={18} className={gerandoPessoa ? 'spin' : ''} />
                  </button>
                )}
              </div>
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
                <div 
                  className="photo-avatar-container avatar-hover-container"
                  onClick={() => fileInputRef.current?.click()}
                  title="Clique para escolher uma foto"
                >
                  {fotoUrl ? (
                    <img src={fotoUrl} alt="Preview da Foto" />
                  ) : (
                    <div className="photo-placeholder-icon">
                      <Camera size={32} />
                    </div>
                  )}
                  <div className="avatar-hover-overlay">
                    <Camera size={18} color="#ffffff" />
                  </div>
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
                  <span className="upload-hint">Foto otimizada automaticamente (~25KB)</span>
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

              {/* Endereço Opcional com Geolocalização Métrica */}
              <div className="form-section-title" style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Endereço <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>(Opcional)</span></span>
                
                {/* Botão de Mapa dentro do Modal de Cadastro / Edição */}
                {(logradouro || cidade || cep) && (
                  <button
                    type="button"
                    onClick={openCurrentFormGoogleMaps}
                    className="btn-action map"
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    title="Abrir este endereço no Google Maps"
                  >
                    <Map size={14} /> Ver no Mapa <ExternalLink size={12} />
                  </button>
                )}
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
                    onChange={(e) => {
                      setLogradouro(e.target.value);
                      triggerGeocoding(e.target.value, numero, cidade, estado, cep);
                    }}
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Número</label>
                  <input
                    type="text"
                    placeholder="Número"
                    value={numero}
                    onChange={(e) => {
                      setNumero(e.target.value);
                      // Ao preencher o número da casa, aplica a geocodificação métrica (Passo 2)
                      triggerGeocoding(logradouro, e.target.value, cidade, estado, cep);
                    }}
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
                    onChange={(e) => {
                      setCidade(e.target.value);
                      triggerGeocoding(logradouro, numero, e.target.value, estado, cep);
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Estado (UF)</label>
                  <input
                    type="text"
                    placeholder="UF"
                    value={estado}
                    onChange={(e) => {
                      const uf = e.target.value.toUpperCase();
                      setEstado(uf);
                      triggerGeocoding(logradouro, numero, cidade, uf, cep);
                    }}
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
