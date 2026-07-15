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

// Ensure Database Connection for every request (Serverless pattern)
app.use(async (req, res, next) => {
  try {
    await connectMongoDB();
    next();
  } catch (error) {
    res.status(500).json({ message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้: ' + error.message });
  }
});

// Mount Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/survey', surveyRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'mongodb' });
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}

export default app;
