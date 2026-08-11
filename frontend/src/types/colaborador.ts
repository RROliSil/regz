export interface Colaborador {
  id?: number;
  nome: string;
  cpf: string;
  cargo?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  foto_url?: string | null;
  ativo?: boolean;
  criado_em?: string;
}

export interface Cargo {
  id?: number;
  nome: string;
  codigo_cbo?: string | null;
  criado_em?: string;
}

export interface CboItem {
  codigo: string;
  titulo: string;
}
