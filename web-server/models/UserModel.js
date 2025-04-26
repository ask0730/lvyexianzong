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

const UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;
