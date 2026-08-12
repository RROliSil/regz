import React, { useState, useEffect } from 'react';
import { CampoCustomizado } from '../types/auth';
import { Plus, Trash2, Loader2, Check, AlertCircle, Type, Hash, ListFilter, Eye, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CampoColumnWidths {
  nome: number;
  tipo: number;
  regras: number;
  obrigatorio: number;
  acoes: number;
}

export const Campos: React.FC = () => {
  const { usuario, temPermissao } = useAuth();
  const podeEditar = temPermissao('campos', 'escrita');

  const [campos, setCampos] = useState<CampoCustomizado[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingType, setSubmittingType] = useState<'numero' | 'texto' | 'selecao' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Estado do Popup Modal de Visualização dos Campos Criados
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Estados dos 3 Formulários de Criação
  // Card 1: Numérico
  const [numNome, setNumNome] = useState('');
  const [numObrigatorio, setNumObrigatorio] = useState(false);
  const [numMin, setNumMin] = useState<string>('');
  const [numMax, setNumMax] = useState<string>('');

  // Card 2: Texto
  const [txtNome, setTxtNome] = useState('');
  const [txtObrigatorio, setTxtObrigatorio] = useState(false);
  const [txtMin, setTxtMin] = useState<string>('');
  const [txtMax, setTxtMax] = useState<string>('');

  // Card 3: Seleção Dropdown
  const [selNome, setSelNome] = useState('');
  const [selObrigatorio, setSelObrigatorio] = useState(false);
  const [selOpcoes, setSelOpcoes] = useState('');

  // Larguras das colunas na tabela do popup modal (salvas por usuário)
  const [colWidths, setColWidths] = useState<CampoColumnWidths>({
    nome: 220,
    tipo: 160,
    regras: 280,
    obrigatorio: 120,
    acoes: 90
  });

  const [resizingCol, setResizingCol] = useState<keyof CampoColumnWidths | null>(null);
  const [startX, setStartX] = useState<number>(0);
  const [startWidth, setStartWidth] = useState<number>(0);

  // Carregar larguras salvas do localStorage do usuário
  useEffect(() => {
    if (usuario?.id) {
      const saved = localStorage.getItem(`regz_campos_column_widths_${usuario.id}`);
      if (saved) {
        try {
          setColWidths(JSON.parse(saved));
        } catch (e) { }
      }
    }
  }, [usuario?.id]);

  // Listener para fechar modal no ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewModalOpen) {
        setViewModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewModalOpen]);

  // Redimensionamento de colunas do modal
  const handleMouseDownResize = (e: React.MouseEvent, colKey: keyof CampoColumnWidths) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingCol(colKey);
    setStartX(e.clientX);
    setStartWidth(colWidths[colKey]);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingCol) return;
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(60, startWidth + deltaX);
      setColWidths(prev => {
        const next = { ...prev, [resizingCol]: newWidth };
        if (usuario?.id) {
          localStorage.setItem(`regz_campos_column_widths_${usuario.id}`, JSON.stringify(next));
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

  // Carregar lista de campos customizados da API
  const fetchCampos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/campos-customizados');
      if (res.ok) {
        const data = await res.json();
        setCampos(data);
      }
    } catch (err) {
      console.error('Erro ao carregar campos customizados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampos();
  }, []);

  // Cadastrar Campo Genérico
  const handleCreateCampo = async (payload: {
    nome: string;
    tipo: 'numero' | 'texto' | 'selecao';
    opcoes?: string;
    obrigatorio: boolean;
    min_caracteres?: number | null;
    max_caracteres?: number | null;
  }) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!payload.nome.trim()) {
      setErrorMsg('Informe o nome do campo.');
      return;
    }

    setSubmittingType(payload.tipo);
    try {
      const res = await fetch('/api/campos-customizados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Erro ao criar campo personalizado.');
      } else {
        setSuccessMsg(`Campo "${data.nome}" criado com sucesso!`);
        fetchCampos();

        // Limpar formulário correspondente
        if (payload.tipo === 'numero') {
          setNumNome('');
          setNumObrigatorio(false);
          setNumMin('');
          setNumMax('');
        } else if (payload.tipo === 'texto') {
          setTxtNome('');
          setTxtObrigatorio(false);
          setTxtMin('');
          setTxtMax('');
        } else if (payload.tipo === 'selecao') {
          setSelNome('');
          setSelObrigatorio(false);
          setSelOpcoes('');
        }

        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (err) {
      setErrorMsg('Erro de conexão ao criar campo.');
    } finally {
      setSubmittingType(null);
    }
  };

  // Remover um Campo Personalizado
  const handleDeleteCampo = async (id: number, nome: string) => {
    if (confirm(`Deseja realmente remover o campo "${nome}"? Os dados preenchidos pelos colaboradores neste campo serão excluídos.`)) {
      try {
        const res = await fetch(`/api/campos-customizados/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchCampos();
        } else {
          alert('Erro ao remover campo');
        }
      } catch (err) {
        alert('Erro ao comunicar com o servidor');
      }
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'numero':
        return (
          <span style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <Hash size={12} /> Numérico
          </span>
        );
      case 'texto':
        return (
          <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <Type size={12} /> Texto
          </span>
        );
      case 'selecao':
        return (
          <span style={{ background: 'rgba(251, 146, 60, 0.15)', color: '#fb923c', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <ListFilter size={12} /> Seleção (Dropdown)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-content">
      {/* Header da Página */}
      <header className="page-header" style={{ marginBottom: '28px' }}>
        <div>
          <h1 className="page-title">
            Gestão de <span className="text-gradient">Campos Personalizados</span>
          </h1>
          <p className="page-description">
            Crie novos campos para o perfil do colaborador (Numéricos com min/max dígitos, Textos ou Seleções Dropdown).
          </p>
        </div>
      </header>

      {/* Alertas Globais de Erro e Sucesso */}
      {errorMsg && (
        <div className="alert-danger" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '12px 18px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <Check size={18} /> {successMsg}
        </div>
      )}

      {/* Grid com 3 Cards Específicos para Criar Campo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* ======================================================== */}
        {/* CARD 1: CRIAR CAMPO NUMÉRICO */}
        {/* ======================================================== */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                  <Hash size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Campo Numérico</h3>
              </div>

              {/* Botão Olho no Cabeçalho */}
              <button
                onClick={() => setViewModalOpen(true)}
                className="btn-action map"
                title="Visualizar campos já criados"
                style={{ borderRadius: '8px', padding: '6px' }}
              >
                <Eye size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateCampo({
                  nome: numNome,
                  tipo: 'numero',
                  obrigatorio: numObrigatorio,
                  min_caracteres: numMin ? Number(numMin) : null,
                  max_caracteres: numMax ? Number(numMax) : null
                });
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div className="form-group">
                <label>Nome do Campo *</label>
                <input
                  type="text"
                  placeholder="Ex: CPF, PIS, Matrícula, CEP..."
                  value={numNome}
                  onChange={(e) => setNumNome(e.target.value)}
                  disabled={submittingType === 'numero'}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label" style={{ margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={numObrigatorio}
                    onChange={(e) => setNumObrigatorio(e.target.checked)}
                    disabled={submittingType === 'numero'}
                  />
                  <span>Tornar este campo obrigatório</span>
                </label>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Mín. Dígitos</label>
                  <input
                    type="number"
                    placeholder="Ex: 3"
                    value={numMin}
                    onChange={(e) => setNumMin(e.target.value)}
                    min={0}
                    disabled={submittingType === 'numero'}
                  />
                </div>
                <div className="form-group">
                  <label>Máx. Dígitos</label>
                  <input
                    type="number"
                    placeholder="Ex: 11"
                    value={numMax}
                    onChange={(e) => setNumMax(e.target.value)}
                    min={0}
                    disabled={submittingType === 'numero'}
                  />
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', background: 'rgba(15, 23, 42, 0.4)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                ℹ️ Aceita pontuações e símbolos, porém valida <strong>somente a quantidade de dígitos numéricos</strong>.
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={submittingType === 'numero' || !podeEditar}
                style={{ justifyContent: 'center', marginTop: '10px', opacity: podeEditar ? 1 : 0.5, cursor: podeEditar ? 'pointer' : 'not-allowed', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' }}
                title={podeEditar ? 'Criar campo numérico' : 'Ação desativada: Seu perfil permite apenas visualização'}
              >
                {submittingType === 'numero' ? (
                  <>
                    <Loader2 size={16} className="spin" /> Criando...
                  </>
                ) : (
                  <>
                    <Plus size={18} /> Criar Campo Numérico
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 2: CRIAR CAMPO DE TEXTO */}
        {/* ======================================================== */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  <Type size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Campo de Texto</h3>
              </div>

              {/* Botão Olho no Cabeçalho */}
              <button
                onClick={() => setViewModalOpen(true)}
                className="btn-action map"
                title="Visualizar campos já criados"
                style={{ borderRadius: '8px', padding: '6px' }}
              >
                <Eye size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateCampo({
                  nome: txtNome,
                  tipo: 'texto',
                  obrigatorio: txtObrigatorio,
                  min_caracteres: txtMin ? Number(txtMin) : null,
                  max_caracteres: txtMax ? Number(txtMax) : null
                });
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div className="form-group">
                <label>Nome do Campo *</label>
                <input
                  type="text"
                  placeholder="Ex: Setor, Nome da Mãe, Nome do Pai..."
                  value={txtNome}
                  onChange={(e) => setTxtNome(e.target.value)}
                  disabled={submittingType === 'texto'}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label" style={{ margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={txtObrigatorio}
                    onChange={(e) => setTxtObrigatorio(e.target.checked)}
                    disabled={submittingType === 'texto'}
                  />
                  <span>Tornar este campo obrigatório</span>
                </label>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Mín. Caracteres</label>
                  <input
                    type="number"
                    placeholder="Ex: 2"
                    value={txtMin}
                    onChange={(e) => setTxtMin(e.target.value)}
                    min={0}
                    disabled={submittingType === 'texto'}
                  />
                </div>
                <div className="form-group">
                  <label>Máx. Caracteres</label>
                  <input
                    type="number"
                    placeholder="Ex: 100"
                    value={txtMax}
                    onChange={(e) => setTxtMax(e.target.value)}
                    min={0}
                    disabled={submittingType === 'texto'}
                  />
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', background: 'rgba(15, 23, 42, 0.4)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                ℹ️ Aceita alfanuméricos completos (textos, números e caracteres especiais).
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={submittingType === 'texto' || !podeEditar}
                style={{ justifyContent: 'center', marginTop: '10px', opacity: podeEditar ? 1 : 0.5, cursor: podeEditar ? 'pointer' : 'not-allowed', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
                title={podeEditar ? 'Criar campo de texto' : 'Ação desativada: Seu perfil permite apenas visualização'}
              >
                {submittingType === 'texto' ? (
                  <>
                    <Loader2 size={16} className="spin" /> Criando...
                  </>
                ) : (
                  <>
                    <Plus size={18} /> Criar Campo de Texto
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 3: CRIAR CAMPO SELEÇÃO DROPDOWN */}
        {/* ======================================================== */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(251, 146, 60, 0.15)', color: '#fb923c' }}>
                  <ListFilter size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Seleção Dropdown</h3>
              </div>

              {/* Botão Olho no Cabeçalho */}
              <button
                onClick={() => setViewModalOpen(true)}
                className="btn-action map"
                title="Visualizar campos já criados"
                style={{ borderRadius: '8px', padding: '6px' }}
              >
                <Eye size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!selOpcoes.trim()) {
                  setErrorMsg('Informe ao menos 2 opções para a seleção dropdown.');
                  return;
                }
                handleCreateCampo({
                  nome: selNome,
                  tipo: 'selecao',
                  opcoes: selOpcoes.trim(),
                  obrigatorio: selObrigatorio
                });
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div className="form-group">
                <label>Nome do Campo *</label>
                <input
                  type="text"
                  placeholder="Ex: Estado Civil, Turno, Nível..."
                  value={selNome}
                  onChange={(e) => setSelNome(e.target.value)}
                  disabled={submittingType === 'selecao'}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label" style={{ margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={selObrigatorio}
                    onChange={(e) => setSelObrigatorio(e.target.checked)}
                    disabled={submittingType === 'selecao'}
                  />
                  <span>Tornar este campo obrigatório</span>
                </label>
              </div>

              <div className="form-group">
                <label>Opções do Dropdown *</label>
                <input
                  type="text"
                  placeholder="Ex: Solteiro, Casado, Divorciado, Viúvo"
                  value={selOpcoes}
                  onChange={(e) => setSelOpcoes(e.target.value)}
                  disabled={submittingType === 'selecao'}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Separe cada opção por vírgula.
                </span>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={submittingType === 'selecao' || !podeEditar}
                style={{ justifyContent: 'center', marginTop: '10px', opacity: podeEditar ? 1 : 0.5, cursor: podeEditar ? 'pointer' : 'not-allowed', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' }}
                title={podeEditar ? 'Criar campo de seleção' : 'Ação desativada: Seu perfil permite apenas visualização'}
              >
                {submittingType === 'selecao' ? (
                  <>
                    <Loader2 size={16} className="spin" /> Criando...
                  </>
                ) : (
                  <>
                    <Plus size={18} /> Criar Campo Seleção
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* POPUP MODAL: TABELA DOS CAMPOS JÁ CRIADOS (PADRÃO RIGOROSO) */}
      {/* ======================================================== */}
      {viewModalOpen && (
        <div className="modal-backdrop">
          <div
            className="modal-content glass-panel animate-fadeIn"
            style={{ width: '900px', maxWidth: '95vw', padding: '0', overflow: 'hidden' }}
          >
            {/* Modal Header com Posição Relativa e Margem 0 (Impede corte do título e do X) */}
            <div style={{ position: 'relative', top: 0, margin: 0, padding: '22px 28px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.95)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Eye size={22} color="#38bdf8" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                  Campos Personalizados Cadastrados ({campos.length})
                </h3>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="btn-close"
                title="Fechar (ESC)"
                style={{ flexShrink: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Table Content (Padrão: sem rolagem horizontal, colunas arrastáveis) */}
            <div style={{ padding: '20px 24px' }}>
              <div className="table-flex-wrapper" style={{ overflowX: 'hidden' }}>
                <table className="custom-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: `${colWidths.nome}px`, position: 'relative' }}>
                        Nome do Campo
                        <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'nome')} />
                      </th>
                      <th style={{ width: `${colWidths.tipo}px`, position: 'relative' }}>
                        Tipo
                        <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'tipo')} />
                      </th>
                      <th style={{ width: `${colWidths.regras}px`, position: 'relative' }}>
                        Regras / Opções
                        <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'regras')} />
                      </th>
                      <th style={{ width: `${colWidths.obrigatorio}px`, position: 'relative' }}>
                        Obrigatório
                        <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'obrigatorio')} />
                      </th>
                      <th style={{ width: `${colWidths.acoes}px`, textAlign: 'center', position: 'relative' }}>
                        Ação
                        <div className="resizer" onMouseDown={(e) => handleMouseDownResize(e, 'acoes')} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                          <Loader2 className="spin" size={20} /> Carregando campos...
                        </td>
                      </tr>
                    ) : campos.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                          Nenhum campo personalizado cadastrado no momento.
                        </td>
                      </tr>
                    ) : (
                      campos.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <span style={{ fontWeight: 600, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                              {c.nome}
                            </span>
                          </td>
                          <td>{getTipoBadge(c.tipo)}</td>
                          <td>
                            {c.tipo === 'selecao' ? (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                                {c.opcoes || '-'}
                              </span>
                            ) : (c.min_caracteres !== null && c.min_caracteres !== undefined) || (c.max_caracteres !== null && c.max_caracteres !== undefined) ? (
                              <span style={{ fontSize: '0.8rem', color: '#a5b4fc' }}>
                                {c.tipo === 'numero' ? 'Dígitos: ' : 'Caracteres: '}
                                {c.min_caracteres !== null && c.min_caracteres !== undefined ? `Mín ${c.min_caracteres}` : ''}
                                {c.min_caracteres && c.max_caracteres ? ' / ' : ''}
                                {c.max_caracteres !== null && c.max_caracteres !== undefined ? `Máx ${c.max_caracteres}` : ''}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Sem limites</span>
                            )}
                          </td>
                          <td>
                            {c.obrigatorio ? (
                              <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                                Sim
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Não</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => podeEditar && c.id && handleDeleteCampo(c.id, c.nome)}
                              className="btn-action delete"
                              disabled={!podeEditar}
                              style={{ opacity: podeEditar ? 1 : 0.4, cursor: podeEditar ? 'pointer' : 'not-allowed' }}
                              title={podeEditar ? "Remover este campo personalizado" : "Ação desativada: Seu perfil permite apenas visualização"}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="btn-secondary"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
