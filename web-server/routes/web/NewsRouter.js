var express = require('express');
const NewsController = require('../../controllers/web/NewsController');
const AuthMiddleware = require('../../middleware/AuthMiddleware');  
var NewsRouter = express.Router();

NewsRouter.post('/webapi/news/list', NewsController.getList);
NewsRouter.post('/webapi/news/toplist', NewsController.getTopList);

// 收藏文章，需要登录
NewsRouter.post('/webapi/news/collect', AuthMiddleware.requireAuth, NewsController.collectArticle);

// 取消收藏文章，需要登录
NewsRouter.post('/webapi/news/uncollect', AuthMiddleware.requireAuth, NewsController.uncollectArticle);

// 获取文章的收藏状态，需要登录
NewsRouter.get('/webapi/news/collection-status', AuthMiddleware.requireAuth, NewsController.getArticleCollectedStatus);

// 获取用户收藏的文章列表，需要登录
NewsRouter.get('/webapi/news/collections', AuthMiddleware.requireAuth, async (req, res) => {
  const userId = req.user._id;
  const result = await NewsController.getUserCollectedArticles({ userId });
  res.send({
    code: result.success ? 0 : -1,
    message: result.message,
    data: result.data
  });
});

// 获取文章收藏统计
NewsRouter.get('/webapi/news/collection-statistics', NewsController.getCollectionStatistics);

module.exports = NewsRouter;
