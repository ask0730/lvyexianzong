const express = require('express');
const router = express.Router();

// 获取爬虫新闻列表
router.get('/spider-news', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    // 由于已删除对../../crawler的引用，这里需要重新实现获取爬虫新闻列表的逻辑
    res.json({ 
      code: -1,
      message: '获取爬虫新闻列表失败',
      error: '模块已删除'
    });
  } catch (error) {
    console.error('获取爬虫新闻列表失败:', error);
    res.status(500).json({ 
      code: -1,
      message: '获取爬虫新闻列表失败',
      error: error.message
    });
  }
});

// 启动爬虫任务
router.post('/spider-news/start-crawler', async (req, res) => {
  try {
    // 由于已删除对../../crawler的引用，这里需要重新实现启动爬虫任务的逻辑
    res.json({ 
      code: -1,
      message: '爬虫任务执行失败',
      error: '模块已删除'
    });
  } catch (error) {
    console.error('爬虫任务执行失败:', error);
    res.status(500).json({ 
      code: -1,
      message: '爬虫任务执行失败',
      error: error.message
    });
  }
});

module.exports = router;