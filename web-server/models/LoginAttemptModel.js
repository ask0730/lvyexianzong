const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: true
  },
  ip: {
    type: String,
    required: true,
    index: true
  },
  userAgent: {
    type: String,
    default: ''
  },
  attemptTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  success: {
    type: Boolean,
    default: false
  },
  reason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// 创建复合索引
loginAttemptSchema.index({ username: 1, attemptTime: -1 });
loginAttemptSchema.index({ ip: 1, attemptTime: -1 });

// 清理过期记录的静态方法
loginAttemptSchema.statics.cleanOldRecords = async function(hours = 24) {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.deleteMany({ attemptTime: { $lt: cutoffTime } });
};

// 获取用户最近的失败尝试
loginAttemptSchema.statics.getRecentFailures = async function(username, minutes = 30) {
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  return this.find({
    username,
    success: false,
    attemptTime: { $gte: cutoffTime }
  }).sort({ attemptTime: -1 });
};

// 获取IP最近的失败尝试
loginAttemptSchema.statics.getRecentIPFailures = async function(ip, minutes = 30) {
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  return this.find({
    ip,
    success: false,
    attemptTime: { $gte: cutoffTime }
  }).sort({ attemptTime: -1 });
};

// 检查用户是否被锁定
loginAttemptSchema.statics.isUserLocked = async function(username, maxAttempts = 5, lockMinutes = 30) {
  const recentFailures = await this.getRecentFailures(username, lockMinutes);
  return recentFailures.length >= maxAttempts;
};

// 检查IP是否被锁定
loginAttemptSchema.statics.isIPLocked = async function(ip, maxAttempts = 10, lockMinutes = 30) {
  const recentFailures = await this.getRecentIPFailures(ip, lockMinutes);
  return recentFailures.length >= maxAttempts;
};

// 获取锁定剩余时间
loginAttemptSchema.statics.getLockRemainingTime = async function(username, maxAttempts = 5, lockMinutes = 30) {
  const recentFailures = await this.getRecentFailures(username, lockMinutes);
  if (recentFailures.length < maxAttempts) {
    return 0;
  }
  
  const oldestFailure = recentFailures[recentFailures.length - 1];
  const lockEndTime = new Date(oldestFailure.attemptTime.getTime() + lockMinutes * 60 * 1000);
  const remainingTime = lockEndTime.getTime() - Date.now();
  
  return Math.max(0, remainingTime);
};

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema); 