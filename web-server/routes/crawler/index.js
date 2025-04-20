const express = require('express');
const router = express.Router();
const SpiderNewsService = require('../../crawler');

const spiderNewsService = new SpiderNewsService();

// 获取爬虫新闻列表
router.get('/spider-news', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const result = await spiderNewsService.getNewsList(
      Number(page),
      Number(pageSize)
    );
    res.json(result);
  } catch (error) {
    console.error('获取爬虫新闻列表失败:', error);
    res.status(500).json({ 
      code: -1,
      message: '获取爬虫新闻列表失败',
      error: error.message
    });
  }
});

module.exports = router;