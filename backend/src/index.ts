import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'regz_jwt_super_secret_key_2026';

// Configurar limites de payload para requisições Express
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'regz_user',
  password: process.env.DB_PASSWORD || 'regz_password',
  database: process.env.DB_NAME || 'regz_db',
  connectionTimeoutMillis: 5000,
});

// Base Completa de Ocupações Oficiais CBO (Classificação Brasileira de Ocupações - MTE/Brasil)
const CBO_DATASET = [
  // Tecnologia da Informação & Computação
  { codigo: '2124-05', titulo: 'Analista de desenvolvimento de sistemas' },
  { codigo: '2124-10', titulo: 'Analista de redes e de comunicação de dados' },
  { codigo: '2124-15', titulo: 'Analista de segurança da informação' },
  { codigo: '2124-20', titulo: 'Analista de suporte computacional' },
  { codigo: '2123-05', titulo: 'Administrador de banco de dados (DBA)' },
  { codigo: '2123-10', titulo: 'Administrador de redes' },
  { codigo: '2123-15', titulo: 'Administrador de sistemas operacionais' },
  { codigo: '2124-30', titulo: 'Engenheiro de software' },
  { codigo: '3171-10', titulo: 'Programador de sistemas de informação' },
  { codigo: '3171-15', titulo: 'Programador de máquinas de comando numérico' },
  { codigo: '3171-20', titulo: 'Programador de internet' },
  { codigo: '3171-25', titulo: 'Programador multimídia' },
  { codigo: '2124-25', titulo: 'Arquiteto de soluções de tecnologia da informação' },
  { codigo: '2521-05', titulo: 'Administrador de empresas' },

  // Design, Comunicação & Marketing
  { codigo: '2624-10', titulo: 'Desenhos industriais (Designer UX/UI)' },
  { codigo: '2624-05', titulo: 'Designer gráfico' },
  { codigo: '2611-05', titulo: 'Jornalista' },
  { codigo: '2612-05', titulo: 'Bibliotecário' },
  { codigo: '2614-10', titulo: 'Filólogo / Linguista' },
  { codigo: '2617-05', titulo: 'Locutor' },
  { codigo: '2611-10', titulo: 'Redator de publicidade' },
  { codigo: '2531-10', titulo: 'Redator publicitário / Copywriter' },
  { codigo: '2531-15', titulo: 'Agente de publicidade e propaganda' },

  // Gestão, Recursos Humanos & Administração
  { codigo: '1421-05', titulo: 'Gerente administrativo' },
  { codigo: '1421-15', titulo: 'Gerente de recursos humanos' },
  { codigo: '1423-05', titulo: 'Gerente de comercialização / Vendas' },
  { codigo: '1423-10', titulo: 'Gerente de marketing' },
  { codigo: '1425-05', titulo: 'Gerente de tecnologia da informação' },
  { codigo: '1426-05', titulo: 'Gerente de pesquisa e desenvolvimento' },
  { codigo: '1414-05', titulo: 'Comerciante atacadista' },
  { codigo: '2524-05', titulo: 'Analista de recursos humanos' },
  { codigo: '4110-05', titulo: 'Auxiliar de escritório / Administrativo' },
  { codigo: '4110-10', titulo: 'Assistente administrativo' },
  { codigo: '4110-15', titulo: 'Atendente de judiciário' },
  { codigo: '4110-20', titulo: 'Auxiliar de judiciário' },

  // Finanças, Contabilidade & Economia
  { codigo: '2522-05', titulo: 'Contador' },
  { codigo: '2522-10', titulo: 'Auditor (contadores e afins)' },
  { codigo: '2522-15', titulo: 'Perito contábil' },
  { codigo: '2525-05', titulo: 'Analista de câmbio' },
  { codigo: '2525-10', titulo: 'Analista de cobrança' },
  { codigo: '2525-15', titulo: 'Analista de crédito' },
  { codigo: '2525-25', titulo: 'Analista financeiro' },
  { codigo: '2512-05', titulo: 'Economista' },
  { codigo: '4131-05', titulo: 'Auxiliar de contabilidade' },
  { codigo: '4131-10', titulo: 'Auxiliar de faturamento' },

  // Engenharia, Arquitetura & Infraestrutura
  { codigo: '2142-05', titulo: 'Engenheiro civil' },
  { codigo: '2143-05', titulo: 'Engenheiro eletricista' },
  { codigo: '2144-05', titulo: 'Engenheiro mecânico' },
  { codigo: '2140-05', titulo: 'Arquiteto urbanista' },
  { codigo: '2149-05', titulo: 'Engenheiro de produção' },
  { codigo: '2149-10', titulo: 'Engenheiro de segurança do trabalho' },
  { codigo: '3121-05', titulo: 'Técnico em edificações' },
  { codigo: '3131-05', titulo: 'Técnico em eletricidade' },

  // Saúde, Medicina & Enfermagem
  { codigo: '2251-25', titulo: 'Médico clínico' },
  { codigo: '2235-05', titulo: 'Enfermeiro' },
  { codigo: '3222-05', titulo: 'Técnico de enfermagem' },
  { codigo: '2236-05', titulo: 'Fisioterapeuta geral' },
  { codigo: '2237-10', titulo: 'Nutricionista' },
  { codigo: '2232-05', titulo: 'Cirurgião dentista' },
  { codigo: '2234-05', titulo: 'Farmacêutico' },
  { codigo: '2515-10', titulo: 'Psicólogo clínico' },

  // Logística, Operações & Transporte
  { codigo: '4141-05', titulo: 'Almoxarife' },
  { codigo: '4141-10', titulo: 'Conferente de carga e descarga' },
  { codigo: '4142-05', titulo: 'Apontador de produção' },
  { codigo: '7823-10', titulo: 'Motorista de furgão ou caminhonete' },
  { codigo: '7823-20', titulo: 'Motorista de caminhão (rotas regionais e internacionais)' },
  { codigo: '7824-05', titulo: 'Motorista de ônibus urbano' },
  { codigo: '7825-10', titulo: 'Motorista de trator' },
  { codigo: '7832-15', titulo: 'Operador de empilhadeira' },

  // Jurídico, Educação & Serviços
  { codigo: '2410-05', titulo: 'Advogado' },
  { codigo: '2312-05', titulo: 'Professor de nível superior na educação infantil' },
  { codigo: '2313-05', titulo: 'Professor do ensino fundamental' },
  { codigo: '2321-05', titulo: 'Professor do ensino médio' },
  { codigo: '2344-05', titulo: 'Professor de ensino superior' },
  { codigo: '5141-05', titulo: 'Zelador de edifício' },
  { codigo: '5142-05', titulo: 'Coletor de lixo' },
  { codigo: '5143-20', titulo: 'Faxineiro' },
  { codigo: '5173-30', titulo: 'Vigilante' },
  { codigo: '5174-10', titulo: 'Porteiro de edifício' }
];

// Função de Sincronização Bidirecional e Auto-Invalidação no Banco de Dados
const syncDatabaseLicenses = async () => {
  try {
    // 1. Invalidação automática no banco de dados para licenças com prazo de validade expirado
    await pool.query(`
      UPDATE chaves_licenca
      SET status = 'Expirada'
      WHERE data_expiracao < CURRENT_TIMESTAMP AND status = 'Ativa';
    `);

    // 2. Preencher/sincronizar usuarios.chave_licenca a partir da tabela chaves_licenca
    await pool.query(`
      UPDATE usuarios u
      SET chave_licenca = l.chave
      FROM chaves_licenca l
      WHERE l.usuario_id = u.id AND (u.chave_licenca IS NULL OR u.chave_licenca != l.chave);
    `);

    // 3. Sincronizar chaves_licenca.usuario_id a partir de usuarios.chave_licenca
    await pool.query(`
      UPDATE chaves_licenca l
      SET usuario_id = u.id
      FROM usuarios u
      WHERE u.chave_licenca IS NOT NULL AND u.chave_licenca = l.chave AND (l.usuario_id IS NULL OR l.usuario_id != u.id);
    `);
  } catch (err: any) {
    console.error('⚠️ Erro ao sincronizar chaves de licença no banco:', err.message);
  }
};

