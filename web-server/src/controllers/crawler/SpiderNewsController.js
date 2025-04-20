const AgricultureNewsCrawler = require('../../../crawler');

class SpiderNewsController {
  constructor() {
    this.crawler = new AgricultureNewsCrawler();
  }

  getNewsList = async (req, res) => {
    try {
      await this.crawler.initialize();
      await this.crawler.crawl();
      await this.crawler.stop();

      res.json({
        code: 0,
        message: '爬取新闻成功'
      });
    } catch (error) {
      console.error('爬取新闻错误:', error);
      res.status(500).json({
        code: 1,
        message: '爬取新闻失败',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = { SpiderNewsController };