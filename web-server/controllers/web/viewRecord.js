const ViewRecordModel = require('../../models/ViewRecordModel');
const NewsModel = require('../../models/NewsModel');

// 记录文章浏览
const recordView = async (req, res) => {
  try {
    const { articleId } = req.body;
    const userIp = req.ip;
    const userId = req.user ? req.user._id : null;

    // 创建浏览记录
    await ViewRecordModel.create({
      articleId,
      userIp,
      userId,
    });

    res.json({
      code: 0,
      msg: '记录成功'
    });
  } catch (error) {
    console.error('记录浏览量失败:', error);
    res.json({
      code: 1,
      msg: '记录失败'
    });
  }
};

// 获取文章浏览量统计
const getViewStatistics = async (req, res) => {
  try {
    // 聚合查询获取文章浏览量排行
    const viewStats = await ViewRecordModel.aggregate([
      {
        $group: {
          _id: '$articleId',
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

    // 获取文章标题
    const articleIds = viewStats.map(stat => stat._id);
    const articles = await NewsModel.find({ _id: { $in: articleIds } }, 'title');

    // 组装数据
    const titles = [];
    const counts = [];
    viewStats.forEach(stat => {
      const article = articles.find(a => a._id.toString() === stat._id.toString());
      if (article) {
        titles.push(article.title);
        counts.push(stat.count);
      }
    });

    res.json({
      code: 0,
      data: {
        titles,
        counts
      }
    });
  } catch (error) {
    console.error('获取浏览量统计失败:', error);
    res.json({
      code: 1,
      msg: '获取统计数据失败'
    });
  }
};

// 获取24小时浏览量分布
const getHourlyViewDistribution = async (req, res) => {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 按小时统计浏览量
    const hourlyStats = await ViewRecordModel.aggregate([
      {
        $match: {
          viewTime: { $gte: yesterday, $lte: now }
        }
      },
      {
        $group: {
          _id: { $hour: '$viewTime' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // 填充24小时的数据
    const hours = [];
    const counts = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i.toString().padStart(2, '0') + ':00');
      const hourData = hourlyStats.find(stat => stat._id === i);
      counts.push(hourData ? hourData.count : 0);
    }

    res.json({
      code: 0,
      data: {
        hours,
        counts
      }
    });
  } catch (error) {
    console.error('获取24小时分布数据失败:', error);
    res.json({
      code: 1,
      msg: '获取分布数据失败'
    });
  }
};

module.exports = {
  recordView,
  getViewStatistics,
  getHourlyViewDistribution
};