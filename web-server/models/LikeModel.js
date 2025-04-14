const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  newsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 创建复合索引确保用户只能对同一篇文章点赞一次
likeSchema.index({ userId: 1, newsId: 1 }, { unique: true });

const LikeModel = mongoose.model('Like', likeSchema);

module.exports = LikeModel;
