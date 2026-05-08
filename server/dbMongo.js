import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectMongoDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.warn('⚠️ MONGO_URI is not defined in .env. Skipping MongoDB connection.');
      return;
    }
    await mongoose.connect(uri);
    console.log(`✅ MongoDB connected successfully!`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Don't exit process, let MySQL run even if MongoDB fails
  }
};

export default connectMongoDB;
