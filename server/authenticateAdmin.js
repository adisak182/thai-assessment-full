import jwt from 'jsonwebtoken';
import User from './models/User.js';
export default async function authenticateAdmin(req,res,next){
  const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if(!token)return res.status(401).json({message:'กรุณาเข้าสู่ระบบก่อน'});
  let decoded;
  try{decoded=jwt.verify(token,process.env.JWT_SECRET||'dev_secret');}
  catch{return res.status(401).json({message:'Token ไม่ถูกต้องหรือหมดอายุ'});}
  try{
    const user=await User.findById(decoded.userId).select('role');
    if(!user)return res.status(401).json({message:'ไม่พบบัญชีผู้ใช้'});
    if(user.role!=='admin')return res.status(403).json({message:'คุณไม่มีสิทธิ์เข้าถึงหน้านี้'});
    req.userId=decoded.userId;
    next();
  }catch{return res.status(503).json({message:'ตรวจสิทธิ์ไม่สำเร็จ กรุณาลองใหม่'});}
}
