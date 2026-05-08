import mongoose from 'mongoose';

const scoreHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  skill: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  max_score: {
    type: Number,
    required: true,
  },
  taken_at: {
    type: Date,
    default: Date.now,
  }
});

scoreHistorySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const ScoreHistory = mongoose.model('ScoreHistory', scoreHistorySchema);
export default ScoreHistory;
