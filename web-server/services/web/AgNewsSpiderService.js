const axios = require('axios');
const cheerio = require('cheerio');
const { Kafka } = require('kafkajs');

class AgNewsSpiderService {
    constructor() {
        // 初始化Kafka客户端
        this.kafka = new Kafka({
            clientId: 'ag-news-spider',
            brokers: ['localhost:9092']
        });
        this.producer = this.kafka.producer();

        // 定义要爬取的农业新闻网站列表
        this.newsSourceList = [
            {
                name: '中国农业新闻网',
                url: 'http://www.farmer.com.cn/xwpd/nyyw/',
                listSelector: '.list_con ul li',
                titleSelector: 'a',
                linkSelector: 'a',
                dateSelector: 'span'
            },
            {
                name: '农民日报',
                url: 'http://szb.farmer.com.cn/nmrb/html/index.html',
                listSelector: '.news_list li',
                titleSelector: 'a',
                linkSelector: 'a',
                dateSelector: '.date'
            }
        ];
    }

    // 初始化Kafka连接
    async initKafka() {
        try {
            await this.producer.connect();
            console.log('Kafka生产者连接成功');
        } catch (error) {
            console.error('Kafka连接失败:', error);
            throw error;
        }
    }

    // 爬取新闻列表
    async crawlNewsList(source) {
        try {
            const response = await axios.get(source.url);
            const $ = cheerio.load(response.data);
            const newsList = [];

            $(source.listSelector).each((index, element) => {
                const title = $(element).find(source.titleSelector).text().trim();
                const link = $(element).find(source.linkSelector).attr('href');
                const date = $(element).find(source.dateSelector).text().trim();

                if (title && link) {
                    newsList.push({
                        title,
                        link: link.startsWith('http') ? link : new URL(link, source.url).href,
                        date,
                        source: source.name
                    });
                }
            });

            return newsList;
        } catch (error) {
            console.error(`爬取${source.name}新闻列表失败:`, error);
            return [];
        }
    }

    // 爬取新闻详情
    async crawlNewsDetail(newsItem) {
        try {
            const response = await axios.get(newsItem.link);
            const $ = cheerio.load(response.data);
            
            // 根据不同网站提取正文内容
            let content = '';
            if (newsItem.source === '中国农业新闻网') {
                content = $('.content').text().trim();
            } else if (newsItem.source === '农民日报') {
                content = $('.article-content').text().trim();
            }

            return {
                ...newsItem,
                content,
                crawlTime: new Date().toISOString()
            };
        } catch (error) {
            console.error(`爬取新闻详情失败 ${newsItem.link}:`, error);
            return null;
        }
    }

    // 发送新闻到Kafka
    async sendToKafka(news) {
        try {
            await this.producer.send({
                topic: 'agricultural-news',
                messages: [
                    { 
                        key: news.link,
                        value: JSON.stringify(news)
                    }
                ]
            });
            console.log(`新闻 "${news.title}" 已发送到Kafka`);
        } catch (error) {
            console.error('发送新闻到Kafka失败:', error);
            throw error;
        }
    }

    // 启动爬虫服务
    async start() {
        try {
            await this.initKafka();

            // 定期执行爬虫任务
            setInterval(async () => {
                for (const source of this.newsSourceList) {
                    const newsList = await this.crawlNewsList(source);
                    
                    for (const newsItem of newsList) {
                        const newsDetail = await this.crawlNewsDetail(newsItem);
                        if (newsDetail) {
                            await this.sendToKafka(newsDetail);
                        }
                    }
                }
            }, 1800000); // 每30分钟执行一次

        } catch (error) {
            console.error('爬虫服务启动失败:', error);
        }
    }
}

module.exports = AgNewsSpiderService;