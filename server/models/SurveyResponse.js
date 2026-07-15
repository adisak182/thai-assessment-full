import mongoose from 'mongoose';

const surveySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  // ส่วนที่ 1
  gender: { type: String },
  age: { type: String },
  target_group: { type: String },
  district: { type: String },
  province: { type: String },
  // ส่วนที่ 2 ด้านการออกแบบและการใช้งาน (1-4)
  design_1: { type: Number, min: 1, max: 4 },
  design_2: { type: Number, min: 1, max: 4 },
  design_3: { type: Number, min: 1, max: 4 },
  design_4: { type: Number, min: 1, max: 4 },
  // ส่วนที่ 2 ด้านเนื้อหา (1-4)
  content_1: { type: Number, min: 1, max: 4 },
  content_2: { type: Number, min: 1, max: 4 },
  content_3: { type: Number, min: 1, max: 4 },
  content_4: { type: Number, min: 1, max: 4 },
  // ส่วนที่ 2 ประโยชน์การนำไปใช้ (1-4)
  benefit_1: { type: Number, min: 1, max: 4 },
  benefit_2: { type: Number, min: 1, max: 4 },
  benefit_3: { type: Number, min: 1, max: 4 },
  benefit_4: { type: Number, min: 1, max: 4 },
  // ส่วนที่ 3
  suggestions: { type: String, default: '' },
  submitted_at: { type: Date, default: Date.now }
});

export default mongoose.models.SurveyResponse || mongoose.model('SurveyResponse', surveySchema);
