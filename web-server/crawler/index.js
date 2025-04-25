const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

// 定义新闻模型
const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    publishDate: { type: String, required: true },
    source: { type: String, default: '中国农业农村部' },
    url: { type: String, unique: true, required: true },
    isPublish: { type: Number, default: 1 },
    editTime: { type: Date, default: Date.now }
});

const NewsModel = mongoose.model('News', newsSchema);

class SpiderNewsService {
    constructor() {
        this.baseUrl = 'http://www.moa.gov.cn';
        this.initDatabase();
    }

    // 初始化数据库连接
    async initDatabase() {
        try {
            await mongoose.connect('mongodb://127.0.0.1:27017/company-system', {
                serverSelectionTimeoutMS: 5000,
                retryWrites: true,
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('数据库连接成功');
        } catch (err) {
            console.error('数据库连接失败:', err);
        }
    }

    // 初始化爬虫服务
    async initialize() {
        await this.initDatabase();
        console.log('爬虫服务初始化成功');
    }

    // 执行爬虫任务
    async crawl() {
        try {
            await this.fetchNewsPage();
            console.log('爬虫任务执行成功');
        } catch (error) {
            console.error('爬虫任务执行失败:', error);
        }
    }

    // 获取新闻列表页面
    async fetchNewsPage() {
        const url = `${this.baseUrl}/xw/zwdt/`;
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36',
                    'Referer': url,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                }
            });
            const newsList = this.parseNewsList(response.data);
            await this.saveNewsToDatabase(newsList);
            return newsList;
        } catch (error) {
            console.error('获取新闻列表失败:', error.message);
            throw error;
        }
    }

    // 解析新闻列表
    parseNewsList(html) {
        const $ = cheerio.load(html);
        const newsList = [];

        $('.pub-media1-txt-list li').each((index, element) => {
            const $li = $(element);
            const $a = $li.find('a');

            const title = $a.text().trim();
            const href = $a.attr('href');
            // 确保能够正确提取到发布日期
            const $dateElement = $li.find('span');
            let publishTime = $dateElement.length ? $dateElement.text().trim().replace(/[\[\]]/g, '') : '';
            if (!publishTime) {
                console.warn(`未提取到新闻 "${title}" 的发布日期`);
                // 可以根据实际情况设置一个默认值，例如当前日期
                publishTime = new Date().toISOString().split('T')[0];
            }

            let url;
            if (href.startsWith('http')) {
                url = href;
            } else {
                url = `${this.baseUrl}/xw/zwdt/${href.replace(/^\.?\//, '')}`;
            }

            newsList.push({
                title,
                url,
                publishTime,
                summary: $li.text().replace(title, '').replace(publishTime, '').trim()
            });
        });

        console.log(`解析到 ${newsList.length} 条新闻`);
        return newsList;
    }

    // 将新闻保存到数据库
    async saveNewsToDatabase(newsList) {
        if (!mongoose.connection.readyState) return;

        for (const news of newsList) {
            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                const existing = await NewsModel.findOne({ url: news.url });
                if (existing) continue;

                const content = await this.fetchNewsContent(news.url);
                await NewsModel.create({
                    title: news.title,
                    content: content || news.summary,
                    publishDate: news.publishTime, // 确保 publishDate 字段被正确传递
                    source: news.source,
                    url: news.url,
                    isPublish: 1,
                    editTime: new Date()
                });
                console.log(`保存成功：${news.title}`);
            } catch (error) {
                console.error(`保存失败：${news.title}`, error);
            }
        }
    }

    // 获取新闻详情内容
    async fetchNewsContent(url) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36',
                    'Referer': this.baseUrl,
                    'Accept': 'text/html'
                },
                timeout: 10000
            });
            const $ = cheerio.load(response.data);
            const content = this.extractContent($);
            return content || '内容解析失败';
        } catch (error) {
            console.error(`解析失败：${url}`, error.message);
            return null;
        }
    }

    // 提取新闻内容
    extractContent($) {
        return $('.zwgk_content, .TRS_Editor, .article-content')
           .map((i, el) => $(el).html())
           .toArray()
           .join('')
           .replace(/<\/?[^>]+>/g, '')
           .replace(/\s{2,}/g, ' ')
           .trim() ||
            $('body').text().replace(/\s+/g, ' ').trim();
    }

    // 获取新闻列表（支持分页）
    async getNewsList(page = 1, pageSize = 10) {
        try {
            // 检查数据库连接状态，如果未连接则先初始化连接
            if (!mongoose.connection.readyState) {
                await this.initDatabase();
            }
            const skip = (page - 1) * pageSize;
            const [list, total] = await Promise.all([
                NewsModel.find({ isPublish: 1 })
                   .sort({ publishDate: -1 })
                   .skip(skip)
                   .limit(pageSize),
                NewsModel.countDocuments({ isPublish: 1 })
            ]);

            return {
                code: 0,
                message: '成功获取新闻列表',
                data: { list, total, page, pageSize }
            };
        } catch (error) {
            console.error('获取列表失败:', error.message);
            return { code: -1, message: '获取失败', error: error.message };
        }
    }

    // 停止爬虫服务
    async stop() {
        await mongoose.disconnect();
        console.log('爬虫服务已停止');
    }
}

module.exports = SpiderNewsService;
    