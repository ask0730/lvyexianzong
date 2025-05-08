import { Kafka, Consumer, Producer } from 'kafkajs';
import { NewsModel } from '../../models/NewsModel';

class KafkaService {
  private kafka: Kafka;
  private consumer: Consumer;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'agriculture-news-service',
      brokers: ['localhost:9092']
    });

    this.consumer = this.kafka.consumer({ groupId: 'news-group' });
    this.producer = this.kafka.producer();
  }

  async initialize() {
    await this.consumer.connect();
    await this.producer.connect();
    await this.setupConsumer();
  }

  private async setupConsumer() {
    await this.consumer.subscribe({ topic: 'agriculture-news', fromBeginning: true });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const newsData = JSON.parse(message.value?.toString() || '');
          
          // 保存到MongoDB
          const news = new NewsModel({
            title: newsData.title,
            content: newsData.content,
            source: newsData.source,
            publishDate: newsData.publishDate,
            url: newsData.url,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          await news.save();
          console.log('News saved to database:', newsData.title);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      }
    });
  }

  async stop() {
    await this.consumer.disconnect();
    await this.producer.disconnect();
  }
}

export default KafkaService;
