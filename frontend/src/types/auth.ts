export type PermissaoNivel = 'sem_acesso' | 'leitura' | 'escrita';

export interface PermissoesAba {
  home: PermissaoNivel;
  colaboradores: PermissaoNivel;
  campos: PermissaoNivel;
  administracao: PermissaoNivel;
  relatorios?: PermissaoNivel;
}

export interface PerfilAcesso {
  id: number;
  nome: string;
  descricao?: string | null;
  is_admin: boolean;
  permissoes: PermissoesAba;
  criado_em?: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil_id?: number | null;
  perfil?: PerfilAcesso;
  ativo: boolean;
  criado_em?: string;
}

export interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  temPermissao: (aba: keyof PermissoesAba, nivelExigido?: 'leitura' | 'escrita') => boolean;
}

export interface CampoCustomizado {
  id?: number;
  nome: string;
  tipo: 'texto' | 'numero' | 'data' | 'selecao' | 'numerico' | 'select' | 'alternativa';
  opcoes?: string | null;
  obrigatorio?: boolean;
  min_caracteres?: number | null;
  max_caracteres?: number | null;
  criado_em?: string;
}
