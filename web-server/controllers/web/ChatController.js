const ChatModel = require('../../models/ChatModel');
const axios = require('axios');

class ChatController {
    // 创建新的对话
    async createChat(req, res) {
        try {
            const userId = req.user._id;
            const chat = new ChatModel({ userId });
            await chat.save();
            res.json({ code: 0, data: chat });
        } catch (error) {
            res.json({ code: -1, msg: '创建对话失败' });
        }
    }

    // 发送消息并获取AI回复
    async sendMessage(req, res) {
        try {
            const { chatId, message } = req.body;
            const userId = req.user._id;

            const chat = await ChatModel.findOne({ _id: chatId, userId });
            if (!chat) {
                return res.json({ code: -1, msg: '对话不存在' });
            }

            // 添加用户消息
            chat.messages.push({
                role: 'user',
                content: message
            });

            // 调用DeepSeek API
            const response = await axios.post('https://api.openrouter.ai/api/v1/chat/completions', {
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: '你是绿野仙踪科技有限公司的AI客服助手。请以专业、简洁的方式回答用户问题，重点关注环保技术和可持续发展解决方案。'
                    },
                    ...chat.messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }))
                ],
                temperature: 0.5,
                max_tokens: 1000,
                top_p: 0.8,
                frequency_penalty: 0.1,
                presence_penalty: 0.1
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            // 添加AI回复
            const aiResponse = response.data.choices[0].message.content;
            chat.messages.push({
                role: 'assistant',
                content: aiResponse
            });

            await chat.save();
            res.json({ code: 0, data: { message: aiResponse } });
        } catch (error) {
            console.error('AI回复错误:', error);
            let errorMessage = '获取AI回复失败';
            if (error.response) {
                if (error.response.status === 429) {
                    errorMessage = '服务繁忙，请稍后再试';
                } else if (error.response.status === 401) {
                    errorMessage = 'API认证失败，请联系管理员';
                }
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = '请求超时，请重试';
            }
            res.json({ code: -1, msg: errorMessage });
        }
    }

    // 获取对话历史
    async getChatHistory(req, res) {
        try {
            const userId = req.user._id;
            const { chatId } = req.params;

            const chat = await ChatModel.findOne({ _id: chatId, userId });
            if (!chat) {
                return res.json({ code: -1, msg: '对话不存在' });
            }

            res.json({ code: 0, data: chat });
        } catch (error) {
            res.json({ code: -1, msg: '获取对话历史失败' });
        }
    }

    // 获取用户的所有对话列表
    async getChatList(req, res) {
        try {
            const userId = req.user._id;
            const chats = await ChatModel.find({ userId })
                .select('_id createdAt updatedAt')
                .sort({ updatedAt: -1 });

            res.json({ code: 0, data: chats });
        } catch (error) {
            res.json({ code: -1, msg: '获取对话列表失败' });
        }
    }

    // 删除对话
    async deleteChat(req, res) {
        try {
            const userId = req.user._id;
            const { chatId } = req.params;

            const result = await ChatModel.deleteOne({ _id: chatId, userId });
            if (result.deletedCount === 0) {
                return res.json({ code: -1, msg: '对话不存在或无权删除' });
            }

            res.json({ code: 0, msg: '删除成功' });
        } catch (error) {
            res.json({ code: -1, msg: '删除对话失败' });
        }
    }
}

const controller = new ChatController();
module.exports = {
    createChat: controller.createChat.bind(controller),
    sendMessage: controller.sendMessage.bind(controller),
    getChatHistory: controller.getChatHistory.bind(controller),
    getChatList: controller.getChatList.bind(controller),
    deleteChat: controller.deleteChat.bind(controller)
};