var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const UserRouter = require('./routes/admin/UserRouter');
const LoginAttemptRouter = require('./routes/admin/LoginAttemptRouter');
const JWT = require('./utils/JWT');
const NewsRouter = require('./routes/admin/NewsRouter');
const ProductRouter = require('./routes/admin/ProductRouter');
const webNewsRouter = require('./routes/web/NewsRouter');
const webProductRouter = require('./routes/web/ProductRouter');
const webViewRecordRouter = require('./routes/web/ViewRecordRouter');
const webLikeRouter = require('./routes/web/likeRoutes');
const webCommentRouter = require('./routes/web/commentRouter');
const webChatRouter = require('./routes/web/index');
const crawlerRouter = require('./routes/crawler/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 白名单路由，不需要 JWT 验证
const publicRoutes = [
  '/webapi/users/register', 
  '/webapi/users/login',
  '/adminapi/user/login',
  '/webapi/view-record',
  '/webapi/comment/*',
  '/webapi/chat/send',
  '/api/spider-news',
  // 开发阶段，登录尝试管理接口暂时不需要认证
  '/adminapi/login-attempts/*'
];

// 全局中间件：处理跨域和公共路由
app.use((req, res, next) => {
  // 设置跨域头
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  // 如果是公共路由，直接放行
  if (publicRoutes.some(route => {
    if (route.endsWith('*')) {
      return req.path.startsWith(route.slice(0, -1));
    }
    return route === req.path;
  })) {
    return next();
  }

  next();
});

app.use('/', indexRouter);
app.use('/webapi/users', usersRouter);

app.use('/webapi/like', webLikeRouter);
app.use('/webapi/comment', webCommentRouter);
app.use(webNewsRouter);
app.use(webProductRouter);
app.use(webViewRecordRouter);
app.use('/webapi', webChatRouter);
app.use('/', crawlerRouter);

/*
 * /adminapi - 后台系统用的
 * /webapi - 企业官网用的
 */
app.use((req, res, next) => {
  // 检查是否为公共路由
  if (publicRoutes.some(route => {
    if (route.endsWith('*')) {
      return req.path.startsWith(route.slice(0, -1));
    }
    return route === req.path;
  })) {
    return next();
  }

  // 安全地检查授权头
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ 
      code: '401', 
      msg: '未提供授权令牌' 
    });
  }

  try {
    // 安全地处理 token
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2) {
      return res.status(401).json({ 
        code: '401', 
        msg: '授权令牌格式不正确' 
      });
    }

    const token = tokenParts[1];
    const payload = JWT.verify(token);
    
    if (payload) {
      const newToken = JWT.generate(
        {
          _id: payload._id,
          username: payload.username,
        },
        '1d'
      );
      res.header('Authorization', newToken);
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
});

app.use(UserRouter);
app.use(LoginAttemptRouter);
app.use(NewsRouter);
app.use(ProductRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// 全局错误处理中间件
app.use(function (err, req, res, next) {
  console.error('未捕获的错误:', err);

  // 设置本地变量，仅在开发环境提供详细错误信息
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // 返回错误响应
  res.status(err.status || 500).json({
    code: 1,
    message: '服务器内部错误',
    error: req.app.get('env') === 'development' ? err.message : undefined
  });
});

module.exports = app;