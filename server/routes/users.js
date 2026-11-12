import process from 'node:process';
import { Buffer } from 'node:buffer';
import SpeakingAudio from '../models/SpeakingAudio.js';
import { isAudioId, validateAudioUpload, validateAudioReferences } from '../speakingAudio.js';
import { gradeSubmission, summarizeResults } from '../grading.js';
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ScoreHistory from '../models/ScoreHistory.js';
import LevelProgress from '../models/LevelProgress.js';
import mongoose from 'mongoose';
import ExamSettings from '../models/ExamSettings.js';
import { resolveLocationUpdates } from '../../src/utils/addressHelper.js';
import { evaluateExamWindow } from '../../src/utils/examSchedule.js';


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
  const { name, age, gender, address, avatar, is_literacy_learner } = req.body;
  if (is_literacy_learner !== undefined && typeof is_literacy_learner !== 'boolean') {
    return res.status(400).json({ message: 'สถานะผู้เรียนต้องเป็นค่าติ๊กหรือไม่ติ๊กเท่านั้น' });
  }
  try {
    const updateFields = {
      name,
      age,
      gender,
      address,
      avatar,
      ...(is_literacy_learner !== undefined ? { is_literacy_learner } : {}),
      ...resolveLocationUpdates(req.body)
    };
    await User.findByIdAndUpdate(req.userId, updateFields);
    return res.json({ message: 'บันทึกข้อมูลสำเร็จ' });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// Recordings remain private; unsubmitted recordings expire after one day.
router.post('/speaking-audio/:id',authenticate,express.raw({type:()=>true,limit:'2mb'}),async(req,res)=>{
 try{
  const {submissionId,skill}=req.query,questionId=Number(req.query.questionId);
  const mime=validateAudioUpload({id:req.params.id,submissionId,skill,questionId,mime:req.headers['content-type'],data:req.body});
  if(!await User.exists({_id:req.userId}))return res.status(401).json({message:'ไม่พบบัญชีผู้ใช้'});
  if(await ScoreHistory.exists({user_id:req.userId,submission_id:submissionId}))return res.status(409).json({message:'รอบสอบนี้ส่งคำตอบแล้ว'});
  const existing=await SpeakingAudio.findById(req.params.id);
  if(existing){
   validateAudioReferences([{id:questionId,audioId:req.params.id}],[existing],{userId:req.userId,submissionId,skill});
   return res.json({audioId:existing._id});
  }
  if(await SpeakingAudio.countDocuments({user_id:req.userId,submission_id:submissionId})>=60)return res.status(429).json({message:'บันทึกเสียงรอบนี้ครบจำนวนแล้ว กรุณาติดต่อผู้ดูแล'});
  await SpeakingAudio.init();
  const clip=await SpeakingAudio.create({_id:req.params.id,user_id:req.userId,submission_id:submissionId,skill,question_id:questionId,mime,data:req.body,expires_at:new Date(Date.now()+86400000)});
  return res.status(201).json({audioId:clip._id});
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:'กำลังบันทึกเสียงนี้ กรุณาลองส่งอีกครั้ง'});
  if(error.name==='Error')return res.status(400).json({message:error.message});
  return res.status(500).json({message:'บันทึกเสียงไม่สำเร็จ กรุณาลองใหม่'});
 }
},(error,req,res,next)=>{
 if(error.type==='entity.too.large')return res.status(413).json({message:'ไฟล์เสียงใหญ่เกิน 2 MB กรุณาอัดให้สั้นลง'});
 next(error);
});
router.get('/speaking-audio/:id',authenticate,async(req,res)=>{
 if(!isAudioId(req.params.id))return res.status(404).json({message:'ไม่พบไฟล์เสียง'});
 try{
  const viewer=await User.findById(req.userId).select('role');
  if(!viewer)return res.status(401).json({message:'ไม่พบบัญชีผู้ใช้'});
  const clip=await SpeakingAudio.findOne({_id:req.params.id,...(viewer.role==='admin'?{}:{user_id:req.userId})}).select('+data');
  if(!clip || (clip.expires_at && clip.expires_at<=new Date()))return res.status(404).json({message:'ไม่พบไฟล์เสียง'});
  res.set({'Content-Type':clip.mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'});
  const data=Buffer.from(clip.data),range=req.headers.range;
  if(range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(range);
   let start=match?.[1]?Number(match[1]):0,end=match?.[2]?Number(match[2]):data.length-1;
   if(match && !match[1] && match[2]){start=Math.max(0,data.length-Number(match[2]));end=data.length-1;}
   end=Math.min(end,data.length-1);
   if(!match||start>end||start>=data.length)return res.status(416).set('Content-Range',`bytes */${data.length}`).end();
   return res.status(206).set('Content-Range',`bytes ${start}-${end}/${data.length}`).send(data.subarray(start,end+1));
  }
  return res.send(data);
 }catch{return res.status(500).json({message:'โหลดเสียงไม่สำเร็จ'});}
});

// ==================== SAVE SCORE ====================
router.post('/score', authenticate, async (req, res) => {
  let result;
  try {
    if(typeof req.body.submissionId!=='string' || !/^[0-9a-f-]{36}$/i.test(req.body.submissionId))throw new Error('รหัสรอบสอบไม่ถูกต้อง');
    result=gradeSubmission(req.body);
  }
  catch(error){return res.status(400).json({message:error.message});}
  try {
    const userDoc = await User.findById(req.userId).select('role').lean();
    if (!userDoc) return res.status(401).json({ message: 'ไม่พบบัญชีผู้ใช้' });

    const examSettings = await ExamSettings.findOne({ key: 'global' }).lean();
    const windowStatus = evaluateExamWindow(examSettings, new Date(), { isAdmin: userDoc.role === 'admin' });
    if (!windowStatus.isOpen) {
      return res.status(403).json({ message: windowStatus.reason, examStatus: windowStatus });
    }

    const audioIds=req.body.responses.filter(r=>r.audioId).map(r=>r.audioId);
    const clips=audioIds.length?await SpeakingAudio.find({_id:{$in:audioIds}}):[];
    try{validateAudioReferences(req.body.responses,clips,{userId:req.userId,submissionId:req.body.submissionId,skill:req.body.skill});}
    catch(error){return res.status(400).json({message:error.message});}
    // Keep submitted clips for the same lifetime as their exam; account deletion removes both.
    await ScoreHistory.init();
    const saved=await ScoreHistory.findOneAndUpdate(
      {user_id:req.userId,submission_id:req.body.submissionId},
      {$setOnInsert:{user_id:req.userId,submission_id:req.body.submissionId,level:1,skill:req.body.skill,score:result.score,max_score:result.maxScore,breakdown:result.breakdown,detailed_results:result.detailed_results,pending_count:result.pending_count}},
      {upsert:true,new:true,setDefaultsOnInsert:true}
    );
    const savedAudioIds=saved.detailed_results.filter(r=>r.audio_id).map(r=>r.audio_id);
    if(savedAudioIds.length)await SpeakingAudio.updateMany({_id:{$in:savedAudioIds},user_id:req.userId},{$unset:{expires_at:1}});
    return res.json({message:'บันทึกคะแนนสำเร็จ',...summarizeResults(saved.detailed_results,saved.max_score)});
  } catch {
    return res.status(500).json({message:'บันทึกคะแนนไม่สำเร็จ กรุณาลองใหม่'});
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
      { $match: { user_id: new mongoose.Types.ObjectId(req.userId), pending_count: { $not: { $gt: 0 } } } },
      { $sort: { score: -1, taken_at: -1 } },
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
        $match: { skill: 'full_test', pending_count: { $not: { $gt: 0 } } }
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
