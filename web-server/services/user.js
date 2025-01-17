const User = require('../models/user');

class UserService {
    /**
     * 创建新用户
     * @param {Object} userData 用户数据
     * @returns {Promise<Object>} 创建的用户对象
     */
    static async createUser(userData) {
        try {
            // 检查用户名是否已存在
            const existingUsername = await User.findOne({ username: userData.username });
            if (existingUsername) {
                throw new Error('用户名已存在');
            }

            // 检查邮箱是否已存在
            const existingEmail = await User.findOne({ email: userData.email });
            if (existingEmail) {
                throw new Error('邮箱已被使用');
            }

            // 创建新用户
            const user = new User(userData);
            await user.save();
            return user;
        } catch (error) {
            console.error('创建用户错误:', error);
            throw error;
        }
    }

    /**
     * 验证用户凭证
     * @param {string} username 用户名
     * @param {string} password 密码
     * @returns {Promise<Object>} 用户对象
     */
    static async validateCredentials(username, password) {
        try {
            const user = await User.findOne({ username });
            if (!user) {
                throw new Error('用户名或密码错误');
            }

            const isValid = await user.comparePassword(password);
            if (!isValid) {
                throw new Error('用户名或密码错误');
            }

            if (!user.isActive) {
                throw new Error('账户已被禁用');
            }

            return user;
        } catch (error) {
            console.error('验证用户凭证错误:', error);
            throw error;
        }
    }

    /**
     * 通过ID查找用户
     * @param {string} id 用户ID
     * @returns {Promise<Object>} 用户对象
     */
    static async findById(id) {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw new Error('用户不存在');
            }
            return user;
        } catch (error) {
            console.error('查找用户错误:', error);
            throw error;
        }
    }

    /**
     * 更新用户信息
     * @param {string} id 用户ID
     * @param {Object} updateData 更新数据
     * @returns {Promise<Object>} 更新后的用户对象
     */
    static async updateUser(id, updateData) {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw new Error('用户不存在');
            }

            // 如果要更新邮箱，检查是否已被使用
            if (updateData.email && updateData.email !== user.email) {
                const existingEmail = await User.findOne({ email: updateData.email });
                if (existingEmail) {
                    throw new Error('邮箱已被使用');
                }
            }

            Object.assign(user, updateData);
            await user.save();
            return user;
        } catch (error) {
            console.error('更新用户错误:', error);
            throw error;
        }
    }

    /**
     * 更新用户资料
     * @param {string} userId 用户ID
     * @param {Object} updateData 更新的数据
     * @returns {Promise<Object>} 更新后的用户对象
     */
    static async updateUserProfile(userId, updateData) {
        try {
            const user = await User.findByIdAndUpdate(
                userId, 
                { $set: updateData }, 
                { new: true, runValidators: true }
            );

            if (!user) {
                throw new Error('用户不存在');
            }

            return user;
        } catch (error) {
            console.error('更新用户资料错误:', error);
            throw error;
        }
    }

    /**
     * 修改用户密码
     * @param {string} userId 用户ID
     * @param {string} currentPassword 当前密码
     * @param {string} newPassword 新密码
     * @returns {Promise<void>}
     */
    static async changeUserPassword(userId, currentPassword, newPassword) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('用户不存在');
            }

            // 验证当前密码
            const isValid = await user.comparePassword(currentPassword);
            if (!isValid) {
                throw new Error('当前密码错误');
            }

            // 设置新密码
            user.password = newPassword;
            await user.save();
        } catch (error) {
            console.error('修改密码错误:', error);
            throw error;
        }
    }
}

module.exports = UserService;
