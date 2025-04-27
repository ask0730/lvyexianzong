const mongoose = require('mongoose');

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
