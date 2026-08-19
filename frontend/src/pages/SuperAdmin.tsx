import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Empresa } from './Administracao';
import { Licenca } from '../types/auth';
import {
  Building2, Key, Plus, Trash2, Edit, Check, Loader2,
  Shield, Copy, RefreshCw, Calendar, CheckCircle2, AlertTriangle,
  MapPin, Palette, Upload, Database, LogOut
} from 'lucide-react';

interface EmpresaColumnWidths {
  logo: number;
  empresa: number;
  cnpj: number;
  banco: number;
  local: number;
  cores: number;
  licencas: number;
  status: number;
  acoes: number;
}

interface LicencaColumnWidths {
  chave: number;
  empresa: number;
  plano: number;
  validade: number;
  status: number;
  acoes: number;
}

export const SuperAdmin: React.FC = () => {
  const { usuario, logout } = useAuth();
  const [subTab, setSubTab] = useState<'empresas' | 'licencas'>('empresas');

  // Estados de Empresas
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [modalEmpresaOpen, setModalEmpresaOpen] = useState(false);
  const [editingEmpresaId, setEditingEmpresaId] = useState<number | null>(null);

  // Campos de Empresa
  const [empresaRazaoSocial, setEmpresaRazaoSocial] = useState('');
  const [empresaNomeFantasia, setEmpresaNomeFantasia] = useState('');
  const [empresaCnpj, setEmpresaCnpj] = useState('');
  const [empresaCep, setEmpresaCep] = useState('');
  const [empresaLogradouro, setEmpresaLogradouro] = useState('');
  const [empresaNumero, setEmpresaNumero] = useState('');
  const [empresaComplemento, setEmpresaComplemento] = useState('');
  const [empresaBairro, setEmpresaBairro] = useState('');
  const [empresaCidade, setEmpresaCidade] = useState('');
  const [empresaEstado, setEmpresaEstado] = useState('');
  const [empresaLogoUrl, setEmpresaLogoUrl] = useState('');
  const [empresaCorPrimaria, setEmpresaCorPrimaria] = useState('#6366f1');
  const [empresaCorSecundaria, setEmpresaCorSecundaria] = useState('#38bdf8');
  const [empresaCorDestaque, setEmpresaCorDestaque] = useState('#34d399');
  const [empresaStatus, setEmpresaStatus] = useState('Ativa');

  // Campos de Banco Próprio (On-Premise)
  const [dbHost, setDbHost] = useState('localhost');
  const [dbPort, setDbPort] = useState(5432);
  const [dbUser, setDbUser] = useState('postgres');
  const [dbPass, setDbPass] = useState('');
  const [dbName, setDbName] = useState('regz_db');

  const [buscandoCepEmpresa, setBuscandoCepEmpresa] = useState(false);
  const [cepErrorEmpresa, setCepErrorEmpresa] = useState('');
  const [submittingEmpresa, setSubmittingEmpresa] = useState(false);

  // Estados de Licenças
  const [licencas, setLicencas] = useState<Licenca[]>([]);
  const [loadingLicencas, setLoadingLicencas] = useState(true);
  const [modalLicencaOpen, setModalLicencaOpen] = useState(false);
  const [newLicencaEmpresaId, setNewLicencaEmpresaId] = useState<string>('');
  const [newLicencaTipo, setNewLicencaTipo] = useState<string>('Enterprise');
  const [newLicencaValidade, setNewLicencaValidade] = useState<number>(365);
  const [submittingLicenca, setSubmittingLicenca] = useState(false);

  // Modal Renovação / Alteração de Licença
  const [modalRenovarOpen, setModalRenovarOpen] = useState(false);
  const [selectedLicencaRenovar, setSelectedLicencaRenovar] = useState<Licenca | null>(null);
  const [renovarOpcao, setRenovarOpcao] = useState<'renovar_30' | 'upgrade_120' | 'upgrade_365' | 'downgrade_trial' | 'add_120' | 'add_365'>('renovar_30');
  const [submittingRenovar, setSubmittingRenovar] = useState(false);

  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Redimensionamento de Colunas
  const [empresaColumnWidths] = useState<EmpresaColumnWidths>({
    logo: 70,
    empresa: 220,
    cnpj: 160,
    banco: 200,
    local: 200,
    cores: 130,
    licencas: 130,
    status: 110,
    acoes: 165
  });

  const totalEmpresaTableWidth = (empresaColumnWidths.logo || 70) +
    (empresaColumnWidths.empresa || 220) +
    (empresaColumnWidths.cnpj || 160) +
    (empresaColumnWidths.banco || 200) +
    (empresaColumnWidths.local || 200) +
    (empresaColumnWidths.cores || 130) +
    (empresaColumnWidths.licencas || 130) +
    (empresaColumnWidths.status || 110) +
    (empresaColumnWidths.acoes || 165);

  const [licencaColumnWidths] = useState<LicencaColumnWidths>({
    chave: 260,
    empresa: 220,
    plano: 150,
    validade: 150,
    status: 120,
    acoes: 165
  });

  const totalLicTableWidth = (licencaColumnWidths.chave || 260) +
    (licencaColumnWidths.empresa || 220) +
    (licencaColumnWidths.plano || 150) +
    (licencaColumnWidths.validade || 150) +
    (licencaColumnWidths.status || 120) +
    (licencaColumnWidths.acoes || 165);

  // Listener para fechar modais com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modalEmpresaOpen) setModalEmpresaOpen(false);
        if (modalLicencaOpen) setModalLicencaOpen(false);
        if (modalRenovarOpen) setModalRenovarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalEmpresaOpen, modalLicencaOpen, modalRenovarOpen]);

  // Carregar Empresas e Licenças
  const fetchEmpresas = async () => {
    setLoadingEmpresas(true);
    try {
      const res = await fetch('/api/empresas');
      if (res.ok) {
        const data = await res.json();
        setEmpresas(data);
      }
    } catch (err) {
      console.error('Erro ao buscar empresas:', err);
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const fetchLicencas = async () => {
    setLoadingLicencas(true);
    try {
      const res = await fetch('/api/licencas');
      if (res.ok) {
        const data = await res.json();
        setLicencas(data);
      }
    } catch (err) {
      console.error('Erro ao buscar licenças:', err);
    } finally {
      setLoadingLicencas(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
    fetchLicencas();
  }, []);

  // Handlers de Empresa
  const handleOpenCreateEmpresa = () => {
    setEditingEmpresaId(null);
    setEmpresaRazaoSocial('');
    setEmpresaNomeFantasia('');
    setEmpresaCnpj('');
    setEmpresaCep('');
    setEmpresaLogradouro('');
    setEmpresaNumero('');
    setEmpresaComplemento('');
    setEmpresaBairro('');
    setEmpresaCidade('');
    setEmpresaEstado('');
    setEmpresaLogoUrl('');
    setEmpresaCorPrimaria('#6366f1');
    setEmpresaCorSecundaria('#38bdf8');
    setEmpresaCorDestaque('#34d399');
    setEmpresaStatus('Ativa');
    setDbHost('localhost');
    setDbPort(5432);
    setDbUser('postgres');
    setDbPass('');
    setDbName('regz_db');
    setCepErrorEmpresa('');
    setModalEmpresaOpen(true);
  };

  const handleOpenEditEmpresa = (emp: any) => {
    setEditingEmpresaId(emp.id);
    setEmpresaRazaoSocial(emp.razao_social || '');
    setEmpresaNomeFantasia(emp.nome_fantasia || '');
    setEmpresaCnpj(emp.cnpj || '');
    setEmpresaCep(emp.cep || '');
    setEmpresaLogradouro(emp.logradouro || '');
    setEmpresaNumero(emp.numero || '');
    setEmpresaComplemento(emp.complemento || '');
    setEmpresaBairro(emp.bairro || '');
    setEmpresaCidade(emp.cidade || '');
    setEmpresaEstado(emp.estado || '');
    setEmpresaLogoUrl(emp.logo_url || '');
    setEmpresaCorPrimaria(emp.cor_primaria || '#6366f1');
    setEmpresaCorSecundaria(emp.cor_secundaria || '#38bdf8');
    setEmpresaCorDestaque(emp.cor_destaque || '#34d399');
    setEmpresaStatus(emp.status || 'Ativa');
    setDbHost(emp.db_host || 'localhost');
    setDbPort(emp.db_port || 5432);
    setDbUser(emp.db_user || 'postgres');
    setDbPass(emp.db_pass || '');
    setDbName(emp.db_name || 'regz_db');
    setCepErrorEmpresa('');
    setModalEmpresaOpen(true);
  };

  const handleCepEmpresaChange = async (val: string) => {
    const formattedCep = val.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').substring(0, 9);
    setEmpresaCep(formattedCep);
    setCepErrorEmpresa('');

    const rawDigits = val.replace(/\D/g, '');
    if (rawDigits.length === 8) {
      setBuscandoCepEmpresa(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${rawDigits}/json/`);
        const data = await res.json();
        if (data.erro) {
          setCepErrorEmpresa('CEP não encontrado');
        } else {
          setEmpresaLogradouro(data.logradouro || '');
          setEmpresaBairro(data.bairro || '');
          setEmpresaCidade(data.localidade || '');
          setEmpresaEstado(data.uf || '');
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      } finally {
        setBuscandoCepEmpresa(false);
      }
    }
  };

  const handleCnpjChange = (val: string) => {
    const digits = val.replace(/\D/g, '').substring(0, 14);
    const formatted = digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
    setEmpresaCnpj(formatted);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem da logo deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEmpresaLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingEmpresa(true);

    try {
      const payload = {
        razao_social: empresaRazaoSocial,
        nome_fantasia: empresaNomeFantasia,
        cnpj: empresaCnpj,
        cep: empresaCep,
        logradouro: empresaLogradouro,
        numero: empresaNumero,
        complemento: empresaComplemento,
        bairro: empresaBairro,
        cidade: empresaCidade,
        estado: empresaEstado,
        logo_url: empresaLogoUrl,
        cor_primaria: empresaCorPrimaria,
        cor_secundaria: empresaCorSecundaria,
        cor_destaque: empresaCorDestaque,
        status: empresaStatus,
        db_host: dbHost,
        db_port: dbPort,
        db_user: dbUser,
        db_pass: dbPass,
        db_name: dbName
      };

      const url = editingEmpresaId ? `/api/empresas/${editingEmpresaId}` : '/api/empresas';
      const method = editingEmpresaId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setGlobalSuccess(editingEmpresaId ? 'Empresa atualizada com sucesso!' : 'Nova empresa cadastrada com sucesso!');
        setModalEmpresaOpen(false);
        fetchEmpresas();
        setTimeout(() => setGlobalSuccess(null), 4000);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Erro ao salvar empresa');
      }
    } catch (err) {
      console.error('Erro ao salvar empresa:', err);
    } finally {
      setSubmittingEmpresa(false);
    }
  };

  const handleDeleteEmpresa = async (id: number, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a empresa "${nome}"?`)) return;
    try {
      const res = await fetch(`/api/empresas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGlobalSuccess('Empresa removida com sucesso!');
        fetchEmpresas();
        setTimeout(() => setGlobalSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Erro ao excluir empresa:', err);
    }
  };

  // Handlers de Licenças Master
  const handleGerarNovaLicenca = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLicenca(true);
    try {
      const res = await fetch('/api/licencas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: newLicencaEmpresaId ? Number(newLicencaEmpresaId) : null,
          tipo_licenca: newLicencaTipo,
          dias_validade: Number(newLicencaValidade)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGlobalSuccess(`Nova Chave Master Gerada: ${data.chave}`);
        setModalLicencaOpen(false);
        fetchLicencas();
        fetchEmpresas();
        setTimeout(() => setGlobalSuccess(null), 5000);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Erro ao gerar chave de licença');
      }
    } catch (err) {
      console.error('Erro ao gerar chave de licença:', err);
    } finally {
      setSubmittingLicenca(false);
    }
  };

  const handleCopyKey = (chave: string) => {
    navigator.clipboard.writeText(chave);
    setCopiedKey(chave);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleOpenModalRenovar = (lic: Licenca) => {
    setSelectedLicencaRenovar(lic);
    setRenovarOpcao('renovar_30');
    setModalRenovarOpen(true);
  };

  const handleConfirmarRenovacao = async () => {
    if (!selectedLicencaRenovar) return;
    setSubmittingRenovar(true);

    try {
      let payload: any = {};
      if (renovarOpcao === 'renovar_30') {
        payload = { dias: 30 };
      } else if (renovarOpcao === 'upgrade_120') {
        payload = { dias: 120, tipo_licenca: 'Enterprise', redefinir: true };
      } else if (renovarOpcao === 'upgrade_365') {
        payload = { dias: 365, tipo_licenca: 'Enterprise', redefinir: true };
      } else if (renovarOpcao === 'downgrade_trial') {
        payload = { dias: 30, tipo_licenca: 'Trial', redefinir: true };
      } else if (renovarOpcao === 'add_120') {
        payload = { dias: 120 };
      } else if (renovarOpcao === 'add_365') {
        payload = { dias: 365 };
      }

      const res = await fetch(`/api/licencas/${selectedLicencaRenovar.id}/renovar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setGlobalSuccess('Validade da chave atualizada com sucesso!');
        setModalRenovarOpen(false);
        fetchLicencas();
        fetchEmpresas();
        setTimeout(() => setGlobalSuccess(null), 4000);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Erro ao renovar licença');
      }
    } catch (err) {
      console.error('Erro ao renovar licença:', err);
    } finally {
      setSubmittingRenovar(false);
    }
  };

  const handleToggleStatusLicenca = async (id: number, statusAtual: string) => {
    const novoStatus = statusAtual === 'Ativa' ? 'Suspensa' : 'Ativa';
    try {
      const res = await fetch(`/api/licencas/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });
      if (res.ok) {
        fetchLicencas();
        fetchEmpresas();
      }
    } catch (err) {
      console.error('Erro ao alterar status:', err);
    }
  };

  const handleDeleteLicenca = async (id: number, chave: string) => {
    if (!window.confirm(`Tem certeza que deseja revogar/excluir a chave "${chave}"?`)) return;
    try {
      const res = await fetch(`/api/licencas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGlobalSuccess('Chave de licença excluída com sucesso!');
        fetchLicencas();
        fetchEmpresas();
        setTimeout(() => setGlobalSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Erro ao excluir chave:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', padding: '24px 36px' }}>
      
      {/* Header Executivo do Licenciador Regz */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        padding: '20px 28px',
        borderRadius: '20px',
        backdropFilter: 'blur(12px)',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)', padding: '12px', borderRadius: '14px', color: '#ffffff' }}>
            <Shield size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(90deg, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                REGZ LICENCIAMENTO MASTER
              </h1>
              <span style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#818cf8', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
                PORTAL SUPER ADMIN EXCLUSIVO
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Central de Gestão de Licenças On-Premise & Parâmetros de Banco de Dados Local por Empresa
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
            <span style={{ display: 'block', fontWeight: 700, color: '#f8fafc' }}>{usuario?.nome || 'Administrador Regz'}</span>
            <span style={{ fontSize: '0.78rem', color: '#818cf8' }}>{usuario?.email || 'admin@regz.app'}</span>
          </div>
          <button
            onClick={logout}
            className="btn-secondary"
            style={{ padding: '10px 16px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            <LogOut size={16} /> SAIR DO PORTAL
          </button>
        </div>
      </header>

      {/* Sub-Abas do Portal Master */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setSubTab('empresas')}
          className={subTab === 'empresas' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '12px 20px', borderRadius: '12px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}
        >
          <Building2 size={20} color={subTab === 'empresas' ? '#ffffff' : '#818cf8'} /> Empresas Clientes & Banco Próprio ({empresas.length})
        </button>
        <button
          onClick={() => setSubTab('licencas')}
          className={subTab === 'licencas' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '12px 20px', borderRadius: '12px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}
        >
          <Key size={20} color={subTab === 'licencas' ? '#ffffff' : '#38bdf8'} /> Gerenciador de Chaves de Licença Master ({licencas.length})
        </button>
      </div>

      {globalSuccess && (
        <div style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '14px 20px', borderRadius: '14px', fontSize: '0.92rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} /> {globalSuccess}
        </div>
      )}

      {/* ======================================================== */}
      {/* ABA DE EMPRESAS CLIENTES & BANCO PRÓPRIO */}
      {/* ======================================================== */}
      {subTab === 'empresas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Métricas Master */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '14px', borderRadius: '12px', color: '#818cf8' }}>
                <Building2 size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>EMPRESAS CLIENTES</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: '#f8fafc' }}>{empresas.length}</h3>
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(52, 211, 153, 0.15)', padding: '14px', borderRadius: '12px', color: '#34d399' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>LICENÇAS ATIVAS NA PLATAFORMA</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: '#f8fafc' }}>
                  {empresas.reduce((acc, emp) => acc + (emp.licencas_ativas || 0), 0)}
                </h3>
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '14px', borderRadius: '12px', color: '#38bdf8' }}>
                <Database size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>BANCOS DE DADOS REGISTRADOS</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: '#f8fafc' }}>
                  {empresas.filter(e => (e as any).db_host).length}
                </h3>
              </div>
            </div>
          </div>

          {/* Tabela de Empresas */}
          <div className="custom-table-container" style={{ position: 'relative', overflowX: 'auto', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Building2 size={22} color="#818cf8" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Gestão de Empresas Clientes ({empresas.length})</h3>
              </div>
              <button
                onClick={handleOpenCreateEmpresa}
                className="btn-primary"
                style={{ padding: '10px 18px', borderRadius: '10px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={18} /> Cadastrar Empresa Cliente
              </button>
            </div>

            <div className="table-flex-wrapper" style={{ overflowX: 'auto', width: '100%' }}>
              <table className="custom-table" style={{ width: '100%', minWidth: `${totalEmpresaTableWidth}px`, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ width: `${empresaColumnWidths.logo}px` }}>Logo</th>
                    <th style={{ width: `${empresaColumnWidths.empresa}px` }}>Empresa / Razão Social</th>
                    <th style={{ width: `${empresaColumnWidths.cnpj}px` }}>CNPJ</th>
                    <th style={{ width: `${empresaColumnWidths.banco}px` }}>Banco DB Local</th>
                    <th style={{ width: `${empresaColumnWidths.local}px` }}>Local / Endereço</th>
                    <th style={{ width: `${empresaColumnWidths.cores}px` }}>Tema (3 Cores)</th>
                    <th style={{ width: `${empresaColumnWidths.licencas}px` }}>Licenças</th>
                    <th style={{ width: `${empresaColumnWidths.status}px` }}>Status</th>
                    <th className="col-acoes" style={{ textAlign: 'center', width: `${empresaColumnWidths.acoes || 165}px`, minWidth: '165px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingEmpresas ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                        <Loader2 className="spin" size={24} color="#818cf8" style={{ margin: '0 auto' }} />
                        <span style={{ display: 'block', marginTop: '8px', color: '#94a3b8' }}>Carregando empresas clientes...</span>
                      </td>
                    </tr>
                  ) : empresas.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        Nenhuma empresa cadastrada. Clique em "+ Cadastrar Empresa Cliente" para começar.
                      </td>
                    </tr>
                  ) : (
                    empresas.map((emp: any) => (
                      <tr key={emp.id}>
                        <td style={{ width: `${empresaColumnWidths.logo}px`, textAlign: 'center' }}>
                          {emp.logo_url ? (
                            <img src={emp.logo_url} alt={emp.nome_fantasia} className="empresa-logo-avatar" style={{ objectFit: 'cover' }} />
                          ) : (
                            <div className="empresa-logo-avatar" style={{ background: emp.cor_primaria || '#6366f1', color: '#ffffff' }}>
                              {(emp.nome_fantasia || 'E').substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </td>

                        <td style={{ width: `${empresaColumnWidths.empresa}px` }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>{emp.nome_fantasia}</span>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{emp.razao_social}</span>
                          </div>
                        </td>

                        <td style={{ width: `${empresaColumnWidths.cnpj}px`, fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem', color: '#a5b4fc' }}>
                          {emp.cnpj}
                        </td>

                        <td style={{ width: `${empresaColumnWidths.banco}px` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>
                            <Database size={13} color="#38bdf8" />
                            <span>{emp.db_host || 'localhost'}:{emp.db_port || 5432}/{emp.db_name || 'regz_db'}</span>
                          </div>
                        </td>

                        <td style={{ width: `${empresaColumnWidths.local}px` }}>
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem' }}>
                            <span style={{ fontWeight: 600, color: '#f8fafc' }}>{emp.cidade ? `${emp.cidade} - ${emp.estado}` : 'Sem endereço'}</span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              {emp.logradouro ? `${emp.logradouro}, ${emp.numero || 'S/N'}` : ''} {emp.cep ? `(${emp.cep})` : ''}
                            </span>
                          </div>
                        </td>

                        <td style={{ width: `${empresaColumnWidths.cores}px` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="empresa-color-dot" style={{ background: emp.cor_primaria || '#6366f1' }} title={`Primária: ${emp.cor_primaria || '#6366f1'}`} />
                            <span className="empresa-color-dot" style={{ background: emp.cor_secundaria || '#38bdf8' }} title={`Secundária: ${emp.cor_secundaria || '#38bdf8'}`} />
                            <span className="empresa-color-dot" style={{ background: emp.cor_destaque || '#34d399' }} title={`Destaque: ${emp.cor_destaque || '#34d399'}`} />
                          </div>
                        </td>

                        <td style={{ width: `${empresaColumnWidths.licencas}px` }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>
                            <Key size={12} /> {emp.licencas_ativas || 0} Ativas ({emp.total_licencas || 0} Total)
                          </span>
                        </td>

                        <td style={{ width: `${empresaColumnWidths.status}px` }}>
                          <span style={{
                            fontSize: '0.78rem',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            background: emp.status === 'Ativa' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: emp.status === 'Ativa' ? '#34d399' : '#f87171',
                            border: emp.status === 'Ativa' ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                          }}>
                            {emp.status}
                          </span>
                        </td>

                        <td className="col-acoes" style={{ textAlign: 'center', width: `${empresaColumnWidths.acoes || 165}px`, minWidth: '165px' }}>
                          <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                            <button
                              onClick={() => handleOpenEditEmpresa(emp)}
                              className="btn-action map"
                              title="Editar Parâmetros & Banco da Empresa"
                            >
                              <Edit size={14} />
                            </button>

                            <button
                              onClick={() => handleDeleteEmpresa(emp.id, emp.nome_fantasia)}
                              className="btn-action delete"
                              title="Excluir Empresa"
                            >
                              <Trash2 size={14} />
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
        </div>
      )}

      {/* ======================================================== */}
      {/* ABA DE GERENCIADOR DE CHAVES DE LICENÇA MASTER */}
      {/* ======================================================== */}
      {subTab === 'licencas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Action Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '18px 24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Key size={22} color="#38bdf8" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>Gestão Geral de Chaves Master ({licencas.length})</h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Emita, altere validade ou revogue chaves para qualquer empresa cliente</span>
              </div>
            </div>
            <button
              onClick={() => setModalLicencaOpen(true)}
              className="btn-primary"
              style={{ padding: '10px 18px', borderRadius: '10px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={18} /> Emitir Nova Chave de Licença Master
            </button>
          </div>

          {/* Tabela de Licenças */}
          <div className="custom-table-container" style={{ position: 'relative', overflowX: 'auto', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="table-flex-wrapper" style={{ overflowX: 'auto', width: '100%' }}>
              <table className="custom-table" style={{ width: '100%', minWidth: `${totalLicTableWidth}px`, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ width: `${licencaColumnWidths.chave}px` }}>Chave de Licença Master</th>
                    <th style={{ width: `${licencaColumnWidths.empresa}px` }}>Empresa Cliente / Usuário</th>
                    <th style={{ width: `${licencaColumnWidths.plano}px` }}>Plano / Validade</th>
                    <th style={{ width: `${licencaColumnWidths.validade}px` }}>Data Expiração</th>
                    <th style={{ width: `${licencaColumnWidths.status}px` }}>Status</th>
                    <th className="col-acoes" style={{ textAlign: 'center', width: `${licencaColumnWidths.acoes || 165}px`, minWidth: '165px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingLicencas ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                        <Loader2 className="spin" size={24} color="#38bdf8" style={{ margin: '0 auto' }} />
                        <span style={{ display: 'block', marginTop: '8px', color: '#94a3b8' }}>Carregando chaves master...</span>
                      </td>
                    </tr>
                  ) : licencas.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        Nenhuma chave de licença emitida. Clique em "+ Emitir Nova Chave de Licença Master".
                      </td>
                    </tr>
                  ) : (
                    licencas.map((lic: any) => {
                      const isExpirada = lic.dias_restantes < 0 || lic.status === 'Expirada';
                      const isSuspensa = lic.status === 'Suspensa';

                      return (
                        <tr key={lic.id}>
                          <td style={{ width: `${licencaColumnWidths.chave}px` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.88rem', color: '#38bdf8' }}>
                                {lic.chave}
                              </span>
                              <button
                                onClick={() => handleCopyKey(lic.chave)}
                                style={{ background: 'transparent', border: 'none', color: copiedKey === lic.chave ? '#34d399' : '#94a3b8', cursor: 'pointer', padding: '2px' }}
                                title="Copiar Chave"
                              >
                                {copiedKey === lic.chave ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                          </td>

                          <td style={{ width: `${licencaColumnWidths.empresa}px` }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                                {lic.usuario_nome ? `${lic.usuario_nome}` : 'Empresa Cliente / Global'}
                              </span>
                              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                {lic.usuario_email || 'Não Atribuída'}
                              </span>
                            </div>
                          </td>

                          <td style={{ width: `${licencaColumnWidths.plano}px` }}>
                            <span style={{
                              fontSize: '0.78rem',
                              padding: '3px 10px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              background: lic.tipo_licenca === 'Enterprise' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                              color: lic.tipo_licenca === 'Enterprise' ? '#818cf8' : '#38bdf8',
                              border: lic.tipo_licenca === 'Enterprise' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(56, 189, 248, 0.4)'
                            }}>
                              {lic.tipo_licenca || 'Enterprise'}
                            </span>
                          </td>

                          <td style={{ width: `${licencaColumnWidths.validade}px` }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={13} color="#94a3b8" />
                                {new Date(lic.data_expiracao).toLocaleDateString('pt-BR')}
                              </span>
                              <span style={{ fontSize: '0.74rem', color: isExpirada ? '#f87171' : '#94a3b8' }}>
                                {isExpirada ? `Expirada há ${Math.abs(lic.dias_restantes)}d` : `Faltam ${lic.dias_restantes} dias`}
                              </span>
                            </div>
                          </td>

                          <td style={{ width: `${licencaColumnWidths.status}px` }}>
                            {isSuspensa ? (
                              <span style={{ fontSize: '0.78rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                                Suspensa
                              </span>
                            ) : isExpirada ? (
                              <span style={{ fontSize: '0.78rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                                Expirada
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.78rem', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                                Ativa
                              </span>
                            )}
                          </td>

                          <td className="col-acoes" style={{ textAlign: 'center', width: `${licencaColumnWidths.acoes || 165}px`, minWidth: '165px' }}>
                            <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                              <button
                                onClick={() => handleOpenModalRenovar(lic)}
                                className="btn-action map"
                                title="Renovar / Alterar Validade da Licença"
                              >
                                <RefreshCw size={14} />
                              </button>

                              <button
                                onClick={() => handleToggleStatusLicenca(lic.id, lic.status)}
                                className="btn-action"
                                style={{
                                  background: lic.status === 'Ativa' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                                  color: lic.status === 'Ativa' ? '#fbbf24' : '#34d399'
                                }}
                                title={lic.status === 'Ativa' ? 'Suspender Licença' : 'Ativar Licença'}
                              >
                                {lic.status === 'Ativa' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                              </button>

                              <button
                                onClick={() => handleDeleteLicenca(lic.id, lic.chave)}
                                className="btn-action delete"
                                title="Excluir Chave de Licença"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
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
      )}

      {/* ======================================================== */}
      {/* MODAL DE CADASTRO / EDIÇÃO DE EMPRESA & BANCO PRÓPRIO */}
      {/* ======================================================== */}
      {modalEmpresaOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '720px', width: '90%', background: '#0f172a', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={22} color="#818cf8" />
                <h3 style={{ color: '#ffffff' }}>{editingEmpresaId ? 'Editar Empresa & Banco Local' : 'Cadastrar Empresa Cliente (On-Premise)'}</h3>
              </div>
              <button onClick={() => setModalEmpresaOpen(false)} className="btn-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmpresa} className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>Razão Social *</label>
                  <input
                    type="text"
                    value={empresaRazaoSocial}
                    onChange={(e) => setEmpresaRazaoSocial(e.target.value)}
                    placeholder="Ex: Empresa Cliente LTDA"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nome Fantasia *</label>
                  <input
                    type="text"
                    value={empresaNomeFantasia}
                    onChange={(e) => setEmpresaNomeFantasia(e.target.value)}
                    placeholder="Ex: Empresa Cliente"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>CNPJ *</label>
                  <input
                    type="text"
                    value={empresaCnpj}
                    onChange={(e) => handleCnpjChange(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status da Empresa</label>
                  <select value={empresaStatus} onChange={(e) => setEmpresaStatus(e.target.value)}>
                    <option value="Ativa">Ativa (Acesso Liberado)</option>
                    <option value="Inativa">Inativa (Bloqueada)</option>
                  </select>
                </div>
              </div>

              {/* Seção Banco de Dados Próprio (On-Premise) */}
              <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 700, fontSize: '0.9rem', color: '#38bdf8' }}>
                  <Database size={16} /> Parâmetros do Banco de Dados Próprio da Empresa (PostgreSQL)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: '12px', marginBottom: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Host do Banco (IP / Domain)</label>
                    <input
                      type="text"
                      value={dbHost}
                      onChange={(e) => setDbHost(e.target.value)}
                      placeholder="localhost / 192.168.1.100"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Porta</label>
                    <input
                      type="number"
                      value={dbPort}
                      onChange={(e) => setDbPort(Number(e.target.value))}
                      placeholder="5432"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Nome do Banco</label>
                    <input
                      type="text"
                      value={dbName}
                      onChange={(e) => setDbName(e.target.value)}
                      placeholder="regz_db"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Usuário do Banco DB</label>
                    <input
                      type="text"
                      value={dbUser}
                      onChange={(e) => setDbUser(e.target.value)}
                      placeholder="postgres"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Senha do Banco DB</label>
                    <input
                      type="password"
                      value={dbPass}
                      onChange={(e) => setDbPass(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Seção Endereço ViaCEP */}
              <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 700, fontSize: '0.9rem', color: '#818cf8' }}>
                  <MapPin size={16} /> Endereço & Localização (ViaCEP)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 100px', gap: '12px', marginBottom: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>CEP</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={empresaCep}
                        onChange={(e) => handleCepEmpresaChange(e.target.value)}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      {buscandoCepEmpresa && (
                        <Loader2 className="spin" size={14} style={{ position: 'absolute', right: '10px', top: '12px', color: '#818cf8' }} />
                      )}
                    </div>
                    {cepErrorEmpresa && <span style={{ fontSize: '0.72rem', color: '#f87171', marginTop: '2px', display: 'block' }}>{cepErrorEmpresa}</span>}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Logradouro / Rua</label>
                    <input
                      type="text"
                      value={empresaLogradouro}
                      onChange={(e) => setEmpresaLogradouro(e.target.value)}
                      placeholder="Ex: Av. Paulista"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Número</label>
                    <input
                      type="text"
                      value={empresaNumero}
                      onChange={(e) => setEmpresaNumero(e.target.value)}
                      placeholder="1000"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Bairro</label>
                    <input
                      type="text"
                      value={empresaBairro}
                      onChange={(e) => setEmpresaBairro(e.target.value)}
                      placeholder="Bairro"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Cidade</label>
                    <input
                      type="text"
                      value={empresaCidade}
                      onChange={(e) => setEmpresaCidade(e.target.value)}
                      placeholder="Cidade"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label>UF</label>
                    <input
                      type="text"
                      value={empresaEstado}
                      onChange={(e) => setEmpresaEstado(e.target.value.toUpperCase())}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              {/* Seção Logotipo */}
              <div className="form-group">
                <label>Logotipo da Empresa</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {empresaLogoUrl ? (
                    <img src={empresaLogoUrl} alt="Logo Preview" style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: empresaCorPrimaria, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      {(empresaNomeFantasia || 'E').substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      type="text"
                      value={empresaLogoUrl}
                      onChange={(e) => setEmpresaLogoUrl(e.target.value)}
                      placeholder="Cole a URL da logo ou faça upload abaixo"
                      style={{ fontSize: '0.82rem' }}
                    />
                    <label className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', width: 'fit-content', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Upload size={13} /> Upload de Imagem
                      <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Seção Paleta 3 Cores */}
              <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 700, fontSize: '0.9rem', color: '#38bdf8' }}>
                  <Palette size={16} /> Paleta de Cores do Cliente (Tema Personalizado)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.78rem' }}>Cor Primária</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={empresaCorPrimaria}
                        onChange={(e) => setEmpresaCorPrimaria(e.target.value)}
                        style={{ width: '36px', height: '36px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                      />
                      <input
                        type="text"
                        value={empresaCorPrimaria}
                        onChange={(e) => setEmpresaCorPrimaria(e.target.value)}
                        style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.78rem' }}>Cor Secundária</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={empresaCorSecundaria}
                        onChange={(e) => setEmpresaCorSecundaria(e.target.value)}
                        style={{ width: '36px', height: '36px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                      />
                      <input
                        type="text"
                        value={empresaCorSecundaria}
                        onChange={(e) => setEmpresaCorSecundaria(e.target.value)}
                        style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.78rem' }}>Cor Destaque</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={empresaCorDestaque}
                        onChange={(e) => setEmpresaCorDestaque(e.target.value)}
                        style={{ width: '36px', height: '36px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                      />
                      <input
                        type="text"
                        value={empresaCorDestaque}
                        onChange={(e) => setEmpresaCorDestaque(e.target.value)}
                        style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div style={{ background: '#0f172a', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Pré-Visualização do Tema do Cliente
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button type="button" style={{ background: empresaCorPrimaria, color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'default' }}>
                      Botão Primário
                    </button>
                    <span style={{ background: `${empresaCorSecundaria}25`, color: empresaCorSecundaria, border: `1px solid ${empresaCorSecundaria}50`, padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                      Badge Secundária
                    </span>
                    <span style={{ color: empresaCorDestaque, fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> Destaque Ativo
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setModalEmpresaOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submittingEmpresa}
                  style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {submittingEmpresa ? <Loader2 className="spin" size={16} /> : <Check size={16} />}
                  {editingEmpresaId ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR EMPRESA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE EMISSÃO DE LICENÇA MASTER */}
      {/* ======================================================== */}
      {modalLicencaOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px', background: '#0f172a', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Key size={22} color="#38bdf8" />
                <h3 style={{ color: '#ffffff' }}>Emitir Nova Chave de Licença Master</h3>
              </div>
              <button onClick={() => setModalLicencaOpen(false)} className="btn-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleGerarNovaLicenca} className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Vincular a Empresa Cliente (Opcional)</label>
                <select value={newLicencaEmpresaId} onChange={(e) => setNewLicencaEmpresaId(e.target.value)}>
                  <option value="">Nenhuma (Chave Avulsa / Global)</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nome_fantasia} ({emp.cnpj})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>Tipo de Plano</label>
                  <select value={newLicencaTipo} onChange={(e) => setNewLicencaTipo(e.target.value)}>
                    <option value="Enterprise">Enterprise (Completo)</option>
                    <option value="Trial">Trial (Avaliação)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Validade Inicial</label>
                  <select value={newLicencaValidade} onChange={(e) => setNewLicencaValidade(Number(e.target.value))}>
                    <option value={30}>30 Dias</option>
                    <option value={120}>120 Dias (4 Meses)</option>
                    <option value={365}>365 Dias (1 Ano)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setModalLicencaOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submittingLicenca}
                  style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {submittingLicenca ? <Loader2 className="spin" size={16} /> : <Check size={16} />}
                  GERAR CHAVE MASTER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE RENOVAÇÃO / ALTERAÇÃO DE VALIDADE */}
      {/* ======================================================== */}
      {modalRenovarOpen && selectedLicencaRenovar && (
        <div className="modal-backdrop">
          <div className="modal-content renovar-modal-card" style={{ maxWidth: '520px', background: '#0f172a', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <RefreshCw size={22} color="#38bdf8" />
                <h3 style={{ color: '#ffffff' }}>Renovar / Alterar Validade da Chave</h3>
              </div>
              <button onClick={() => setModalRenovarOpen(false)} className="btn-close">
                ✕
              </button>
            </div>

            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Chave Selecionada:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.92rem', color: '#38bdf8', display: 'block', marginTop: '2px' }}>
                  {selectedLicencaRenovar.chave}
                </span>
              </div>

              <div className="form-group">
                <label>Selecione a Opção de Renovação / Alteração</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  <label className="renovar-option-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', background: renovarOpcao === 'renovar_30' ? 'rgba(99, 102, 241, 0.18)' : 'rgba(30, 41, 59, 0.5)', border: renovarOpcao === 'renovar_30' ? '1px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer' }}>
                    <input type="radio" name="renovarOpcao" value="renovar_30" checked={renovarOpcao === 'renovar_30'} onChange={() => setRenovarOpcao('renovar_30')} />
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>+ 30 Dias adicionais</span>
                      <span style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8' }}>Soma 30 dias à validade atual da chave</span>
                    </div>
                  </label>

                  <label className="renovar-option-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', background: renovarOpcao === 'add_120' ? 'rgba(99, 102, 241, 0.18)' : 'rgba(30, 41, 59, 0.5)', border: renovarOpcao === 'add_120' ? '1px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer' }}>
                    <input type="radio" name="renovarOpcao" value="add_120" checked={renovarOpcao === 'add_120'} onChange={() => setRenovarOpcao('add_120')} />
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>+ 120 Dias (4 Meses)</span>
                      <span style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8' }}>Adiciona 120 dias ao prazo atual</span>
                    </div>
                  </label>

                  <label className="renovar-option-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', background: renovarOpcao === 'add_365' ? 'rgba(99, 102, 241, 0.18)' : 'rgba(30, 41, 59, 0.5)', border: renovarOpcao === 'add_365' ? '1px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer' }}>
                    <input type="radio" name="renovarOpcao" value="add_365" checked={renovarOpcao === 'add_365'} onChange={() => setRenovarOpcao('add_365')} />
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>+ 365 Dias (1 Ano Anual)</span>
                      <span style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8' }}>Adiciona 1 ano completo de acesso</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px' }}>
              <button
                type="button"
                onClick={() => setModalRenovarOpen(false)}
                className="btn-secondary"
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={handleConfirmarRenovacao}
                className="btn-primary"
                disabled={submittingRenovar}
                style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {submittingRenovar ? <Loader2 className="spin" size={16} /> : <Check size={16} />}
                CONFIRMAR ALTERAÇÃO
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdmin;
