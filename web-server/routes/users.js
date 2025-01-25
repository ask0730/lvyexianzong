var express = require('express');
var router = express.Router();
const UserModel = require('../models/UserModel');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// 用户注册路由
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // 检查必填字段
    if (!username || !password || !email) {
      return res.status(400).json({ 
        code: 1,
        message: '用户名、密码和邮箱不能为空' 
      });
    }

    // 检查用户是否已存在
    const existingUser = await UserModel.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        code: 1,
        message: existingUser.username === username 
          ? '用户名已存在' 
          : '邮箱已被注册' 
      });
    }

    // 创建新用户
    const newUser = new UserModel({
      username,
      password,
      email,
      role: 2, // 默认普通用户
      gender: 0, // 默认未知性别
      introduction: '', // 默认空简介
      avatar: '' // 默认空头像
    });

    // 保存用户
    await newUser.save();

    res.status(201).json({ 
      code: 0,
      message: '注册成功', 
      data: { 
        username: newUser.username, 
        email: newUser.email,
        role: newUser.role
      } 
    });

  } catch (error) {
    console.error('注册错误:', error);

    // 处理 Mongoose 验证错误
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        code: 1,
        message: errorMessages.join(', ') 
      });
    }

    // 处理唯一性冲突错误
    if (error.code === 11000) {
      return res.status(400).json({ 
        code: 1,
        message: '用户名或邮箱已被占用' 
      });
    }

    // 记录未知错误
    console.error('未知注册错误:', error);

    res.status(500).json({ 
      code: 1,
      message: '服务器错误，请稍后重试',
      error: process.env.NODE_ENV === 'development' ? error.message : '内部服务器错误'
    });
  }
});

module.exports = router;
