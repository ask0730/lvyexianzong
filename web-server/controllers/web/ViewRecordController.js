const ViewRecordService = require('../../services/web/ViewRecordService');

const ViewRecordController = {
  // 记录文章浏览
  recordView: async (req, res) => {
    const { articleId } = req.body;
    const userIp = req.ip;
    const userId = req.user ? req.user._id : null;

    const result = await ViewRecordService.recordView({ articleId, userIp, userId });
    res.send({
      code: result.success ? 0 : -1,
      message: result.message
    });
  },

  // 获取文章浏览量统计
  getViewStatistics: async (req, res) => {
    const result = await ViewRecordService.getViewStatistics();
    res.send({
      code: result.success ? 0 : -1,
      message: result.message,
      data: result.data
    });
  },

  // 获取24小时浏览量分布
  getHourlyViewDistribution: async (req, res) => {
    const result = await ViewRecordService.getHourlyViewDistribution();
    res.send({
      code: result.success ? 0 : -1,
      message: result.message,
      data: result.data
    });
  }
};

module.exports = ViewRecordController;