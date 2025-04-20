import { Request, Response } from 'express';
import { NewsModel } from '../../models/NewsModel';

class NewsController {
  // 获取新闻列表
  static async getNewsList(req: Request, res: Response) {
    try {
      const { page = 1, pageSize = 10, source } = req.query;
      const query = source ? { source } : {};

      const total = await NewsModel.countDocuments(query);
      const newsList = await NewsModel.find(query)
        .sort({ publishDate: -1 })
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize));

      res.json({
        code: 200,
        data: {
          list: newsList,
          total,
          page: Number(page),
          pageSize: Number(pageSize)
        },
        message: '获取新闻列表成功'
      });
    } catch (error) {
      console.error('获取新闻列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取新闻列表失败'
      });
    }
  }

  // 获取新闻来源统计
  static async getNewsSourceStats(req: Request, res: Response) {
    try {
      const stats = await NewsModel.aggregate([
        {
          $group: {
            _id: '$source',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            source: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]);

      res.json({
        code: 200,
        data: stats,
        message: '获取新闻来源统计成功'
      });
    } catch (error) {
      console.error('获取新闻来源统计失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取新闻来源统计失败'
      });
    }
  }

  // 获取新闻详情
  static async getNewsDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const news = await NewsModel.findById(id);

      if (!news) {
        return res.status(404).json({
          code: 404,
          message: '新闻不存在'
        });
      }

      res.json({
        code: 200,
        data: news,
        message: '获取新闻详情成功'
      });
    } catch (error) {
      console.error('获取新闻详情失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取新闻详情失败'
      });
    }
  }
}

export default NewsController;