// Inicialização e migrations do banco de dados
const initDb = async () => {
  try {
    // Remover tabela órfã de testes se existir no PostgreSQL
    await pool.query('DROP TABLE IF EXISTS teste;');

    // 1. Tabela de Perfis de Acesso (RBAC)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS perfis_acesso (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL UNIQUE,
        descricao TEXT,
        is_admin BOOLEAN DEFAULT false,
        permissoes JSONB NOT NULL DEFAULT '{}'::jsonb,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Inserir perfis padrão se a tabela estiver vazia
    const countPerfis = await pool.query('SELECT COUNT(*) FROM perfis_acesso');
    if (parseInt(countPerfis.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO perfis_acesso (nome, descricao, is_admin, permissoes) VALUES
        ('Administrador', 'Acesso total e ilimitado a todas as abas e configurações do sistema', true, '{"home":"escrita","colaboradores":"escrita","campos":"escrita","administracao":"escrita"}'::jsonb),
        ('Gestor de RH', 'Acesso completo a colaboradores e campos personalizáveis', false, '{"home":"escrita","colaboradores":"escrita","campos":"escrita","administracao":"sem_acesso"}'::jsonb),
        ('Operador (Leitura e Escrita)', 'Pode visualizar e editar colaboradores, mas sem acesso a campos e administração', false, '{"home":"escrita","colaboradores":"escrita","campos":"sem_acesso","administracao":"sem_acesso"}'::jsonb),
        ('Consulta (Somente Leitura)', 'Pode apenas visualizar os relatórios e lista de colaboradores', false, '{"home":"leitura","colaboradores":"leitura","campos":"sem_acesso","administracao":"sem_acesso"}'::jsonb);
      `);
      console.log('✅ Perfis de acesso padrão inicializados!');
    }

    // 2. Tabela de Usuários do Sistema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha_hash VARCHAR(255) NOT NULL,
        perfil_id INT REFERENCES perfis_acesso(id) ON DELETE SET NULL,
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Inserir usuário administrador inicial se não houver usuários
    const countUsuarios = await pool.query('SELECT COUNT(*) FROM usuarios');
    if (parseInt(countUsuarios.rows[0].count, 10) === 0) {
      const adminPerfil = await pool.query("SELECT id FROM perfis_acesso WHERE is_admin = true LIMIT 1");
      const perfilId = adminPerfil.rows[0]?.id || 1;
      const senhaHash = await bcrypt.hash('admin123', 10);

      await pool.query(
        `INSERT INTO usuarios (nome, email, senha_hash, perfil_id, ativo) VALUES ($1, $2, $3, $4, true)`,
        ['Administrador Regz', 'admin@regz.app', senhaHash, perfilId]
      );
      console.log('✅ Usuário administrador inicial (admin@regz.app / admin123) criado com sucesso!');
    }

    // Migration SQL para corrigir usuários com perfil_id ausente ou órfão
    await pool.query(`
      UPDATE usuarios u
      SET perfil_id = COALESCE(
        (SELECT p.id FROM perfis_acesso p WHERE LOWER(p.nome) LIKE '%' || LOWER(u.nome) || '%' LIMIT 1),
        (SELECT p.id FROM perfis_acesso p WHERE p.is_admin = true LIMIT 1)
      )
      WHERE u.perfil_id IS NULL OR u.perfil_id NOT IN (SELECT id FROM perfis_acesso);
    `);
    console.log('✅ Migração de vínculo de perfis de usuários executada!');

    // Migration SQL: Expiração de Senha (30 dias), Chave de Licença e Super Admin
    await pool.query(`
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS senha_atualizada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS chave_licenca VARCHAR(100);
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;
      UPDATE usuarios SET is_super_admin = true WHERE LOWER(email) = 'admin@regz.app' OR nome = 'Administrador Regz';
    `);

    // Tabela de Chaves de Licença (Validade Inicial Padrão = 30 Dias)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chaves_licenca (
        id SERIAL PRIMARY KEY,
        chave VARCHAR(100) NOT NULL UNIQUE,
        usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
        tipo_licenca VARCHAR(50) DEFAULT 'Enterprise',
        data_ativacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_expiracao TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
        status VARCHAR(20) DEFAULT 'Ativa',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Garantir remoção da coluna max_colaboradores caso ainda exista no banco
    await pool.query(`
      ALTER TABLE chaves_licenca DROP COLUMN IF EXISTS max_colaboradores;
    `);

    // Se a tabela de licenças estiver vazia para algum usuário, criar chaves automáticas (30 dias)
    await pool.query(`
      INSERT INTO chaves_licenca (chave, usuario_id, tipo_licenca, data_expiracao, status)
      SELECT 
        'REGZ-2026-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 4)) || '-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 4)) || '-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 4)),
        u.id,
        'Enterprise',
        (CURRENT_TIMESTAMP + INTERVAL '30 days'),
        'Ativa'
      FROM usuarios u
      WHERE NOT EXISTS (SELECT 1 FROM chaves_licenca l WHERE l.usuario_id = u.id);
    `);
    await syncDatabaseLicenses();
    console.log('✅ Migração e sincronização estrita de chaves de licença no banco de dados concluída!');

    // 2.1 Tabela de Empresas (Tenants Multi-Empresas & Personalização & Conexão DB Próprio)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS empresas (
        id SERIAL PRIMARY KEY,
        razao_social VARCHAR(255) NOT NULL,
        nome_fantasia VARCHAR(255) NOT NULL,
        cnpj VARCHAR(20) UNIQUE NOT NULL,
        cep VARCHAR(10),
        logradouro VARCHAR(255),
        numero VARCHAR(50),
        complemento VARCHAR(255),
        bairro VARCHAR(100),
        cidade VARCHAR(100),
        estado VARCHAR(2),
        logo_url TEXT,
        cor_primaria VARCHAR(7) DEFAULT '#6366f1',
        cor_secundaria VARCHAR(7) DEFAULT '#38bdf8',
        cor_destaque VARCHAR(7) DEFAULT '#34d399',
        status VARCHAR(20) DEFAULT 'Ativa',
        db_host VARCHAR(255),
        db_port INT DEFAULT 5432,
        db_user VARCHAR(100),
        db_pass VARCHAR(255),
        db_name VARCHAR(100),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE empresas ADD COLUMN IF NOT EXISTS db_host VARCHAR(255);
      ALTER TABLE empresas ADD COLUMN IF NOT EXISTS db_port INT DEFAULT 5432;
      ALTER TABLE empresas ADD COLUMN IF NOT EXISTS db_user VARCHAR(100);
      ALTER TABLE empresas ADD COLUMN IF NOT EXISTS db_pass VARCHAR(255);
      ALTER TABLE empresas ADD COLUMN IF NOT EXISTS db_name VARCHAR(100);
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS empresa_id INT REFERENCES empresas(id) ON DELETE SET NULL;
      ALTER TABLE chaves_licenca ADD COLUMN IF NOT EXISTS empresa_id INT REFERENCES empresas(id) ON DELETE SET NULL;
    `);

    const countEmpresas = await pool.query('SELECT COUNT(*) FROM empresas');
    if (parseInt(countEmpresas.rows[0].count, 10) === 0) {
      const resultEmpresa = await pool.query(`
        INSERT INTO empresas (razao_social, nome_fantasia, cnpj, cep, logradouro, numero, bairro, cidade, estado, cor_primaria, cor_secundaria, cor_destaque, status)
        VALUES ('Regz Tecnologia da Informação LTDA', 'Regz Gestão de Pessoas', '00.000.000/0001-00', '01001-000', 'Praça da Sé', '100', 'Sé', 'São Paulo', 'SP', '#6366f1', '#38bdf8', '#34d399', 'Ativa')
        RETURNING id
      `);
      const matrizId = resultEmpresa.rows[0]?.id;
      if (matrizId) {
        await pool.query('UPDATE usuarios SET empresa_id = $1 WHERE empresa_id IS NULL', [matrizId]);
        await pool.query('UPDATE chaves_licenca SET empresa_id = $1 WHERE empresa_id IS NULL', [matrizId]);
      }
      console.log('✅ Empresa Matriz inicial criada e vinculada aos usuários!');
    }

    // 3. Tabela de Cargos CBO
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cargos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL UNIQUE,
        codigo_cbo VARCHAR(20),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      ALTER TABLE cargos ADD COLUMN IF NOT EXISTS codigo_cbo VARCHAR(20);
    `);

    // Sincronizar/Importar TODOS os cargos da base CBO oficial no PostgreSQL
    for (const item of CBO_DATASET) {
      await pool.query(
        'INSERT INTO cargos (nome, codigo_cbo) VALUES ($1, $2) ON CONFLICT (nome) DO UPDATE SET codigo_cbo = EXCLUDED.codigo_cbo',
        [item.titulo, item.codigo]
      );
    }

    // 4. Tabela de Colaboradores
    await pool.query(`
      CREATE TABLE IF NOT EXISTS colaboradores (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cpf VARCHAR(14) NOT NULL UNIQUE,
        cargo VARCHAR(255),
        cep VARCHAR(9),
        logradouro VARCHAR(255),
        numero VARCHAR(50),
        complemento VARCHAR(255),
        bairro VARCHAR(255),
        cidade VARCHAR(255),
        estado VARCHAR(2),
        latitude NUMERIC(10,8),
        longitude NUMERIC(11,8),
        foto_url TEXT,
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
      ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS cargo VARCHAR(255);
      ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,8);
      ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS longitude NUMERIC(11,8);
    `);

    // 5. Tabela de Campos Customizados / Dinâmicos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS campos_customizados (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL UNIQUE,
        tipo VARCHAR(50) DEFAULT 'texto',
        opcoes TEXT,
        obrigatorio BOOLEAN DEFAULT false,
        min_caracteres INT,
        max_caracteres INT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      ALTER TABLE campos_customizados ADD COLUMN IF NOT EXISTS min_caracteres INT;
      ALTER TABLE campos_customizados ADD COLUMN IF NOT EXISTS max_caracteres INT;
    `);

    // 6. Tabela de Valores dos Campos Customizados por Colaborador
    await pool.query(`
      CREATE TABLE IF NOT EXISTS colaboradores_valores_customizados (
        id SERIAL PRIMARY KEY,
        colaborador_id INT REFERENCES colaboradores(id) ON DELETE CASCADE,
        campo_id INT REFERENCES campos_customizados(id) ON DELETE CASCADE,
        valor TEXT,
        CONSTRAINT unique_colab_campo UNIQUE (colaborador_id, campo_id)
      );
    `);

    // Inicializar campos customizados exemplo se a tabela estiver vazia
    const countCampos = await pool.query('SELECT COUNT(*) FROM campos_customizados');
    if (parseInt(countCampos.rows[0].count, 10) === 0) {
      const camposIniciais = [
        { nome: 'Setor / Departamento', tipo: 'selecao', opcoes: 'Tecnologia da Informação, Recursos Humanos, Financeiro, Vendas, Operações, Diretoria', obrigatorio: false },
        { nome: 'Nome da Mãe', tipo: 'texto', opcoes: null, obrigatorio: false },
        { nome: 'Nome do Pai', tipo: 'texto', opcoes: null, obrigatorio: false },
        { nome: 'Estado Civil', tipo: 'selecao', opcoes: 'Solteiro(a), Casado(a), Divorciado(a), Viúvo(a), União Estável', obrigatorio: false },
        { nome: 'PIS / PASEP', tipo: 'texto', opcoes: null, obrigatorio: false }
      ];

      for (const c of camposIniciais) {
        await pool.query(
          'INSERT INTO campos_customizados (nome, tipo, opcoes, obrigatorio) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
          [c.nome, c.tipo, c.opcoes, c.obrigatorio]
        );
      }
      console.log('✅ Campos customizados padrão (Setor, Nome da Mãe, Pai, etc.) inicializados!');
    }

    console.log('✅ Tabelas e migrations do PostgreSQL inicializadas com sucesso!');
  } catch (error) {
    console.error('⚠️ Erro ao inicializar o banco de dados:', error);
  }
};

