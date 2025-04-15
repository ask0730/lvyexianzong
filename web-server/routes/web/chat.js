const express = require('express');
const router = express.Router();
const { AuthMiddleware } = require('../../middleware/AuthMiddleware');
const {
    createChat,
    sendMessage,
    getChatHistory,
    getChatList,
    deleteChat
} = require('../../controllers/web/ChatController');

// 所有聊天相关的路由都需要登录验证
router.use(AuthMiddleware);

// 创建新对话
router.post('/create', createChat);

// 发送消息
router.post('/send', sendMessage);

// 获取对话历史
router.get('/history/:chatId', getChatHistory);

// 获取对话列表
router.get('/list', getChatList);

// 删除对话
router.delete('/:chatId', deleteChat);

module.exports = router;
