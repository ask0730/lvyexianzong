import { Request, Response } from 'express';
import { SpiderNewsService } from '../../services/crawler/SpiderNewsService';

export class SpiderNewsController {
  private spiderNewsService: SpiderNewsService;

  constructor() {
    this.spiderNewsService = new SpiderNewsService();
  }

  getNewsList = async (req: Request, res: Response) => {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      const result = await this.spiderNewsService.getNewsList(
        Number(page),
        Number(pageSize)
      );
      res.json(result);
    } catch (error) {
      console.error('获取爬虫新闻列表失败:', error);
      res.status(500).json({ message: '获取爬虫新闻列表失败' });
    }
  };
}