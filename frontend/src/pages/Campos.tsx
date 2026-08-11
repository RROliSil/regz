import React, { useState, useEffect } from 'react';
import { Cargo, CboItem } from '../types/colaborador';
import { Briefcase, Plus, Trash2, Loader2, Check, Sliders, AlertCircle, Search, Award, Download } from 'lucide-react';

export const Campos: React.FC = () => {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [novoCargo, setNovoCargo] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Estados da Busca Oficial CBO Brasil
  const [cboQuery, setCboQuery] = useState('');
  const [cboResults, setCboResults] = useState<CboItem[]>([]);
  const [loadingCbo, setLoadingCbo] = useState(false);
  const [importingCode, setImportingCode] = useState<string | null>(null);

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

  // Buscar Ocupações na API CBO Brasil
  const fetchCbo = async (query: string) => {
    setLoadingCbo(true);
    try {
      const res = await fetch(`/api/cbo/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setCboResults(data);
      }
    } catch (err) {
      console.error('Erro ao buscar CBO:', err);
    } finally {
      setLoadingCbo(false);
    }
  };

  useEffect(() => {
    fetchCargos();
    fetchCbo('');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCbo(cboQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [cboQuery]);

  // Cadastrar novo cargo no catálogo
  const handleAddCargo = async (e?: React.FormEvent, cargoCustom?: { nome: string; cbo?: string }) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const nomeParaCadastrar = cargoCustom ? cargoCustom.nome : novoCargo.trim();
    const cboParaCadastrar = cargoCustom ? cargoCustom.cbo : null;

    if (!nomeParaCadastrar) {
      setErrorMsg('Digite o nome do cargo para cadastrar.');
      return;
    }

    if (cargoCustom) {
      setImportingCode(cargoCustom.cbo || cargoCustom.nome);
    } else {
      setSubmitting(true);
    }

    try {
      const res = await fetch('/api/cargos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeParaCadastrar,
          codigo_cbo: cboParaCadastrar
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Erro ao cadastrar cargo.');
      } else {
        if (!cargoCustom) setNovoCargo('');
        setSuccessMsg(`Cargo "${data.nome}" ${data.codigo_cbo ? `(CBO ${data.codigo_cbo})` : ''} adicionado ao catálogo!`);
        fetchCargos();
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (err) {
      setErrorMsg('Erro de conexão ao cadastrar cargo.');
    } finally {
      setSubmitting(false);
      setImportingCode(null);
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
            Catálogo de <span className="text-gradient">Campos & CBO Brasil</span>
          </h1>
          <p className="page-description">
            Gerencie os cargos com suporte à Classificação Brasileira de Ocupações (CBO - MTE/Brasil).
          </p>
        </div>
      </header>

      {/* Seção Principal de Consulta e Cadastro CBO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* Formulário de Adição de Cargo Manual */}
        <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div className="brand-logo" style={{ padding: '8px', borderRadius: '10px' }}>
              <Briefcase size={20} color="#ffffff" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Novo Cargo Customizado</h3>
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

          <form onSubmit={(e) => handleAddCargo(e)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Nome do Cargo *</label>
              <input
                type="text"
                placeholder="Ex: Desenvolvedor(a), Coordenador(a)..."
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

        {/* Painel de Busca Oficial CBO Brasil (MTE) */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={22} color="#38bdf8" />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Catálogo Oficial CBO Brasil (MTE)</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Classificação Brasileira de Ocupações</span>
              </div>
            </div>

            <div className="search-box" style={{ width: '280px' }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Buscar por código CBO ou nome..."
                value={cboQuery}
                onChange={(e) => setCboQuery(e.target.value)}
              />
            </div>
          </div>

          <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--card-border)', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.4)' }}>
            <table className="custom-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ width: '110px' }}>Código CBO</th>
                  <th>Título Oficial da Ocupação</th>
                  <th style={{ textAlign: 'right', width: '140px' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {loadingCbo ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                      <Loader2 className="spin" size={18} /> Buscando na base CBO...
                    </td>
                  </tr>
                ) : cboResults.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)' }}>
                      Nenhuma ocupação CBO encontrada para "{cboQuery}".
                    </td>
                  </tr>
                ) : (
                  cboResults.map((item) => {
                    const jaExiste = cargos.some(c => c.nome.toLowerCase() === item.titulo.toLowerCase());
                    return (
                      <tr key={item.codigo}>
                        <td>
                          <code style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {item.codigo}
                          </code>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#f8fafc' }}>{item.titulo}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {jaExiste ? (
                            <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={14} /> Importado
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAddCargo(undefined, { nome: item.titulo, cbo: item.codigo })}
                              className="btn-action map"
                              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                              disabled={importingCode === item.codigo}
                              title="Importar esta ocupação CBO para o catálogo"
                            >
                              {importingCode === item.codigo ? (
                                <Loader2 size={12} className="spin" />
                              ) : (
                                <>
                                  <Download size={12} /> Importar
                                </>
                              )}
                            </button>
                          )}
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

      {/* Tabela dos Cargos Atualmente Disponíveis no Sistema */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={18} color="#38bdf8" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Cargos Ativos no Catálogo do Banco de Dados ({cargos.length})</h3>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>#ID</th>
                <th>Código CBO</th>
                <th>Nome do Cargo</th>
                <th>Data de Cadastro</th>
                <th style={{ textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                      <Loader2 className="spin" size={20} /> Carregando catálogo...
                    </div>
                  </td>
                </tr>
              ) : cargos.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                    Nenhum cargo cadastrado no catálogo. Importe da CBO acima ou adicione um manualmente.
                  </td>
                </tr>
              ) : (
                cargos.map((cargo) => (
                  <tr key={cargo.id}>
                    <td style={{ color: 'var(--text-dim)' }}>#{cargo.id}</td>
                    <td>
                      {cargo.codigo_cbo ? (
                        <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                          CBO {cargo.codigo_cbo}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Customizado</span>
                      )}
                    </td>
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
  );
};