initDb();

// Funções auxiliares para gerador nativo de CPF e pessoas brasileiras
const gerarCpfValido = (): string => {
  const randDigit = () => Math.floor(Math.random() * 9);
  const n = Array.from({ length: 9 }, randDigit);

  let d1 = n.reduce((acc, val, i) => acc + val * (10 - i), 0);
  d1 = 11 - (d1 % 11);
  if (d1 >= 10) d1 = 0;

  let d2 = [...n, d1].reduce((acc, val, i) => acc + val * (11 - i), 0);
  d2 = 11 - (d2 % 11);
  if (d2 >= 10) d2 = 0;

  return `${n.slice(0,3).join('')}.${n.slice(3,6).join('')}.${n.slice(6,9).join('')}-${d1}${d2}`;
};

const NOMES_EXEMPLO = [
  'Gabriel Silveira Santos', 'Mariana Oliveira Costa', 'Lucas Fernandes Lima',
  'Beatriz Alves Rocha', 'Matheus Henrique Ribeiro', 'Camila Martins Souza',
  'Rafael Barbosa de Melo', 'Juliana Castro Ferreira', 'Thiago Mendes de Araujo',
  'Larissa Machado Cardoso', 'Felipe Eduardo Peixoto', 'Amanda Reis Guimarães'
];

const ENDERECOS_EXEMPLO = [
  { cep: '01001-000', logradouro: 'Praça da Sé', bairro: 'Sé', cidade: 'São Paulo', estado: 'SP', lat: -23.5505, lon: -46.6333 },
  { cep: '20040-002', logradouro: 'Rua Primeiro de Março', bairro: 'Centro', cidade: 'Rio de Janeiro', estado: 'RJ', lat: -22.9035, lon: -43.1729 },
  { cep: '30130-010', logradouro: 'Avenida Afonso Pena', bairro: 'Centro', cidade: 'Belo Horizonte', estado: 'MG', lat: -19.9208, lon: -43.9378 },
  { cep: '80010-000', logradouro: 'Rua XV de Novembro', bairro: 'Centro', cidade: 'Curitiba', estado: 'PR', lat: -25.4284, lon: -49.2733 },
  { cep: '90010-150', logradouro: 'Avenida dos Andradas', bairro: 'Centro Histórico', cidade: 'Porto Alegre', estado: 'RS', lat: -30.0346, lon: -51.2177 },
  { cep: '40020-000', logradouro: 'Avenida Sete de Setembro', bairro: 'Vitória', cidade: 'Salvador', estado: 'BA', lat: -12.9714, lon: -38.5014 },
  { cep: '12220-520', logradouro: 'Rua Alfredo Pereira Filho', bairro: 'Vila Industrial', cidade: 'São José dos Campos', estado: 'SP', lat: -23.1818, lon: -45.8655 }
];

// Geocodificação de Alta Precisão via OpenStreetMap
const fetchGeocodingHighPrecision = async (logradouro?: string, numeroStr?: string, cidade?: string, estado?: string, cep?: string) => {
  try {
    const headers = { 'User-Agent': 'RegzApp/1.0 (contact@regz.app)' };

    const fullQuery = [logradouro, numeroStr ? `nº ${numeroStr}` : '', cidade, estado, cep, 'Brasil'].filter(Boolean).join(', ');
    if (fullQuery) {
      const url1 = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=1`;
      const res1 = await fetch(url1, { headers });
      if (res1.ok) {
        const data1 = await res1.json();
        if (Array.isArray(data1) && data1.length > 0) {
          return {
            lat: parseFloat(parseFloat(data1[0].lat).toFixed(8)),
            lon: parseFloat(parseFloat(data1[0].lon).toFixed(8))
          };
        }
      }
    }

    const streetQuery = [logradouro, cidade, estado, cep, 'Brasil'].filter(Boolean).join(', ');
    if (streetQuery) {
      const url2 = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(streetQuery)}&limit=1`;
      const res2 = await fetch(url2, { headers });
      if (res2.ok) {
        const data2 = await res2.json();
        if (Array.isArray(data2) && data2.length > 0) {
          return {
            lat: parseFloat(parseFloat(data2[0].lat).toFixed(8)),
            lon: parseFloat(parseFloat(data2[0].lon).toFixed(8))
          };
        }
      }
    }

    if (cep) {
      const cepQuery = `${cep}, Brasil`;
      const url3 = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cepQuery)}&limit=1`;
      const res3 = await fetch(url3, { headers });
      if (res3.ok) {
        const data3 = await res3.json();
        if (Array.isArray(data3) && data3.length > 0) {
          return {
            lat: parseFloat(parseFloat(data3[0].lat).toFixed(8)),
            lon: parseFloat(parseFloat(data3[0].lon).toFixed(8))
          };
        }
      }
    }
  } catch (err) {
    console.error('Erro na geocodificação de precisão:', err);
  }
  return { lat: null, lon: null };
};

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'regz-app',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Database connectivity status endpoint
app.get('/api/db-status', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    res.json({
      connected: true,
      timestamp: result.rows[0].current_time,
      postgresVersion: result.rows[0].version
    });
  } catch (error: any) {
    res.status(500).json({
      connected: false,
      error: error.message || 'Falha na conexão com o banco de dados'
    });
  }
});

// ==========================================
// ==========================================
// ROTAS DE AUTENTICAÇÃO E LOGIN (JWT / BCRYPT)
// ==========================================

interface LoginAttempt {
  count: number;
  lockUntil: number | null;
}

const loginAttemptsMap = new Map<string, LoginAttempt>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKTIME_MS = 15 * 60 * 1000; // 15 Minutos

const recordFailedAttempt = (key: string) => {
  const now = Date.now();
  const existing = loginAttemptsMap.get(key) || { count: 0, lockUntil: null };
  const newCount = existing.count + 1;
  const lockUntil = newCount >= MAX_LOGIN_ATTEMPTS ? now + LOCKTIME_MS : null;
  loginAttemptsMap.set(key, { count: newCount, lockUntil });
};

// Limpeza periódica de tentativas expiradas (a cada 10 min)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of loginAttemptsMap.entries()) {
    if (val.lockUntil && val.lockUntil < now) {
      loginAttemptsMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

// Login de Usuário (Sem Auto-Registro)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  const clientIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1').split(',')[0].trim();
  const attemptKey = `${clientIp}_${String(email).trim().toLowerCase()}`;
  const now = Date.now();
  const currentAttempt = loginAttemptsMap.get(attemptKey);

  if (currentAttempt && currentAttempt.lockUntil && currentAttempt.lockUntil > now) {
    const remainingSec = Math.ceil((currentAttempt.lockUntil - now) / 1000);
    const remainingMin = Math.ceil(remainingSec / 60);
    return res.status(429).json({
      error: `Muitas tentativas incorretas consecutivas. Por segurança, o acesso para este e-mail/IP foi temporariamente bloqueado. Tente novamente em ${remainingMin} minuto(s).`
    });
  }

  try {
    await syncDatabaseLicenses();
    const query = `
      SELECT u.id, u.nome, u.email, u.senha_hash, u.ativo, u.perfil_id, u.chave_licenca,
             p.nome as perfil_nome, p.descricao as perfil_descricao, p.is_admin, p.permissoes,
             l.chave as licenca_chave, l.status as licenca_status, l.data_expiracao as licenca_expiracao,
             (l.data_expiracao::date - CURRENT_DATE)::int as dias_restantes_licenca
      FROM usuarios u
      LEFT JOIN perfis_acesso p ON u.perfil_id = p.id
      LEFT JOIN chaves_licenca l ON (l.chave = u.chave_licenca OR l.usuario_id = u.id)
      WHERE LOWER(u.email) = LOWER($1)
    `;
    const result = await pool.query(query, [email.trim()]);

    if (result.rows.length === 0) {
      recordFailedAttempt(attemptKey);
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    const usuario = result.rows[0];

    if (!usuario.ativo) {
      return res.status(403).json({ error: 'Esta conta de usuário está inativa. Contate o Administrador.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      recordFailedAttempt(attemptKey);
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    // Sucesso no login: resetar contador de falhas
    loginAttemptsMap.delete(attemptKey);

    const perfil = {
      id: usuario.perfil_id,
      nome: usuario.perfil_nome || 'Usuário Sem Perfil',
      descricao: usuario.perfil_descricao,
      is_admin: !!usuario.is_admin,
      permissoes: usuario.permissoes || { home: 'escrita', colaboradores: 'escrita', campos: 'escrita', administracao: 'escrita' }
    };

    // EXCEÇÃO EXCLUSIVA PARA O USUÁRIO SUPER ADMIN REGZ (is_super_admin ou admin@regz.app)
    const isSuperAdmin = !!(usuario.is_super_admin || (usuario.email && usuario.email.toLowerCase() === 'admin@regz.app') || usuario.nome === 'Administrador Regz');
    const temChaveVinculada = !!(usuario.chave_licenca || usuario.licenca_chave);
    const diasRestantesLic = isSuperAdmin ? 999 : (typeof usuario.dias_restantes_licenca === 'number' ? usuario.dias_restantes_licenca : 0);
    const licencaStatus = isSuperAdmin ? 'Ativa (Isento - Super Admin)' : (usuario.licenca_status || (temChaveVinculada ? 'Ativa' : 'Sem Licença'));
    const semLicenca = !isSuperAdmin && !temChaveVinculada;
    const licencaExpirada = !isSuperAdmin && (semLicenca || diasRestantesLic <= 0 || usuario.licenca_status === 'Suspensa' || usuario.licenca_status === 'Expirada');

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, perfil_id: usuario.perfil_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        ativo: usuario.ativo,
        is_super_admin: isSuperAdmin,
        chave_licenca: usuario.chave_licenca || usuario.licenca_chave || null,
        perfil,
        sem_licenca: semLicenca,
        licenca_expirada: licencaExpirada,
        dias_restantes_licenca: diasRestantesLic,
        status_licenca: licencaStatus
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao realizar login' });
  }
});

// Checar sessão do Usuário Logado
app.get('/api/auth/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    await syncDatabaseLicenses();
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const query = `
      SELECT u.id, u.nome, u.email, u.ativo, u.perfil_id, u.chave_licenca, u.is_super_admin,
             p.nome as perfil_nome, p.descricao as perfil_descricao, p.is_admin, p.permissoes,
             l.chave as licenca_chave, l.status as licenca_status, l.data_expiracao as licenca_expiracao,
             (l.data_expiracao::date - CURRENT_DATE)::int as dias_restantes_licenca
      FROM usuarios u
      LEFT JOIN perfis_acesso p ON u.perfil_id = p.id
      LEFT JOIN chaves_licenca l ON (l.chave = u.chave_licenca OR l.usuario_id = u.id)
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [decoded.id]);

    if (result.rows.length === 0 || !result.rows[0].ativo) {
      return res.status(401).json({ error: 'Sessão inválida ou usuário inativo' });
    }

    const usuario = result.rows[0];
    const perfil = {
      id: usuario.perfil_id,
      nome: usuario.perfil_nome || 'Usuário Sem Perfil',
      descricao: usuario.perfil_descricao,
      is_admin: !!usuario.is_admin,
      permissoes: usuario.permissoes || { home: 'escrita', colaboradores: 'escrita', campos: 'escrita', administracao: 'escrita' }
    };

    // EXCEÇÃO EXCLUSIVA PARA O USUÁRIO SUPER ADMIN REGZ (is_super_admin ou admin@regz.app)
    const isSuperAdmin = !!(usuario.is_super_admin || (usuario.email && usuario.email.toLowerCase() === 'admin@regz.app') || usuario.nome === 'Administrador Regz');
    const temChaveVinculada = !!(usuario.chave_licenca || usuario.licenca_chave);
    const diasRestantesLic = isSuperAdmin ? 999 : (typeof usuario.dias_restantes_licenca === 'number' ? usuario.dias_restantes_licenca : 0);
    const licencaStatus = isSuperAdmin ? 'Ativa (Isento - Super Admin)' : (usuario.licenca_status || (temChaveVinculada ? 'Ativa' : 'Sem Licença'));
    const semLicenca = !isSuperAdmin && !temChaveVinculada;
    const licencaExpirada = !isSuperAdmin && (semLicenca || diasRestantesLic <= 0 || usuario.licenca_status === 'Suspensa' || usuario.licenca_status === 'Expirada');

    res.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        ativo: usuario.ativo,
        is_super_admin: isSuperAdmin,
        chave_licenca: usuario.chave_licenca || usuario.licenca_chave || null,
        perfil,
        sem_licenca: semLicenca,
        licenca_expirada: licencaExpirada,
        dias_restantes_licenca: diasRestantesLic,
        status_licenca: licencaStatus
      }
    });
  } catch (error: any) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
});

