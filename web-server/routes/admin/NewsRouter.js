var express = require('express');
const NewsController = require('../../controllers/admin/NewsController');
var NewsRouter = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'public/newsuploads/' });

//涉及文件上传, 普通post不行, 需要加上 multer中间件
NewsRouter.post('/adminapi/news/add', upload.single('file'), NewsController.add);
NewsRouter.post('/adminapi/news/list', NewsController.getList);
NewsRouter.post('/adminapi/news/update', upload.single('file'), NewsController.updateList);
NewsRouter.post('/adminapi/news/delete', NewsController.delList);
NewsRouter.post('/adminapi/news/publish', NewsController.publish);

module.exports = NewsRouter;
