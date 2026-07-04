import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import LevelProgress from '../models/LevelProgress.js';

const router = express.Router();
const SALT_ROUNDS = 10;

// ==================== REGISTER ====================
router.post('/register', async (req, res) => {
  const { username, password, name, age, gender, address, avatar } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ message: 'กรุณากรอกชื่อผู้ใช้, รหัสผ่าน และชื่อ-นามสกุล' });
  }

  try {
    // Check duplicate username
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่อใหม่' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const role = username.toLowerCase() === 'admin' ? 'admin' : 'user';

    const newUser = new User({
      username,
      password: hashedPassword,
      name,
      age: age || null,
      gender: gender || null,
      address: address || null,
      avatar: avatar || null,
      role
    });

    await newUser.save();

    // Create default level_progress row
    await LevelProgress.create({ user_id: newUser._id });

    const token = jwt.sign(
      { userId: newUser._id, username, role },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );

    const safeUser = newUser.toJSON();
    delete safeUser.password;

    return res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ',
      token,
      user: safeUser
    });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// ==================== START SESSION (GUEST / NO PASSWORD) ====================
router.post('/start', async (req, res) => {
  const { name, age, address } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'กรุณากรอกชื่อ-สกุล' });
  }

  try {
    // ค้นหาผู้ใช้ที่มีชื่อตรงกัน (exact match)
    const trimmedName = name.trim();
    let user = await User.findOne({ 
      name: trimmedName,
      role: 'user'
    });

    if (!user) {
      // สร้างผู้ใช้ใหม่
      const randomUsername = `user_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const randomPassword = await bcrypt.hash(randomUsername, 10);
      
      user = new User({
        username: randomUsername,
        password: randomPassword,
        name: trimmedName,
        age: age ? Number(age) : null,
        address: address ? address.trim() : null,
        role: 'user'
      });
      await user.save();

      // สร้าง LevelProgress แบบปลอดภัย (ถ้าซ้ำก็ข้ามไป)
      try {
        await LevelProgress.create({ user_id: user._id });
      } catch (lpErr) {
        if (lpErr.code !== 11000) throw lpErr; // 11000 = duplicate key → ข้ามได้
      }
    } else {
      // อัปเดตข้อมูลถ้ามีการเปลี่ยนแปลง
      let changed = false;
      if (age && user.age !== Number(age)) { user.age = Number(age); changed = true; }
      if (address && user.address !== address.trim()) { user.address = address.trim(); changed = true; }
      if (changed) await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '30d' }
    );

    const safeUser = user.toJSON();
    delete safeUser.password;

    return res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Start session error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์: ' + err.message });
  }
});

// ==================== LOGIN ====================
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );

    const safeUser = user.toJSON();
    delete safeUser.password;

    return res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: safeUser
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

export default router;
