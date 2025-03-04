const express = require('express');
const router = express.Router();
const NewsController = require('../../controllers/web/NewsController');

// 获取文章收藏统计
router.get('/collection-statistics', NewsController.getCollectionStatistics);

module.exports = router;