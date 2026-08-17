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
  valores_customizados?: Record<number, string>;
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

export interface ValorCustomizado {
  id?: number;
  colaborador_id: number;
  campo_id: number;
  valor: string;
}

export const ESTADOS_MAP: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins'
};

export const normalizeText = (str: string): string => {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};
