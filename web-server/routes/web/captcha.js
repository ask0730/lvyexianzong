const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const sharp = require('sharp');
const axios = require('axios');

// 存储验证码会话（实际项目中应该使用Redis）
const captchaSessions = new Map();

// 拼图块形状遮罩（简单矩形，可自定义为复杂形状）
function createBlockMask(size) {
  const svg = `
    <svg width="${size}" height="${size}">
      <rect x="0" y="0" width="${size}" height="${size}" rx="8" fill="white" stroke="black" stroke-width="3"/>
    </svg>
  `;
  return Buffer.from(svg);
}

// 生成验证码
router.post('/generate', async (req, res) => {
  try {
    const { width = 300, height = 150 } = req.body;
    
    // 生成唯一的会话ID
    const sessionId = crypto.randomBytes(16).toString('hex');
    
    // 拼图块参数
    const puzzleSize = 40;
    const minTop = 20;
    const maxTop = height - puzzleSize - 20;
    const minLeft = 50;
    const maxLeft = width - puzzleSize - 50;
    
    const puzzleTop = Math.floor(Math.random() * (maxTop - minTop)) + minTop;
    const puzzleLeft = Math.floor(Math.random() * (maxLeft - minLeft)) + minLeft;
    
    // 获取随机图片
    const timestamp = Date.now();
    const imageUrl = `https://picsum.photos/${width}/${height}?random=${timestamp}`;
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const originalImage = Buffer.from(response.data);
    
    // 1. 生成拼图块图片
    const blockMask = createBlockMask(puzzleSize);
    const blockImage = await sharp(originalImage)
      .extract({ left: puzzleLeft, top: puzzleTop, width: puzzleSize, height: puzzleSize })
      .composite([{ input: blockMask, blend: 'dest-in' }])
      .png()
      .toBuffer();
    
    // 2. 生成带缺口的背景图
    // 先生成一个透明的拼图块遮罩
    const transparentBlock = await sharp({
      create: {
        width: puzzleSize,
        height: puzzleSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .png()
      .toBuffer();
    
    // 用遮罩"抠掉"原图上的拼图块
    let bgImage = await sharp(originalImage)
      .composite([
        {
          input: blockMask,
          top: puzzleTop,
          left: puzzleLeft,
          blend: 'dest-out'
        }
      ])
      .png()
      .toBuffer();
    
    // 返回 base64 图片
    const bgImageBase64 = 'data:image/png;base64,' + bgImage.toString('base64');
    const blockImageBase64 = 'data:image/png;base64,' + blockImage.toString('base64');
    
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
        bgImage: bgImageBase64,
        blockImage: blockImageBase64,
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