const config = {
    url: 'mongodb://127.0.0.1:27017/company-system',
    options: {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        minPoolSize: 5,
        maxIdleTimeMS: 30000
    }
};

mongoose
  .connect('mongodb://127.0.0.1:27017/company-system')
  .then(async () => {
    console.log('数据库连接成功');
    // 初始化管理员账号
    const UserModel = require('../models/UserModel');
    await UserModel.initAdminAccount();
  })
  .catch(err => {
    console.log('数据库连接失败=>', err);
  });
module.exports = config;

