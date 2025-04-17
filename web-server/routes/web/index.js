const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../../middleware/AuthMiddleware');
const axios = require('axios');

// 聊天相关路由
router.post('/chat/send', AuthMiddleware.requireAuth, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({
                code: 1,
                message: '消息内容不能为空'
            });
        }

        // 调用DeepSeek API
        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: message }]
        }, {
            headers: {
                'Authorization': 'Bearer sk-328b818462634a4eadb05764b1a106b1',
                'Content-Type': 'application/json'
            }
        });

        // 返回AI的回复
        res.json({
            code: 0,
            data: {
                message: response.data.choices[0].message.content
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