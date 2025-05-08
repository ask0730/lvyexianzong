const express = require('express');
const router = express.Router();
const SpiderNewsController = require('../../controllers/admin/SpiderNewsController');
const { auth } = require('../../middleware/AuthMiddleware');

// 获取爬虫新闻列表
router.get('/list', auth, SpiderNewsController.getList);

// 获取爬虫新闻详情
router.get('/detail', auth, SpiderNewsController.getDetail);

// 手动触发爬虫
router.post('/crawl', auth, SpiderNewsController.crawlNews);

module.exports = router;