// Middleware para verificação estrita de permissão de escrita
const checkPermission = (aba: string) => {
  return async (req: Request, res: Response, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const query = `
        SELECT u.id, u.ativo, p.is_admin, p.permissoes
        FROM usuarios u
        LEFT JOIN perfis_acesso p ON u.perfil_id = p.id
        WHERE u.id = $1
      `;
      const result = await pool.query(query, [decoded.id]);
      if (result.rows.length === 0 || !result.rows[0].ativo) {
        return res.status(401).json({ error: 'Sessão inválida ou usuário inativo' });
      }
      const user = result.rows[0];
      if (user.is_admin) {
        return next();
      }
      const permissoes = user.permissoes || {};
      if (permissoes[aba] !== 'escrita') {
        return res.status(403).json({ error: `Acesso negado: Seu perfil possui apenas permissão de leitura no módulo ${aba}.` });
      }
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token de autenticação inválido' });
    }
  };
};

// ==========================================
// ROTAS DE GESTÃO DE PERFIS DE ACESSO (RBAC)
// ==========================================

// Listar todos os perfis de acesso
app.get('/api/perfis-acesso', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM perfis_acesso ORDER BY id ASC');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar perfis de acesso' });
  }
});

// Cadastrar novo perfil de acesso
app.post('/api/perfis-acesso', checkPermission('administracao'), async (req: Request, res: Response) => {
  const { nome, descricao, is_admin, permissoes } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'O nome do perfil é obrigatório' });
  }

  try {
    const nomeTrimmed = nome.trim();
    const existing = await pool.query('SELECT id FROM perfis_acesso WHERE LOWER(nome) = LOWER($1)', [nomeTrimmed]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Já existe um perfil com este nome' });
    }

    const result = await pool.query(
      'INSERT INTO perfis_acesso (nome, descricao, is_admin, permissoes) VALUES ($1, $2, $3, $4) RETURNING *',
      [nomeTrimmed, descricao || null, !!is_admin, JSON.stringify(permissoes || {})]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao criar perfil de acesso' });
  }
});

// Atualizar perfil de acesso
app.put('/api/perfis-acesso/:id', checkPermission('administracao'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, descricao, is_admin, permissoes } = req.body;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'O nome do perfil é obrigatório' });
  }

  try {
    const result = await pool.query(
      'UPDATE perfis_acesso SET nome = $1, descricao = $2, is_admin = $3, permissoes = $4 WHERE id = $5 RETURNING *',
      [nome.trim(), descricao || null, !!is_admin, JSON.stringify(permissoes || {}), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil de acesso não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao atualizar perfil' });
  }
});

// Excluir perfil de acesso
app.delete('/api/perfis-acesso/:id', checkPermission('administracao'), async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const checkAdmin = await pool.query('SELECT is_admin FROM perfis_acesso WHERE id = $1', [id]);
    if (checkAdmin.rows.length > 0 && checkAdmin.rows[0].is_admin) {
      return res.status(400).json({ error: 'O perfil de Administrador padrão não pode ser excluído' });
    }

    const result = await pool.query('DELETE FROM perfis_acesso WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }
    res.json({ success: true, message: 'Perfil removido com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao remover perfil' });
  }
});

// ==========================================
// ROTAS DE GESTÃO DE USUÁRIOS (ADMIN PAINEL)
// ==========================================

// Listar todos os usuários com dados do perfil, expiração de senha e validade da licença
app.get('/api/usuarios', async (req: Request, res: Response) => {
  try {
    await syncDatabaseLicenses();
    const query = `
      SELECT u.id, u.nome, u.email, u.ativo, u.perfil_id, u.criado_em, u.senha_atualizada_em, u.chave_licenca, u.is_super_admin,
             p.nome as perfil_nome, p.descricao as perfil_descricao, p.is_admin, p.permissoes,
             (30 - (CURRENT_DATE - COALESCE(u.senha_atualizada_em, u.criado_em)::date))::int as dias_para_expirar,
             l.chave as licenca_chave, l.tipo_licenca, l.status as status_licenca,
             (l.data_expiracao::date - CURRENT_DATE)::int as dias_restantes_licenca
      FROM usuarios u
      LEFT JOIN perfis_acesso p ON u.perfil_id = p.id
      LEFT JOIN chaves_licenca l ON (l.chave = u.chave_licenca OR l.usuario_id = u.id)
      ORDER BY u.id ASC
    `;
    const result = await pool.query(query);
    const usuariosFormatados = result.rows.map(u => {
      const diasRestantesSenha = typeof u.dias_para_expirar === 'number' ? u.dias_para_expirar : 30;
      const isSuperAdmin = !!(u.is_super_admin || (u.email && u.email.toLowerCase() === 'admin@regz.app') || u.nome === 'Administrador Regz');
      const diasRestantesLicenca = typeof u.dias_restantes_licenca === 'number' ? u.dias_restantes_licenca : null;

      return {
        id: u.id,
        nome: u.nome,
        email: u.email,
        ativo: u.ativo,
        perfil_id: u.perfil_id,
        is_super_admin: isSuperAdmin,
        criado_em: u.criado_em,
        senha_atualizada_em: u.senha_atualizada_em || u.criado_em,
        dias_para_expirar: diasRestantesSenha,
        dias_restantes_licenca: diasRestantesLicenca,
        senha_expirada: diasRestantesSenha <= 0,
        chave_licenca: u.chave_licenca || u.licenca_chave || null,
        tipo_licenca: isSuperAdmin ? 'Super Admin (Isento)' : (u.tipo_licenca || null),
        status_licenca: isSuperAdmin ? 'Ativa (Isento)' : (u.status_licenca || 'Ativa'),
        perfil: u.perfil_id ? {
          id: u.perfil_id,
          nome: u.perfil_nome,
          descricao: u.perfil_descricao,
          is_admin: !!u.is_admin,
          permissoes: u.permissoes
        } : null
      };
    });
    res.json(usuariosFormatados);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar usuários' });
  }
});

