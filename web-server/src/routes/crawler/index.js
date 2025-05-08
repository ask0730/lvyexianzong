const express = require('express');
const { SpiderNewsController } = require('../../controllers/crawler/SpiderNewsController');

const router = express.Router();
const spiderNewsController = new SpiderNewsController();

// 获取爬虫新闻列表
router.get('/spider-news', spiderNewsController.getNewsList);

module.exports = router;