const express = require('express');
const router = express.Router();
const ViewRecordController = require('../../controllers/web/ViewRecordController');
const AuthMiddleware = require('../../middleware/AuthMiddleware');

// 记录文章浏览
router.post('/webapi/view-record', ViewRecordController.recordView);

// 获取文章浏览量统计
router.get('/webapi/view-record/statistics', ViewRecordController.getViewStatistics);

// 获取24小时浏览量分布
router.get('/webapi/view-record/hourly-distribution', ViewRecordController.getHourlyViewDistribution);

module.exports = router;