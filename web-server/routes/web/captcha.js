const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// 存储验证码会话（实际项目中应该使用Redis）
const captchaSessions = new Map();

// 生成验证码
router.post('/generate', (req, res) => {
  try {
    const { width = 300, height = 150 } = req.body;
    
    // 生成唯一的会话ID
    const sessionId = crypto.randomBytes(16).toString('hex');
    
    // 生成随机拼图位置
    const puzzleSize = 40;
    const minTop = 20;
    const maxTop = height - puzzleSize - 20;
    const minLeft = 50;
    const maxLeft = width - puzzleSize - 50;
    
    const puzzleTop = Math.floor(Math.random() * (maxTop - minTop)) + minTop;
    const puzzleLeft = Math.floor(Math.random() * (maxLeft - minLeft)) + minLeft;
    
    // 生成随机图片URL（这里使用占位图片服务）
    const timestamp = Date.now();
    const imageUrl = `https://picsum.photos/${width}/${height}?random=${timestamp}`;
    
    // 存储验证码信息
    captchaSessions.set(sessionId, {
      puzzleLeft,
      puzzleTop,
      puzzleSize,
      createdAt: Date.now(),
      verified: false
    });
    
    // 5分钟后自动清理
    setTimeout(() => {
      captchaSessions.delete(sessionId);
    }, 5 * 60 * 1000);
    
    res.json({
      code: 0,
      message: '验证码生成成功',
      data: {
        sessionId,
        imageUrl,
        puzzleLeft,
        puzzleTop,
        puzzleSize,
        width,
        height
      }
    });
    
  } catch (error) {
    console.error('生成验证码失败:', error);
    res.status(500).json({
      code: 1,
      message: '生成验证码失败'
    });
  }
});

// 验证滑动验证码
router.post('/verify', (req, res) => {
  try {
    const { sessionId, sliderLeft } = req.body;
    
    if (!sessionId || sliderLeft === undefined) {
      return res.status(400).json({
        code: 1,
        message: '参数不完整'
      });
    }
    
    const session = captchaSessions.get(sessionId);
    
    if (!session) {
      return res.status(400).json({
        code: 1,
        message: '验证码已过期，请重新获取'
      });
    }
    
    // 检查验证码是否过期（5分钟）
    if (Date.now() - session.createdAt > 5 * 60 * 1000) {
      captchaSessions.delete(sessionId);
      return res.status(400).json({
        code: 1,
        message: '验证码已过期，请重新获取'
      });
    }
    
    // 验证滑块位置（允许5px误差）
    const targetLeft = session.puzzleLeft;
    const currentLeft = parseInt(sliderLeft);
    
    if (Math.abs(currentLeft - targetLeft) <= 5) {
      // 标记为已验证
      session.verified = true;
      
      res.json({
        code: 0,
        message: '验证成功',
        data: {
          verified: true
        }
      });
    } else {
      res.json({
        code: 1,
        message: '验证失败，请重试',
        data: {
          verified: false
        }
      });
    }
    
  } catch (error) {
    console.error('验证失败:', error);
    res.status(500).json({
      code: 1,
      message: '验证失败'
    });
  }
});

// 检查验证码状态
router.post('/check', (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        code: 1,
        message: '会话ID不能为空'
      });
    }
    
    const session = captchaSessions.get(sessionId);
    
    if (!session) {
      return res.status(400).json({
        code: 1,
        message: '验证码已过期'
      });
    }
    
    res.json({
      code: 0,
      message: '验证码有效',
      data: {
        verified: session.verified
      }
    });
    
  } catch (error) {
    console.error('检查验证码失败:', error);
    res.status(500).json({
      code: 1,
      message: '检查验证码失败'
    });
  }
});

module.exports = router; 