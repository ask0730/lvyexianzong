var express = require('express');
const ProductController = require('../../controllers/admin/ProductController');
var ProductRouter = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'public/productuploads/' });

//涉及文件上传, 普通post不行, 需要加上 multer中间件
ProductRouter.post('/adminapi/product/add', upload.single('file'), ProductController.add);
ProductRouter.post('/adminapi/product/list', ProductController.getList);
ProductRouter.post('/adminapi/product/update', upload.single('file'), ProductController.updateList);
ProductRouter.post('/adminapi/product/delete', ProductController.delList);

module.exports = ProductRouter;
