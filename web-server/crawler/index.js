const axios = require('axios');
const cheerio = require('cheerio');

class SpiderNewsService {
  constructor() {
    this.baseUrl = 'http://www.farmer.com.cn';
    this.newsCache = [];
  }

  async fetchNewsPage(page = 1) {
    try {
      const response = await axios.get(`${this.baseUrl}/news/list?page=${page}`);
      return response.data;
    } catch (error) {
      console.error('获取新闻页面失败:', error);
      return null;
    }
  }

  parseNewsContent(html) {
    const $ = cheerio.load(html);
    const newsList = [];

    $('.news-item').each((index, element) => {
      const $element = $(element);
      const news = {
        title: $element.find('.news-title').text().trim(),
        summary: $element.find('.news-summary').text().trim(),
        publishTime: $element.find('.news-time').text().trim(),
        source: '中国农业新闻网',
        url: this.baseUrl + $element.find('a').attr('href'),
      };
      newsList.push(news);
    });

    return newsList;
  }

  async getNewsList(page = 1, pageSize = 10) {
    try {
      // 如果缓存为空，则获取新数据
      if (this.newsCache.length === 0) {
        const html = await this.fetchNewsPage(page);
        if (html) {
          this.newsCache = this.parseNewsContent(html);
        }
      }

      // 根据分页参数返回数据
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedNews = this.newsCache.slice(start, end);

      return {
        code: 0,
        message: '获取新闻列表成功',
        data: {
          list: paginatedNews,
          total: this.newsCache.length,
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
}

module.exports = SpiderNewsService;