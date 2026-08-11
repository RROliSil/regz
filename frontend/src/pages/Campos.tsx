import React, { useState, useEffect } from 'react';
import { Cargo } from '../types/colaborador';
import { Briefcase, Plus, Trash2, Loader2, Check, Sliders, AlertCircle } from 'lucide-react';

export const Campos: React.FC = () => {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [novoCargo, setNovoCargo] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Carregar catálogo de cargos da API
  const fetchCargos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cargos');
      if (res.ok) {
        const data = await res.json();
        setCargos(data);
      }
    } catch (err) {
      console.error('Erro ao carregar catálogo de cargos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCargos();
  }, []);

  // Cadastrar novo cargo no catálogo
  const handleAddCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!novoCargo.trim()) {
      setErrorMsg('Digite o nome do cargo para cadastrar.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/cargos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoCargo.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Erro ao cadastrar cargo.');
      } else {
        setNovoCargo('');
        setSuccessMsg(`Cargo "${data.nome}" adicionado com sucesso!`);
        fetchCargos();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg('Erro de conexão ao cadastrar cargo.');
    } finally {
      setSubmitting(false);
    }
  };

  // Remover um cargo do catálogo
  const handleDeleteCargo = async (id: number, nome: string) => {
    if (confirm(`Deseja realmente remover o cargo "${nome}" do catálogo?`)) {
      try {
        const res = await fetch(`/api/cargos/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchCargos();
        } else {
          alert('Erro ao remover cargo');
        }
      } catch (err) {
        alert('Erro ao comunicar com o servidor');
      }
    }
  };

  return (
    <div className="page-content">
      {/* Header da Página */}
      <header className="page-header" style={{ marginBottom: '28px' }}>
        <div>
          <h1 className="page-title">
            Catálogo de <span className="text-gradient">Campos & Cargos</span>
          </h1>
          <p className="page-description">
            Gerencie os cargos e opções pré-definidas para seleção no formulário de colaboradores.
          </p>
        </div>
      </header>

      {/* Grid com Painel de Cadastro e Lista de Cargos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Formulário de Adição de Cargo */}
        <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div className="brand-logo" style={{ padding: '8px', borderRadius: '10px' }}>
              <Briefcase size={20} color="#ffffff" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Novo Cargo</h3>
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

          <form onSubmit={handleAddCargo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Nome do Cargo *</label>
              <input
                type="text"
                placeholder="Ex: Desenvolvedor(a), Gerente de Vendas..."
                value={novoCargo}
                onChange={(e) => setNovoCargo(e.target.value)}
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ justifyContent: 'center' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin" /> Adicionando...
                </>
              ) : (
                <>
                  <Plus size={18} /> Adicionar ao Catálogo
                </>
              )}
            </button>
          </form>
        </div>

        {/* Lista/Tabela de Cargos Cadastrados */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sliders size={18} color="#38bdf8" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Cargos Disponíveis ({cargos.length})</h3>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>Nome do Cargo</th>
                  <th>Data de Adição</th>
                  <th style={{ textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                        <Loader2 className="spin" size={20} /> Carregando cargos...
                      </div>
                    </td>
                  </tr>
                ) : cargos.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                      Nenhum cargo cadastrado no catálogo. Adicione um no painel ao lado.
                    </td>
                  </tr>
                ) : (
                  cargos.map((cargo) => (
                    <tr key={cargo.id}>
                      <td style={{ width: '60px', color: 'var(--text-dim)' }}>#{cargo.id}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>
                          {cargo.nome}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                        {cargo.criado_em ? new Date(cargo.criado_em).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => cargo.id && handleDeleteCargo(cargo.id, cargo.nome)}
                          className="btn-action delete"
                          title="Remover cargo do catálogo"
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
