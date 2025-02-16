import { Schema, model } from 'mongoose';
import mongoose from 'mongoose';

// 定义模型接口
interface IFavorite {
  user: mongoose.Types.ObjectId;
  article: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// 创建 Schema
const favoriteSchema = new Schema<IFavorite>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '用户ID是必需的'],
    index: true
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: [true, '文章ID是必需的'],
    index: true
  }
}, {
  timestamps: true,
  collection: 'article_favorites', // 明确指定集合名
  versionKey: false // 不使用 __v 字段
});

// 删除现有的索引并重新创建
export const initializeFavoriteModel = async () => {
  try {
    // 1. 删除旧的集合
    await mongoose.connection.db.dropCollection('collections').catch(() => {
      console.log('collections 集合不存在');
    });
    
    await mongoose.connection.db.dropCollection('article_favorites').catch(() => {
      console.log('article_favorites 集合不存在');
    });

    // 2. 创建新的集合和索引
    await favoriteSchema.index(
      { user: 1, article: 1 },
      { 
        unique: true,
        name: 'unique_user_article',
        background: true,
        sparse: true // 只对非null值建立索引
      }
    );

    console.log('收藏模型初始化成功');
    return true;
  } catch (error) {
    console.error('收藏模型初始化失败:', error);
    return false;
  }
};

// 创建并导出模型
export const Favorite = model<IFavorite>('Favorite', favoriteSchema); 