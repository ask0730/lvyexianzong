const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 创建复合唯一索引，防止重复收藏
CollectionSchema.index({ userId: 1, articleId: 1 }, { unique: true });

module.exports = mongoose.model('Collection', CollectionSchema);
