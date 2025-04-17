<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>智能客服</h2>
    </div>
    <div class="chat-content" ref="chatContent">
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.type]">
        <div class="message-content">
          {{ message.content }}
        </div>
      </div>
    </div>
    <div class="chat-input">
      <el-input
        v-model="inputMessage"
        placeholder="请输入您的问题"
        :rows="3"
        type="textarea"
        @keyup.enter.native.prevent="sendMessage"
      />
      <el-button type="primary" @click="sendMessage" :loading="loading">
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

interface Message {
  content: string;
  type: 'user' | 'bot';
}

const messages = ref<Message[]>([]);
const inputMessage = ref('');
const loading = ref(false);
const chatContent = ref<HTMLElement | null>(null);

onMounted(() => {
  // 添加欢迎消息
  messages.value.push({
    content: '您好！我是绿野仙踪的智能客服助手，很高兴为您服务。请问有什么可以帮助您的吗？',
    type: 'bot'
  });
});

const scrollToBottom = async () => {
  await nextTick();
  if (chatContent.value) {
    chatContent.value.scrollTop = chatContent.value.scrollHeight;
  }
};

const sendMessage = async () => {
  if (!inputMessage.value.trim()) return;

  const token = localStorage.getItem('token');
  if (!token) {
    messages.value.push({
      content: '请先登录后再继续对话。',
      type: 'bot'
    });
    return;
  }

  // 添加用户消息
  messages.value.push({
    content: inputMessage.value,
    type: 'user'
  });

  const userQuestion = inputMessage.value;
  inputMessage.value = '';
  loading.value = true;

  await scrollToBottom();

  try {
    const response = await fetch('http://localhost:8081/webapi/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: userQuestion
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        messages.value.push({
          content: '登录已过期，请重新登录后继续对话。',
          type: 'bot'
        });
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code === 0) {
      messages.value.push({
        content: data.data.message,
        type: 'bot'
      });
    } else {
      messages.value.push({
        content: '抱歉，服务出现了一些问题，请稍后再试。',
        type: 'bot'
      });
    }
  } catch (error) {
    console.error('发送消息失败:', error);
    messages.value.push({
      content: '网络连接出现问题，请检查您的网络连接后重试。',
      type: 'bot'
    });
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
};
</script>

<style scoped lang="scss">
.chat-container {
  max-width: 800px;
  margin: 2rem auto;
  height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  text-align: center;

  h2 {
    margin: 0;
    color: var(--el-color-primary);
  }
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;

  .message {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;

    &.user {
      align-items: flex-end;

      .message-content {
        background: var(--el-color-primary);
        color: white;
      }
    }

    &.bot .message-content {
      background: #f4f4f5;
      color: #333;
    }

    .message-content {
      max-width: 80%;
      padding: 0.8rem 1rem;
      border-radius: 4px;
      word-break: break-word;
    }
  }
}

.chat-input {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 1rem;
  align-items: flex-start;

  .el-input {
    flex: 1;
  }

  .el-button {
    margin-top: 0.5rem;
  }
}
</style>