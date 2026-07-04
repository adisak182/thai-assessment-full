import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ScoreHistory from '../models/ScoreHistory.js';
import LevelProgress from '../models/LevelProgress.js';

const router = express.Router();

// Middleware: Verify Admin
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อน' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้' });
    }
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
}

// ==================== GET ALL USERS ====================
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    // Get all users
    const users = await User.find().select('-password').sort({ created_at: -1 });
    
    // Get progress for all users
    const progressMap = {};
    const progresses = await LevelProgress.find();
    progresses.forEach(p => {
      progressMap[p.user_id.toString()] = p;
    });

    const result = users.map(u => {
      const p = progressMap[u._id.toString()] || {};
      return {
        ...u.toJSON(),
        level1_passed: p.level1_passed || 0,
        level2_passed: p.level2_passed || 0,
        level3_passed: p.level3_passed || 0
      };
    });

    return res.json(result);
  } catch (err) {
    console.error('Get all users error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// ==================== GET SPECIFIC USER SCORES ====================
router.get('/users/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select('username name role');
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    const history = await ScoreHistory.find({ user_id: id }).sort({ taken_at: -1 });

    return res.json({ user: user.toJSON(), history });
  } catch (err) {
    console.error('Get user scores error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// Note: The previous mysql code had /users/:id/scores, but the admin frontend might call that. Let's add it to be safe
router.get('/users/:id/scores', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select('username name role');
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    const history = await ScoreHistory.find({ user_id: id }).sort({ taken_at: -1 });

    return res.json({ user: user.toJSON(), history });
  } catch (err) {
    console.error('Get user scores error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// ==================== DELETE USER ====================
router.delete('/users/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await ScoreHistory.deleteMany({ user_id: id });
    await LevelProgress.deleteOne({ user_id: id });
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้ที่ต้องการลบ' });
    }
    return res.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// ==================== UPDATE USER ====================
router.put('/users/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, age, address, role } = req.body;
  try {
    const updated = await User.findByIdAndUpdate(
      id,
      { name, age: age || null, address: address || null, role: role || 'user' }
    );
    if (!updated) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }
    return res.json({ message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ' });
  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

export default router;
