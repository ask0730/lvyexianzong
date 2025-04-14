const mongoose = require('mongoose');
const UserModel = require('./UserModel');

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  newsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdTime: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Comment', commentSchema);