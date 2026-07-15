import express from 'express';
import SurveyResponse from '../models/SurveyResponse.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Optional auth middleware (allow anonymous if token not provided, but decode if provided)
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
      req.userId = decoded.userId;
    } catch (e) {
      // ignore token error
    }
  }
  next();
}

// ==================== SUBMIT SURVEY ====================
router.post('/', optionalAuth, async (req, res) => {
  try {
    const surveyData = { ...req.body };
    if (req.userId) {
      surveyData.user_id = req.userId;
    }
    
    await SurveyResponse.create(surveyData);
    return res.status(201).json({ message: 'บันทึกแบบประเมินสำเร็จ' });
  } catch (err) {
    console.error('Submit survey error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกแบบประเมิน' });
  }
});

// ==================== GET ALL SURVEYS (ADMIN) ====================
router.get('/', optionalAuth, async (req, res) => {
  try {
    const surveys = await SurveyResponse.find().sort({ submitted_at: -1 }).populate('user_id', 'name');
    return res.json(surveys);
  } catch (err) {
    console.error('Get surveys error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

export default router;
