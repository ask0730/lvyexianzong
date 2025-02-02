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
      const payload = JWT.verify(token);
      
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
  }
};

module.exports = AuthMiddleware;
