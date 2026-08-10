import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Configurar limites de payload maiores para upload de fotos em Base64
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

// Inicialização da tabela de colaboradores
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
        foto_url TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela "colaboradores" inicializada com sucesso no PostgreSQL!');
  } catch (error) {
    console.error('⚠️ Erro ao inicializar a tabela "colaboradores":', error);
  }
};

initDb();

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
// ROTAS CRUD DE COLABORADORES
// ==========================================

// Listar todos os colaboradores
app.get('/api/colaboradores', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM colaboradores ORDER BY id DESC');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar colaboradores' });
  }
});

// Buscar um colaborador por ID
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
  const { nome, cpf, cep, logradouro, numero, complemento, bairro, cidade, estado, foto_url } = req.body;

  if (!nome || !cpf) {
    return res.status(400).json({ error: 'Campos Nome e CPF são obrigatórios' });
  }

  try {
    // Verificar se o CPF já está cadastrado
    const existingCpf = await pool.query('SELECT id FROM colaboradores WHERE cpf = $1', [cpf]);
    if (existingCpf.rows.length > 0) {
      return res.status(400).json({ error: 'Este CPF já está cadastrado' });
    }

    const result = await pool.query(
      `INSERT INTO colaboradores 
      (nome, cpf, cep, logradouro, numero, complemento, bairro, cidade, estado, foto_url) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`,
      [nome, cpf, cep || null, logradouro || null, numero || null, complemento || null, bairro || null, cidade || null, estado || null, foto_url || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao cadastrar colaborador' });
  }
});

// Atualizar dados de um colaborador
app.put('/api/colaboradores/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, cpf, cep, logradouro, numero, complemento, bairro, cidade, estado, foto_url } = req.body;

  if (!nome || !cpf) {
    return res.status(400).json({ error: 'Campos Nome e CPF são obrigatórios' });
  }

  try {
    // Verificar se o CPF pertence a outro colaborador
    const existingCpf = await pool.query('SELECT id FROM colaboradores WHERE cpf = $1 AND id != $2', [cpf, id]);
    if (existingCpf.rows.length > 0) {
      return res.status(400).json({ error: 'Este CPF pertence a outro colaborador' });
    }

    const result = await pool.query(
      `UPDATE colaboradores 
       SET nome = $1, cpf = $2, cep = $3, logradouro = $4, numero = $5, complemento = $6, bairro = $7, cidade = $8, estado = $9, foto_url = $10 
       WHERE id = $11 
       RETURNING *`,
      [nome, cpf, cep || null, logradouro || null, numero || null, complemento || null, bairro || null, cidade || null, estado || null, foto_url || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao atualizar colaborador' });
  }
});

// Excluir colaborador
app.delete('/api/colaboradores/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM colaboradores WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }
    res.json({ success: true, message: 'Colaborador removido com sucesso' });
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
      colaboradores: '/api/colaboradores'
    }
  });
});

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`⚡️ Servidor Regz Backend rodando na porta ${PORT}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`========================================`);
});
