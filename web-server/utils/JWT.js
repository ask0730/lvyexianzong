const jsonwebtoken = require('jsonwebtoken');
const secret = 'kerwin';
const refreshSecret = 'kerwin_refresh';

const JWT = {
  // 生成访问令牌（短期）
  generateAccessToken(value) {
    return jsonwebtoken.sign(value, secret, { expiresIn: '15m' }); // 15分钟过期
  },

  // 生成刷新令牌（长期）
  generateRefreshToken(value) {
    return jsonwebtoken.sign(value, refreshSecret, { expiresIn: '7d' }); // 7天过期
  },

  // 生成双token
  generateTokens(value) {
    return {
      accessToken: this.generateAccessToken(value),
      refreshToken: this.generateRefreshToken(value)
    };
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

  // 兼容旧版本的验证方法
  verify(token) {
    return this.verifyAccessToken(token);
  },

  // 兼容旧版本的生成方法
  generate(value, expires) {
    return jsonwebtoken.sign(value, secret, { expiresIn: expires });
  }
};

module.exports = JWT;
