const UserService = require('../services/user');
const JWT = require('../utils/JWT');

class UserController {
    // 用户注册
    static async register(req, res) {
        try {
            console.log('注册请求数据:', req.body);
            const { username, password, email } = req.body;

            // 验证请求数据
            if (!username || !password || !email) {
                console.log('缺少必要字段:', { username: !!username, password: !!password, email: !!email });
                return res.status(400).json({
                    code: 400,
                    message: '请提供完整的注册信息'
                });
            }

            // 验证用户名格式
            if (username.length < 3 || username.length > 20) {
                console.log('用户名长度不符:', username.length);
                return res.status(400).json({
                    code: 400,
                    message: '用户名长度应在3-20个字符之间'
                });
            }

            // 验证密码格式
            if (password.length < 6 || password.length > 20) {
                console.log('密码长度不符:', password.length);
                return res.status(400).json({
                    code: 400,
                    message: '密码长度应在6-20个字符之间'
                });
            }

            // 验证邮箱格式
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                console.log('邮箱格式不正确:', email);
                return res.status(400).json({
                    code: 400,
                    message: '请提供有效的邮箱地址'
                });
            }

            // 创建用户
            console.log('开始创建用户...');
            const user = await UserService.createUser({ username, password, email });
            console.log('用户创建成功:', user);

            res.status(201).json({
                code: 201,
                message: '注册成功',
                data: {
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('注册错误:', error);
            console.error('错误堆栈:', error.stack);
            
            // 处理特定错误
            if (error.message.includes('已存在') || error.message.includes('已被使用')) {
                return res.status(409).json({
                    code: 409,
                    message: error.message
                });
            }

            // 处理验证错误
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    code: 400,
                    message: messages.join(', ')
                });
            }

            // 其他错误
            res.status(500).json({
                code: 500,
                message: '注册失败，请稍后重试'
            });
        }
    }

    // 用户登录
    static async login(req, res) {
        try {
            console.log('登录请求数据:', req.body);
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    code: 400,
                    message: '请提供用户名和密码'
                });
            }

            const user = await UserService.validateCredentials(username, password);

            // 生成token
            const token = JWT.generate({
                _id: user._id,
                username: user.username
            }, '1d');

            console.log('用户登录成功:', { username: user.username });

            res.json({
                code: 200,
                message: '登录成功',
                data: {
                    token,
                    user: {
                        username: user.username,
                        email: user.email
                    }
                }
            });
        } catch (error) {
            console.error('登录错误:', error);
            
            if (error.message === '用户名或密码错误') {
                return res.status(401).json({
                    code: 401,
                    message: error.message
                });
            }

            res.status(500).json({
                code: 500,
                message: '登录失败，请稍后重试'
            });
        }
    }

    // 获取用户信息
    static async getUserInfo(req, res) {
        try {
            const userId = req.user._id;
            const user = await UserService.findById(userId);

            res.json({
                code: 200,
                data: user
            });
        } catch (error) {
            console.error('获取用户信息错误:', error);
            res.status(500).json({
                code: 500,
                message: '获取用户信息失败'
            });
        }
    }

    // 用户登出
    static async logout(req, res) {
        try {
            // 客户端需要清除token
            res.json({
                code: 200,
                message: '登出成功'
            });
        } catch (error) {
            console.error('登出错误:', error);
            res.status(500).json({
                code: 500,
                message: '登出失败'
            });
        }
    }

    // 更新用户资料
    static async updateProfile(req, res) {
        try {
            const userId = req.user._id;
            const { email, gender, introduction } = req.body;

            // 验证数据
            const updateData = {};
            if (email) {
                // 验证邮箱格式
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({
                        code: 400,
                        message: '请提供有效的邮箱地址'
                    });
                }
                updateData.email = email;
            }

            if (gender !== undefined) {
                // 验证性别值
                if (![0, 1, 2].includes(gender)) {
                    return res.status(400).json({
                        code: 400,
                        message: '性别值无效'
                    });
                }
                updateData.gender = gender;
            }

            if (introduction) {
                // 限制简介长度
                if (introduction.length > 200) {
                    return res.status(400).json({
                        code: 400,
                        message: '个人简介不能超过200个字符'
                    });
                }
                updateData.introduction = introduction;
            }

            // 更新用户信息
            const user = await UserService.updateUserProfile(userId, updateData);

            res.json({
                code: 200,
                message: '个人信息更新成功',
                data: user
            });
        } catch (error) {
            console.error('更新用户资料错误:', error);
            res.status(500).json({
                code: 500,
                message: '更新失败，请稍后重试'
            });
        }
    }

    // 修改密码
    static async changePassword(req, res) {
        try {
            const userId = req.user._id;
            const { currentPassword, newPassword } = req.body;

            // 验证密码
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    code: 400,
                    message: '请提供当前密码和新密码'
                });
            }

            // 验证新密码长度
            if (newPassword.length < 6 || newPassword.length > 20) {
                return res.status(400).json({
                    code: 400,
                    message: '新密码长度应在6-20个字符之间'
                });
            }

            // 修改密码
            await UserService.changeUserPassword(userId, currentPassword, newPassword);

            res.json({
                code: 200,
                message: '密码修改成功'
            });
        } catch (error) {
            console.error('修改密码错误:', error);
            
            if (error.message === '当前密码错误') {
                return res.status(400).json({
                    code: 400,
                    message: '当前密码错误'
                });
            }

            res.status(500).json({
                code: 500,
                message: '密码修改失败，请稍后重试'
            });
        }
    }
}

module.exports = UserController;
