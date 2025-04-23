const express = require('express');
const router = express.Router();
const AgricultureNewsCrawler = require('../../crawler');

const spiderNewsService = new AgricultureNewsCrawler();

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

// 启动爬虫任务
router.post('/spider-news/start-crawler', async (req, res) => {
  try {
    await spiderNewsService.initialize();
    await spiderNewsService.crawl();
    await spiderNewsService.stop();
    res.json({ 
      code: 0,
      message: '爬虫任务执行成功'
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