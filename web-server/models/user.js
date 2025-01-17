const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, '用户名是必需的'],
        unique: true,
        trim: true,
        minlength: [3, '用户名至少需要3个字符'],
        maxlength: [20, '用户名不能超过20个字符']
    },
    password: {
        type: String,
        required: [true, '密码是必需的'],
        minlength: [6, '密码至少需要6个字符'],
        maxlength: [20, '密码不能超过20个字符']
    },
    email: {
        type: String,
        required: [true, '邮箱是必需的'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请提供有效的邮箱地址']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // 自动管理createdAt和updatedAt字段
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
    // 只有在密码被修改时才重新加密
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// 验证密码的方法
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('密码比较失败');
    }
};

// 在返回给客户端之前删除敏感字段
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

// 创建并导出模型
const User = mongoose.model('User', userSchema);

module.exports = User;
