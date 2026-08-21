import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Empresa } from './Administracao';
import { Licenca } from '../types/auth';
import {
  Building2, Key, Plus, Trash2, Edit, Check, Loader2,
  Shield, Copy, RefreshCw, Calendar, CheckCircle2, AlertTriangle,
  MapPin, Upload, Database, LogOut, Users, UserCheck, UserX, Zap, UserPlus, Unlink,
  Sun, Moon, Sparkles
} from 'lucide-react';

export const SuperAdmin: React.FC = () => {
  const { usuario, logout } = useAuth();
  const { theme, cycleTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun size={16} />;
      case 'dark': return <Moon size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  const getThemeTitle = () => {
    switch (theme) {
      case 'light': return 'Modo Claro Ativo (Clique para alternar)';
      case 'dark': return 'Modo Escuro Ativo (Clique para alternar)';
      default: return 'Modo Padrão Regz (Clique para alternar)';
    }
  };

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
  const [testingDb, setTestingDb] = useState(false);
  const [testingDbResult, setTestingDbResult] = useState<{ success: boolean; message: string } | null>(null);

  // Modal de Confirmação de Exclusão de Empresa ("SIM")
  const [empresaToDelete, setEmpresaToDelete] = useState<{ id: number; nome: string } | null>(null);
  const [confirmTextDelete, setConfirmTextDelete] = useState('');
  const [deletingEmpresa, setDeletingEmpresa] = useState(false);

  // Modal de Licenças Master da Empresa Selecionada
  const [selectedEmpresaLicencas, setSelectedEmpresaLicencas] = useState<Empresa | null>(null);
  const [empresaLicencas, setEmpresaLicencas] = useState<Licenca[]>([]);
  const [loadingEmpresaLicencas, setLoadingEmpresaLicencas] = useState(false);

  // Modal de Usuários da Empresa Selecionada
  const [selectedEmpresaUsuarios, setSelectedEmpresaUsuarios] = useState<Empresa | null>(null);
  const [empresaUsuarios, setEmpresaUsuarios] = useState<any[]>([]);
  const [loadingEmpresaUsuarios, setLoadingEmpresaUsuarios] = useState(false);

  // Modal de Emissão de Nova Licença
  const [modalLicencaOpen, setModalLicencaOpen] = useState(false);
  const [newLicencaEmpresaId, setNewLicencaEmpresaId] = useState<string>('');
  const [newLicencaTipo, setNewLicencaTipo] = useState<string>('Enterprise');
  const [newLicencaValidade, setNewLicencaValidade] = useState<number>(365);
  const [submittingLicenca, setSubmittingLicenca] = useState(false);

  // Modal de Renovação / Alteração de Licença
  const [modalRenovarOpen, setModalRenovarOpen] = useState(false);
  const [selectedLicencaRenovar, setSelectedLicencaRenovar] = useState<Licenca | null>(null);
  const [renovarOpcao, setRenovarOpcao] = useState<'renovar_30' | 'upgrade_120' | 'upgrade_365' | 'downgrade_trial' | 'add_120' | 'add_365'>('renovar_30');
  const [submittingRenovar, setSubmittingRenovar] = useState(false);

  // Modal de Cadastro de Usuário para Empresa (Com Vínculo de Licença Master)
  const [modalCreateUserOpen, setModalCreateUserOpen] = useState(false);
  const [newUserNome, setNewUserNome] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserSenha, setNewUserSenha] = useState('');
  const [newUserPerfilId, setNewUserPerfilId] = useState<number | string>('');
  const [newUserChaveLicenca, setNewUserChaveLicenca] = useState('');
  const [submittingCreateUser, setSubmittingCreateUser] = useState(false);
  const [perfisDisponiveis, setPerfisDisponiveis] = useState<any[]>([]);
  const [licencasAvulsas, setLicencasAvulsas] = useState<Licenca[]>([]);

  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Listener para fechar modais com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modalEmpresaOpen) setModalEmpresaOpen(false);
        if (modalLicencaOpen) setModalLicencaOpen(false);
        if (modalRenovarOpen) setModalRenovarOpen(false);
        if (selectedEmpresaLicencas) setSelectedEmpresaLicencas(null);
        if (selectedEmpresaUsuarios) setSelectedEmpresaUsuarios(null);
        if (empresaToDelete) setEmpresaToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalEmpresaOpen, modalLicencaOpen, modalRenovarOpen, selectedEmpresaLicencas, selectedEmpresaUsuarios, empresaToDelete]);

  // Carregar Empresas
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

  useEffect(() => {
    fetchEmpresas();
  }, []);

  // Abrir Gerenciamento de Licenças da Empresa
  const handleOpenEmpresaLicencas = async (emp: Empresa) => {
    setSelectedEmpresaLicencas(emp);
    setLoadingEmpresaLicencas(true);
    try {
      const res = await fetch(`/api/empresas/${emp.id}/licencas`);
      if (res.ok) {
        const data = await res.json();
        setEmpresaLicencas(data);
      }
    } catch (err) {
      console.error('Erro ao buscar licenças da empresa:', err);
    } finally {
      setLoadingEmpresaLicencas(false);
    }
  };

  // Abrir Gerenciamento de Usuários da Empresa
  const handleOpenEmpresaUsuarios = async (emp: Empresa) => {
    setSelectedEmpresaUsuarios(emp);
    setLoadingEmpresaUsuarios(true);
    try {
      const res = await fetch(`/api/empresas/${emp.id}/usuarios`);
      if (res.ok) {
        const data = await res.json();
        setEmpresaUsuarios(data);
      }
    } catch (err) {
      console.error('Erro ao buscar usuários da empresa:', err);
    } finally {
      setLoadingEmpresaUsuarios(false);
    }
  };

  const handleToggleEmpresaUserStatus = async (userId: number, statusAtual: boolean) => {
    try {
      const res = await fetch(`/api/usuarios/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !statusAtual })
      });
      if (res.ok && selectedEmpresaUsuarios) {
        handleOpenEmpresaUsuarios(selectedEmpresaUsuarios);
        fetchEmpresas();
      }
    } catch (err) {
      console.error('Erro ao alterar status do usuário:', err);
    }
  };

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

  const handleAutoFillDbCredentials = () => {
    setDbHost('localhost');
    setDbPort(5432);
    setDbUser('regz_user');
    setDbPass('regz_password');
    if (!dbName) setDbName('regz_db');
  };

  const handleTestDbConnection = async () => {
    if (!dbName) {
      alert('Preencha o Nome do Banco de Dados para testar a conexão.');
      return;
    }

    setTestingDb(true);
    setTestingDbResult(null);

    try {
      const res = await fetch('/api/empresas/test-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          db_host: dbHost,
          db_port: dbPort,
          db_user: dbUser,
          db_pass: dbPass,
          db_name: dbName
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestingDbResult({ success: true, message: data.message });
        if (data.resolvedHost) setDbHost(data.resolvedHost);
        if (data.resolvedUser) setDbUser(data.resolvedUser);
      } else {
        setTestingDbResult({ success: false, message: data.error || 'Falha ao conectar no banco de dados.' });
      }
    } catch (err: any) {
      setTestingDbResult({ success: false, message: 'Erro na requisição de teste de banco.' });
    } finally {
      setTestingDb(false);
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

  const handleOpenDeleteEmpresa = (id: number, nome: string) => {
    setEmpresaToDelete({ id, nome });
    setConfirmTextDelete('');
  };

  const handleConfirmDeleteEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaToDelete || confirmTextDelete.trim().toUpperCase() !== 'SIM') return;

    setDeletingEmpresa(true);
    try {
      const res = await fetch(`/api/empresas/${empresaToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setGlobalSuccess(`Empresa "${empresaToDelete.nome}" removida com sucesso!`);
        setEmpresaToDelete(null);
        fetchEmpresas();
        setTimeout(() => setGlobalSuccess(null), 4000);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Erro ao excluir empresa');
      }
    } catch (err) {
      console.error('Erro ao excluir empresa:', err);
    } finally {
      setDeletingEmpresa(false);
    }
  };

  // Handlers de Licenças Master
  const handleGerarNovaLicenca = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLicenca(true);
    try {
      const targetEmpresaId = newLicencaEmpresaId || (selectedEmpresaLicencas ? String(selectedEmpresaLicencas.id) : '');

      const res = await fetch('/api/licencas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: targetEmpresaId ? Number(targetEmpresaId) : null,
          tipo_licenca: newLicencaTipo,
          dias_validade: Number(newLicencaValidade)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGlobalSuccess(`Nova Chave Master Gerada: ${data.chave}`);
        setModalLicencaOpen(false);
        fetchEmpresas();
        if (selectedEmpresaLicencas) {
          handleOpenEmpresaLicencas(selectedEmpresaLicencas);
        }
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

  const handleEmissaoRapidaLicenca = async (empresaId: number) => {
    setSubmittingLicenca(true);
    try {
      const res = await fetch('/api/licencas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: empresaId,
          tipo_licenca: 'Enterprise',
          dias_validade: 365
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGlobalSuccess(`Nova Chave Master Enterprise (365 Dias) Gerada: ${data.chave}`);
        fetchEmpresas();
        if (selectedEmpresaLicencas) {
          handleOpenEmpresaLicencas(selectedEmpresaLicencas);
        }
        setTimeout(() => setGlobalSuccess(null), 5000);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Erro ao gerar chave de licença');
      }
    } catch (err) {
      console.error('Erro ao gerar chave rápida:', err);
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
        fetchEmpresas();
        if (selectedEmpresaLicencas) {
          handleOpenEmpresaLicencas(selectedEmpresaLicencas);
        }
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

  const handleOpenCreateUserEmpresa = async (emp: Empresa) => {
    setNewUserNome('');
    setNewUserEmail('');
    setNewUserSenha('');
    setNewUserPerfilId('');
    setNewUserChaveLicenca('');
    setModalCreateUserOpen(true);

    try {
      const token = localStorage.getItem('regz_token');
      const headers: Record<string, string> = {
        'x-empresa-id': String(emp.id)
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const resPerfis = await fetch(`/api/perfis-acesso?empresa_id=${emp.id}`, { headers });
      if (resPerfis.ok) {
        const perfis = await resPerfis.json();
        setPerfisDisponiveis(perfis);
        if (perfis.length > 0) setNewUserPerfilId(perfis[0].id);
      }

      const resLic = await fetch(`/api/empresas/${emp.id}/licencas`, { headers });
      if (resLic.ok) {
        const lics: Licenca[] = await resLic.json();
        const avulsas = lics.filter((l: any) => !l.usuario_id || l.usuario_nome === 'Não Vinculado');
        setLicencasAvulsas(avulsas);
        if (avulsas.length > 0) {
          setNewUserChaveLicenca(avulsas[0].chave);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados para cadastro de usuário:', err);
    }
  };

  const handleCreateUserEmpresaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpresaUsuarios) return;

    if (!newUserNome || !newUserEmail || !newUserSenha) {
      alert('Preencha Nome, E-mail e Senha para o novo usuário.');
      return;
    }

    if (!newUserChaveLicenca) {
      alert('Selecione uma Chave de Licença Master já emitida para atrelar ao usuário.');
      return;
    }

    setSubmittingCreateUser(true);
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: newUserNome,
          email: newUserEmail,
          senha: newUserSenha,
          perfil_id: newUserPerfilId ? Number(newUserPerfilId) : null,
          empresa_id: selectedEmpresaUsuarios.id,
          chave_licenca: newUserChaveLicenca
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGlobalSuccess(`Usuário "${data.nome}" cadastrado e vinculado à chave Master com sucesso!`);
        setModalCreateUserOpen(false);
        handleOpenEmpresaUsuarios(selectedEmpresaUsuarios);
        fetchEmpresas();
        setTimeout(() => setGlobalSuccess(null), 4000);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Erro ao cadastrar usuário');
      }
    } catch (err) {
      console.error('Erro ao cadastrar usuário:', err);
    } finally {
      setSubmittingCreateUser(false);
    }
  };

  const handleDesvincularLicenca = async (licId: number) => {
    if (!window.confirm('Deseja desvincular esta chave do usuário atual? A chave voltará ao status "Empresa / Avulso".')) return;
    try {
      const res = await fetch(`/api/licencas/${licId}/desvincular`, { method: 'POST' });
      if (res.ok) {
        setGlobalSuccess('Licença desvinculada do usuário com sucesso!');
        if (selectedEmpresaLicencas) {
          handleOpenEmpresaLicencas(selectedEmpresaLicencas);
        }
        if (selectedEmpresaUsuarios) {
          handleOpenEmpresaUsuarios(selectedEmpresaUsuarios);
        }
        fetchEmpresas();
        setTimeout(() => setGlobalSuccess(null), 3500);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Erro ao desvincular licença');
      }
    } catch (err) {
      console.error('Erro ao desvincular licença:', err);
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
        fetchEmpresas();
        if (selectedEmpresaLicencas) {
          handleOpenEmpresaLicencas(selectedEmpresaLicencas);
        }
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
        fetchEmpresas();
        if (selectedEmpresaLicencas) {
          handleOpenEmpresaLicencas(selectedEmpresaLicencas);
        }
        setTimeout(() => setGlobalSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Erro ao excluir chave:', err);
    }
  };

  return (
    <div className="superadmin-container" style={{ minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-main)', padding: '24px 36px' }}>
      
      {/* Header Executivo do Licenciador Regz */}
      <header className="superadmin-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
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
              <h1 className="superadmin-title" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
                REGZ LICENCIAMENTO MASTER
              </h1>
              <span className="superadmin-badge-portal" style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#818cf8', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
                PORTAL SUPER ADMIN EXCLUSIVO
              </span>
            </div>
            <p className="superadmin-subtitle" style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Central de Gestão de Licenças On-Premise & Parâmetros de Banco de Dados Local por Empresa
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={cycleTheme}
            className="theme-toggle-btn superadmin-theme-btn"
            title={getThemeTitle()}
            style={{ width: '38px', height: '38px', borderRadius: '10px' }}
          >
            {getThemeIcon()}
          </button>
          <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
            <span style={{ display: 'block', fontWeight: 700, color: 'var(--text-main)' }}>{usuario?.nome || 'Administrador Regz'}</span>
            <span style={{ fontSize: '0.78rem', color: '#818cf8' }}>{usuario?.email || 'admin@regz.app'}</span>
          </div>
          <button
            onClick={logout}
            className="btn-secondary superadmin-logout-btn"
            style={{ padding: '10px 16px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            <LogOut size={16} /> SAIR DO PORTAL
          </button>
        </div>
      </header>

      {globalSuccess && (
        <div style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '14px 20px', borderRadius: '14px', fontSize: '0.92rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} /> {globalSuccess}
        </div>
      )}

      {/* ======================================================== */}
      {/* PAINEL DE EMPRESAS CLIENTES (CARDS MODERNOS EXECUTIVOS) */}
      {/* ======================================================== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Métricas Master */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div className="superadmin-stat-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '14px', borderRadius: '12px', color: '#818cf8' }}>
              <Building2 size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>EMPRESAS CLIENTES</span>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)' }}>{empresas.length}</h3>
            </div>
          </div>

          <div className="superadmin-stat-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(52, 211, 153, 0.15)', padding: '14px', borderRadius: '12px', color: '#34d399' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>LICENÇAS ATIVAS NA PLATAFORMA</span>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {empresas.reduce((acc, emp) => acc + (emp.licencas_ativas || 0), 0)}
              </h3>
            </div>
          </div>

          <div className="superadmin-stat-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '14px', borderRadius: '12px', color: '#38bdf8' }}>
              <Database size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>BANCOS DE DADOS REGISTRADOS</span>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {empresas.filter(e => (e as any).db_host).length}
              </h3>
            </div>
          </div>
        </div>

        {/* Action Header */}
        <div className="superadmin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '18px 24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Building2 size={22} color="#818cf8" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>Gestão de Empresas Clientes ({empresas.length})</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Clique nas ações dos cards para gerenciar licenças master ou usuários de cada empresa</span>
            </div>
          </div>
          <button
            onClick={handleOpenCreateEmpresa}
            className="btn-primary"
            style={{ padding: '10px 18px', borderRadius: '10px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Cadastrar Empresa Cliente
          </button>
        </div>

        {/* GRID DE CARDS EXECUTIVOS DE EMPRESAS */}
        {loadingEmpresas ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Loader2 className="spin" size={28} color="#818cf8" style={{ margin: '0 auto' }} />
            <span style={{ display: 'block', marginTop: '12px', color: '#94a3b8' }}>Carregando empresas clientes...</span>
          </div>
        ) : empresas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
            Nenhuma empresa cadastrada. Clique em "+ Cadastrar Empresa Cliente" para começar.
          </div>
        ) : (
          <div className="empresas-grid">
            {empresas.map((emp: any) => (
              <div key={emp.id} className="empresa-card">
                
                {/* Cabeçalho do Card */}
                <div className="empresa-card-header">
                  <div className="empresa-card-title-box">
                    {emp.logo_url ? (
                      <img src={emp.logo_url} alt={emp.nome_fantasia} className="empresa-logo-avatar" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="empresa-logo-avatar" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)', color: '#ffffff' }}>
                        {(emp.nome_fantasia || 'E').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="empresa-card-info">
                      <h4 className="empresa-card-nome">{emp.nome_fantasia}</h4>
                      <span className="empresa-card-razao">{emp.razao_social}</span>
                      <span className="empresa-card-cnpj-badge">{emp.cnpj}</span>
                    </div>
                  </div>

                  <span className={`empresa-card-status-badge ${emp.status === 'Ativa' ? 'ativa' : 'inativa'}`}>
                    {emp.status}
                  </span>
                </div>

                {/* Detalhes do Card */}
                <div className="empresa-card-body">
                  <div className="empresa-card-row">
                    <span className="empresa-card-label">
                      <Database size={14} color="#38bdf8" /> Banco DB Local:
                    </span>
                    <span className="empresa-card-val" style={{ fontFamily: 'monospace', color: '#38bdf8', fontSize: '0.8rem' }}>
                      {emp.db_host || 'localhost'}:{emp.db_port || 5432}/{emp.db_name || 'regz_db'}
                    </span>
                  </div>

                  <div className="empresa-card-row">
                    <span className="empresa-card-label">
                      <MapPin size={14} color="#818cf8" /> Localização:
                    </span>
                    <span className="empresa-card-val">
                      {emp.cidade ? `${emp.cidade} - ${emp.estado}` : 'Não Informado'}
                    </span>
                  </div>

                  <div className="empresa-card-row">
                    <span className="empresa-card-label">
                      <Users size={14} color="#a5b4fc" /> Colaboradores:
                    </span>
                    <span className="empresa-card-val">
                      {emp.total_usuarios || 0} Usuários
                    </span>
                  </div>

                  <div className="empresa-card-row">
                    <span className="empresa-card-label">
                      <Key size={14} color="#34d399" /> Licenças Ativas:
                    </span>
                    <span className="empresa-card-val" style={{ color: '#34d399', fontWeight: 700 }}>
                      {emp.licencas_ativas || 0} Ativas / {emp.total_licencas || 0} Total
                    </span>
                  </div>
                </div>

                {/* Ações Interativas no Card */}
                <div className="empresa-card-actions">
                  <button
                    onClick={() => handleOpenEmpresaLicencas(emp)}
                    className="empresa-action-btn licencas"
                    title="Gerenciar Licenças Master desta empresa"
                  >
                    <Key size={14} /> Licenças Master
                  </button>

                  <button
                    onClick={() => handleOpenEmpresaUsuarios(emp)}
                    className="empresa-action-btn usuarios"
                    title="Gerenciar Usuários e Acessos desta empresa"
                  >
                    <Users size={14} /> Usuários
                  </button>

                  <button
                    onClick={() => handleOpenEditEmpresa(emp)}
                    className="empresa-action-btn editar"
                    title="Editar Dados & Banco DB da Empresa"
                  >
                    <Edit size={14} /> Editar
                  </button>

                  <button
                    onClick={() => handleOpenDeleteEmpresa(emp.id, emp.nome_fantasia)}
                    className="empresa-action-btn excluir"
                    title="Excluir Empresa"
                  >
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL COMPLETO DE GERENCIAMENTO DE LICENÇAS DA EMPRESA */}
      {/* ======================================================== */}
      {selectedEmpresaLicencas && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '1400px', width: '96vw', maxHeight: '92vh', background: '#0f172a', border: '1px solid rgba(56, 189, 248, 0.4)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '10px', borderRadius: '12px', color: '#38bdf8' }}>
                  <Key size={26} />
                </div>
                <div>
                  <h3 style={{ color: '#ffffff', margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                    Gerenciador de Licenças Master - {selectedEmpresaLicencas.nome_fantasia}
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{selectedEmpresaLicencas.razao_social} ({selectedEmpresaLicencas.cnpj})</span>
                </div>
              </div>
              <button onClick={() => setSelectedEmpresaLicencas(null)} className="btn-close">
                ✕
              </button>
            </div>

            <div className="custom-scrollbar" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30, 41, 59, 0.6)', padding: '14px 20px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield size={20} color="#38bdf8" />
                  <span style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: 700 }}>
                    Chaves de Licença Master Emitidas para esta Empresa ({empresaLicencas.length})
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => handleEmissaoRapidaLicenca(selectedEmpresaLicencas.id)}
                    disabled={submittingLicenca}
                    style={{
                      background: 'rgba(52, 211, 153, 0.15)',
                      color: '#34d399',
                      border: '1px solid rgba(52, 211, 153, 0.4)',
                      padding: '10px 16px',
                      fontSize: '0.86rem',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 700,
                      cursor: submittingLicenca ? 'wait' : 'pointer'
                    }}
                    title="Emitir instantaneamente uma licença Enterprise de 365 dias (1 Ano)"
                  >
                    {submittingLicenca ? <Loader2 className="spin" size={16} /> : <Zap size={16} />} ⚡ Emissão Rápida (1 Ano)
                  </button>

                  <button
                    onClick={() => {
                      setNewLicencaEmpresaId(String(selectedEmpresaLicencas.id));
                      setModalLicencaOpen(true);
                    }}
                    className="btn-primary"
                    style={{ padding: '10px 18px', fontSize: '0.88rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
                  >
                    <Plus size={18} /> Emitir Nova Chave de Licença Master
                  </button>
                </div>
              </div>

              {loadingEmpresaLicencas ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Loader2 className="spin" size={26} color="#38bdf8" style={{ margin: '0 auto' }} />
                  <span style={{ display: 'block', marginTop: '8px', color: '#94a3b8' }}>Carregando chaves de licença...</span>
                </div>
              ) : empresaLicencas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', color: '#94a3b8' }}>
                  Nenhuma chave emitida para esta empresa. Clique em "+ Emitir Nova Chave de Licença Master".
                </div>
              ) : (
                <div style={{ overflowX: 'auto', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th>Chave de Licença Master</th>
                        <th>Usuário Vinculado</th>
                        <th>Plano</th>
                        <th>Data Expiração</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empresaLicencas.map((lic: any) => {
                        const isExpirada = lic.dias_restantes < 0 || lic.status === 'Expirada';
                        const isSuspensa = lic.status === 'Suspensa';

                        return (
                          <tr key={lic.id}>
                            <td>
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

                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
                                  {lic.usuario_nome || 'Empresa / Avulso'}
                                </span>
                                {lic.usuario_email && (
                                  <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                                    {lic.usuario_email}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td>
                              <span style={{
                                fontSize: '0.75rem',
                                padding: '3px 9px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                background: lic.tipo_licenca === 'Enterprise' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                                color: lic.tipo_licenca === 'Enterprise' ? '#818cf8' : '#38bdf8',
                                border: lic.tipo_licenca === 'Enterprise' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(56, 189, 248, 0.4)'
                              }}>
                                {lic.tipo_licenca || 'Enterprise'}
                              </span>
                            </td>

                            <td>
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

                            <td>
                              {isSuspensa ? (
                                <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                                  Suspensa
                                </span>
                              ) : isExpirada ? (
                                <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                                  Expirada
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.75rem', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                                  Ativa
                                </span>
                              )}
                            </td>

                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'center' }}>
                                {lic.usuario_id && (
                                  <button
                                    onClick={() => handleDesvincularLicenca(lic.id)}
                                    className="btn-action"
                                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}
                                    title="Desvincular Licença do Usuário"
                                  >
                                    <Unlink size={14} />
                                  </button>
                                )}

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
                                  title="Excluir / Revogar Chave de Licença"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px' }}>
              <button onClick={() => setSelectedEmpresaLicencas(null)} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px' }}>
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE GERENCIAMENTO DE USUÁRIOS DE UMA EMPRESA */}
      {/* ======================================================== */}
      {selectedEmpresaUsuarios && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '1200px', width: '94vw', maxHeight: '90vh', background: '#0f172a', border: '1px solid rgba(99, 102, 241, 0.4)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '10px', borderRadius: '12px', color: '#818cf8' }}>
                  <Users size={24} />
                </div>
                <div>
                  <h3 style={{ color: '#ffffff', margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Colaboradores Cadastrados - {selectedEmpresaUsuarios.nome_fantasia}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{selectedEmpresaUsuarios.razao_social} ({selectedEmpresaUsuarios.cnpj})</span>
                </div>
              </div>
              <button onClick={() => setSelectedEmpresaUsuarios(null)} className="btn-close">
                ✕
              </button>
            </div>

            <div className="custom-scrollbar" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30, 41, 59, 0.6)', padding: '14px 20px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users size={20} color="#818cf8" />
                  <span style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: 700 }}>
                    Usuários Cadastrados nesta Empresa ({empresaUsuarios.length})
                  </span>
                </div>
                <button
                  onClick={() => handleOpenCreateUserEmpresa(selectedEmpresaUsuarios)}
                  className="btn-primary"
                  style={{ padding: '10px 18px', fontSize: '0.88rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
                >
                  <UserPlus size={18} /> Cadastrar Novo Usuário
                </button>
              </div>

              {loadingEmpresaUsuarios ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <Loader2 className="spin" size={24} color="#818cf8" style={{ margin: '0 auto' }} />
                </div>
              ) : empresaUsuarios.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '10px', color: '#94a3b8' }}>
                  Nenhum colaborador registrado nesta empresa até o momento.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th>Nome do Colaborador</th>
                        <th>E-mail</th>
                        <th>Perfil</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Ação de Acesso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empresaUsuarios.map((u: any) => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.88rem' }}>
                            {u.nome}
                          </td>
                          <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                            {u.email}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', background: u.is_admin ? 'rgba(99, 102, 241, 0.2)' : 'rgba(56, 189, 248, 0.2)', color: u.is_admin ? '#818cf8' : '#38bdf8', fontWeight: 700 }}>
                              {u.perfil_nome || (u.is_admin ? 'ADMIN' : 'Operador')}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', background: u.ativo ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: u.ativo ? '#34d399' : '#f87171', fontWeight: 700 }}>
                              {u.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleToggleEmpresaUserStatus(u.id, u.ativo)}
                              className="btn-action"
                              style={{
                                background: u.ativo ? 'rgba(239, 68, 68, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                                color: u.ativo ? '#f87171' : '#34d399',
                                fontSize: '0.78rem',
                                padding: '4px 10px'
                              }}
                              title={u.ativo ? 'Inativar Usuário' : 'Ativar Usuário'}
                            >
                              {u.ativo ? <UserX size={13} /> : <UserCheck size={13} />}
                              {u.ativo ? ' Inativar' : ' Ativar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px' }}>
              <button onClick={() => setSelectedEmpresaUsuarios(null)} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px' }}>
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE CADASTRO / EDIÇÃO DE EMPRESA & BANCO PRÓPRIO */}
      {/* ======================================================== */}
      {modalEmpresaOpen && (
        <div className="modal-backdrop" style={{ zIndex: 2000 }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9rem', color: '#38bdf8' }}>
                    <Database size={16} /> Parâmetros do Banco de Dados Próprio da Empresa (PostgreSQL)
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillDbCredentials}
                    style={{
                      background: 'rgba(99, 102, 241, 0.12)',
                      color: '#a5b4fc',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Preencher com os dados padrão do container PostgreSQL (regz_user)"
                  >
                    ⚡ Preencher com Credenciais Padrão
                  </button>
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

                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleTestDbConnection}
                    disabled={testingDb}
                    style={{
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: testingDb ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {testingDb ? <Loader2 className="spin" size={14} /> : <Database size={14} />}
                    🔌 TESTAR CONEXÃO & CRIAR BANCO DB
                  </button>

                  {testingDbResult && (
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: testingDbResult.success ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: testingDbResult.success ? '#34d399' : '#f87171',
                      border: testingDbResult.success ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {testingDbResult.success ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                      {testingDbResult.message}
                    </div>
                  )}
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
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
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
        <div className="modal-backdrop" style={{ zIndex: 2000 }}>
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
                <label>Empresa Cliente Destino</label>
                <select value={newLicencaEmpresaId} onChange={(e) => setNewLicencaEmpresaId(e.target.value)}>
                  <option value="">Selecione a empresa...</option>
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
        <div className="modal-backdrop" style={{ zIndex: 2000 }}>
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

      {/* ======================================================== */}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE EMPRESA ("SIM") */}
      {/* ======================================================== */}
      {empresaToDelete && (
        <div className="modal-backdrop" style={{ zIndex: 2000 }}>
          <div className="modal-content" style={{ maxWidth: '520px', background: '#0f172a', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={24} color="#f87171" />
                <h3 style={{ color: '#ffffff', margin: 0 }}>Confirmar Exclusão de Empresa</h3>
              </div>
              <button onClick={() => setEmpresaToDelete(null)} className="btn-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDeleteEmpresa} className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '14px 16px', borderRadius: '12px', color: '#fca5a5', fontSize: '0.88rem', lineHeight: '1.5' }}>
                <strong>Atenção:</strong> Você está prestes a excluir permanentemente a empresa <strong>"{empresaToDelete.nome}"</strong> e todas as suas licenças e vínculos. Esta ação é irreversível.
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ color: '#f8fafc', fontWeight: 600 }}>
                  Para confirmar a exclusão, digite <span style={{ color: '#f87171', fontWeight: 800 }}>SIM</span> abaixo:
                </label>
                <input
                  type="text"
                  value={confirmTextDelete}
                  onChange={(e) => setConfirmTextDelete(e.target.value)}
                  placeholder="Digite SIM para confirmar"
                  style={{
                    borderColor: confirmTextDelete.trim().toUpperCase() === 'SIM' ? '#34d399' : 'rgba(255, 255, 255, 0.2)',
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    letterSpacing: '1px'
                  }}
                  autoFocus
                />
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEmpresaToDelete(null)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={confirmTextDelete.trim().toUpperCase() !== 'SIM' || deletingEmpresa}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: confirmTextDelete.trim().toUpperCase() === 'SIM' ? 1 : 0.4,
                    cursor: confirmTextDelete.trim().toUpperCase() === 'SIM' ? 'pointer' : 'not-allowed',
                    background: confirmTextDelete.trim().toUpperCase() === 'SIM' ? '#ef4444' : 'rgba(239, 68, 68, 0.2)',
                    color: '#ffffff',
                    border: 'none'
                  }}
                >
                  {deletingEmpresa ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}
                  CONFIRMAR EXCLUSÃO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE CADASTRO DE USUÁRIO PARA EMPRESA */}
      {/* ======================================================== */}
      {modalCreateUserOpen && selectedEmpresaUsuarios && (
        <div className="modal-backdrop" style={{ zIndex: 2000 }}>
          <div className="modal-content" style={{ maxWidth: '580px', background: '#0f172a', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '16px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserPlus size={22} color="#818cf8" />
                <h3 style={{ color: '#ffffff' }}>Cadastrar Novo Usuário - {selectedEmpresaUsuarios.nome_fantasia}</h3>
              </div>
              <button onClick={() => setModalCreateUserOpen(false)} className="btn-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUserEmpresaSubmit} style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Nome Completo do Usuário *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={newUserNome}
                  onChange={(e) => setNewUserNome(e.target.value)}
                  style={{ background: 'rgba(30, 41, 59, 0.8)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '10px 14px', borderRadius: '8px' }}
                />
              </div>

              <div className="form-group">
                <label>E-mail Corporativo *</label>
                <input
                  type="email"
                  required
                  placeholder="usuario@empresa.com.br"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  style={{ background: 'rgba(30, 41, 59, 0.8)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '10px 14px', borderRadius: '8px' }}
                />
              </div>

              <div className="form-group">
                <label>Senha de Acesso Inicial *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo de 6 caracteres"
                  value={newUserSenha}
                  onChange={(e) => setNewUserSenha(e.target.value)}
                  style={{ background: 'rgba(30, 41, 59, 0.8)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '10px 14px', borderRadius: '8px' }}
                />
              </div>

              <div className="form-group">
                <label>Perfil de Acesso (RBAC)</label>
                <select
                  value={newUserPerfilId}
                  onChange={(e) => setNewUserPerfilId(e.target.value)}
                  style={{ background: 'rgba(30, 41, 59, 0.8)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '10px 14px', borderRadius: '8px' }}
                >
                  {perfisDisponiveis.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} {p.is_admin ? '(ADMIN)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Vincular Chave de Licença Master Avulsa *</label>
                {licencasAvulsas.length === 0 ? (
                  <div style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '12px', borderRadius: '8px', fontSize: '0.84rem' }}>
                    ⚠️ Nenhuma chave de licença master avulsa disponível para esta empresa. Por favor, emita uma nova chave master no card da empresa primeiro.
                  </div>
                ) : (
                  <select
                    value={newUserChaveLicenca}
                    onChange={(e) => setNewUserChaveLicenca(e.target.value)}
                    style={{ background: 'rgba(30, 41, 59, 0.8)', color: '#ffffff', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '10px 14px', borderRadius: '8px', fontWeight: 600 }}
                  >
                    {licencasAvulsas.map((l: any) => (
                      <option key={l.id} value={l.chave}>
                        {l.chave} ({l.tipo_licenca || 'Enterprise'} - {l.dias_restantes}d restantes)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px' }}>
                <button type="button" onClick={() => setModalCreateUserOpen(false)} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px' }}>
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={submittingCreateUser || licencasAvulsas.length === 0}
                  className="btn-primary"
                  style={{ padding: '8px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', opacity: (submittingCreateUser || licencasAvulsas.length === 0) ? 0.5 : 1 }}
                >
                  {submittingCreateUser ? <Loader2 className="spin" size={16} /> : <Check size={16} />}
                  CADASTRAR E VINCULAR LICENÇA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdmin;
