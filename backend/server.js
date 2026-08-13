import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import { seedDatabase } from './scripts/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Root welcome status handler for Render
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'Military Asset Management Command System API',
    status: 'ONLINE',
    database: 'Neon Cloud PostgreSQL (ACID Compliant)',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/login',
      dashboard: '/api/assets/dashboard',
      purchases: '/api/purchases',
      transfers: '/api/transfers',
      assignments: '/api/assignments',
      auditLogs: '/api/audit-logs'
    }
  });
});

// Routes Registration
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/audit-logs', auditRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Military Asset Management System Backend API is active.' });
});

// Auto Seed Database & Start Server
const startServer = async () => {
  try {
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`Military Asset Management API Server running on port ${PORT}`);
      console.log(`Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
