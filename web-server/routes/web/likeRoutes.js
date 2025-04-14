const express = require('express');
const router = express.Router();
const likeController = require('../../controllers/web/likeController');
const AuthMiddleware = require('../../middleware/AuthMiddleware');

// 添加点赞
router.post('/add', AuthMiddleware.requireAuth, likeController.addLike);

// 取消点赞
router.post('/remove', AuthMiddleware.requireAuth, likeController.removeLike);

// 获取点赞状态
router.get('/status/:newsId', AuthMiddleware.requireAuth, likeController.getLikeStatus);

// 获取点赞数量
router.get('/count/:newsId', likeController.getLikeCount);

// 批量获取点赞数量
router.post('/batch-counts', likeController.getBatchLikeCounts);

module.exports = router;
    

