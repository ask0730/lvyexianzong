import express from 'express';
import { addFavorite, removeFavorite } from '../controllers/favorite';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 确保所有路由都经过认证中间件
router.use(authMiddleware);

// 修改路由路径以匹配前端请求
router.post('/collect', addFavorite);
router.delete('/collect/:articleId', removeFavorite);

export default router; 