const axios = require('axios');
const cheerio = require('cheerio');
const SpiderNewsModel = require('../models/SpiderNewsModel');
const mongoose = require('mongoose');
const dbConfig = require('../config/db.config');

// 连接数据库
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// 定义爬虫目标网站
const targetUrls = [
    'http://www.farmer.com.cn/xwpd/nyyw/',    // 农民日报
    'http://www.moa.gov.cn/xw/zwdt/',         // 农业农村部
    'http://www.agri.cn/V20/xwzx/',           // 中国农业新闻网
    'http://www.agronet.com.cn/News/',        // 中国农业信息网
    'http://www.nongbao.com/news/'            // 中国农业新闻
];

// 设置请求头
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Connection': 'keep-alive'
};

// 爬取新闻函数
async function crawlNews(url) {
    try {
        const maxRetries = 3;
        let retries = 0;
        let response;

        while (retries < maxRetries) {
            try {
                response = await axios.get(url, { headers, timeout: 15000 });
                break;
            } catch (error) {
                retries++;
                if (retries === maxRetries) throw error;
                console.log(`第${retries}次重试: ${url}`);
                await new Promise(resolve => setTimeout(resolve, 3000 * retries));
            }
        }
        const $ = cheerio.load(response.data);
        
        // 根据不同网站使用不同的选择器
        const newsItems = [];
        
        if (url.includes('farmer.com.cn')) {
            $('.list li').each((i, element) => {
                const title = $(element).find('a').text().trim();
                const date = $(element).find('.date').text().trim();
                const link = $(element).find('a').attr('href');
                newsItems.push({
                    title,
                    source: '农民日报',
                    date,
                    link,
                    content: '',
                    crawlTime: new Date()
                });
            });
        } else if (url.includes('moa.gov.cn')) {
            $('.pub-list li').each((i, element) => {
                const title = $(element).find('a').text().trim();
                const date = $(element).find('.date').text().trim();
                const link = $(element).find('a').attr('href');
                if (title && date) {
                    newsItems.push({
                        title,
                        source: '农业农村部',
                        date,
                        link: link.startsWith('http') ? link : `http://www.moa.gov.cn${link}`,
                        content: '',
                        crawlTime: new Date()
                    });
                }
            });
        } else if (url.includes('agri.cn')) {
            $('.news-list li').each((i, element) => {
                const title = $(element).find('.title a').text().trim();
                const date = $(element).find('.date').text().trim();
                const link = $(element).find('.title a').attr('href');
                if (title && date) {
                    newsItems.push({
                        title,
                        source: '中国农业新闻网',
                        date,
                        link: link.startsWith('http') ? link : `http://www.agri.cn${link}`,
                        content: '',
                        crawlTime: new Date()
                    });
                }
            });
        } else if (url.includes('agronet.com.cn')) {
            $('.news-item').each((i, element) => {
                const title = $(element).find('.news-title').text().trim();
                const date = $(element).find('.news-date').text().trim();
                const link = $(element).find('a').attr('href');
                if (title && date) {
                    newsItems.push({
                        title,
                        source: '中国农业信息网',
                        date,
                        link,
                        content: '',
                        crawlTime: new Date()
                    });
                }
            });
        } else if (url.includes('agri.com.cn')) {
            $('.news-list li').each((i, element) => {
                const title = $(element).find('.title').text().trim();
                const date = $(element).find('.date').text().trim();
                const link = $(element).find('a').attr('href');
                if (title && date) {
                    newsItems.push({
                        title,
                        source: '中国农业资讯网',
                        date,
                        link,
                        content: '',
                        crawlTime: new Date()
                    });
                }
            });
        }

        // 保存到数据库
        for (const item of newsItems) {
            try {
                const exists = await SpiderNewsModel.findOne({ title: item.title });
                if (!exists && item.title) {
                    await SpiderNewsModel.create(item);
                    console.log(`保存新闻: ${item.title}`);
                }
            } catch (dbError) {
                console.error(`数据库操作失败: ${item.title}`, dbError);
            }
        }
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error(`爬取超时: ${url}`);
        } else if (error.response) {
            console.error(`爬取失败: ${url}, 状态码: ${error.response.status}`);
        } else if (error.request) {
            console.error(`请求失败: ${url}, 无响应`);
        } else {
            console.error(`爬取错误: ${url}`, error.message);
        }
    }
}

// 主函数
async function main() {
    console.log('开始爬取新闻...');
    try {
        for (const url of targetUrls) {
            await crawlNews(url);
            // 添加延迟，避免频繁请求
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        console.log('爬取完成');
    } catch (error) {
        console.error('爬虫运行出错:', error);
    } finally {
        await mongoose.disconnect();
    }
}

// 执行爬虫
main();