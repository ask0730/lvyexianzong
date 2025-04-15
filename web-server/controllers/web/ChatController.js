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
                        content: '你是绿野仙踪科技有限公司的AI客服助手。请以亲切自然的语气与用户交流，理解并回答用户的各类问题。如果用户询问与环保技术和我们公司业务相关的问题，你可以详细介绍我们的专业服务。如果用户询问其他问题，请以礼貌和专业的态度给出合适的回答，帮助用户解决问题或推荐合适的咨询渠道。'
                    },
                    ...chat.messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }))
                ],
                temperature: 0.9,
                max_tokens: 2000,
                top_p: 0.95,
                frequency_penalty: 0.5,
                presence_penalty: 0.5
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
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
            res.json({ code: -1, msg: '获取AI回复失败' });
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