// Cadastrar novo usuário (Apenas via Painel Admin)
app.post('/api/usuarios', async (req: Request, res: Response) => {
  const { nome, email, senha, perfil_id, ativo, chave_licenca } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, E-mail e Senha são obrigatórios' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
  }

  try {
    const emailTrimmed = email.trim().toLowerCase();
    const existing = await pool.query('SELECT id FROM usuarios WHERE LOWER(email) = $1', [emailTrimmed]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    let finalChave = chave_licenca && chave_licenca.trim() ? chave_licenca.trim() : null;

    if (!finalChave) {
      const randomHex = () => Math.random().toString(36).substring(2, 6).toUpperCase();
      finalChave = `REGZ-2026-${randomHex()}-${randomHex()}-${randomHex()}`;
    }

    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, perfil_id, ativo, chave_licenca) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [nome.trim(), emailTrimmed, senhaHash, perfil_id || null, ativo !== false, finalChave]
    );

    const newId = result.rows[0].id;

    if (finalChave) {
      const checkLic = await pool.query('SELECT id FROM chaves_licenca WHERE chave = $1', [finalChave]);
      if (checkLic.rows.length > 0) {
        await pool.query('UPDATE chaves_licenca SET usuario_id = $1, status = \'Ativa\' WHERE chave = $2', [newId, finalChave]);
      } else {
        await pool.query(
          'INSERT INTO chaves_licenca (chave, usuario_id, tipo_licenca, data_expiracao, status) VALUES ($1, $2, \'Enterprise\', CURRENT_TIMESTAMP + INTERVAL \'30 days\', \'Ativa\')',
          [finalChave, newId]
        );
      }
    }

    await syncDatabaseLicenses();

    const queryUser = `
      SELECT u.id, u.nome, u.email, u.ativo, u.perfil_id, u.chave_licenca, u.criado_em,
             p.nome as perfil_nome, p.descricao as perfil_descricao, p.is_admin, p.permissoes
      FROM usuarios u
      LEFT JOIN perfis_acesso p ON u.perfil_id = p.id
      WHERE u.id = $1
    `;
    const resUser = await pool.query(queryUser, [newId]);
    const u = resUser.rows[0];

    res.status(201).json({
      id: u.id,
      nome: u.nome,
      email: u.email,
      ativo: u.ativo,
      perfil_id: u.perfil_id,
      chave_licenca: u.chave_licenca,
      criado_em: u.criado_em,
      perfil: u.perfil_id ? {
        id: u.perfil_id,
        nome: u.perfil_nome,
        descricao: u.perfil_descricao,
        is_admin: !!u.is_admin,
        permissoes: u.permissoes
      } : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao cadastrar usuário' });
  }
});

// Atualizar usuário
app.put('/api/usuarios/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, email, senha, perfil_id, ativo, chave_licenca } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome e E-mail são obrigatórios' });
  }

  try {
    const emailTrimmed = email.trim().toLowerCase();
    const existing = await pool.query('SELECT id FROM usuarios WHERE LOWER(email) = $1 AND id != $2', [emailTrimmed, id]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Este e-mail pertence a outro usuário' });
    }

    if (senha && senha.trim()) {
      const senhaHash = await bcrypt.hash(senha, 10);
      await pool.query(
        'UPDATE usuarios SET nome = $1, email = $2, senha_hash = $3, perfil_id = $4, ativo = $5, chave_licenca = $6 WHERE id = $7',
        [nome.trim(), emailTrimmed, senhaHash, perfil_id || null, ativo !== false, chave_licenca || null, id]
      );
    } else {
      await pool.query(
        'UPDATE usuarios SET nome = $1, email = $2, perfil_id = $3, ativo = $4, chave_licenca = $5 WHERE id = $6',
        [nome.trim(), emailTrimmed, perfil_id || null, ativo !== false, chave_licenca || null, id]
      );
    }

    if (chave_licenca && chave_licenca.trim()) {
      await pool.query('UPDATE chaves_licenca SET usuario_id = $1, status = \'Ativa\' WHERE chave = $2', [id, chave_licenca.trim()]);
    }
    await syncDatabaseLicenses();

    const queryUser = `
      SELECT u.id, u.nome, u.email, u.ativo, u.perfil_id, u.chave_licenca, u.criado_em,
             p.nome as perfil_nome, p.descricao as perfil_descricao, p.is_admin, p.permissoes
      FROM usuarios u
      LEFT JOIN perfis_acesso p ON u.perfil_id = p.id
      WHERE u.id = $1
    `;
    const resUser = await pool.query(queryUser, [id]);
    const u = resUser.rows[0];

    res.json({
      id: u.id,
      nome: u.nome,
      email: u.email,
      ativo: u.ativo,
      perfil_id: u.perfil_id,
      chave_licenca: u.chave_licenca,
      criado_em: u.criado_em,
      perfil: u.perfil_id ? {
        id: u.perfil_id,
        nome: u.perfil_nome,
        descricao: u.perfil_descricao,
        is_admin: !!u.is_admin,
        permissoes: u.permissoes
      } : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao atualizar usuário' });
  }
});

// Atribuir/Vincular chave de licença a um usuário
app.put('/api/usuarios/:id/atribuir-licenca', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { chave_licenca } = req.body;

  if (!chave_licenca || !chave_licenca.trim()) {
    return res.status(400).json({ error: 'Chave de licença é obrigatória' });
  }

  try {
    const chaveStr = chave_licenca.trim();
    // Verificar se a chave existe
    const licRes = await pool.query('SELECT id, status FROM chaves_licenca WHERE chave = $1', [chaveStr]);
    if (licRes.rows.length === 0) {
      return res.status(404).json({ error: 'Chave de licença não encontrada no sistema' });
    }

    await pool.query('UPDATE usuarios SET chave_licenca = $1 WHERE id = $2', [chaveStr, id]);
    await pool.query('UPDATE chaves_licenca SET usuario_id = $1 WHERE chave = $2', [id, chaveStr]);

    res.json({ success: true, message: 'Chave de licença atrelada ao usuário com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao atribuir licença' });
  }
});

// Alternar status do usuário (Ativo / Inativo)
app.put('/api/usuarios/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { ativo } = req.body;

  try {
    const result = await pool.query(
      'UPDATE usuarios SET ativo = $1 WHERE id = $2 RETURNING id, nome, email, ativo',
      [!!ativo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao alterar status do usuário' });
  }
});

// Renovar validade da senha por mais 30 dias
app.post('/api/usuarios/:id/renovar-senha', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE usuarios SET senha_atualizada_em = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    res.json({ message: 'Validade da senha renovada por mais 30 dias com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao renovar validade da senha' });
  }
});

// ==========================================
// ROTAS DE GESTÃO DE CHAVES DE LICENÇA
// ==========================================

// Listar todas as chaves de licença
app.get('/api/licencas', async (req: Request, res: Response) => {
  try {
    await syncDatabaseLicenses();
    const query = `
      SELECT l.id, l.chave, l.usuario_id, l.tipo_licenca,
             l.data_ativacao, l.data_expiracao, l.status, l.criado_em,
             u.nome as usuario_nome, u.email as usuario_email,
             (l.data_expiracao::date - CURRENT_DATE)::int as dias_restantes
      FROM chaves_licenca l
      LEFT JOIN usuarios u ON l.usuario_id = u.id
      ORDER BY l.id DESC
    `;
    const result = await pool.query(query);
    const licencasFormatadas = result.rows.map(l => ({
      id: l.id,
      chave: l.chave,
      usuario_id: l.usuario_id,
      usuario_nome: l.usuario_nome || 'Não Vinculado',
      usuario_email: l.usuario_email || '-',
      tipo_licenca: l.tipo_licenca,
      data_ativacao: l.data_ativacao,
      data_expiracao: l.data_expiracao,
      status: l.status,
      dias_restantes: typeof l.dias_restantes === 'number' ? l.dias_restantes : 0,
      criado_em: l.criado_em
    }));
    res.json(licencasFormatadas);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar chaves de licença' });
  }
});

// Gerar nova chave de licença
app.post('/api/licencas', async (req: Request, res: Response) => {
  const { usuario_id, empresa_id, tipo_licenca, validade_dias, dias_validade } = req.body;

  try {
    const randomHex = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const chaveGerada = `REGZ-2026-${randomHex()}-${randomHex()}-${randomHex()}`;
    const diasValidade = dias_validade ? parseInt(dias_validade, 10) : (validade_dias ? parseInt(validade_dias, 10) : 30);
    const targetEmpresaId = empresa_id ? parseInt(empresa_id, 10) : null;

    const query = `
      INSERT INTO chaves_licenca (chave, usuario_id, empresa_id, tipo_licenca, data_expiracao, status)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP + ($5 || ' days')::interval, 'Ativa')
      RETURNING *
    `;
    const result = await pool.query(query, [
      chaveGerada,
      usuario_id || null,
      targetEmpresaId,
      tipo_licenca || 'Enterprise',
      diasValidade
    ]);

    if (usuario_id) {
      await pool.query('UPDATE usuarios SET chave_licenca = $1 WHERE id = $2', [chaveGerada, usuario_id]);
    }

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao gerar chave de licença' });
  }
});

