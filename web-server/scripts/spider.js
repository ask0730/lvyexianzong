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
    'http://www.farmer.com.cn/xwpd/nyyw/',  // 农民日报
    'http://www.agri.cn/V20/xwpd/'          // 中国农业新闻网
];

// 爬取新闻函数
async function crawlNews(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        // 根据不同网站使用不同的选择器
        const newsItems = [];
        
        if (url.includes('farmer.com.cn')) {
            $('.list li').each((i, element) => {
                const title = $(element).find('a').text().trim();
                const date = $(element).find('.date').text().trim();
                newsItems.push({
                    title,
                    source: '农民日报',
                    date,
                    content: ''
                });
            });
        } else if (url.includes('agri.cn')) {
            $('.news-list li').each((i, element) => {
                const title = $(element).find('.title').text().trim();
                const date = $(element).find('.date').text().trim();
                newsItems.push({
                    title,
                    source: '中国农业新闻网',
                    date,
                    content: ''
                });
            });
        }

        // 保存到数据库
        for (const item of newsItems) {
            const exists = await SpiderNewsModel.findOne({ title: item.title });
            if (!exists) {
                await SpiderNewsModel.create(item);
                console.log(`保存新闻: ${item.title}`);
            }
        }
    } catch (error) {
        console.error(`爬取失败: ${url}`, error);
    }
}

// 主函数
async function main() {
    console.log('开始爬取新闻...');
    for (const url of targetUrls) {
        await crawlNews(url);
    }
    console.log('爬取完成');
    mongoose.disconnect();
}

// 执行爬虫
main();