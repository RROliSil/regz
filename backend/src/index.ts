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

// Root welcome route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🚀 Regz Backend API operando com sucesso!',
    endpoints: {
      health: '/api/health',
      dbStatus: '/api/db-status'
    }
  });
});

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`⚡️ Servidor Backend rodando na porta ${PORT}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`========================================`);
});