// Renovar prazo ou alterar tipo da licença
app.put('/api/licencas/:id/renovar', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { dias, tipo_licenca, redefinir } = req.body;
  const diasAdicionais = dias ? parseInt(dias, 10) : 365;

  try {
    let query: string;
    let params: any[];

    if (tipo_licenca) {
      if (redefinir) {
        query = `
          UPDATE chaves_licenca
          SET data_expiracao = CURRENT_TIMESTAMP + ($1 || ' days')::interval,
              tipo_licenca = $2,
              status = 'Ativa'
          WHERE id = $3
          RETURNING *
        `;
        params = [diasAdicionais, tipo_licenca, id];
      } else {
        query = `
          UPDATE chaves_licenca
          SET data_expiracao = GREATEST(data_expiracao, CURRENT_TIMESTAMP) + ($1 || ' days')::interval,
              tipo_licenca = $2,
              status = 'Ativa'
          WHERE id = $3
          RETURNING *
        `;
        params = [diasAdicionais, tipo_licenca, id];
      }
    } else {
      if (redefinir) {
        query = `
          UPDATE chaves_licenca
          SET data_expiracao = CURRENT_TIMESTAMP + ($1 || ' days')::interval,
              status = 'Ativa'
          WHERE id = $2
          RETURNING *
        `;
        params = [diasAdicionais, id];
      } else {
        query = `
          UPDATE chaves_licenca
          SET data_expiracao = GREATEST(data_expiracao, CURRENT_TIMESTAMP) + ($1 || ' days')::interval,
              status = 'Ativa'
          WHERE id = $2
          RETURNING *
        `;
        params = [diasAdicionais, id];
      }
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Licença não encontrada' });
    }

    await syncDatabaseLicenses();
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao renovar chave de licença' });
  }
});

// Alterar status da licença (Ativa, Suspensa, Expirada)
app.put('/api/licencas/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Ativa', 'Suspensa', 'Expirada'].includes(status)) {
    return res.status(400).json({ error: 'Status de licença inválido' });
  }

  try {
    const result = await pool.query('UPDATE chaves_licenca SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Licença não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao atualizar status da licença' });
  }
});

// Excluir chave de licença
app.delete('/api/licencas/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const licRes = await pool.query('SELECT chave FROM chaves_licenca WHERE id = $1', [id]);
    if (licRes.rows.length > 0) {
      const chaveExcluida = licRes.rows[0].chave;
      await pool.query('UPDATE usuarios SET chave_licenca = NULL WHERE chave_licenca = $1', [chaveExcluida]);
    }

    const result = await pool.query('DELETE FROM chaves_licenca WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Licença não encontrada' });
    }

    await syncDatabaseLicenses();
    res.json({ message: 'Licença excluída com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao excluir chave de licença' });
  }
});

// ==========================================
// ROTAS DE GESTÃO DE EMPRESAS (SUPER ADMIN)
// ==========================================

// Listar todas as empresas com estatísticas
app.get('/api/empresas', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT e.*,
             COUNT(DISTINCT u.id)::int as total_usuarios,
             COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'Ativa')::int as licencas_ativas,
             COUNT(DISTINCT l.id)::int as total_licencas
      FROM empresas e
      LEFT JOIN usuarios u ON u.empresa_id = e.id
      LEFT JOIN chaves_licenca l ON (l.empresa_id = e.id OR l.usuario_id = u.id)
      GROUP BY e.id
      ORDER BY e.id DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar empresas' });
  }
});

// Criar nova empresa
app.post('/api/empresas', async (req: Request, res: Response) => {
  const {
    razao_social, nome_fantasia, cnpj,
    cep, logradouro, numero, complemento, bairro, cidade, estado,
    logo_url, cor_primaria, cor_secundaria, cor_destaque, status,
    db_host, db_port, db_user, db_pass, db_name
  } = req.body;

  if (!razao_social || !nome_fantasia || !cnpj) {
    return res.status(400).json({ error: 'Razão social, nome fantasia e CNPJ são obrigatórios' });
  }

  try {
    const query = `
      INSERT INTO empresas (
        razao_social, nome_fantasia, cnpj,
        cep, logradouro, numero, complemento, bairro, cidade, estado,
        logo_url, cor_primaria, cor_secundaria, cor_destaque, status,
        db_host, db_port, db_user, db_pass, db_name
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `;
    const result = await pool.query(query, [
      razao_social, nome_fantasia, cnpj,
      cep || null, logradouro || null, numero || null, complemento || null, bairro || null, cidade || null, estado || null,
      logo_url || null,
      cor_primaria || '#6366f1',
      cor_secundaria || '#38bdf8',
      cor_destaque || '#34d399',
      status || 'Ativa',
      db_host || 'localhost',
      db_port ? parseInt(String(db_port), 10) : 5432,
      db_user || 'postgres',
      db_pass || null,
      db_name || 'regz_db'
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao criar empresa' });
  }
});

// Editar empresa
app.put('/api/empresas/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    razao_social, nome_fantasia, cnpj,
    cep, logradouro, numero, complemento, bairro, cidade, estado,
    logo_url, cor_primaria, cor_secundaria, cor_destaque, status,
    db_host, db_port, db_user, db_pass, db_name
  } = req.body;

  try {
    const query = `
      UPDATE empresas
      SET razao_social = $1, nome_fantasia = $2, cnpj = $3,
          cep = $4, logradouro = $5, numero = $6, complemento = $7, bairro = $8, cidade = $9, estado = $10,
          logo_url = $11, cor_primaria = $12, cor_secundaria = $13, cor_destaque = $14, status = $15,
          db_host = $16, db_port = $17, db_user = $18, db_pass = $19, db_name = $20
      WHERE id = $21
      RETURNING *
    `;
    const result = await pool.query(query, [
      razao_social, nome_fantasia, cnpj,
      cep || null, logradouro || null, numero || null, complemento || null, bairro || null, cidade || null, estado || null,
      logo_url || null,
      cor_primaria || '#6366f1',
      cor_secundaria || '#38bdf8',
      cor_destaque || '#34d399',
      status || 'Ativa',
      db_host || 'localhost',
      db_port ? parseInt(String(db_port), 10) : 5432,
      db_user || 'postgres',
      db_pass || null,
      db_name || 'regz_db',
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao atualizar empresa' });
  }
});

// Excluir empresa
app.delete('/api/empresas/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM empresas WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    res.json({ message: 'Empresa removida com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao excluir empresa' });
  }
});

// Testar Conexão & Inicializar Estrutura de Banco DB Próprio de uma Empresa (com Resolução Inteligente Docker/Portainer)
app.post('/api/empresas/test-db', async (req: Request, res: Response) => {
  const { db_host, db_port, db_user, db_pass, db_name } = req.body;

  if (!db_name) {
    return res.status(400).json({ error: 'Nome do Banco de Dados é obrigatório' });
  }

  const targetDbName = String(db_name).trim();
  const port = db_port ? parseInt(String(db_port), 10) : parseInt(process.env.DB_PORT || '5432', 10);

  // Lista de hosts candidatos a tentar (ordenada por preferência)
  const reqHost = db_host ? String(db_host).trim() : '';
  const envHost = process.env.DB_HOST || '';
  const hostsToTry: string[] = Array.from(new Set([
    reqHost,
    envHost,
    'db',
    'postgres',
    'localhost',
    '127.0.0.1'
  ].filter(Boolean)));

  // Lista de usuários candidatos a tentar
  const reqUser = db_user ? String(db_user).trim() : '';
  const envUser = process.env.DB_USER || 'regz_user';
  const usersToTry: string[] = Array.from(new Set([
    reqUser,
    envUser,
    'regz_user',
    'postgres'
  ].filter(Boolean)));

  // Lista de senhas candidatas a tentar
  const reqPass = db_pass !== undefined ? String(db_pass) : '';
  const envPass = process.env.DB_PASSWORD || 'regz_password';
  const passwordsToTry: string[] = Array.from(new Set([
    reqPass,
    envPass,
    'regz_password',
    'postgres',
    ''
  ]));

  let successfulHost = '';
  let successfulUser = '';
  let successfulPass = '';
  let dbCreatedNow = false;
  let connectionEstablished = false;
  let lastErrorMessage = '';

  // Loop de busca por uma combinação válida de Conexão no PostgreSQL
  outerLoop: for (const h of hostsToTry) {
    for (const u of usersToTry) {
      for (const p of passwordsToTry) {
        // 1. Tentar conectar ao banco genérico para administrar (postgres, template1, regz_db)
        const adminDbsToTry = ['postgres', 'template1', process.env.DB_NAME || 'regz_db', 'regz_db'];

        for (const adminDb of adminDbsToTry) {
          const adminPool = new Pool({
            host: h,
            port,
            user: u,
            password: p,
            database: adminDb,
            connectionTimeoutMillis: 3500
          });

          try {
            const checkDb = await adminPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDbName]);

            if (checkDb.rows.length === 0) {
              // Criar o banco de dados se não existir
              await adminPool.query(`CREATE DATABASE "${targetDbName.replace(/"/g, '""')}"`);
              dbCreatedNow = true;
              console.log(`✅ Banco de dados "${targetDbName}" criado com sucesso no host PostgreSQL ${h}:${port}!`);
            }
            await adminPool.end().catch(() => {});
            break;
          } catch (adminErr: any) {
            lastErrorMessage = adminErr.message || 'Erro de autenticação ou host inacessível';
            await adminPool.end().catch(() => {});
          }
        }

        // 2. Conectar diretamente ao banco alvo da empresa
        const targetPool = new Pool({
          host: h,
          port,
          user: u,
          password: p,
          database: targetDbName,
          connectionTimeoutMillis: 3500
        });

        try {
          await targetPool.query('SELECT 1');

          // Garantir estrutura mínima de tabelas no banco da empresa
          await targetPool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
              id SERIAL PRIMARY KEY,
              nome VARCHAR(255) NOT NULL,
              email VARCHAR(255) UNIQUE NOT NULL,
              ativo BOOLEAN DEFAULT true,
              criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);

          await targetPool.end().catch(() => {});
          connectionEstablished = true;
          successfulHost = h;
          successfulUser = u;
          successfulPass = p;
          break outerLoop;
        } catch (targetErr: any) {
          lastErrorMessage = targetErr.message || 'Erro de conexão no banco alvo';
          await targetPool.end().catch(() => {});
        }
      }
    }
  }

  if (connectionEstablished) {
    return res.json({
      success: true,
      message: dbCreatedNow 
        ? `Novo banco "${targetDbName}" criado com sucesso no host ${successfulHost}:${port} (Usuário: ${successfulUser})!`
        : `Conexão estabelecida com sucesso! Banco "${targetDbName}" no host ${successfulHost}:${port} está online e pronto.`,
      resolvedHost: successfulHost,
      resolvedUser: successfulUser,
      resolvedPass: successfulPass
    });
  }

  res.status(500).json({
    error: `Falha na conexão DB (${reqHost || 'localhost'}:${port}): ${lastErrorMessage}. Dica: No ambiente Docker/Portainer use o host "db" ou IP e o usuário "${process.env.DB_USER || 'regz_user'}".`
  });
});

