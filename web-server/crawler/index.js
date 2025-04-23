const axios = require('axios');
const cheerio = require('cheerio');
const NewsModel = require('../models/NewsModel');
const mongoose = require('mongoose');

class SpiderNewsService {
  constructor() {
    this.baseUrl = 'http://www.moa.gov.cn';
    this.newsCache = [];
    this.initDatabase();
  }

  async initDatabase() {
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/company-system', {
        serverSelectionTimeoutMS: 5000,
        retryWrites: true
      });
      console.log('数据库连接成功');
    } catch (err) {
      console.error('数据库连接失败=>', err);
    }
  }

  async initialize() {
    await this.initDatabase();
    console.log('爬虫服务初始化成功');
  }

  async crawl() {
    try {
      await this.fetchNewsPage();
      console.log('爬虫任务执行成功');
    } catch (error) {
      console.error('爬虫任务执行失败:', error);
      throw error;
    }
  }

  async fetchNewsPage(page = 1) {
    try {
      const response = await axios.get(`${this.baseUrl}/xw/zwdt/`);
      const newsList = this.parseNewsContent(response.data);
      
      // 将新闻数据保存到数据库
      if (mongoose.connection.readyState === 1) {
        for (const news of newsList) {
          try {
            // 检查是否已存在相同URL的新闻
            const existingNews = await NewsModel.findOne({ url: news.url });
            if (!existingNews) {
              await NewsModel.create({
                title: news.title,
                content: news.summary,
                publishDate: news.publishTime,
                source: news.source,
                url: news.url,
                isPublish: 1,
                editTime: new Date()
              });
              console.log('新增新闻:', news.title);
            }
          } catch (dbError) {
            console.error('保存新闻数据失败:', dbError);
          }
        }
      } else {
        console.error('数据库未连接，无法保存新闻数据');
        await this.initDatabase();
      }
      
      return newsList;
    } catch (error) {
      console.error('获取新闻页面失败:', error);
      return null;
    }
  }

  parseNewsContent(html) {
    const $ = cheerio.load(html);
    const newsList = [];

    $('.pub-media1-txt-list li').each((index, element) => {
      const $element = $(element);
      const $link = $element.find('a');
      const $content = $element.find('.txt');
      const news = {
        title: $link.text().trim(),
        summary: $content.length ? $content.text().trim() : $link.text().trim(),
        publishTime: $element.find('span').text().trim().replace(/[\[\]]/g, ''),
        source: '中国农业农村部',
        url: this.baseUrl + $link.attr('href'),
      };
      newsList.push(news);
    });

    return newsList;
  }

  async getNewsList(page = 1, pageSize = 10) {
    try {
      const skip = (page - 1) * pageSize;
      const query = { isPublish: 1 };
      
      const total = await NewsModel.countDocuments(query);
      const list = await NewsModel.find(query)
        .sort({ publishDate: -1 })
        .skip(skip)
        .limit(pageSize);

      return {
        code: 0,
        message: '获取新闻列表成功',
        data: {
          list,
          total,
          page,
          pageSize
        }
      };
    } catch (error) {
      console.error('获取新闻列表失败:', error);
      return {
        code: -1,
        message: '获取新闻列表失败',
        error: error.message
      };
    }
  }

  async stop() {
    // 清理资源或执行停止操作
    console.log('爬虫服务停止');
  }
}

module.exports = SpiderNewsService;

// 创建爬虫服务实例并启动
const spiderService = new SpiderNewsService();

// 定期执行爬虫任务
setInterval(async () => {
  try {
    await spiderService.fetchNewsPage();
    console.log('新闻数据更新成功');
  } catch (error) {
    console.error('爬虫任务执行失败:', error);
  }
}, 5 * 60 * 1000); // 每5分钟执行一次