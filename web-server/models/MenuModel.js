const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  path: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  component: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  requireAdmin: {
    type: Boolean,
    default: false
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// 创建索引
menuSchema.index({ parentId: 1, order: 1 });
menuSchema.index({ path: 1 });

// 虚拟字段：子菜单
menuSchema.virtual('children', {
  ref: 'Menu',
  localField: '_id',
  foreignField: 'parentId'
});

// 确保虚拟字段在JSON序列化时包含
menuSchema.set('toJSON', { virtuals: true });
menuSchema.set('toObject', { virtuals: true });

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu; 