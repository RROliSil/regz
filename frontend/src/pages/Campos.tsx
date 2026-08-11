import React, { useState, useEffect } from 'react';
import { Cargo } from '../types/colaborador';
import { Award, Search, Loader2, CheckCircle2 } from 'lucide-react';

export const Campos: React.FC = () => {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Carregar catálogo de cargos CBO da API
  const fetchCargos = async (query: string = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cargos?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setCargos(data);
      }
    } catch (err) {
      console.error('Erro ao carregar catálogo de cargos CBO:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCargos('');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCargos(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="page-content">
      {/* Header da Página */}
      <header className="page-header" style={{ marginBottom: '28px' }}>
        <div>
          <h1 className="page-title">
            Catálogo Oficial de <span className="text-gradient">Cargos CBO Brasil</span>
          </h1>
          <p className="page-description">
            Catálogo oficial e exclusivo da Classificação Brasileira de Ocupações (CBO - MTE/Brasil).
          </p>
        </div>
      </header>

      {/* Painel Único: Catálogo Oficial CBO Brasil */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="brand-logo" style={{ padding: '8px', borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' }}>
              <Award size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Ocupações Oficiais CBO Sincronizadas ({cargos.length})</h3>
              <span style={{ fontSize: '0.82rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <CheckCircle2 size={14} /> Base 100% CBO Oficial do Ministério do Trabalho e Emprego
              </span>
            </div>
          </div>

          <div className="search-box" style={{ width: '340px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Pesquisar por nome da função ou código CBO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>#ID</th>
                <th style={{ width: '160px' }}>Código CBO</th>
                <th>Título Oficial da Ocupação</th>
                <th>Status / Origem</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                      <Loader2 className="spin" size={20} /> Carregando base CBO oficial...
                    </div>
                  </td>
                </tr>
              ) : cargos.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                    Nenhuma ocupação CBO encontrada para "{searchQuery}".
                  </td>
                </tr>
              ) : (
                cargos.map((cargo) => (
                  <tr key={cargo.id}>
                    <td style={{ color: 'var(--text-dim)' }}>#{cargo.id}</td>
                    <td>
                      <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace' }}>
                        CBO {cargo.codigo_cbo || 'Oficial'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.96rem' }}>
                        {cargo.nome}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                        Oficial MTE/Brasil
                      </span>
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
