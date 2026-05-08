import mongoose from 'mongoose';

const levelProgressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  level1_passed: {
    type: Number,
    default: 0,
  },
  level2_passed: {
    type: Number,
    default: 0,
  },
  level3_passed: {
    type: Number,
    default: 0,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  }
});

levelProgressSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const LevelProgress = mongoose.model('LevelProgress', levelProgressSchema);
export default LevelProgress;
