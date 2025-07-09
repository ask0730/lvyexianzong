const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// user模型===>users集合
const UserType = {
  username: { 
    type: String, 
    required: true, 
    unique: true,
    minlength: 3,
    maxlength: 20
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  gender: { 
    type: Number, 
    default: 0, // 性别 ,0,1,2
    enum: [0, 1, 2]
  },
  introduction: { 
    type: String, 
    default: '', //简介
    maxlength: 200
  },
  avatar: { 
    type: String, 
    default: '' 
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  role: { 
    type: Number, 
    default: 2, //管理员1 ,编辑2
    enum: [1, 2]
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
};

const UserSchema = new Schema(UserType);

// 添加静态方法用于初始化管理员账号
UserSchema.statics.initAdminAccount = async function() {
  try {
    // 检查是否已存在admin账号
    const adminExists = await this.findOne({ username: 'admin' });
    if (!adminExists) {
      // 创建admin账号，使用明文密码
      await this.create({
        username: 'admin',
        password: '123456',
        email: 'admin@example.com',
        role: 1, // 管理员角色
        gender: 0
      });
      console.log('管理员账号初始化成功');
    }
  } catch (error) {
    console.error('管理员账号初始化失败:', error);
  }
};

const UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;
