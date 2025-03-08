const ViewRecordModel = require('../../models/ViewRecordModel');
const mongoose = require('mongoose');

const ViewRecordService = {
  // 记录文章浏览
  recordView: async ({ articleId, userIp, userId = null }) => {
    try {
      const viewRecord = new ViewRecordModel({
        articleId: new mongoose.Types.ObjectId(articleId),
        userIp,
        ...(userId && { userId: new mongoose.Types.ObjectId(userId) })
      });
      await viewRecord.save();
      return { success: true, message: '浏览记录保存成功' };
    } catch (error) {
      console.error('保存浏览记录失败:', error);
      return { success: false, message: '保存浏览记录失败' };
    }
  },

  // 获取文章浏览量统计数据
  getViewStatistics: async () => {
    try {
      const statistics = await ViewRecordModel.aggregate([
        {
          $group: {
            _id: '$articleId',
            viewCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'news',
            localField: '_id',
            foreignField: '_id',
            as: 'article'
          }
        },
        { $unwind: '$article' },
        {
          $project: {
            _id: 1,
            title: '$article.title',
            viewCount: 1
          }
        },
        { $sort: { viewCount: -1 } },
        { $limit: 10 }
      ]);

      const titles = statistics.map(stat => stat.title);
      const counts = statistics.map(stat => stat.viewCount);

      return {
        success: true,
        message: '获取浏览统计成功',
        data: {
          titles,
          counts
        }
      };
    } catch (error) {
      console.error('获取浏览统计失败:', error);
      return {
        success: false,
        message: '获取浏览统计失败',
        data: null
      };
    }
  },

  // 获取24小时内的浏览量分布
  getHourlyViewDistribution: async () => {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

      const hourlyStats = await ViewRecordModel.aggregate([
        {
          $match: {
            viewTime: { $gte: oneDayAgo, $lte: now }
          }
        },
        {
          $group: {
            _id: {
              hour: { $hour: '$viewTime' },
              date: { $dateToString: { format: '%Y-%m-%d', date: '$viewTime' } }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.date': 1, '_id.hour': 1 }
        }
      ]);

      // 初始化24小时的数据
      const hourlyData = Array(24).fill(0);
      hourlyStats.forEach(stat => {
        hourlyData[stat._id.hour] = stat.count;
      });

      return {
        success: true,
        message: '获取小时分布统计成功',
        data: {
          hours: Array.from({ length: 24 }, (_, i) => `${i}时`),
          counts: hourlyData
        }
      };
    } catch (error) {
      console.error('获取小时分布统计失败:', error);
      return {
        success: false,
        message: '获取小时分布统计失败',
        data: null
      };
    }
  }
};

module.exports = ViewRecordService;