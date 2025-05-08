import { Router } from 'express';
import { SpiderNewsController } from '../../controllers/crawler/SpiderNewsController';

const router = Router();
const spiderNewsController = new SpiderNewsController();

// 获取爬虫新闻列表
router.get('/spider-news', spiderNewsController.getNewsList);

// 启动爬虫任务
router.post('/spider-news/start-crawler', spiderNewsController.startCrawler);

export default router;