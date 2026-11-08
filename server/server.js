import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectMongoDB from './dbMongo.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import surveyRoutes from './routes/survey.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Connect before database requests; reconnect after transient failures.
app.use(async (req, res, next) => {
  try {
    await connectMongoDB();
    next();
  } catch {
    res.status(503).json({ message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง' });
  }
});
// Mount Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/survey', surveyRoutes);

// Health Check
app.get('/health', async (req, res) => {
  try {
    const mongo = await connectMongoDB();
    await mongo.connection.db.command({ ping: 1 });
    res.json({ status: 'ok', database: 'mongodb' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'mongodb', error: err.message });
  }
});


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend build if dist folder exists (Standalone / Private Server support)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA client-side routing
app.get('*', (req, res, next) => {
  if (
    req.path.startsWith('/auth') ||
    req.path.startsWith('/users') ||
    req.path.startsWith('/admin') ||
    req.path.startsWith('/survey') ||
    req.path.startsWith('/health')
  ) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Start Server (Listen when not running in Vercel serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}

export default app;
