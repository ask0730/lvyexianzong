const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../../middleware/AuthMiddleware');

// 聊天相关路由
router.post('/chat/send', AuthMiddleware.requireAuth, (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({
                code: 1,
                message: '消息内容不能为空'
            });
        }

        // 这里可以添加聊天消息处理逻辑
        // 目前先返回一个简单的回复
        res.json({
            code: 0,
            data: {
                message: `感谢您的咨询。您说：${message}。我们会尽快处理您的问题。`
            }
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            code: 1,
            message: '服务器内部错误'
        });
    }
});

module.exports = router;