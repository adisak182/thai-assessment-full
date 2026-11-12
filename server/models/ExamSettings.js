import mongoose from 'mongoose';

const examSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'global',
    unique: true,
    required: true,
  },
  mode: {
    type: String,
    enum: ['always_open', 'scheduled', 'closed'],
    default: 'always_open',
  },
  open_at: {
    type: Date,
    default: null,
  },
  close_at: {
    type: Date,
    default: null,
  },
  closed_message: {
    type: String,
    default: 'ขณะนี้อยู่นอกช่วงเวลาที่เปิดให้ทำข้อสอบ กรุณารอช่วงเวลาเปิดสอบรอบถัดไป หรือติดต่อผู้ดูแลระบบ',
  },
  allow_admin_bypass: {
    type: Boolean,
    default: true,
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

examSettingsSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const ExamSettings = mongoose.models.ExamSettings || mongoose.model('ExamSettings', examSettingsSchema);
export default ExamSettings;
