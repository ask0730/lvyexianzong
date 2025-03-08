const mongoose = require('mongoose');

const viewRecordSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true
  },
  viewTime: {
    type: Date,
    default: Date.now
  },
  userIp: {
    type: String,
    required: true
  },
  // 可选的用户ID，用于记录登录用户的浏览记录
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// 创建复合索引以提高查询性能
viewRecordSchema.index({ articleId: 1, viewTime: -1 });
viewRecordSchema.index({ userIp: 1, articleId: 1 });

const ViewRecordModel = mongoose.model('ViewRecord', viewRecordSchema);

module.exports = ViewRecordModel;