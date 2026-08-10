import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'regz_user',
  password: process.env.DB_PASSWORD || 'regz_password',
  database: process.env.DB_NAME || 'regz_db',
  connectionTimeoutMillis: 5000,
});

// Inicialização das tabelas no banco
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teste (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela "teste" verificada/criada com sucesso no PostgreSQL!');
  } catch (error) {
    console.error('⚠️ Erro ao inicializar a tabela "teste":', error);
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

// Rotas CRUD para a tabela 'teste'
app.get('/api/teste', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM teste ORDER BY id DESC');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar registros da tabela teste' });
  }
});

app.post('/api/teste', async (req: Request, res: Response) => {
  const { nome, descricao } = req.body;
  if (!nome) {
    return res.status(400).json({ error: 'O campo "nome" é obrigatório' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO teste (nome, descricao) VALUES ($1, $2) RETURNING *',
      [nome, descricao || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao inserir registro na tabela teste' });
  }
});

app.delete('/api/teste/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM teste WHERE id = $1', [id]);
    res.json({ success: true, message: `Registro ${id} removido com sucesso` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao excluir registro' });
  }
});

// Root welcome route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🚀 Regz Backend API operando com sucesso!',
    endpoints: {
      health: '/api/health',
      dbStatus: '/api/db-status',
      testeList: '/api/teste'
    }
  });
});

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`⚡️ Servidor Backend rodando na porta ${PORT}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`========================================`);
});
