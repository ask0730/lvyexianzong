import axios from 'axios';
import * as cheerio from 'cheerio';
import { Kafka } from 'kafkajs';

class AgricultureNewsCrawler {
  private kafka: Kafka;
  private producer: any;
  private sources: Array<{ name: string, url: string, selector: any }>;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'agriculture-news-crawler',
      brokers: ['localhost:9092']
    });

    this.producer = this.kafka.producer();

    // 配置新闻源
    this.sources = [
      {
        name: '中国农业新闻网',
        url: 'http://www.farmer.com.cn/xwpd/news1/',
        selector: {
          list: '.list_con ul li',
          title: 'a',
          link: 'a',
          date: 'span'
        }
      }
    ];
  }

  async initialize() {
    await this.producer.connect();
  }

  async crawl() {
    for (const source of this.sources) {
      try {
        const response = await axios.get(source.url);
        const $ = cheerio.load(response.data);

        const newsItems = [];
        $(source.selector.list).each((_, element) => {
          const title = $(element).find(source.selector.title).text().trim();
          const url = $(element).find(source.selector.link).attr('href');
          const publishDate = $(element).find(source.selector.date).text().trim();

          if (title && url) {
            newsItems.push({
              title,
              url: url.startsWith('http') ? url : `${new URL(source.url).origin}${url}`,
              source: source.name,
              publishDate,
            });
          }
        });

        // 获取详细内容
        for (const item of newsItems) {
          try {
            const contentResponse = await axios.get(item.url);
            const content$ = cheerio.load(contentResponse.data);
            const content = content$('.article_con').text().trim();

            // 发送到Kafka
            await this.producer.send({
              topic: 'agriculture-news',
              messages: [
                {
                  value: JSON.stringify({
                    ...item,
                    content,
                  })
                }
              ]
            });

            console.log(`Crawled and sent to Kafka: ${item.title}`);
            // 添加延迟避免请求过快
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`Error crawling content for ${item.title}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error crawling ${source.name}:`, error);
      }
    }
  }

  async stop() {
    await this.producer.disconnect();
  }
}

export default AgricultureNewsCrawler;