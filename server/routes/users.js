import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ScoreHistory from '../models/ScoreHistory.js';
import LevelProgress from '../models/LevelProgress.js';

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
  const { level, skill, score, maxScore } = req.body;

  if (level == null || !skill || score == null || maxScore == null) {
    return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
  }

  try {
    await ScoreHistory.create({
      user_id: req.userId,
      level,
      skill,
      score,
      max_score: maxScore
    });

    // Fetch latest scores per skill for this level
    const latestScores = await ScoreHistory.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(req.userId), level: Number(level) } },
      { $sort: { taken_at: -1 } },
      { $group: { _id: '$skill', score: { $first: '$score' } } }
    ]);

    const totalScore = latestScores.reduce((acc, curr) => acc + curr.score, 0);
    const passThreshold = level === 1 ? 21 : level === 2 ? 28 : 35;
    const passed = totalScore >= passThreshold ? 1 : 0;

    const col = `level${level}_passed`;
    let progress = await LevelProgress.findOne({ user_id: req.userId });
    if (!progress) {
      progress = new LevelProgress({ user_id: req.userId });
    }
    progress[col] = passed;
    await progress.save();

    return res.json({ message: 'บันทึกคะแนนสำเร็จ', totalScore, passed: passed === 1 });
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
import mongoose from 'mongoose'; // needed for ObjectId in aggregate

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

export default router;
