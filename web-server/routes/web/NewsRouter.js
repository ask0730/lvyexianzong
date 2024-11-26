var express = require('express');
const NewsController = require('../../controllers/web/NewsController');
var NewsRouter = express.Router();

NewsRouter.post('/webapi/news/list', NewsController.getList);
NewsRouter.post('/webapi/news/toplist', NewsController.getTopList);

module.exports = NewsRouter;
