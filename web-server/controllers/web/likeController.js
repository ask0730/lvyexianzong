const LikeService = require('../../services/web/likeService');

// 添加点赞
async function addLike(req, res) {
  try {
    const { newsId } = req.body;
    // 检查 req.user 是否存在
    if (!req.user ||!req.user._id) {
      throw new Error('用户未认证');
    }
    const userId = req.user._id;
    const result = await LikeService.addLike(userId, newsId);
    res.json(result);
  } catch (error) {
    console.error('添加点赞失败:', {
      error: error.message,
      stack: error.stack,
      userId: req.user? req.user._id : undefined,
      newsId: req.body.newsId
    });
    res.status(500).json({ success: false, message: '点赞失败' });
  }
}

// 取消点赞
async function removeLike(req, res) {
  try {
    const { newsId } = req.body;
    // 检查 req.user 是否存在
    if (!req.user ||!req.user._id) {
      throw new Error('用户未认证');
    }
    const userId = req.user._id;
    const result = await LikeService.removeLike(userId, newsId);
    res.json(result);
  } catch (error) {
    console.error('取消点赞失败:', {
      error: error.message,
      stack: error.stack,
      userId: req.user? req.user._id : undefined,
      newsId: req.body.newsId
    });
    res.status(500).json({ success: false, message: '取消点赞失败' });
  }
}

// 获取点赞状态
async function getLikeStatus(req, res) {
  try {
    const { newsId } = req.params;
    // 检查 req.user 是否存在
    if (!req.user ||!req.user._id) {
      return res.json({ code: 1, data: false, message: '用户未认证' });
    }
    const userId = req.user._id;
    const result = await LikeService.getLikeStatus(userId, newsId);
    res.json(result);
  } catch (error) {
    console.error('获取点赞状态失败:', {
      error: error.message,
      stack: error.stack,
      userId: req.user? req.user._id : undefined,
      newsId: req.params.newsId
    });
    res.json({ code: 1, data: false, message: error.message || '获取点赞状态失败' });
  }
}

// 获取点赞数量
async function getLikeCount(req, res) {
  try {
    const { newsId } = req.params;
    const result = await LikeService.getLikeCount(newsId);
    res.json(result);
  } catch (error) {
    console.error('获取点赞数量失败:', {
      error: error.message,
      stack: error.stack,
      newsId: req.params.newsId
    });
    res.status(500).json({ success: false, message: '获取点赞数量失败' });
  }
}

// 批量获取点赞数量
async function getBatchLikeCounts(req, res) {
  try {
    const { newsIds } = req.body;
    const result = await LikeService.getBatchLikeCounts(newsIds);
    res.json(result);
  } catch (error) {
    console.error('批量获取点赞数量失败:', {
      error: error.message,
      stack: error.stack,
      newsIds: req.body.newsIds
    });
    res.status(500).json({ success: false, message: '获取点赞数量失败' });
  }
}

// 导出控制器方法
module.exports = {
  addLike,
  removeLike,
  getLikeStatus,
  getLikeCount,
  getBatchLikeCounts
};    