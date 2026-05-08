import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ActivityLog from '../models/ActivityLog.js';

// Explicitly load .env from the parent directory
dotenv.config({ path: '../.env' });

const seedData = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('❌ MONGO_URI is not defined in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected successfully!');

    console.log('Inserting sample data...');
    const log1 = new ActivityLog({
      action: 'USER_LOGIN',
      details: 'User logged in successfully',
      userId: 1
    });

    const log2 = new ActivityLog({
      action: 'SYSTEM_START',
      details: 'MongoDB initialization and seeding script ran'
    });

    await log1.save();
    await log2.save();

    console.log('✅ Sample data inserted successfully!');
    
    // Check data
    const logs = await ActivityLog.find();
    console.log('Current Logs in DB:', logs);

  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
};

seedData();