// Listar licenças de uma empresa
app.get('/api/empresas/:id/licencas', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // 1. Auto-vínculo de licenças sem empresa_id cujos usuários pertençam a esta empresa
    await pool.query(`
      UPDATE chaves_licenca l
      SET empresa_id = u.empresa_id
      FROM usuarios u
      WHERE l.usuario_id = u.id AND l.empresa_id IS NULL AND u.empresa_id IS NOT NULL
    `);

    // 2. Auto-vínculo para chaves soltas sem usuario_id e sem empresa_id criadas durante testes
    if (id) {
      await pool.query(`
        UPDATE chaves_licenca
        SET empresa_id = $1
        WHERE empresa_id IS NULL AND usuario_id IS NULL
      `, [id]);
    }

    const query = `
      SELECT l.id, l.chave, l.usuario_id, l.empresa_id, l.tipo_licenca, l.data_ativacao, l.data_expiracao, l.status,
             (l.data_expiracao::date - CURRENT_DATE)::int as dias_restantes,
             u.nome as usuario_nome, u.email as usuario_email
      FROM chaves_licenca l
      LEFT JOIN usuarios u ON l.usuario_id = u.id
      WHERE l.empresa_id = $1 OR u.empresa_id = $1
      ORDER BY l.id DESC
    `;
    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar licenças da empresa' });
  }
});

// Listar usuários de uma empresa específica
app.get('/api/empresas/:id/usuarios', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT u.id, u.nome, u.email, u.ativo, u.perfil_id, u.criado_em, u.chave_licenca, u.is_super_admin,
             p.nome as perfil_nome, p.is_admin,
             l.chave as licenca_chave, l.tipo_licenca, l.status as status_licenca,
             (l.data_expiracao::date - CURRENT_DATE)::int as dias_restantes_licenca
      FROM usuarios u
      LEFT JOIN perfis_acesso p ON u.perfil_id = p.id
      LEFT JOIN chaves_licenca l ON (l.chave = u.chave_licenca OR l.usuario_id = u.id)
      WHERE u.empresa_id = $1 OR ($1 = '1' AND u.empresa_id IS NULL)
      ORDER BY u.id ASC
    `;
    const result = await pool.query(query, [id]);
    const usuariosFormatados = result.rows.map(u => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      ativo: u.ativo,
      perfil_id: u.perfil_id,
      perfil_nome: u.perfil_nome,
      is_admin: !!u.is_admin,
      chave_licenca: u.chave_licenca || u.licenca_chave || null,
      tipo_licenca: u.tipo_licenca || 'Enterprise',
      status_licenca: u.status_licenca || 'Ativa',
      dias_restantes_licenca: typeof u.dias_restantes_licenca === 'number' ? u.dias_restantes_licenca : 30
    }));
    res.json(usuariosFormatados);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar usuários da empresa' });
  }
});

// Excluir usuário
app.delete('/api/usuarios/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json({ success: true, message: 'Usuário removido com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao remover usuário' });
  }
});

// ==========================================
// ROTA DA API CBO BRASIL (CONSULTA INTERNA DE CARGOS)
// ==========================================
app.get('/api/cbo/search', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  
  if (!query) {
    return res.json(CBO_DATASET);
  }

  const filtered = CBO_DATASET.filter(item => 
    item.titulo.toLowerCase().includes(query) ||
    item.codigo.includes(query)
  );

  res.json(filtered);
});

// Listar todos os cargos do catálogo
app.get('/api/cargos', async (req: Request, res: Response) => {
  const q = (req.query.q as string || '').toLowerCase().trim();
  try {
    let queryStr = 'SELECT * FROM cargos';
    const params: any[] = [];

    if (q) {
      queryStr += ' WHERE LOWER(nome) LIKE $1 OR LOWER(codigo_cbo) LIKE $1';
      params.push(`%${q}%`);
    }

    queryStr += ' ORDER BY nome ASC';
    const result = await pool.query(queryStr, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar cargos' });
  }
});

// ==========================================
// ROTAS CRUD DE CAMPOS CUSTOMIZADOS
// ==========================================

// Listar todos os campos customizados definidos
app.get('/api/campos-customizados', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM campos_customizados ORDER BY id ASC');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar campos customizados' });
  }
});

// Cadastrar novo campo customizado
app.post('/api/campos-customizados', checkPermission('campos'), async (req: Request, res: Response) => {
  const { nome, tipo, opcoes, obrigatorio, min_caracteres, max_caracteres } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'O nome do campo é obrigatório' });
  }

  try {
    const nomeTrimmed = nome.trim();
    const existing = await pool.query('SELECT id FROM campos_customizados WHERE LOWER(nome) = LOWER($1)', [nomeTrimmed]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Um campo com este nome já foi criado' });
    }

    const minVal = min_caracteres !== undefined && min_caracteres !== null && min_caracteres !== '' ? Number(min_caracteres) : null;
    const maxVal = max_caracteres !== undefined && max_caracteres !== null && max_caracteres !== '' ? Number(max_caracteres) : null;

    const result = await pool.query(
      'INSERT INTO campos_customizados (nome, tipo, opcoes, obrigatorio, min_caracteres, max_caracteres) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nomeTrimmed, tipo || 'texto', opcoes || null, !!obrigatorio, minVal, maxVal]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao cadastrar campo customizado' });
  }
});

// Excluir um campo customizado
app.delete('/api/campos-customizados/:id', checkPermission('campos'), async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM campos_customizados WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campo customizado não encontrado' });
    }
    res.json({ success: true, message: 'Campo removido com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao remover campo customizado' });
  }
});

// Buscar valores dos campos customizados de um colaborador específico
app.get('/api/colaboradores/:id/valores-customizados', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT v.campo_id, c.nome as campo_nome, v.valor 
       FROM colaboradores_valores_customizados v
       JOIN campos_customizados c ON v.campo_id = c.id
       WHERE v.colaborador_id = $1`,
      [id]
    );
    
    const mapaValores: Record<number, string> = {};
    result.rows.forEach((row: any) => {
      mapaValores[row.campo_id] = row.valor;
    });

    res.json(mapaValores);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar valores customizados' });
  }
});

// Salvar/Atualizar valores dos campos customizados de um colaborador
app.put('/api/colaboradores/:id/valores-customizados', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { valores } = req.body;

  if (!valores || typeof valores !== 'object') {
    return res.status(400).json({ error: 'Valores customizados devem ser fornecidos como um objeto' });
  }

  try {
    for (const [campoIdStr, val] of Object.entries(valores)) {
      const campoId = parseInt(campoIdStr, 10);
      const valStr = String(val ?? '').trim();

      if (valStr) {
        await pool.query(
          `INSERT INTO colaboradores_valores_customizados (colaborador_id, campo_id, valor)
           VALUES ($1, $2, $3)
           ON CONFLICT (colaborador_id, campo_id) DO UPDATE SET valor = EXCLUDED.valor`,
          [id, campoId, valStr]
        );
      } else {
        await pool.query(
          `DELETE FROM colaboradores_valores_customizados WHERE colaborador_id = $1 AND campo_id = $2`,
          [id, campoId]
        );
      }
    }

    res.json({ success: true, message: 'Valores customizados salvos com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao salvar valores customizados' });
  }
});

// ==========================================
// ROTA DE GEOCODIFICAÇÃO DE PRECISÃO
// ==========================================
app.get('/api/geocode', async (req: Request, res: Response) => {
  const { logradouro, numero, cidade, estado, cep } = req.query;
  const coords = await fetchGeocodingHighPrecision(
    logradouro as string,
    numero as string,
    cidade as string,
    estado as string,
    cep as string
  );
  res.json(coords);
});

