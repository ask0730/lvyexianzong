import mongoose from 'mongoose';
import { initializeFavoriteModel } from '../models/favorite';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {
      autoIndex: true // 确保索引会被创建
    });

    console.log('MongoDB 连接成功');

    // 清理旧的集合
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    // 删除相关的集合
    for (const collection of collections) {
      if (collection.name === 'collections' || 
          collection.name === 'article_favorites') {
        try {
          await db.dropCollection(collection.name);
          console.log(`已删除集合: ${collection.name}`);
        } catch (err) {
          console.log(`删除集合 ${collection.name} 失败:`, err);
        }
      }
    }

    // 初始化新的收藏模型
    await initializeFavoriteModel();

    console.log('数据库初始化完成');

  } catch (error) {
    console.error('MongoDB 连接失败:', error);
    process.exit(1);
  }
}; 