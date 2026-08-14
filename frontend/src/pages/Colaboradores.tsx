import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Colaborador, Cargo, CampoCustomizado } from '../types/colaborador';
import { UserPlus, Search, Trash2, MapPin, Upload, Camera, X, Check, Loader2, RotateCcw, Columns, ChevronDown, Bot, Map, ExternalLink, Briefcase, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface ColumnConfig {
  foto: boolean;
  nome: boolean;
  cpf: boolean;
  cargo: boolean;
  endereco: boolean;
  cidade: boolean;
  criado_em: boolean;
}

interface ColumnWidths {
  foto: number;
  nome: number;
  cpf: number;
  cargo: number;
  endereco: number;
  cidade: number;
  criado_em: number;
  acoes: number;
}

const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
  foto: 85,
  nome: 200,
  cpf: 150,
  cargo: 180,
  endereco: 240,
  cidade: 160,
  criado_em: 130,
  acoes: 140
};

import { useAuth } from '../context/AuthContext';

export const Colaboradores: React.FC = () => {
  const { usuario, temPermissao } = useAuth();
  const podeEditar = temPermissao('colaboradores', 'escrita');
  const location = useLocation();
  const navigate = useNavigate();

  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [cargosList, setCargosList] = useState<Cargo[]>([]);
  const [camposCustomizadosList, setCamposCustomizadosList] = useState<CampoCustomizado[]>([]);
  const [valoresCustomizados, setValoresCustomizados] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'ativos' | 'inativos'>('ativos');
  const [returnToHome, setReturnToHome] = useState(false);

  // Paginação State (5 por padrão)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'todos'>(() => {
    const saved = localStorage.getItem('regz_page_size');
    if (saved) {
      return saved === 'todos' ? 'todos' : Number(saved) || 5;
    }
    return 5;
  });

  // Modal Principal de Cadastro / Edição
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const closeMainModal = () => {
    setModalOpen(false);
    if (returnToHome) {
      setReturnToHome(false);
      navigate('/home');
    }
  };

  // Auto-abrir modal ou aplicar filtros se redirecionado com estado de rota
  useEffect(() => {
    if (location.state) {
      if (location.state.returnToHome) {
        setReturnToHome(true);
      }
      if (location.state.subTab) {
        setActiveSubTab(location.state.subTab);
      }
      if (location.state.searchTerm !== undefined) {
        setSearchTerm(location.state.searchTerm);
      }
      if (location.state.openNewModal) {
        setEditingId(null);
        resetForm();
        setModalOpen(true);
      }
      if (location.state.editColaborador) {
        const c = location.state.editColaborador;
        if (c.ativo === false) {
          setActiveSubTab('inativos');
        } else {
          setActiveSubTab('ativos');
        }
        openEditModal(c);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
    return { foto: true, nome: true, cpf: true, cargo: true, endereco: true, cidade: true, criado_em: false };
  });

  // Larguras Redimensionáveis das Colunas com LocalStorage
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(() => {
    const saved = localStorage.getItem('regz_column_widths');
    if (saved) {
      try { return { ...DEFAULT_COLUMN_WIDTHS, ...JSON.parse(saved) }; } catch (e) { /* fallback */ }
    }
    return DEFAULT_COLUMN_WIDTHS;
  });

  // Formulário State
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cargo, setCargo] = useState('');
  const [cargoSearchOpen, setCargoSearchOpen] = useState(false);
  const [cargoSearchTerm, setCargoSearchTerm] = useState('');
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

  // Carregar preferências salvas do LocalStorage específicas do usuário logado
  useEffect(() => {
    if (usuario?.id) {
      const savedWidths = localStorage.getItem(`regz_colab_column_widths_${usuario.id}`);
      if (savedWidths) {
        try { setColumnWidths({ ...DEFAULT_COLUMN_WIDTHS, ...JSON.parse(savedWidths) }); } catch (e) { }
      }
      const savedCols = localStorage.getItem(`regz_colab_visible_columns_${usuario.id}`);
      if (savedCols) {
        try { setVisibleColumns(JSON.parse(savedCols)); } catch (e) { }
      }
      const savedPageSize = localStorage.getItem(`regz_colab_page_size_${usuario.id}`);
      if (savedPageSize) {
        setPageSize(savedPageSize === 'todos' ? 'todos' : Number(savedPageSize) || 5);
      }
    }
  }, [usuario?.id]);

  // Salvar preferências de colunas no LocalStorage por usuário
  useEffect(() => {
    if (usuario?.id) {
      localStorage.setItem(`regz_colab_visible_columns_${usuario.id}`, JSON.stringify(visibleColumns));
    }
  }, [visibleColumns, usuario?.id]);

  // Salvar larguras de colunas no LocalStorage por usuário
  useEffect(() => {
    if (usuario?.id) {
      localStorage.setItem(`regz_colab_column_widths_${usuario.id}`, JSON.stringify(columnWidths));
    }
  }, [columnWidths, usuario?.id]);

  // Cálculo dinâmico da largura total da tabela para garantir exibição 100% sem cortes
  const totalTableWidth = useMemo(() => {
    let sum = columnWidths.acoes || 140;
    if (visibleColumns.foto) sum += columnWidths.foto;
    if (visibleColumns.nome) sum += columnWidths.nome;
    if (visibleColumns.cpf) sum += columnWidths.cpf;
    if (visibleColumns.cargo) sum += columnWidths.cargo;
    if (visibleColumns.endereco) sum += columnWidths.endereco;
    if (visibleColumns.cidade) sum += columnWidths.cidade;
    if (visibleColumns.criado_em) sum += columnWidths.criado_em;
    return sum;
  }, [visibleColumns, columnWidths]);

  // Resetar página atual ao alterar busca, filtro ou sub-aba
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeSubTab, pageSize]);

  // Função para Arrastar e Redimensionar Colunas mantendo contêiner travado em 100%
  const handleResizeStart = (colKey: keyof ColumnWidths, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = columnWidths[colKey];

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const minW = colKey === 'acoes' ? 130 : 45;
      const newWidth = Math.max(minW, startWidth + deltaX);
      setColumnWidths(prev => ({ ...prev, [colKey]: newWidth }));
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const resetColumnWidths = () => {
    setColumnWidths(DEFAULT_COLUMN_WIDTHS);
  };

  // Buscar lista completa de colaboradores e catálogo de cargos
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

  const fetchCargosList = async () => {
    try {
      const res = await fetch('/api/cargos');
      if (res.ok) {
        const data = await res.json();
        setCargosList(data);
      }
    } catch (err) {
      console.error('Erro ao carregar lista de cargos:', err);
    }
  };

  const fetchCamposCustomizados = async () => {
    try {
      const res = await fetch('/api/campos-customizados');
      if (res.ok) {
        const data = await res.json();
        setCamposCustomizadosList(data);
      }
    } catch (err) {
      console.error('Erro ao carregar campos customizados:', err);
    }
  };

  useEffect(() => {
    fetchColaboradores();
    fetchCargosList();
    fetchCamposCustomizados();
  }, []);

  // Fechar modal ao pressionar a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) {
        closeMainModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, returnToHome]);

  // Abrir o endereço do colaborador no Google Maps com ALTA PRECISÃO
  const openGoogleMaps = (c: Colaborador) => {
    const fullAddress = [c.logradouro, c.numero ? `nº ${c.numero}` : '', c.bairro, c.cidade, c.estado, c.cep]
      .filter(Boolean)
      .join(', ');
    
    if (!fullAddress) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Abrir o endereço atual do formulário no Google Maps com ALTA PRECISÃO
  const openCurrentFormGoogleMaps = () => {
    const fullAddress = [logradouro, numero ? `nº ${numero}` : '', bairro, cidade, estado, cep]
      .filter(Boolean)
      .join(', ');
    
    if (!fullAddress) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Autogeocodificação de Alta Precisão no Frontend ao alterar CEP ou número
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
      console.error('Erro na geocodificação de precisão:', err);
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
          setCargo(p.cargo || '');
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

          // Disparar geocodificação de alta precisão
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
    setCargo('');
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
    setValoresCustomizados({});
    setFormError('');
    setCepError('');
  };

  const openNewModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = async (c: Colaborador) => {
    setEditingId(c.id || null);
    setNome(c.nome);
    setCpf(c.cpf);
    setCargo(c.cargo || '');
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
    setValoresCustomizados({});
    setModalOpen(true);

    if (c.id) {
      try {
        const res = await fetch(`/api/colaboradores/${c.id}/valores-customizados`);
        if (res.ok) {
          const vals = await res.json();
          setValoresCustomizados(vals);
        }
      } catch (e) {
        console.error('Erro ao carregar valores customizados:', e);
      }
    }
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

    // Validação de regras para Campos Customizados (min/max e dígitos numéricos)
    for (const campo of camposCustomizadosList) {
      if (!campo.id) continue;
      const val = (valoresCustomizados[campo.id] || '').trim();

      if (campo.obrigatorio && !val) {
        setFormError(`O campo "${campo.nome}" é obrigatório.`);
        return;
      }

      if (val) {
        if (campo.tipo === 'numero') {
          // Contabilizar somente dígitos numéricos ignorando pontuações e símbolos
          const digitsOnly = val.replace(/\D/g, '');
          if (campo.min_caracteres !== null && campo.min_caracteres !== undefined && digitsOnly.length < campo.min_caracteres) {
            setFormError(`O campo "${campo.nome}" exige no mínimo ${campo.min_caracteres} dígitos numéricos.`);
            return;
          }
          if (campo.max_caracteres !== null && campo.max_caracteres !== undefined && digitsOnly.length > campo.max_caracteres) {
            setFormError(`O campo "${campo.nome}" permite no máximo ${campo.max_caracteres} dígitos numéricos.`);
            return;
          }
        } else if (campo.tipo === 'texto') {
          if (campo.min_caracteres !== null && campo.min_caracteres !== undefined && val.length < campo.min_caracteres) {
            setFormError(`O campo "${campo.nome}" exige no mínimo ${campo.min_caracteres} caracteres.`);
            return;
          }
          if (campo.max_caracteres !== null && campo.max_caracteres !== undefined && val.length > campo.max_caracteres) {
            setFormError(`O campo "${campo.nome}" permite no máximo ${campo.max_caracteres} caracteres.`);
            return;
          }
        }
      }
    }

    setSubmitting(true);
    const payload = {
      nome: nome.trim(),
      cpf: cpf.trim(),
      cargo: cargo.trim() || null,
      cep: cep.trim() || null,
      logradouro: logradouro.trim() || null,
      numero: numero.trim() || null,
      complemento: complemento.trim() || null,
      bairro: bairro.trim() || null,
      cidade: cidade.trim() || null,
      estado: estado.trim() || null,
      latitude: latitude || null,
      longitude: longitude || null,
      foto_url: fotoUrl || null,
      valores_customizados: valoresCustomizados
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
        closeMainModal();
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

  // Filtrar Colaboradores por busca (incluindo UF/Estado e logradouro)
  const filteredColaboradores = listTarget.filter(c => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      c.nome.toLowerCase().includes(term) ||
      c.cpf.includes(term) ||
      (c.cargo && c.cargo.toLowerCase().includes(term)) ||
      (c.cidade && c.cidade.toLowerCase().includes(term)) ||
      (c.estado && c.estado.toLowerCase().includes(term)) ||
      (c.cidade && c.estado && `${c.cidade}/${c.estado}`.toLowerCase().includes(term)) ||
      (c.logradouro && c.logradouro.toLowerCase().includes(term))
    );
  });

  // Fatiar Colaboradores de acordo com a Paginação
  const totalItems = filteredColaboradores.length;
  const effectivePageSize = pageSize === 'todos' ? (totalItems || 1) : Number(pageSize);
  const totalPages = Math.ceil(totalItems / effectivePageSize) || 1;
  const startIndex = (currentPage - 1) * effectivePageSize;
  const endIndex = Math.min(startIndex + effectivePageSize, totalItems);

  const paginatedColaboradores = filteredColaboradores.slice(startIndex, endIndex);

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
            <span className="sub-tab-badge success">{colaboradoresAtivos.length}</span>
          </button>

          <button
            className={`sub-tab ${activeSubTab === 'inativos' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('inativos')}
          >
            Inativados
            <span className="sub-tab-badge danger">{colaboradoresInativos.length}</span>
          </button>
        </div>

        {/* Botões de Ação no canto direito */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={openNewModal}
            className="btn-icon-primary"
            disabled={!podeEditar}
            style={{ opacity: podeEditar ? 1 : 0.5, cursor: podeEditar ? 'pointer' : 'not-allowed' }}
            title={podeEditar ? "Novo Colaborador" : "Ação desativada: Seu perfil permite apenas visualização"}
          >
            <UserPlus size={18} />
          </button>

          <button
            onClick={handleRobotButtonClick}
            className="btn-robot"
            title={podeEditar ? "Gerar Colaborador de Teste (4Devs)" : "Ação desativada: Seu perfil permite apenas visualização"}
            disabled={!podeEditar || gerandoPessoa}
            style={{ opacity: podeEditar ? 1 : 0.5, cursor: podeEditar ? 'pointer' : 'not-allowed' }}
          >
            <Bot size={20} className={gerandoPessoa ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Control Bar (Busca e Botão Colunas RIGOROSAMENTE FIXO à direita) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <div className="search-box">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, cargo, cidade ou UF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Grupo do Botão Colunas Travado à Direita sem Mover */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {/* Seletor Dropdown de Colunas Visíveis */}
          <div className="dropdown-container" style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setColumnsDropdownOpen(!columnsDropdownOpen)}
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.88rem', flexShrink: 0 }}
            >
              <Columns size={16} /> Colunas <ChevronDown size={14} />
            </button>

            {columnsDropdownOpen && (
              <div className="dropdown-menu glass-panel" style={{ position: 'absolute', right: 0, top: '46px', width: '230px', padding: '14px', zIndex: 50 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#5e5eee', marginBottom: '8px', textTransform: 'uppercase' }}>Exibir Colunas</div>
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
                  <input type="checkbox" checked={visibleColumns.cargo} onChange={() => toggleColumn('cargo')} />
                  <span>Cargo / Função</span>
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

                <button
                  onClick={resetColumnWidths}
                  className="btn-secondary"
                  style={{ width: '100%', marginTop: '10px', padding: '6px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <RotateCw size={12} /> Ajustar Colunas
                </button>
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Exibindo: <strong style={{ color: '#5e5eee' }}>{totalItems > 0 ? `${startIndex + 1}-${endIndex}` : '0'}</strong> de {totalItems}
          </div>
        </div>
      </div>

      {/* Tabela de Colaboradores com Altura Total Fixa de 5 Linhas */}
      <div className="glass-panel table-responsive-container">
        <div className="table-flex-wrapper">
          <table className="custom-table" style={{ minWidth: `${totalTableWidth}px` }}>
            <thead>
              <tr>
                {visibleColumns.foto && (
                  <th style={{ width: `${columnWidths.foto}px`, minWidth: '80px' }}>
                    Foto
                    <div className="resizer" onMouseDown={(e) => handleResizeStart('foto', e)} />
                  </th>
                )}
                {visibleColumns.nome && (
                  <th style={{ width: `${columnWidths.nome}px` }}>
                    Nome
                    <div className="resizer" onMouseDown={(e) => handleResizeStart('nome', e)} />
                  </th>
                )}
                {visibleColumns.cpf && (
                  <th style={{ width: `${columnWidths.cpf}px` }}>
                    CPF
                    <div className="resizer" onMouseDown={(e) => handleResizeStart('cpf', e)} />
                  </th>
                )}
                {visibleColumns.cargo && (
                  <th style={{ width: `${columnWidths.cargo}px` }}>
                    Cargo
                    <div className="resizer" onMouseDown={(e) => handleResizeStart('cargo', e)} />
                  </th>
                )}
                {visibleColumns.endereco && (
                  <th style={{ width: `${columnWidths.endereco}px` }}>
                    Endereço
                    <div className="resizer" onMouseDown={(e) => handleResizeStart('endereco', e)} />
                  </th>
                )}
                {visibleColumns.cidade && (
                  <th style={{ width: `${columnWidths.cidade}px` }}>
                    Cidade / UF
                    <div className="resizer" onMouseDown={(e) => handleResizeStart('cidade', e)} />
                  </th>
                )}
                {visibleColumns.criado_em && (
                  <th style={{ width: `${columnWidths.criado_em}px` }}>
                    Data de Cadastro
                    <div className="resizer" onMouseDown={(e) => handleResizeStart('criado_em', e)} />
                  </th>
                )}
                <th className="col-acoes" style={{ textAlign: 'center', width: `${columnWidths.acoes}px`, minWidth: '130px' }}>
                  Ações
                  <div className="resizer" onMouseDown={(e) => handleResizeStart('acoes', e)} />
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                      <Loader2 className="spin" size={20} /> Carregando lista...
                    </div>
                  </td>
                </tr>
              ) : paginatedColaboradores.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                    {searchTerm 
                      ? 'Nenhum resultado encontrado para a busca.' 
                      : activeSubTab === 'ativos'
                        ? 'Nenhum colaborador ativo no momento.'
                        : 'Nenhum colaborador inativado.'}
                  </td>
                </tr>
              ) : (
                paginatedColaboradores.map((c) => (
                  <tr
                    key={c.id}
                    className={`clickable-row ${c.ativo === false ? 'row-inactive' : ''}`}
                    onClick={() => openEditModal(c)}
                    title={podeEditar ? "Clique para editar este colaborador" : "Clique para visualizar este colaborador (Modo Somente Leitura)"}
                  >
                    {visibleColumns.foto && (
                      <td style={{ width: `${columnWidths.foto}px`, whiteSpace: 'nowrap' }}>
                        <div 
                          className={podeEditar ? "avatar-hover-container" : "avatar-preview-wrapper"} 
                          onClick={(e) => {
                            e.stopPropagation();
                            openQuickPhotoModal(c);
                          }}
                          title={podeEditar ? "Clique para alterar ou remover a foto" : ""}
                        >
                          <div className="avatar-preview">
                            {c.foto_url ? (
                              <img src={c.foto_url} alt={c.nome} />
                            ) : (
                              <div className="avatar-placeholder">{c.nome.charAt(0).toUpperCase()}</div>
                            )}
                          </div>
                          {podeEditar && (
                            <div className="avatar-hover-overlay">
                              <Camera size={14} color="#ffffff" />
                            </div>
                          )}
                        </div>
                      </td>
                    )}

                    {visibleColumns.nome && (
                      <td style={{ width: `${columnWidths.nome}px` }}>
                        <div className="colaborador-nome" style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.nome}>
                          {c.nome}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                          ID: #{c.id} {c.ativo === false && <span className="badge-inactive">Inativo</span>}
                        </div>
                      </td>
                    )}

                    {visibleColumns.cpf && (
                      <td style={{ width: `${columnWidths.cpf}px` }}>
                        <code className="cpf-badge" style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem', whiteSpace: 'nowrap', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                          {c.cpf}
                        </code>
                      </td>
                    )}

                    {visibleColumns.cargo && (
                      <td style={{ width: `${columnWidths.cargo}px` }}>
                        {c.cargo ? (
                          <span 
                            className="cargo-badge"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '4px 10px', borderRadius: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}
                            title={c.cargo}
                          >
                            <Briefcase size={13} className="cargo-icon" style={{ flexShrink: 0 }} /> {c.cargo}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Não definido</span>
                        )}
                      </td>
                    )}

                    {visibleColumns.endereco && (
                      <td style={{ width: `${columnWidths.endereco}px` }}>
                        {c.logradouro ? (
                          <div 
                            style={{ fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}
                            title={`${c.logradouro}${c.numero ? `, nº ${c.numero}` : ''}${c.bairro ? ` - ${c.bairro}` : ''}`}
                          >
                            {c.logradouro}{c.numero ? `, nº ${c.numero}` : ''}
                            {c.bairro ? ` - ${c.bairro}` : ''}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Não informado</span>
                        )}
                      </td>
                    )}

                    {visibleColumns.cidade && (
                      <td style={{ width: `${columnWidths.cidade}px` }}>
                        {c.cidade ? (
                          <span 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}
                            title={`${c.cidade}${c.estado ? `/${c.estado}` : ''}`}
                          >
                            <MapPin size={14} color="#5e5eee" style={{ flexShrink: 0 }} /> {c.cidade}{c.estado ? `/${c.estado}` : ''}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>-</span>
                        )}
                      </td>
                    )}

                    {visibleColumns.criado_em && (
                      <td style={{ width: `${columnWidths.criado_em}px`, fontSize: '0.85rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                        {c.criado_em ? new Date(c.criado_em).toLocaleDateString('pt-BR') : '-'}
                      </td>
                    )}

                    {/* Coluna Ações Centralizada */}
                    <td className="col-acoes" style={{ textAlign: 'center', width: `${columnWidths.acoes}px`, minWidth: '130px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'center' }}>
                        {(c.cidade || c.logradouro || c.cep) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openGoogleMaps(c);
                            }}
                            className="btn-action map"
                            title="Abrir localização no Google Maps"
                          >
                            <Map size={15} />
                          </button>
                        )}

                        {c.ativo !== false ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (podeEditar && c.id) handleInativar(c.id, c.nome);
                            }}
                            className="btn-action delete"
                            disabled={!podeEditar}
                            style={{ opacity: podeEditar ? 1 : 0.4, cursor: podeEditar ? 'pointer' : 'not-allowed' }}
                            title={podeEditar ? "Inativar Colaborador (Soft Delete)" : "Ação desativada: Seu perfil permite apenas visualização"}
                          >
                            <Trash2 size={15} />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (podeEditar && c.id) handleReativar(c.id, c.nome);
                            }}
                            className="btn-action reactivate"
                            disabled={!podeEditar}
                            style={{ opacity: podeEditar ? 1 : 0.4, cursor: podeEditar ? 'pointer' : 'not-allowed' }}
                            title={podeEditar ? "Reativar Colaborador" : "Ação desativada: Seu perfil permite apenas visualização"}
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

        {/* Rodapé de Paginação Sempre Ancorado na Base */}
        <div className="table-pagination-footer">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {totalItems > 0 ? (
              <>Mostrando <strong style={{ color: '#5e5eee' }}>{startIndex + 1}</strong> a <strong style={{ color: '#5e5eee' }}>{endIndex}</strong> de <strong style={{ color: '#5e5eee' }}>{totalItems}</strong> colaboradores</>
            ) : (
              'Nenhum colaborador na lista'
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Seletor Dropdown para Escolher Quantidade por Página (5, 15, 50, 100, todos) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Exibir:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const val = e.target.value === 'todos' ? 'todos' : Number(e.target.value);
                  setPageSize(val);
                  setCurrentPage(1);
                  localStorage.setItem('regz_page_size', String(val));
                }}
                className="custom-select-small"
              >
                <option value={5}>5 por página</option>
                <option value={15}>15 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
                <option value="todos">Todos</option>
              </select>
            </div>

            {/* Controles de Navegação de Página no Canto Inferior Direito */}
            {pageSize !== 'todos' && totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn-pagination"
                  title="Página Anterior"
                >
                  <ChevronLeft size={16} />
                </button>

                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', padding: '0 4px' }}>
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                  className="btn-pagination"
                  title="Próxima Página"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Quick Photo */}
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
              <button onClick={closeMainModal} className="btn-close">
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
              <div className="form-grid-3">
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

                {/* Dropdown Selecionável com Busca por Nome ou Código CBO */}
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Cargo / Função (Pesquisa por Nome ou CBO)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Pesquisar por cargo ou CBO..."
                      value={cargoSearchOpen ? cargoSearchTerm : cargo}
                      onFocus={() => {
                        setCargoSearchOpen(true);
                        setCargoSearchTerm(cargo || '');
                      }}
                      onChange={(e) => {
                        setCargoSearchTerm(e.target.value);
                        setCargo(e.target.value);
                        setCargoSearchOpen(true);
                      }}
                      style={{ paddingRight: '36px' }}
                    />
                    <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>

                  {cargoSearchOpen && (
                    <>
                      <div 
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
                        onClick={() => setCargoSearchOpen(false)} 
                      />
                      <div 
                        className="cargo-dropdown-popover" 
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: '100%',
                          marginTop: '6px',
                          maxHeight: '230px',
                          overflowY: 'auto',
                          zIndex: 999,
                          padding: '6px'
                        }}
                      >
                        {cargosList
                          .filter(cg => {
                            const q = cargoSearchTerm.toLowerCase().trim();
                            if (!q) return true;
                            return cg.nome.toLowerCase().includes(q) || (cg.codigo_cbo && cg.codigo_cbo.toLowerCase().includes(q));
                          })
                          .map(cg => (
                            <div
                              key={cg.id}
                              onClick={() => {
                                setCargo(cg.nome);
                                setCargoSearchTerm(cg.nome);
                                setCargoSearchOpen(false);
                              }}
                              className={`cargo-dropdown-item ${cargo === cg.nome ? 'selected' : ''}`}
                            >
                              <span className="cargo-dropdown-item-title">{cg.nome}</span>
                              {cg.codigo_cbo && (
                                <span className="cargo-dropdown-cbo-badge">
                                  CBO {cg.codigo_cbo}
                                </span>
                              )}
                            </div>
                          ))}

                        {cargosList.filter(cg => {
                          const q = cargoSearchTerm.toLowerCase().trim();
                          if (!q) return true;
                          return cg.nome.toLowerCase().includes(q) || (cg.codigo_cbo && cg.codigo_cbo.toLowerCase().includes(q));
                        }).length === 0 && (
                          <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.84rem' }}>
                            Nenhum cargo CBO encontrado para "{cargoSearchTerm}".
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Endereço Opcional */}
              <div className="form-section-title" style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Endereço <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>(Opcional)</span></span>
                
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

              {/* Seção de Campos Personalizados */}
              {camposCustomizadosList.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <div className="form-section-title" style={{ marginBottom: '14px' }}>
                    <span>CAMPOS PERSONALIZADOS</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {camposCustomizadosList.map((campo) => {
                      const valorAtual = campo.id ? (valoresCustomizados[campo.id] || '') : '';
                      const setValorAtual = (val: string) => {
                        if (!campo.id) return;
                        setValoresCustomizados(prev => ({ ...prev, [campo.id!]: val }));
                      };

                      if (campo.tipo === 'selecao' && campo.opcoes) {
                        const opcoesArr = campo.opcoes.split(',').map(o => o.trim()).filter(Boolean);
                        return (
                          <div key={campo.id} className="form-group">
                            <label>{campo.nome} {campo.obrigatorio && '*'}</label>
                            <select
                              value={valorAtual}
                              onChange={(e) => setValorAtual(e.target.value)}
                              className="custom-select"
                              required={campo.obrigatorio}
                            >
                              <option value="">Selecione...</option>
                              {opcoesArr.map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        );
                      }

                      if (campo.tipo === 'alternativa') {
                        return (
                          <div key={campo.id} className="form-group">
                            <label>{campo.nome} {campo.obrigatorio && '*'}</label>
                            <div className="boolean-field-box">
                              <label className="checkbox-label" style={{ cursor: 'pointer', margin: 0 }}>
                                <input
                                  type="checkbox"
                                  checked={valorAtual === 'Sim'}
                                  onChange={() => setValorAtual(valorAtual === 'Sim' ? '' : 'Sim')}
                                />
                                <span style={{ fontWeight: 600, color: valorAtual === 'Sim' ? '#34d399' : 'var(--text-main)' }}>Sim</span>
                              </label>
                              <label className="checkbox-label" style={{ cursor: 'pointer', margin: 0 }}>
                                <input
                                  type="checkbox"
                                  checked={valorAtual === 'Não'}
                                  onChange={() => setValorAtual(valorAtual === 'Não' ? '' : 'Não')}
                                />
                                <span style={{ fontWeight: 600, color: valorAtual === 'Não' ? '#fb7185' : 'var(--text-main)' }}>Não</span>
                              </label>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={campo.id} className="form-group">
                          <label>{campo.nome} {campo.obrigatorio && '*'}</label>
                          <input
                            type={campo.tipo === 'data' ? 'date' : 'text'}
                            placeholder={`Informe ${campo.nome.toLowerCase()}...`}
                            value={valorAtual}
                            onChange={(e) => setValorAtual(e.target.value)}
                            required={campo.obrigatorio}
                          />
                          {campo.tipo === 'numero' && (campo.min_caracteres || campo.max_caracteres) && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                              Dígitos numéricos: {campo.min_caracteres ? `Mín: ${campo.min_caracteres}` : ''} {campo.min_caracteres && campo.max_caracteres ? ' | ' : ''} {campo.max_caracteres ? `Máx: ${campo.max_caracteres}` : ''}
                            </span>
                          )}
                          {campo.tipo === 'texto' && (campo.min_caracteres || campo.max_caracteres) && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                              Caracteres: {campo.min_caracteres ? `Mín: ${campo.min_caracteres}` : ''} {campo.min_caracteres && campo.max_caracteres ? ' | ' : ''} {campo.max_caracteres ? `Máx: ${campo.max_caracteres}` : ''}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeMainModal}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!podeEditar || submitting}
                  style={{ opacity: podeEditar ? 1 : 0.5, cursor: podeEditar ? 'pointer' : 'not-allowed' }}
                  title={podeEditar ? 'Salvar Alterações' : 'Ação desativada: Seu perfil permite apenas visualização'}
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
