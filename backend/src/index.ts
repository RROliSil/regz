import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

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

// Base de Ocupações Oficiais CBO (Classificação Brasileira de Ocupações - MTE/Brasil)
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

// Inicialização e migrations do banco de dados (tabelas cargos e colaboradores)
const initDb = async () => {
  try {
    // 1. Tabela de Cargos (Catálogo de funções com suporte a código CBO)
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

    // Inserir cargos padrão se a tabela estiver vazia
    const countCargos = await pool.query('SELECT COUNT(*) FROM cargos');
    if (parseInt(countCargos.rows[0].count, 10) === 0) {
      const cargosIniciais = [
        { nome: 'Desenvolvedor(a) Full Stack', cbo: '2124-05' },
        { nome: 'Gerente de Projetos', cbo: '1425-05' },
        { nome: 'Analista de Recursos Humanos', cbo: '2524-05' },
        { nome: 'Designer UX/UI', cbo: '2624-10' },
        { nome: 'Contador(a)', cbo: '2522-05' },
        { nome: 'Analista Financeiro', cbo: '2525-25' },
        { nome: 'Assistente Administrativo', cbo: '4110-10' }
      ];

      for (const item of cargosIniciais) {
        await pool.query(
          'INSERT INTO cargos (nome, codigo_cbo) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [item.nome, item.cbo]
        );
      }
      console.log('✅ Cargos padrão CBO inicializados no banco de dados!');
    }

    // 2. Tabela de Colaboradores
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

    console.log('✅ Tabelas "cargos" e "colaboradores" inicializadas com sucesso no PostgreSQL!');
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
// ROTA DA API CBO BRASIL (CONSULTA EM TEMPO REAL)
// ==========================================
app.get('/api/cbo/search', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  
  if (!query) {
    return res.json(CBO_DATASET.slice(0, 15));
  }

  const filtered = CBO_DATASET.filter(item => 
    item.titulo.toLowerCase().includes(query) ||
    item.codigo.includes(query)
  ).slice(0, 25);

  res.json(filtered);
});

// ==========================================
// ROTAS DE CARGOS (CATÁLOGO DE FUNÇÕES)
// ==========================================

// Listar todos os cargos cadastrados
app.get('/api/cargos', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM cargos ORDER BY nome ASC');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar cargos' });
  }
});

// Cadastrar novo cargo (suporta codigo_cbo opcional)
app.post('/api/cargos', async (req: Request, res: Response) => {
  const { nome, codigo_cbo } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'O nome do cargo é obrigatório' });
  }

  try {
    const nomeTrimmed = nome.trim();
    const existing = await pool.query('SELECT id FROM cargos WHERE LOWER(nome) = LOWER($1)', [nomeTrimmed]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Este cargo já está cadastrado no catálogo' });
    }

    const result = await pool.query(
      'INSERT INTO cargos (nome, codigo_cbo) VALUES ($1, $2) RETURNING *',
      [nomeTrimmed, codigo_cbo || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao cadastrar cargo' });
  }
});

// Excluir um cargo do catálogo
app.delete('/api/cargos/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM cargos WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cargo não encontrado' });
    }
    res.json({ success: true, message: 'Cargo removido com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao remover cargo' });
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

  // Buscar cargos disponíveis no banco de dados para sortear um
  let cargoSorteado = 'Desenvolvedor(a) Full Stack';
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
  const { nome, cpf, cargo, cep, logradouro, numero, complemento, bairro, cidade, estado, latitude, longitude, foto_url } = req.body;

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

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao cadastrar colaborador' });
  }
});

// Atualizar colaborador
app.put('/api/colaboradores/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, cpf, cargo, cep, logradouro, numero, complemento, bairro, cidade, estado, latitude, longitude, foto_url } = req.body;

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
    message: '🚀 Regz API - Sistema de Gestão de Colaboradores com CBO Brasil',
    endpoints: {
      health: '/api/health',
      dbStatus: '/api/db-status',
      colaboradores: '/api/colaboradores',
      cargos: '/api/cargos',
      cboSearch: '/api/cbo/search',
      gerarPessoa: '/api/gerar-pessoa',
      geocode: '/api/geocode'
    }
  });
});

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`⚡️ Servidor Regz Backend rodando na porta ${PORT}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`========================================`);
});
