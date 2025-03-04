const NewsService = require('../../services/web/NewsService');

const NewsController = {
  getList: async (req, res) => {
    const result = await NewsService.getList({ _id: req.body._id });
    res.send({
      code: 0,
      data: result,
    });
  },

  getTopList: async (req, res) => {
    const result = await NewsService.getTopList({ limit: req.body.limit });
    res.send({
      code: 0,
      data: result,
    });
  },

  // 收藏文章
  collectArticle: async (req, res) => {
    const { articleId } = req.body;
    const userId = req.user._id;
    const result = await NewsService.collectArticle({ userId, articleId });
    res.send({
      code: result.success ? 0 : -1,
      message: result.message
    });
  },

  // 取消收藏文章
  uncollectArticle: async (req, res) => {
    const { articleId } = req.body;
    const userId = req.user._id;
    const result = await NewsService.uncollectArticle({ userId, articleId });
    res.send({
      code: result.success ? 0 : -1,
      message: result.message
    });
  },

  // 获取文章的收藏状态
  getArticleCollectedStatus: async (req, res) => {
    const { articleId } = req.query;
    const userId = req.user._id;
    const result = await NewsService.getArticleCollectedStatus({ userId, articleId });
    res.send({
      code: result.success ? 0 : -1,
      message: result.message,
      data: result.data
    });
  },
  // 获取文章收藏统计
  getCollectionStatistics: async (req, res) => {
    const result = await NewsService.getCollectionStatistics();
    res.send({
      code: result.success ? 0 : -1,
      message: result.message,
      data: result.data
    });
  },

  // 获取用户收藏的文章列表
  getUserCollectedArticles: async ({ userId }) => {
    return await NewsService.getUserCollectedArticles({ userId });
  }
};

module.exports = NewsController;
