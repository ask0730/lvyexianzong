const JWT = require('../utils/JWT');

const AuthMiddleware = {
  // 需要登录的路由中间件
  requireAuth: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ 
        code: '401', 
        msg: '未提供授权令牌' 
      });
    }

    try {
      const tokenParts = authHeader.split(' ');
      if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ 
          code: '401', 
          msg: '授权令牌格式不正确' 
        });
      }

      const token = tokenParts[1];
      const payload = JWT.verifyAccessToken(token);
      
      if (payload) {
        // 将用户信息挂载到 req 对象上，后续路由可以直接使用
        req.user = {
          _id: payload._id,
          username: payload.username
        };
        next();
      } else {
        res.status(401).json({ 
          code: '401', 
          msg: 'token过期' 
        });
      }
    } catch (error) {
      console.error('JWT验证错误:', error);
      res.status(401).json({ 
        code: '401', 
        msg: '无效的授权令牌' 
      });
    }
  },

  // 支持自动刷新的认证中间件
  requireAuthWithRefresh: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const refreshToken = req.headers['x-refresh-token'];
    
    if (!authHeader) {
      return res.status(401).json({ 
        code: '401', 
        msg: '未提供授权令牌' 
      });
    }

    try {
      const tokenParts = authHeader.split(' ');
      if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ 
          code: '401', 
          msg: '授权令牌格式不正确' 
        });
      }

      const accessToken = tokenParts[1];
      const payload = JWT.verifyAccessToken(accessToken);
      
      if (payload) {
        // Access token有效，直接通过
        req.user = {
          _id: payload._id,
          username: payload.username
        };
        next();
      } else if (refreshToken) {
        // Access token过期，尝试使用refresh token
        const refreshPayload = JWT.verifyRefreshToken(refreshToken);
        if (refreshPayload) {
          // 生成新的双token
          const tokens = JWT.generateTokens({
            _id: refreshPayload._id,
            username: refreshPayload.username,
          });
          
          // 设置新的token到响应头
          res.header('Authorization', tokens.accessToken);
          res.header('X-New-Refresh-Token', tokens.refreshToken);
          
          // 将用户信息挂载到 req 对象上
          req.user = {
            _id: refreshPayload._id,
            username: refreshPayload.username
          };
          next();
        } else {
          res.status(401).json({ 
            code: '401', 
            msg: '刷新令牌无效，请重新登录' 
          });
        }
      } else {
        res.status(401).json({ 
          code: '401', 
          msg: 'token过期且无刷新令牌' 
        });
      }
    } catch (error) {
      console.error('JWT验证错误:', error);
      res.status(401).json({ 
        code: '401', 
        msg: '无效的授权令牌' 
      });
    }
  }
};

module.exports = AuthMiddleware;
