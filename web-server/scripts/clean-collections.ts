import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function cleanCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('已连接到数据库');

    const db = mongoose.connection.db;
    
    // 删除旧集合
    try {
      await db.dropCollection('collections');
      console.log('已删除 collections 集合');
    } catch (err) {
      console.log('collections 集合不存在或删除失败');
    }

    try {
      await db.dropCollection('article_favorites');
      console.log('已删除 article_favorites 集合');
    } catch (err) {
      console.log('article_favorites 集合不存在或删除失败');
    }

    // 列出剩余的集合
    const collections = await db.listCollections().toArray();
    console.log('剩余集合:', collections.map(c => c.name));

    await mongoose.disconnect();
    console.log('清理完成');
    process.exit(0);
  } catch (error) {
    console.error('清理失败:', error);
    process.exit(1);
  }
}

cleanCollections(); 