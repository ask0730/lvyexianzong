<template>
  <div class="chat-container">
    <div class="chat-button" @click="showChat = true" v-if="!showChat">
      <i class="fas fa-comments"></i>
      智能客服
    </div>

    <div class="chat-window" v-if="showChat">
      <div class="chat-header">
        <span>智能客服</span>
        <button class="close-button" @click="showChat = false">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="chat-messages" ref="messageContainer">
        <div v-for="(message, index) in currentChat.messages" :key="index"
          :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']">
          <div class="message-content">{{ message.content }}</div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>

      <div class="chat-input">
        <textarea
          v-model="newMessage"
          @keyup.enter.exact="sendMessage"
          placeholder="请输入您的问题..."
          :disabled="loading"
        ></textarea>
        <button @click="sendMessage" :disabled="loading || !newMessage.trim()">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useUserStore } from '../store/user';
import axios from 'axios';
import dayjs from 'dayjs';

const userStore = useUserStore();
const showChat = ref(false);
const newMessage = ref('');
const loading = ref(false);
const currentChat = ref({ messages: [] });
const messageContainer = ref(null);

// 创建新对话
async function createNewChat() {
  try {
    const response = await axios.post('/api/web/chat/create');
    if (response.data.code === 0) {
      return response.data.data._id;
    }
  } catch (error) {
    console.error('创建对话失败:', error);
  }
  return null;
}

// 发送消息
async function sendMessage() {
  if (loading.value || !newMessage.value.trim()) return;

  try {
    loading.value = true;
    
    // 如果没有当前对话ID，创建新对话
    if (!currentChat.value._id) {
      currentChat.value._id = await createNewChat();
    }

    // 发送消息到服务器
    const response = await axios.post('/api/web/chat/send', {
      chatId: currentChat.value._id,
      message: newMessage.value.trim()
    });

    if (response.data.code === 0) {
      // 更新消息列表
      currentChat.value.messages.push({
        role: 'user',
        content: newMessage.value.trim(),
        timestamp: new Date()
      });

      currentChat.value.messages.push({
        role: 'assistant',
        content: response.data.data.message,
        timestamp: new Date()
      });

      newMessage.value = '';
      scrollToBottom();
    }
  } catch (error) {
    console.error('发送消息失败:', error);
  } finally {
    loading.value = false;
  }
}

// 格式化时间
function formatTime(time) {
  return dayjs(time).format('HH:mm');
}

// 滚动到底部
function scrollToBottom() {
  setTimeout(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  }, 100);
}

// 监听消息变化，自动滚动到底部
watch(() => currentChat.value.messages.length, scrollToBottom);
</script>

<style scoped>
.chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-button {
  background-color: #4CAF50;
  color: white;
  padding: 12px 24px;
  border-radius: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.chat-button:hover {
  background-color: #45a049;
  transform: translateY(-2px);
}

.chat-window {
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 16px;
  background-color: #4CAF50;
  color: white;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px;
  position: relative;
}

.user-message {
  align-self: flex-end;
  background-color: #4CAF50;
  color: white;
}

.assistant-message {
  align-self: flex-start;
  background-color: #f0f0f0;
  color: #333;
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 4px;
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
}

.chat-input textarea {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  resize: none;
  height: 40px;
  line-height: 24px;
}

.chat-input button {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.chat-input button:hover:not(:disabled) {
  background-color: #45a049;
}

.chat-input button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
