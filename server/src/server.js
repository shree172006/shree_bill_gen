import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import studentRoutes from './routes/studentRoutes.js';
import excelRoutes from './routes/excelRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { connectDB } from './config/db.js';
import { testSupabaseConnection } from './config/supabase.js';
import { initKeepAlive } from './utils/keepAlive.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security & Encryption in Transit Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Performance Middleware: Gzip/Brotli Compression & CORS
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Shree Sai Classes Billing & Fee Management API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/settings', settingRoutes);

// Serve static frontend build in production
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));

// SPA Catch-All for frontend routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 Shree Sai Classes API Server is running on port ${PORT}`);
  console.log(`📡 Local: http://localhost:${PORT}`);
  console.log(`====================================================`);
  await connectDB();
  await testSupabaseConnection();
  initKeepAlive();
});
