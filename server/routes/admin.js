import SpeakingAudio from '../models/SpeakingAudio.js';
import express from 'express';
import mongoose from 'mongoose';
import authenticateAdmin from '../authenticateAdmin.js';
import { summarizeResults } from '../grading.js';
import User from '../models/User.js';
import ScoreHistory from '../models/ScoreHistory.js';
import LevelProgress from '../models/LevelProgress.js';
import SurveyResponse from '../models/SurveyResponse.js';
import ExamSettings from '../models/ExamSettings.js';
import { resolveLocationUpdates, buildNormalizedLocationPatch } from '../../src/utils/addressHelper.js';
import { validateExamScheduleInput, evaluateExamWindow } from '../../src/utils/examSchedule.js';
import { stripLiteracySuffix } from '../../src/utils/namePrefix.js';

const router = express.Router();

// ==================== GET ALL USERS ====================
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    // Get all users
    const users = await User.find().select('-password').sort({ created_at: -1 });
    
    const scores = await ScoreHistory.aggregate([
      { $match: { skill: 'full_test' } },
      { $group: {
        _id: '$user_id', attempts: { $sum: 1 }, lastAt: { $max: '$taken_at' },
        completed: { $sum: { $cond: [{ $gt: [{ $ifNull: ['$pending_count',0] },0] },0,1] } },
        maxScore: { $max: { $cond: [{ $gt: [{ $ifNull: ['$pending_count',0] },0] },null,'$score'] } },
        pending: { $sum: { $cond: [{ $gt: [{ $ifNull: ['$pending_count',0] },0] },1,0] } },
        pendingQuestions: { $sum: { $ifNull: ['$pending_count',0] } },
      } },
    ]);
    const scoreMap = new Map(scores.map(item => [item._id.toString(),item]));
    const result = users.map(u => {
      const score = scoreMap.get(u._id.toString());
      return {
        ...u.toJSON(),
        full_test_score: score?.maxScore ?? 0,
        full_test_completed: (score?.completed || 0) > 0,
        full_test_pending: score?.pending || 0,
        full_test_pending_questions: score?.pendingQuestions || 0,
        full_test_attempts: score?.attempts || 0,
        full_test_last_at: score?.lastAt || null,
        full_test_passed: (score?.maxScore ?? 0) >= 70,
      };
    });

    return res.json(result);
  } catch (err) {
    console.error('Get all users error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// ==================== GET ALL SCORE HISTORY (ACROSS ALL USERS) ====================
router.get('/history', authenticateAdmin, async (req, res) => {
  try {
    const history = await ScoreHistory.find()
      .select('-detailed_results')
      .populate('user_id', 'username name age gender address subdistrict district province is_literacy_learner role')
      .sort({ taken_at: -1 })
      .lean();

    const userIds = history.map(h => h.user_id?._id).filter(Boolean);
    const surveys = userIds.length ? await SurveyResponse.find({ user_id: { $in: userIds } }).select('user_id subdistrict district province submitted_at').sort({ submitted_at: 1 }).lean() : [];
    const surveyMap = new Map();
    for (const s of surveys) {
      if (s.user_id) surveyMap.set(s.user_id.toString(), { subdistrict: s.subdistrict, district: s.district, province: s.province });
    }

    const formatted = history.map(h => {
      const u = h.user_id;
      const s = u ? surveyMap.get(u._id.toString()) : null;
      return {
        id: h._id.toString(),
        user_id: u ? u._id.toString() : null,
        user: u ? {
          id: u._id.toString(),
          name: u.name,
          username: u.username,
          age: u.age,
          gender: u.gender || null,
          address: u.address,
          subdistrict: u.subdistrict || s?.subdistrict || null,
          district: u.district || s?.district || null,
          province: u.province || s?.province || null,
          is_literacy_learner: Boolean(u.is_literacy_learner),
          role: u.role
        } : { name: 'ผู้ใช้งานทั่วไป', username: '-' },
        level: h.level,
        skill: h.skill,
        score: h.score,
        max_score: h.max_score,
        taken_at: h.taken_at,
        breakdown: h.breakdown || {},
        pending_count: h.pending_count || 0
      };
    });

    return res.json(formatted);
  } catch (err) {
    console.error('Get all history error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// ==================== GET SINGLE ATTEMPT WITH DETAILS ====================
router.get('/attempts/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'ไม่พบข้อมูลผลสอบ' });
  }
  try {
    const attempt = await ScoreHistory.findById(id);
    if (!attempt) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผลสอบ' });
    }
    return res.json(attempt.toJSON());
  } catch (err) {
    console.error('Get attempt detail error:', err);
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
    await SpeakingAudio.deleteMany({ user_id: id });
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
  const { name, age, address, role, is_literacy_learner } = req.body;
  if (is_literacy_learner !== undefined && typeof is_literacy_learner !== 'boolean') {
    return res.status(400).json({ message: 'สถานะผู้เรียนต้องเป็นค่าติ๊กหรือไม่ติ๊กเท่านั้น' });
  }
  try {
    const updateFields = {
      name: name ? stripLiteracySuffix(name) : name,
      age: age || null,
      address: address || null,
      role: role || 'user',
      ...(is_literacy_learner !== undefined ? { is_literacy_learner } : {}),
      ...resolveLocationUpdates(req.body)
    };

    const updated = await User.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    ).select('-password');
    if (!updated) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }
    return res.json({ message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ', user: updated.toJSON() });
  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// ==================== BULK NORMALIZE MISSPELLED LOCATIONS ====================
router.post('/locations/normalize', authenticateAdmin, async (req, res) => {
  const operations = Array.isArray(req.body?.operations)
    ? req.body.operations
    : (req.body?.field ? [req.body] : []);

  if (!operations.length) {
    return res.status(400).json({ message: 'กรุณาระบุข้อมูลอำเภอหรือตำบลที่ต้องการปรับปรุง' });
  }

  for (const op of operations) {
    if (!['district', 'subdistrict'].includes(op?.field) || !String(op?.fromValue || '').trim() || !String(op?.toValue || '').trim()) {
      return res.status(400).json({ message: 'ข้อมูลรายการปรับปรุงชื่อพื้นที่ไม่ถูกต้อง' });
    }
  }

  try {
    const [allUsers, allSurveys] = await Promise.all([
      User.find({ role: { $ne: 'admin' } }).select('_id address subdistrict district province').lean(),
      SurveyResponse.find().select('_id subdistrict district province').lean(),
    ]);

    const userBulkOps = [];
    for (const u of allUsers) {
      let mergedPatch = null;
      const working = { ...u };
      for (const op of operations) {
        const patch = buildNormalizedLocationPatch(working, {
          field: op.field,
          fromValue: op.fromValue,
          toValue: op.toValue,
          districtFilter: op.districtFilter || '',
          targetDistrict: op.targetDistrict || '',
          targetProvince: op.targetProvince || 'นราธิวาส',
          isUser: true,
        });
        if (patch) {
          mergedPatch = { ...(mergedPatch || {}), ...patch };
          Object.assign(working, patch);
        }
      }
      if (mergedPatch) {
        userBulkOps.push({
          updateOne: {
            filter: { _id: u._id },
            update: { $set: mergedPatch },
          },
        });
      }
    }

    const surveyBulkOps = [];
    for (const s of allSurveys) {
      let mergedPatch = null;
      const working = { ...s };
      for (const op of operations) {
        const patch = buildNormalizedLocationPatch(working, {
          field: op.field,
          fromValue: op.fromValue,
          toValue: op.toValue,
          districtFilter: op.districtFilter || '',
          targetDistrict: op.targetDistrict || '',
          targetProvince: op.targetProvince || 'นราธิวาส',
          isUser: false,
        });
        if (patch) {
          mergedPatch = { ...(mergedPatch || {}), ...patch };
          Object.assign(working, patch);
        }
      }
      if (mergedPatch) {
        surveyBulkOps.push({
          updateOne: {
            filter: { _id: s._id },
            update: { $set: mergedPatch },
          },
        });
      }
    }

    const [userRes, surveyRes] = await Promise.all([
      userBulkOps.length ? User.bulkWrite(userBulkOps) : Promise.resolve({ modifiedCount: 0 }),
      surveyBulkOps.length ? SurveyResponse.bulkWrite(surveyBulkOps) : Promise.resolve({ modifiedCount: 0 }),
    ]);

    return res.json({
      message: 'ปรับปรุงชื่อพื้นที่เป็นมาตรฐานสำเร็จ',
      updatedUsersCount: userRes.modifiedCount ?? userBulkOps.length,
      updatedSurveysCount: surveyRes.modifiedCount ?? surveyBulkOps.length,
    });
  } catch (err) {
    console.error('Normalize locations error:', err);
    return res.status(500).json({ message: 'ปรับปรุงข้อมูลพื้นที่ไม่สำเร็จ' });
  }
});


router.put('/attempts/:id/review', authenticateAdmin, async (req,res)=>{
  const {questionId,correct}=req.body;
  if(!Number.isInteger(questionId)||typeof correct!=='boolean')return res.status(400).json({message:'ผลตรวจไม่ถูกต้อง'});
  try{
    const attempt=await ScoreHistory.findById(req.params.id);
    if(!attempt)return res.status(404).json({message:'ไม่พบผลสอบ'});
    const item=attempt.detailed_results.find(d=>d.id===questionId);
    if(!item || item.is_correct!==null)return res.status(409).json({message:'ข้อนี้ไม่ได้อยู่ระหว่างรอตรวจ กรุณาโหลดข้อมูลใหม่'});
    const details=attempt.detailed_results.map(d=>d.id===questionId?{...d,is_correct:correct,reviewed_by:req.userId}:d);
    const result=summarizeResults(details,attempt.max_score);
    const updated=await ScoreHistory.findOneAndUpdate(
      {_id:attempt._id,__v:attempt.__v},
      {$set:{score:result.score,breakdown:result.breakdown,detailed_results:details,pending_count:result.pending_count},$inc:{__v:1}},
      {new:true}
    );
    if(!updated)return res.status(409).json({message:'มีการตรวจพร้อมกัน กรุณาโหลดข้อมูลใหม่'});
    return res.json(updated);
  }catch{return res.status(500).json({message:'บันทึกผลตรวจไม่สำเร็จ'});}
});

// ==================== GET / UPDATE EXAM SCHEDULE SETTINGS ====================
router.get('/exam-settings', authenticateAdmin, async (req, res) => {
  try {
    const settings = await ExamSettings.findOne({ key: 'global' }).lean();
    return res.json(evaluateExamWindow(settings, new Date(), { isAdmin: true }));
  } catch (err) {
    console.error('Get exam settings error:', err);
    return res.status(500).json({ message: 'โหลดการตั้งค่าเวลาสอบไม่สำเร็จ' });
  }
});

router.put('/exam-settings', authenticateAdmin, async (req, res) => {
  const validated = validateExamScheduleInput(req.body);
  if (validated.error) {
    return res.status(400).json({ message: validated.error });
  }
  try {
    const updated = await ExamSettings.findOneAndUpdate(
      { key: 'global' },
      {
        $set: {
          ...validated,
          key: 'global',
          updated_by: req.userId,
          updated_at: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    return res.json({
      message: 'บันทึกเวลาเปิด-ปิดการทำข้อสอบสำเร็จ',
      status: evaluateExamWindow(updated, new Date(), { isAdmin: true }),
    });
  } catch (err) {
    console.error('Update exam settings error:', err);
    return res.status(500).json({ message: 'บันทึกการตั้งค่าเวลาสอบไม่สำเร็จ' });
  }
});

export default router;
