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

// Inicialização e migrations da tabela de colaboradores
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS colaboradores (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cpf VARCHAR(14) NOT NULL UNIQUE,
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
      ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,8);
      ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS longitude NUMERIC(11,8);
    `);

    console.log('✅ Tabela "colaboradores" inicializada com suporte a Geolocalização Métrica (CEP + Número)!');
  } catch (error) {
    console.error('⚠️ Erro ao inicializar a tabela "colaboradores":', error);
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
  { cep: '40020-000', logradouro: 'Avenida Sete de Setembro', bairro: 'Vitória', cidade: 'Salvador', estado: 'BA', lat: -12.9714, lon: -38.5014 }
];

// Algoritmo de Geolocalização Métrica Brasileira (CEP + Número da Casa = Distância em Metros + Lado Par/Ímpar)
const fetchGeocodingMetric = async (logradouro?: string, numeroStr?: string, cidade?: string, estado?: string, cep?: string) => {
  try {
    // Passo 1: Obter as coordenadas base da rua / CEP
    let latBase: number | null = null;
    let lonBase: number | null = null;

    // Tentar primeiro pelo CEP ou Rua + Cidade
    const queryParts = [cep || logradouro, cidade, estado, 'Brasil'].filter(Boolean).join(', ');
    if (queryParts) {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryParts)}&limit=1`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'RegzApp/1.0 (contact@regz.app)' }
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          latBase = parseFloat(data[0].lat);
          lonBase = parseFloat(data[0].lon);
        }
      }
    }

    if (!latBase || !lonBase) {
      return { lat: null, lon: null };
    }

    // Passo 2: Se houver número da casa, aplicar o cálculo métrico (distância em metros do início da rua + lado par/ímpar)
    const numMeters = numeroStr ? parseInt(numeroStr.replace(/\D/g, ''), 10) : 0;
    
    if (!isNaN(numMeters) && numMeters > 0) {
      // 1 metro em latitude aproximadamente equivale a 0.00000899 graus
      const metersToLat = 0.00000899;
      // 1 metro em longitude depende da latitude atual
      const metersToLon = 0.00000899 / Math.cos(latBase * (Math.PI / 180));

      // Lado da via: Par (Direita, offset positivo) vs Ímpar (Esquerda, offset negativo)
      const isEven = numMeters % 2 === 0;
      const sideMultiplier = isEven ? 1 : -1;
      const sideOffsetMeters = 6 * sideMultiplier; // ~6 metros de afastamento perpendicular da via

      // Deslocamento métrico no sentido da via + lado da rua
      const latCalculated = latBase + (numMeters * metersToLat * 0.7) + (sideOffsetMeters * metersToLat * 0.3);
      const lonCalculated = lonBase + (numMeters * metersToLon * 0.7) - (sideOffsetMeters * metersToLon * 0.3);

      return {
        lat: parseFloat(latCalculated.toFixed(8)),
        lon: parseFloat(lonCalculated.toFixed(8))
      };
    }

    return { lat: latBase, lon: lonBase };
  } catch (err) {
    console.error('Erro na geocodificação métrica:', err);
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

// Rota de geocodificação métrica (OpenStreetMap + Regra Brasileira)
app.get('/api/geocode', async (req: Request, res: Response) => {
  const { logradouro, numero, cidade, estado, cep } = req.query;
  const coords = await fetchGeocodingMetric(
    logradouro as string,
    numero as string,
    cidade as string,
    estado as string,
    cep as string
  );
  res.json(coords);
});

// Rota gerador de pessoas (4Devs / Fallback)
app.get('/api/gerar-pessoa', async (req: Request, res: Response) => {
  let pessoaGerada: any = null;

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
          const coords = await fetchGeocodingMetric(p.endereco, p.numero ? String(p.numero) : '100', p.cidade, p.estado, p.cep);

          pessoaGerada = {
            nome: p.nome,
            cpf: p.cpf,
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
    const coords = await fetchGeocodingMetric(endRandom.logradouro, numRandom, endRandom.cidade, endRandom.estado, endRandom.cep);

    pessoaGerada = {
      nome: nomeRandom,
      cpf: cpfRandom,
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

// Cadastrar novo colaborador
app.post('/api/colaboradores', async (req: Request, res: Response) => {
  const { nome, cpf, cep, logradouro, numero, complemento, bairro, cidade, estado, latitude, longitude, foto_url } = req.body;

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
      const coords = await fetchGeocodingMetric(logradouro, numero, cidade, estado, cep);
      finalLat = coords.lat;
      finalLon = coords.lon;
    }

    const result = await pool.query(
      `INSERT INTO colaboradores 
      (nome, cpf, cep, logradouro, numero, complemento, bairro, cidade, estado, latitude, longitude, foto_url, ativo) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true) 
      RETURNING *`,
      [nome, cpf, cep || null, logradouro || null, numero || null, complemento || null, bairro || null, cidade || null, estado || null, finalLat || null, finalLon || null, foto_url || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao cadastrar colaborador' });
  }
});

// Atualizar colaborador
app.put('/api/colaboradores/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, cpf, cep, logradouro, numero, complemento, bairro, cidade, estado, latitude, longitude, foto_url } = req.body;

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
      const coords = await fetchGeocodingMetric(logradouro, numero, cidade, estado, cep);
      finalLat = coords.lat;
      finalLon = coords.lon;
    }

    const result = await pool.query(
      `UPDATE colaboradores 
       SET nome = $1, cpf = $2, cep = $3, logradouro = $4, numero = $5, complemento = $6, bairro = $7, cidade = $8, estado = $9, latitude = $10, longitude = $11, foto_url = $12 
       WHERE id = $13 
       RETURNING *`,
      [nome, cpf, cep || null, logradouro || null, numero || null, complemento || null, bairro || null, cidade || null, estado || null, finalLat || null, finalLon || null, foto_url || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao atualizar colaborador' });
  }
});

// Listar colaboradores
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
    message: '🚀 Regz API - Sistema de Gestão de Colaboradores',
    endpoints: {
      health: '/api/health',
      dbStatus: '/api/db-status',
      colaboradores: '/api/colaboradores',
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
