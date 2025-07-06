const jsonwebtoken = require('jsonwebtoken');
const secret = 'kerwin';
const refreshSecret = 'kerwin_refresh';

const JWT = {
  // 生成访问令牌（短期）
  generateAccessToken(value) {
    return jsonwebtoken.sign(value, secret, { expiresIn: '15m' }); // 15分钟
  },

  // 生成刷新令牌（长期）
  generateRefreshToken(value) {
    return jsonwebtoken.sign(value, refreshSecret, { expiresIn: '7d' }); // 7天
  },

  // 验证访问令牌
  verifyAccessToken(token) {
    try {
      return jsonwebtoken.verify(token, secret);
    } catch (e) {
      return false;
    }
  },

  // 验证刷新令牌
  verifyRefreshToken(token) {
    try {
      return jsonwebtoken.verify(token, refreshSecret);
    } catch (e) {
      return false;
    }
  },

  // 兼容旧版本的方法
  generate(value, exprires) {
    return jsonwebtoken.sign(value, secret, { expiresIn: exprires });
  },
  
  verify(token) {
    return this.verifyAccessToken(token);
  },
};

module.exports = JWT;
