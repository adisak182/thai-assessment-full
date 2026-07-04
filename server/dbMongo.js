import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Global is used here to maintain a cached connection across hot reloads
// in development and serverless invocations in production.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectMongoDB = async () => {
  const uri = process.env.MONGO_URI;
  
  if (!uri) {
    throw new Error('MONGO_URI is not defined in Environment Variables.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // ป้องกันการค้าง 10000ms
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log(`✅ MongoDB connected successfully!`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e.message);
    throw e;
  }

  return cached.conn;
};

export default connectMongoDB;
