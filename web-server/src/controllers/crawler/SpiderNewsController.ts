import { Request, Response } from 'express';
import { SpiderNewsService } from '../../services/crawler/SpiderNewsService';
import AgricultureNewsCrawler from '../../crawler';

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

  startCrawler = async (req: Request, res: Response) => {
    try {
      const crawler = new AgricultureNewsCrawler();
      await crawler.initialize();
      await crawler.crawl();
      await crawler.stop();
      res.json({ message: '爬虫任务执行成功' });
    } catch (error) {
      console.error('爬虫任务执行失败:', error);
      res.status(500).json({ message: '爬虫任务执行失败' });
    }
  };
}