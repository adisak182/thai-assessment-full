import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ScoreHistory from '../models/ScoreHistory.js';
import LevelProgress from '../models/LevelProgress.js';
import mongoose from 'mongoose';


const router = express.Router();

// ==================== MIDDLEWARE: Verify JWT ====================
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อน' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
  }
}

// ==================== GET PROFILE ====================
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });

    let progress = await LevelProgress.findOne({ user_id: req.userId });
    if (!progress) {
      progress = await LevelProgress.create({ user_id: req.userId });
    }

    return res.json({ ...user.toJSON(), progress: progress.toJSON() });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// ==================== UPDATE PROFILE ====================
router.put('/me', authenticate, async (req, res) => {
  const { name, age, gender, address, avatar } = req.body;
  try {
    await User.findByIdAndUpdate(req.userId, { name, age, gender, address, avatar });
    return res.json({ message: 'บันทึกข้อมูลสำเร็จ' });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// ==================== SAVE SCORE ====================
router.post('/score', authenticate, async (req, res) => {
  const { level, skill, score, maxScore, breakdown } = req.body;

  if (!skill || score == null || maxScore == null) {
    return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
  }

  try {
    // บันทึกลง ScoreHistory โดยใช้ level=1 เป็น default (ระบบใหม่ไม่แบ่ง level)
    await ScoreHistory.create({
      user_id: req.userId,
      level: level || 1,
      skill,
      score,
      max_score: maxScore,
      breakdown: breakdown || {}
    });

    // คำนวณคะแนนรวมทุกทักษะของผู้ใช้นี้ (เอาคะแนนสูงสุดของแต่ละทักษะ)
    const latestScores = await ScoreHistory.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(req.userId) } },
      { $sort: { taken_at: -1 } },
      { $group: { _id: '$skill', score: { $max: '$score' } } }
    ]);

    const totalScore = latestScores.reduce((acc, curr) => acc + curr.score, 0);
    // เกณฑ์ผ่าน: 70% ของ 100 คะแนนเต็ม = 70 คะแนน
    const passed = totalScore >= 70;

    return res.json({ message: 'บันทึกคะแนนสำเร็จ', totalScore, passed });
  } catch (err) {
    console.error('Save score error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// ==================== GET SCORE HISTORY ====================
router.get('/history', authenticate, async (req, res) => {
  try {
    const history = await ScoreHistory.find({ user_id: req.userId })
      .sort({ taken_at: -1 })
      .limit(50);
    return res.json(history);
  } catch (err) {
    console.error('Get history error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// ==================== GET LATEST SCORES PER LEVEL ====================

router.get('/scores', authenticate, async (req, res) => {
  try {
    // Latest score per (level, skill) combination
    const scores = await ScoreHistory.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(req.userId) } },
      { $sort: { taken_at: -1 } },
      { $group: {
          _id: { level: '$level', skill: '$skill' },
          score: { $first: '$score' },
          max_score: { $first: '$max_score' },
          taken_at: { $first: '$taken_at' }
        }
      },
      { $project: {
          _id: 0,
          level: '$_id.level',
          skill: '$_id.skill',
          score: 1,
          max_score: 1,
          taken_at: 1
        }
      },
      { $sort: { level: 1, skill: 1 } }
    ]);

    let progress = await LevelProgress.findOne({ user_id: req.userId });
    if (!progress) {
      progress = { level1_passed: 0, level2_passed: 0, level3_passed: 0 };
    }

    return res.json({ scores, progress });
  } catch (err) {
    console.error('Get scores error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// ==================== GET RANKING ====================
router.get('/ranking', authenticate, async (req, res) => {
  try {
    const ranking = await ScoreHistory.aggregate([
      // กรองเอาเฉพาะคะแนนจากแบบทดสอบ 100 ข้อ
      {
        $match: { skill: 'full_test' }
      },
      // 1. หาคะแนนสูงสุดของผู้ใช้แต่ละคน
      {
        $group: {
          _id: { user_id: '$user_id', skill: '$skill' },
          maxScorePerSkill: { $max: '$score' }
        }
      },
      // 2. รวมคะแนนของทุกทักษะของผู้ใช้แต่ละคน
      {
        $group: {
          _id: '$_id.user_id',
          totalScore: { $sum: '$maxScorePerSkill' }
        }
      },
      // 3. เรียงลำดับจากมากไปน้อย
      {
        $sort: { totalScore: -1 }
      },
      // 4. จำกัดแค่ 100 อันดับแรก
      {
        $limit: 100
      },
      // 5. ดึงข้อมูล User (ชื่อ, avatar) มาแสดง
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: { $arrayElemAt: ['$user.name', 0] },
          avatar: { $arrayElemAt: ['$user.avatar', 0] },
          role: { $arrayElemAt: ['$user.role', 0] },
          totalScore: 1
        }
      }
    ]);

    // กรองเอาแอดมินออกถ้ามี (ถ้าต้องการ, ในที่นี้แค่ระบุ role)
    const filteredRanking = ranking.filter(r => r.role !== 'admin');

    return res.json(filteredRanking.slice(0, 100)); // เผื่อแอดมินหลุดมา
  } catch (err) {
    console.error('Get ranking error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

export default router;
