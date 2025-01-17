const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/company-system';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB连接成功');
  })
  .catch(err => {
    console.error('MongoDB连接失败:', err);
    process.exit(1); // 如果数据库连接失败，退出应用
  });

// 监听连接事件
mongoose.connection.on('connected', () => {
  console.log('Mongoose连接已建立');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose连接错误:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose连接已断开');
});

// 应用终止时关闭连接
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('应用终止，MongoDB连接已关闭');
  process.exit(0);
});

module.exports = mongoose;
