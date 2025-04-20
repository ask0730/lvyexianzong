import { SpiderNewsModel } from '../../models/crawler/SpiderNewsModel';

export class SpiderNewsService {
  private spiderNewsModel: SpiderNewsModel;

  constructor() {
    this.spiderNewsModel = new SpiderNewsModel();
  }

  async getNewsList(page: number, pageSize: number) {
    try {
      const skip = (page - 1) * pageSize;
      const list = await this.spiderNewsModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize);

      const total = await this.spiderNewsModel.countDocuments();

      return {
        list,
        total,
        page,
        pageSize
      };
    } catch (error) {
      console.error('获取爬虫新闻列表失败:', error);
      throw error;
    }
  }
}