import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  userId: {
    type: Number, // Reference to MySQL user ID
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
