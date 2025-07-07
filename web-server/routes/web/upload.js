const express = require('express');
const router = express.Router();
const UploadController = require('../../controllers/web/UploadController');

// 上传单个分片
router.post('/chunk', UploadController.uploadChunk);
// 查询已上传分片
router.get('/chunk', UploadController.getUploadedChunks);
// 合并分片
router.post('/merge', UploadController.mergeChunks);

module.exports = router; 