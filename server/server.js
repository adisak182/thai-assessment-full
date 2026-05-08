import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import connectMongoDB from './dbMongo.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize MongoDB
connectMongoDB();

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    // Allow any localhost origin in development
    const allowedOrigins = process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',').map(s => s.trim()) : ['*'];
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin) || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Allow large avatar base64
app.use(express.urlencoded({ extended: true }));

// ==================== ROUTES ====================
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Thai Assessment API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// ==================== START ====================
app.listen(PORT, () => {
  console.log(`✅ Thai Assessment API running on http://localhost:${PORT}`);
});
