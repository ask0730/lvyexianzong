var express = require('express');
var router = express.Router();
const UserModel = require('../models/UserModel');
const JWT = require('../utils/JWT');
const PasswordEncryption = require('../utils/PasswordEncryption');

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

    // 加密密码
    const hashedPassword = await PasswordEncryption.encrypt(password);

    // 创建新用户
    const newUser = new UserModel({
      username,
      password: hashedPassword,
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

// 用户登录路由
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 检查必填字段
    if (!username || !password) {
      return res.status(400).json({ 
        code: 1,
        message: '用户名和密码不能为空' 
      });
    }

    // 查找用户
    const user = await UserModel.findOne({ username });

    // 验证用户和密码
    if (!user) {
      return res.status(401).json({ 
        code: 1,
        message: '用户名或密码错误' 
      });
    }

    // 验证密码
    const isPasswordValid = await PasswordEncryption.verify(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        code: 1,
        message: '用户名或密码错误' 
      });
    }

    // 生成 JWT Token
    const token = JWT.generate(
      {
        _id: user._id,
        username: user.username,
      },
      '1d'
    );

    // 返回登录成功响应
    res.status(200).json({ 
      code: 0,
      message: '登录成功',
      data: {
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        introduction: user.introduction,
        gender: user.gender
      },
      token: token
    });

  } catch (error) {
    console.error('登录错误:', error);

    res.status(500).json({ 
      code: 1,
      message: '服务器错误，请稍后重试',
      error: process.env.NODE_ENV === 'development' ? error.message : '内部服务器错误'
    });
  }
});

// 用户信息更新路由
router.post('/update', async (req, res) => {
  try {
    // 从 JWT 中获取用户信息
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ 
        code: 1,
        message: '未授权，请先登录' 
      });
    }

    const decoded = JWT.verify(token)
    if (!decoded) {
      return res.status(401).json({ 
        code: 1,
        message: 'Token 无效，请重新登录' 
      });
    }

    const { gender, introduction } = req.body

    // 更新用户信息
    const updatedUser = await UserModel.findByIdAndUpdate(
      decoded._id, 
      { 
        gender, 
        introduction 
      }, 
      { 
        new: true,  // 返回更新后的文档
        runValidators: true  // 运行模型验证
      }
    )

    if (!updatedUser) {
      return res.status(404).json({ 
        code: 1,
        message: '用户不存在' 
      });
    }

    res.status(200).json({ 
      code: 0,
      message: '个人信息更新成功',
      data: {
        username: updatedUser.username,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        introduction: updatedUser.introduction,
        gender: updatedUser.gender
      }
    });

  } catch (error) {
    console.error('更新用户信息错误:', error);

    res.status(500).json({ 
      code: 1,
      message: '服务器错误，请稍后重试',
      error: process.env.NODE_ENV === 'development' ? error.message : '内部服务器错误'
    });
  }
});

// 用户退出登录路由
router.post('/logout', async (req, res) => {
  try {
    // 从 JWT 中获取用户信息
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ 
        code: 1,
        message: '未授权，请先登录' 
      });
    }

    const decoded = JWT.verify(token)
    if (!decoded) {
      return res.status(401).json({ 
        code: 1,
        message: 'Token 无效，请重新登录' 
      });
    }

    // 注销操作（在实际应用中可以考虑使用 Redis 等方式管理 Token 黑名单）
    res.status(200).json({ 
      code: 0,
      message: '退出登录成功'
    });

  } catch (error) {
    console.error('退出登录错误:', error);

    res.status(500).json({ 
      code: 1,
      message: '服务器错误，请稍后重试',
      error: process.env.NODE_ENV === 'development' ? error.message : '内部服务器错误'
    });
  }
});

module.exports = router;
