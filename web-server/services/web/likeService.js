const LikeModel = require('../../models/LikeModel');

class LikeService {
  // 添加点赞
  static async addLike(userId, newsId) {
    try {
      const like = new LikeModel({
        userId,
        newsId
      });
      await like.save();
      return { success: true };
    } catch (error) {
      console.error('数据库添加点赞失败:', {
        error: error.message,
        stack: error.stack,
        userId,
        newsId
      });
      if (error.code === 11000) { // 重复点赞错误
        return { success: false, message: '您已经点赞过该文章' };
      }
      throw error;
    }
  }

  // 取消点赞
  static async removeLike(userId, newsId) {
    try {
      const result = await LikeModel.deleteOne({ userId, newsId });
      return { success: result.deletedCount > 0 };
    } catch (error) {
      console.error('数据库取消点赞失败:', {
        error: error.message,
        stack: error.stack,
        userId,
        newsId
      });
      throw error;
    }
  }

  // 获取用户对文章的点赞状态
  static async getLikeStatus(userId, newsId) {
    try {
      const like = await LikeModel.findOne({ userId, newsId });
      return { code: 0, data: !!like, message: '获取点赞状态成功' };
    } catch (error) {
      console.error('数据库获取点赞状态失败:', {
        error: error.message,
        stack: error.stack,
        userId,
        newsId
      });
      throw error;
    }
  }

  // 获取文章的点赞数量
  static async getLikeCount(newsId) {
    try {
      const count = await LikeModel.countDocuments({ newsId });
      return {
        code: 0,
        data: { count },
        message: '获取点赞数量成功'
      };
    } catch (error) {
      console.error('数据库获取点赞数量失败:', {
        error: error.message,
        stack: error.stack,
        newsId
      });
      return {
        code: 1,
        data: null,
        message: '获取点赞数量失败'
      };
    }
  }

  // 批量获取多篇文章的点赞数量
  static async getBatchLikeCounts(newsIds) {
    try {
      const counts = await LikeModel.aggregate([
        { $match: { newsId: { $in: newsIds } } },
        { $group: { _id: '$newsId', count: { $sum: 1 } } }
      ]);
      return counts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});
    } catch (error) {
      console.error('数据库批量获取点赞数量失败:', {
        error: error.message,
        stack: error.stack,
        newsIds
      });
      throw error;
    }
  }
}

module.exports = LikeService;