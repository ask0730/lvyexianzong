var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

// 导入数据库配置
require('./config/db.config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const UserRouter = require('./routes/admin/UserRouter');
const JWT = require('./utils/JWT');
const NewsRouter = require('./routes/admin/NewsRouter');
const ProductRouter = require('./routes/admin/ProductRouter');
const webNewsRouter = require('./routes/web/NewsRouter');
const webProductRouter = require('./routes/web/ProductRouter');
const userRouter = require('./routes/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// 基本的CORS配置
app.use(cors());

// 解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 日志
app.use(logger('dev'));

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 公开路由（不需要token验证）
app.use('/api/user', userRouter);

// Token验证中间件
app.use('/api', (req, res, next) => {
    // 排除不需要验证的路径
    const publicPaths = ['/api/user/register', '/api/user/login'];
    if (publicPaths.includes(req.path)) {
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            code: 401,
            message: '请先登录'
        });
    }

    try {
        const token = authHeader.split(' ')[1];
        const payload = JWT.verify(token);
        req.user = payload;
        next();
    } catch (error) {
        console.error('Token验证错误:', error);
        res.status(401).json({
            code: 401,
            message: error.message || 'token无效'
        });
    }
});

// API路由
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(webNewsRouter);
app.use(webProductRouter);
app.use(UserRouter);
app.use(NewsRouter);
app.use(ProductRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    console.error('Error:', err);
    res.status(err.status || 500);
    res.json({
        code: err.status || 500,
        message: err.message || '服务器内部错误'
    });
});

module.exports = app;
