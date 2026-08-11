import React, { useState, useEffect } from 'react';
import { CampoCustomizado } from '../types/colaborador';
import { Sliders, Plus, Trash2, Loader2, Check, AlertCircle, Type, Calendar, Hash, ListFilter, HelpCircle } from 'lucide-react';

export const Campos: React.FC = () => {
  const [campos, setCampos] = useState<CampoCustomizado[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Estados do Formulário de Criação de Campo
  const [nomeCampo, setNomeCampo] = useState('');
  const [tipoCampo, setTipoCampo] = useState<'texto' | 'numero' | 'data' | 'selecao'>('texto');
  const [opcoesCampo, setOpcoesCampo] = useState('');
  const [obrigatorioCampo, setObrigatorioCampo] = useState(false);

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

  // Cadastrar Novo Campo Personalizado
  const handleAddCampo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!nomeCampo.trim()) {
      setErrorMsg('Digite o nome do campo (ex: Setor, Nome da Mãe, Nome do Pai...).');
      return;
    }

    if (tipoCampo === 'selecao' && !opcoesCampo.trim()) {
      setErrorMsg('Para campos do tipo Seleção, informe ao menos 2 opções separadas por vírgula.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/campos-customizados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeCampo.trim(),
          tipo: tipoCampo,
          opcoes: tipoCampo === 'selecao' ? opcoesCampo.trim() : null,
          obrigatorio: obrigatorioCampo
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Erro ao criar campo personalizável.');
      } else {
        setNomeCampo('');
        setTipoCampo('texto');
        setOpcoesCampo('');
        setObrigatorioCampo(false);
        setSuccessMsg(`Campo "${data.nome}" criado com sucesso!`);
        fetchCampos();
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (err) {
      setErrorMsg('Erro de conexão ao criar campo.');
    } finally {
      setSubmitting(false);
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
      case 'texto':
        return (
          <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <Type size={12} /> Texto Simples
          </span>
        );
      case 'numero':
        return (
          <span style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <Hash size={12} /> Numérico
          </span>
        );
      case 'data':
        return (
          <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <Calendar size={12} /> Data
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
            Crie novos campos para o perfil do colaborador (ex: Setor, Nome da Mãe, Nome do Pai, PIS/PASEP, Estado Civil...).
          </p>
        </div>
      </header>

      {/* Grid com Form de Criação e Lista de Campos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Painel de Criar Novo Campo */}
        <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div className="brand-logo" style={{ padding: '8px', borderRadius: '10px' }}>
              <Sliders size={20} color="#ffffff" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Criar Novo Campo</h3>
          </div>

          {errorMsg && (
            <div className="alert-danger" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={16} /> {successMsg}
            </div>
          )}

          <form onSubmit={handleAddCampo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Nome do Campo *</label>
              <input
                type="text"
                placeholder="Ex: Setor, Nome da Mãe, Nome do Pai, PIS..."
                value={nomeCampo}
                onChange={(e) => setNomeCampo(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Tipo de Dado *</label>
              <select
                value={tipoCampo}
                onChange={(e: any) => setTipoCampo(e.target.value)}
                className="custom-select"
                disabled={submitting}
              >
                <option value="texto">Texto (Linha simples)</option>
                <option value="numero">Número</option>
                <option value="data">Data (DD/MM/AAAA)</option>
                <option value="selecao">Seleção / Dropdown</option>
              </select>
            </div>

            {tipoCampo === 'selecao' && (
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Opções de Seleção <span title="Digite as opções separadas por vírgula" style={{ display: 'inline-flex', cursor: 'help' }}><HelpCircle size={13} color="var(--text-muted)" /></span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Tecnologia, Financeiro, Vendas, RH"
                  value={opcoesCampo}
                  onChange={(e) => setOpcoesCampo(e.target.value)}
                  disabled={submitting}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Separe cada opção por vírgula.
                </span>
              </div>
            )}

            <div className="form-group">
              <label className="checkbox-label" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={obrigatorioCampo}
                  onChange={(e) => setObrigatorioCampo(e.target.checked)}
                  disabled={submitting}
                />
                <span>Tornar este campo obrigatório</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ justifyContent: 'center', marginTop: '8px' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin" /> Criando Campo...
                </>
              ) : (
                <>
                  <Plus size={18} /> Criar Campo Personalizado
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tabela dos Campos Personalizados Ativos */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sliders size={18} color="#38bdf8" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Campos Ativos no Formulário ({campos.length})</h3>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#ID</th>
                  <th>Nome do Campo</th>
                  <th>Tipo de Dado</th>
                  <th>Opções</th>
                  <th>Obrigatório</th>
                  <th style={{ textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                        <Loader2 className="spin" size={20} /> Carregando campos...
                      </div>
                    </td>
                  </tr>
                ) : campos.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                      Nenhum campo personalizado cadastrado. Adicione um no painel ao lado.
                    </td>
                  </tr>
                ) : (
                  campos.map((campo) => (
                    <tr key={campo.id}>
                      <td style={{ color: 'var(--text-dim)' }}>#{campo.id}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>
                          {campo.nome}
                        </span>
                      </td>
                      <td>{getTipoBadge(campo.tipo)}</td>
                      <td>
                        {campo.opcoes ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {campo.opcoes}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>-</span>
                        )}
                      </td>
                      <td>
                        {campo.obrigatorio ? (
                          <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                            Sim
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Não</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => campo.id && handleDeleteCampo(campo.id, campo.nome)}
                          className="btn-action delete"
                          title="Remover este campo personalizado"
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

      </div>
    </div>
  );
};
