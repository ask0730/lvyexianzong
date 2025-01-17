const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');

// 用户注册
router.post('/register', UserController.register);

// 用户登录
router.post('/login', UserController.login);

// 获取用户信息
router.get('/info', UserController.getUserInfo);

// 用户登出
router.post('/logout', UserController.logout);

// 更新用户资料
router.put('/profile', UserController.updateProfile);

// 修改密码
router.put('/password', UserController.changePassword);

module.exports = router;
