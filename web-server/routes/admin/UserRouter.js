const express = require('express');
const UserController = require('../../controllers/admin/UserController');
const UserRouter = express.Router();
//图片上传
const multer = require('multer');
const upload = multer({ dest: 'public/avataruploads/' });

/* GET home page. */
UserRouter.post('/adminapi/user/login', UserController.login);
UserRouter.post('/adminapi/user/upload', upload.single('file'), UserController.upload);
//实现用户的列表的增删改查
UserRouter.post('/adminapi/user/add', upload.single('file'), UserController.add);
UserRouter.post('/adminapi/user/list', UserController.getList);
UserRouter.post('/adminapi/user/update', UserController.putList);
UserRouter.post('/adminapi/user/delete', UserController.delList);

module.exports = UserRouter;