// ==========================================
// ROTA GERADOR DE PESSOA (4DEVS / FALLBACK)
// ==========================================
app.get('/api/gerar-pessoa', async (req: Request, res: Response) => {
  let pessoaGerada: any = null;

  let cargoSorteado = 'Analista de desenvolvimento de sistemas';
  try {
    const cargosRes = await pool.query('SELECT nome FROM cargos');
    if (cargosRes.rows.length > 0) {
      const idx = Math.floor(Math.random() * cargosRes.rows.length);
      cargoSorteado = cargosRes.rows[idx].nome;
    }
  } catch (e) { /* fallback */ }

  try {
    const params = new URLSearchParams({
      acao: 'gerar_pessoa',
      sexo: 'I',
      pontuacao: 'S',
      idade: '0',
      cep_estado: '',
      cep_cidade: ''
    });

    const response = await fetch('https://www.4devs.com.br/ferramentas_online.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (response.ok) {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        const p = Array.isArray(data) ? data[0] : data;

        if (p && p.nome && p.cpf) {
          const imgIndex = Math.floor(Math.random() * 70) + 1;
          const coords = await fetchGeocodingHighPrecision(p.endereco, p.numero ? String(p.numero) : '100', p.cidade, p.estado, p.cep);

          pessoaGerada = {
            nome: p.nome,
            cpf: p.cpf,
            cargo: cargoSorteado,
            cep: p.cep || '01001-000',
            logradouro: p.endereco || 'Avenida Principal',
            numero: p.numero ? String(p.numero) : String(Math.floor(Math.random() * 800) + 20),
            complemento: p.complemento || '',
            bairro: p.bairro || 'Centro',
            cidade: p.cidade || 'São Paulo',
            estado: p.estado || 'SP',
            latitude: coords.lat || -23.5505,
            longitude: coords.lon || -46.6333,
            foto_url: `https://i.pravatar.cc/300?img=${imgIndex}`
          };
        }
      } catch (e) {
        // Fallback
      }
    }
  } catch (err) {
    console.log('4Devs API inacessível, utilizando gerador nativo...');
  }

  if (!pessoaGerada) {
    const nomeRandom = NOMES_EXEMPLO[Math.floor(Math.random() * NOMES_EXEMPLO.length)];
    const cpfRandom = gerarCpfValido();
    const endRandom = ENDERECOS_EXEMPLO[Math.floor(Math.random() * ENDERECOS_EXEMPLO.length)];
    const imgIndex = Math.floor(Math.random() * 70) + 1;
    const numRandom = String(Math.floor(Math.random() * 950) + 15);
    const coords = await fetchGeocodingHighPrecision(endRandom.logradouro, numRandom, endRandom.cidade, endRandom.estado, endRandom.cep);

    pessoaGerada = {
      nome: nomeRandom,
      cpf: cpfRandom,
      cargo: cargoSorteado,
      cep: endRandom.cep,
      logradouro: endRandom.logradouro,
      numero: numRandom,
      complemento: '',
      bairro: endRandom.bairro,
      cidade: endRandom.cidade,
      estado: endRandom.estado,
      latitude: coords.lat || endRandom.lat,
      longitude: coords.lon || endRandom.lon,
      foto_url: `https://i.pravatar.cc/300?img=${imgIndex}`
    };
  }

  return res.json(pessoaGerada);
});

// ==========================================
// ROTAS CRUD DE COLABORADORES
// ==========================================

// Listar todos os colaboradores
app.get('/api/colaboradores', async (req: Request, res: Response) => {
  const { status } = req.query;
  try {
    let query = 'SELECT * FROM colaboradores';
    const values: any[] = [];

    if (status === 'ativos') {
      query += ' WHERE ativo = true';
    } else if (status === 'inativos') {
      query += ' WHERE ativo = false';
    }

    query += ' ORDER BY id DESC';
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar colaboradores' });
  }
});

// Buscar colaborador por ID
app.get('/api/colaboradores/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM colaboradores WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar colaborador' });
  }
});

// Cadastrar novo colaborador
app.post('/api/colaboradores', checkPermission('colaboradores'), async (req: Request, res: Response) => {
  const { nome, cpf, cargo, cep, logradouro, numero, complemento, bairro, cidade, estado, latitude, longitude, foto_url, valores_customizados } = req.body;

  if (!nome || !cpf) {
    return res.status(400).json({ error: 'Campos Nome e CPF são obrigatórios' });
  }

  try {
    const existingCpf = await pool.query('SELECT id FROM colaboradores WHERE cpf = $1', [cpf]);
    if (existingCpf.rows.length > 0) {
      return res.status(400).json({ error: 'Este CPF já está cadastrado' });
    }

    let finalLat = latitude;
    let finalLon = longitude;
    if (!finalLat && (logradouro || cidade || cep)) {
      const coords = await fetchGeocodingHighPrecision(logradouro, numero, cidade, estado, cep);
      finalLat = coords.lat;
      finalLon = coords.lon;
    }

    const result = await pool.query(
      `INSERT INTO colaboradores 
      (nome, cpf, cargo, cep, logradouro, numero, complemento, bairro, cidade, estado, latitude, longitude, foto_url, ativo) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true) 
      RETURNING *`,
      [nome, cpf, cargo || null, cep || null, logradouro || null, numero || null, complemento || null, bairro || null, cidade || null, estado || null, finalLat || null, finalLon || null, foto_url || null]
    );

    const novoColaborador = result.rows[0];

    if (valores_customizados && typeof valores_customizados === 'object') {
      for (const [campoIdStr, val] of Object.entries(valores_customizados)) {
        const campoId = parseInt(campoIdStr, 10);
        const valStr = String(val ?? '').trim();
        if (valStr) {
          await pool.query(
            'INSERT INTO colaboradores_valores_customizados (colaborador_id, campo_id, valor) VALUES ($1, $2, $3)',
            [novoColaborador.id, campoId, valStr]
          );
        }
      }
    }

    res.status(201).json(novoColaborador);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao cadastrar colaborador' });
  }
});

// Atualizar colaborador
app.put('/api/colaboradores/:id', checkPermission('colaboradores'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, cpf, cargo, cep, logradouro, numero, complemento, bairro, cidade, estado, latitude, longitude, foto_url, valores_customizados } = req.body;

  if (!nome || !cpf) {
    return res.status(400).json({ error: 'Campos Nome e CPF são obrigatórios' });
  }

  try {
    const existingCpf = await pool.query('SELECT id FROM colaboradores WHERE cpf = $1 AND id != $2', [cpf, id]);
    if (existingCpf.rows.length > 0) {
      return res.status(400).json({ error: 'Este CPF pertence a outro colaborador' });
    }

    let finalLat = latitude;
    let finalLon = longitude;
    if (!finalLat && (logradouro || cidade || cep)) {
      const coords = await fetchGeocodingHighPrecision(logradouro, numero, cidade, estado, cep);
      finalLat = coords.lat;
      finalLon = coords.lon;
    }

    const result = await pool.query(
      `UPDATE colaboradores 
       SET nome = $1, cpf = $2, cargo = $3, cep = $4, logradouro = $5, numero = $6, complemento = $7, bairro = $8, cidade = $9, estado = $10, latitude = $11, longitude = $12, foto_url = $13 
       WHERE id = $14 
       RETURNING *`,
      [nome, cpf, cargo || null, cep || null, logradouro || null, numero || null, complemento || null, bairro || null, cidade || null, estado || null, finalLat || null, finalLon || null, foto_url || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    if (valores_customizados && typeof valores_customizados === 'object') {
      for (const [campoIdStr, val] of Object.entries(valores_customizados)) {
        const campoId = parseInt(campoIdStr, 10);
        const valStr = String(val ?? '').trim();

        if (valStr) {
          await pool.query(
            `INSERT INTO colaboradores_valores_customizados (colaborador_id, campo_id, valor)
             VALUES ($1, $2, $3)
             ON CONFLICT (colaborador_id, campo_id) DO UPDATE SET valor = EXCLUDED.valor`,
            [id, campoId, valStr]
          );
        } else {
          await pool.query(
            `DELETE FROM colaboradores_valores_customizados WHERE colaborador_id = $1 AND campo_id = $2`,
            [id, campoId]
          );
        }
      }
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao atualizar colaborador' });
  }
});

// Inativar colaborador (Soft Delete)
app.put('/api/colaboradores/:id/inativar', checkPermission('colaboradores'), async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('UPDATE colaboradores SET ativo = false WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }
    res.json({ success: true, message: 'Colaborador inativado com sucesso', colaborador: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao inativar colaborador' });
  }
});

// Reativar colaborador
app.put('/api/colaboradores/:id/reativar', checkPermission('colaboradores'), async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('UPDATE colaboradores SET ativo = true WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }
    res.json({ success: true, message: 'Colaborador reativado com sucesso', colaborador: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao reativar colaborador' });
  }
});

// Excluir permanentemente
app.delete('/api/colaboradores/:id', checkPermission('colaboradores'), async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM colaboradores WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }
    res.json({ success: true, message: 'Colaborador removido permanentemente' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao remover colaborador' });
  }
});

// Servir arquivos estáticos do Frontend React e Roteamento SPA em Produção
const publicPath = path.join(__dirname, '../public');
if (fs.existsSync(publicPath)) {
  console.log(`📦 Servindo arquivos estáticos do frontend a partir de: ${publicPath}`);
  app.use(express.static(publicPath));

  app.get('*', (req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Rota de API não encontrada' });
    }
    res.sendFile(path.join(publicPath, 'index.html'));
  });
} else {
  // Rota de recepção padrão para desenvolvimento isolado do backend
  app.get('/', (req: Request, res: Response) => {
    res.json({
      message: '🚀 Regz API - Gestão de Colaboradores, Autenticação JWT e RBAC',
      endpoints: {
        health: '/api/health',
        dbStatus: '/api/db-status',
        authLogin: '/api/auth/login',
        authMe: '/api/auth/me',
        usuarios: '/api/usuarios',
        perfisAcesso: '/api/perfis-acesso',
        colaboradores: '/api/colaboradores',
        cargos: '/api/cargos',
        camposCustomizados: '/api/campos-customizados',
        cboSearch: '/api/cbo/search'
      }
    });
  });
}

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`⚡️ Servidor Regz Backend rodando na porta ${PORT}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`========================================`);
});
