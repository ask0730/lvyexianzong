const NewsModel = require('../../models/NewsModel');
const CollectionModel = require('../../models/CollectionModel');
const mongoose = require('mongoose');

const NewsService = {
  getList: async ({ _id }) => {
    return _id ? NewsModel.find({ _id, isPublish: 1 }) : NewsModel.find({ isPublish: 1 }).sort({ editTime: -1 });
  },
  
  getTopList: async ({ limit }) => {
    return NewsModel.find({ isPublish: 1 }).sort({ editTime: -1 }).limit(limit);
  },

  // 收藏文章
  collectArticle: async ({ userId, articleId }) => {
    try {
      const collection = new CollectionModel({
        userId: new mongoose.Types.ObjectId(userId),
        articleId: new mongoose.Types.ObjectId(articleId)
      });

      await collection.save();
      return { success: true, message: '收藏成功' };
    } catch (error) {
      console.error('收藏文章错误:', error);
      return { success: false, message: '收藏失败' };
    }
  },

  // 取消收藏文章
  uncollectArticle: async ({ userId, articleId }) => {
    try {
      await CollectionModel.findOneAndDelete({ 
        userId: new mongoose.Types.ObjectId(userId), 
        articleId: new mongoose.Types.ObjectId(articleId) 
      });

      return { success: true, message: '取消收藏成功' };
    } catch (error) {
      console.error('取消收藏错误:', error);
      return { success: false, message: '取消收藏失败' };
    }
  },

  // 获取文章的收藏状态
  getArticleCollectedStatus: async ({ userId, articleId }) => {
    try {
      const collection = await CollectionModel.findOne({ 
        userId: new mongoose.Types.ObjectId(userId), 
        articleId: new mongoose.Types.ObjectId(articleId) 
      });

      return { 
        success: true, 
        data: !!collection 
      };
    } catch (error) {
      console.error('获取收藏状态错误:', error);
      return { success: false, message: '获取收藏状态失败' };
    }
  },

  // 获取用户收藏的文章列表
  getUserCollectedArticles: async ({ userId }) => {
    try {
      const collections = await CollectionModel.aggregate([
        { 
          $match: { 
            userId: new mongoose.Types.ObjectId(userId) 
          } 
        },
        {
          $lookup: {
            from: 'news', 
            localField: 'articleId',
            foreignField: '_id',
            as: 'article'
          }
        },
        { $unwind: '$article' },
        { 
          $project: {
            _id: '$article._id',
            title: '$article.title',
            content: '$article.content',
            cover: '$article.cover',
            editTime: '$article.editTime'
          }
        }
      ]);

      return { 
        success: true, 
        data: collections 
      };
    } catch (error) {
      console.error('获取收藏文章列表错误:', error);
      return { success: false, message: '获取收藏文章列表失败' };
    }
  },

  // 获取文章收藏统计
  getCollectionStatistics: async () => {
    try {
      // 使用聚合管道进行统计
      const statistics = await CollectionModel.aggregate([
        {
          $lookup: {
            from: 'news',
            localField: 'articleId',
            foreignField: '_id',
            as: 'article'
          }
        },
        { $unwind: '$article' },
        {
          $group: {
            _id: {
              articleId: '$article._id',
              title: '$article.title'
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ]);

      // 格式化数据为前端所需格式
      const titles = statistics.map(stat => stat._id.title);
      const counts = statistics.map(stat => stat.count);

      return {
        success: true,
        message: '获取收藏统计成功',
        data: {
          titles,
          counts
        }
      };

    } catch (error) {
      console.error('获取收藏统计失败:', error);
      return {
        success: false,
        message: '获取收藏统计失败',
        data: null
      };
    }
  }
};

module.exports = NewsService;
