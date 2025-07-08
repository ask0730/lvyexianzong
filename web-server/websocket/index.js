const ChatModel = require('../models/ChatModel');
const axios = require('axios');

module.exports = function(io) {
  // 连接事件
  io.on('connection', async (socket) => {
    console.log('有用户连接:', socket.id);

    // 新用户连接时，推送历史消息
    try {
      let chatRoom = await ChatModel.findOne({ userId: null });
      if (!chatRoom) {
        chatRoom = await ChatModel.create({ userId: null, messages: [] });
      }
      // 只推送最近50条
      const history = (chatRoom.messages || []).slice(-50);
      socket.emit('chat history', history);
    } catch (e) {
      console.error('获取历史消息失败:', e);
    }

    // 监听客户端发送的消息
    socket.on('chat message', async (data) => {
      // data: { username, message, token }
      const { username, message, token } = data;
      // 保存到聊天室文档
      try {
        const msgObj = {
          role: 'user',
          content: message,
          timestamp: new Date(),
          username
        };
        await ChatModel.updateOne(
          { userId: null },
          { $push: { messages: msgObj } }
        );
      } catch (e) {
        console.error('保存聊天记录失败:', e);
      }
      // 广播用户消息到所有客户端
      io.emit('chat message', {
        username,
        message,
        time: new Date().toISOString(),
      });

      // deepseek/AI回复（调用现有API）
      try {
        // 这里假设你的AI接口为 http://localhost:8081/webapi/chat/send
        const aiRes = await axios.post('http://localhost:8081/webapi/chat/send', {
          message
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        let aiReply = '智能客服暂时无法回复';
        if (aiRes.data && aiRes.data.code === 0 && aiRes.data.data && aiRes.data.data.message) {
          aiReply = aiRes.data.data.message;
        }
        // 保存AI消息
        const aiMsgObj = {
          role: 'assistant',
          content: aiReply,
          timestamp: new Date(),
        };
        await ChatModel.updateOne(
          { userId: null },
          { $push: { messages: aiMsgObj } }
        );
        // 广播AI消息
        io.emit('chat message', {
          message: aiReply,
          time: new Date().toISOString(),
        });
      } catch (e) {
        console.error('AI回复失败:', e);
      }
    });

    socket.on('disconnect', () => {
      console.log('用户断开:', socket.id);
    });
  });
}; 