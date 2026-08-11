import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

// Inicialização e migrations do banco de dados
const initDb = async () => {
  try {
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
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
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
    service: 'regz-backend',
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
// ROTAS DE AUTENTICAÇÃO E LOGIN (JWT / BCRYPT)
// ==========================================

// Login de Usuário (Sem Auto-Registro)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  try {
    const query = `
      SELECT u.id, u.nome, u.email, u.senha_hash, u.ativo, u.perfil_id,
             p.nome as perfil_nome, p.descricao as perfil_descricao, p.is_admin, p.permissoes
      FROM usuarios u
      LEFT JOIN perfis_acesso p ON u.perfil_id = p.id
      WHERE LOWER(u.email) = LOWER($1)
    `;
    const result = await pool.query(query, [email.trim()]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    const usuario = result.rows[0];

    if (!usuario.ativo) {
      return res.status(403).json({ error: 'Esta conta de usuário está inativa. Contate o Administrador.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    const perfil = {
      id: usuario.perfil_id,
      nome: usuario.perfil_nome || 'Usuário Sem Perfil',
      descricao: usuario.perfil_descricao,
      is_admin: !!usuario.is_admin,
      permissoes: usuario.permissoes || { home: 'escrita', colaboradores: 'escrita', campos: 'escrita', administracao: 'escrita' }
    };

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
        perfil
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
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const query = `
      SELECT u.id, u.nome, u.email, u.ativo, u.perfil_id,
             p.nome as perfil_nome, p.descricao as perfil_descricao, p.is_admin, p.permissoes
      FROM usuarios u
      LEFT JOIN perfis_acesso p ON u.perfil_id = p.id
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

    res.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        ativo: usuario.ativo,
        perfil
      }
    });
  } catch (error: any) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
});

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
app.post('/api/perfis-acesso', async (req: Request, res: Response) => {
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
app.put('/api/perfis-acesso/:id', async (req: Request, res: Response) => {
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
app.delete('/api/perfis-acesso/:id', async (req: Request, res: Response) => {
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

// Listar todos os usuários com dados do perfil
app.get('/api/usuarios', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT u.id, u.nome, u.email, u.ativo, u.perfil_id, u.criado_em,
             p.nome as perfil_nome, p.is_admin, p.permissoes
      FROM usuarios u
      LEFT JOIN perfis_acesso p ON u.perfil_id = p.id
      ORDER BY u.id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar usuários' });
  }
});

// Cadastrar novo usuário (Apenas via Painel Admin)
app.post('/api/usuarios', async (req: Request, res: Response) => {
  const { nome, email, senha, perfil_id, ativo } = req.body;

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
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, perfil_id, ativo) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, perfil_id, ativo, criado_em',
      [nome.trim(), emailTrimmed, senhaHash, perfil_id || null, ativo !== false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao cadastrar usuário' });
  }
});

// Atualizar usuário
app.put('/api/usuarios/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, email, senha, perfil_id, ativo } = req.body;

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
        'UPDATE usuarios SET nome = $1, email = $2, senha_hash = $3, perfil_id = $4, ativo = $5 WHERE id = $6',
        [nome.trim(), emailTrimmed, senhaHash, perfil_id || null, ativo !== false, id]
      );
    } else {
      await pool.query(
        'UPDATE usuarios SET nome = $1, email = $2, perfil_id = $3, ativo = $4 WHERE id = $5',
        [nome.trim(), emailTrimmed, perfil_id || null, ativo !== false, id]
      );
    }

    const resUser = await pool.query(
      'SELECT id, nome, email, perfil_id, ativo, criado_em FROM usuarios WHERE id = $1',
      [id]
    );

    res.json(resUser.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao atualizar usuário' });
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
app.post('/api/campos-customizados', async (req: Request, res: Response) => {
  const { nome, tipo, opcoes, obrigatorio } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'O nome do campo é obrigatório' });
  }

  try {
    const nomeTrimmed = nome.trim();
    const existing = await pool.query('SELECT id FROM campos_customizados WHERE LOWER(nome) = LOWER($1)', [nomeTrimmed]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Um campo com este nome já foi criado' });
    }

    const result = await pool.query(
      'INSERT INTO campos_customizados (nome, tipo, opcoes, obrigatorio) VALUES ($1, $2, $3, $4) RETURNING *',
      [nomeTrimmed, tipo || 'texto', opcoes || null, !!obrigatorio]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao cadastrar campo customizado' });
  }
});

// Excluir um campo customizado
app.delete('/api/campos-customizados/:id', async (req: Request, res: Response) => {
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
app.post('/api/colaboradores', async (req: Request, res: Response) => {
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
app.put('/api/colaboradores/:id', async (req: Request, res: Response) => {
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
app.put('/api/colaboradores/:id/inativar', async (req: Request, res: Response) => {
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
app.put('/api/colaboradores/:id/reativar', async (req: Request, res: Response) => {
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
app.delete('/api/colaboradores/:id', async (req: Request, res: Response) => {
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

// Root welcome route
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

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`⚡️ Servidor Regz Backend rodando na porta ${PORT}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`========================================`);
});
