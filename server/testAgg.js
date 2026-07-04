import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const Schema = mongoose.Schema;
const ScoreHistory = mongoose.model('ScoreHistory', new Schema({
  user_id: Schema.Types.ObjectId,
  skill: String,
  score: Number
}, { collection: 'scorehistories' }));

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const ranking = await ScoreHistory.aggregate([
      { $group: { _id: { user_id: '$user_id', skill: '$skill' }, maxScorePerSkill: { $max: '$score' } } },
      { $group: { _id: '$_id.user_id', totalScore: { $sum: '$maxScorePerSkill' } } },
      { $sort: { totalScore: -1 } },
      { $limit: 100 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $project: { _id: 0, userId: '$_id', name: { $arrayElemAt: ['$user.name', 0] }, role: { $arrayElemAt: ['$user.role', 0] }, totalScore: 1 } }
    ]);
    console.log('Success:', ranking);
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}
test();
