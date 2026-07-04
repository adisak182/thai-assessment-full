import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import User from './models/User.js';

dotenv.config();

async function testAll() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  
  // Find a user
  const user = await User.findOne({ role: 'user' });
  if (!user) {
    console.log('No user found');
    process.exit(1);
  }
  
  const token = jwt.sign(
    { userId: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '30d' }
  );

  console.log(`Testing with user ${user.name} (${user._id})`);

  // We will start the server locally in another process, but here we can just test the controller logic directly if we want.
  // Better yet, I can just call the functions directly.
  
  // Or I can test using HTTP to localhost:3001
  const API_URL = 'http://localhost:3001';
  
  const endpoints = [
    { method: 'GET', url: '/users/me' },
    { method: 'GET', url: '/users/ranking' },
    { method: 'GET', url: '/users/scores' },
    { method: 'GET', url: '/users/history' }
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${API_URL}${ep.url}`, {
        method: ep.method,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log(`[${ep.method} ${ep.url}] Status: ${res.status}`);
      if (res.status !== 200) {
        console.error('Error response:', data);
      }
    } catch (e) {
      console.error(`[${ep.method} ${ep.url}] Fetch failed:`, e.message);
    }
  }

  process.exit(0);
}
testAll();
