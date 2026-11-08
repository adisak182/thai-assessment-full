import { Buffer } from 'node:buffer';
import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 _id:{type:String,required:true},user_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true},
 submission_id:{type:String,required:true},skill:{type:String,required:true},question_id:{type:Number,required:true},
 mime:{type:String,required:true},data:{type:Buffer,required:true,select:false},
 expires_at:Date
});
schema.index({expires_at:1},{expireAfterSeconds:0});
export default mongoose.model('SpeakingAudio',schema);
