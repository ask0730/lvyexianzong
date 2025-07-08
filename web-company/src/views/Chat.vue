<template>
    <div class="chat-container">
        <div class="chat-header">
            <h2>智能客服</h2>
        </div>
        <div class="chat-content" ref="chatContent">
            <div v-for="(message, index) in messages" :key="index" :class="['message', message.type]">
                <div class="message-content">
                    <template v-if="message.type === 'room'">
                        <span v-if="!message.username">
                            <b>智能客服：</b>
                        </span>
                        <span v-else-if="message.username === username">
                            <b>我：</b>
                        </span>
                        <span v-else>
                            <b>{{ message.username }}</b>：
                        </span>
                        <span>{{ message.content }}</span>
                    </template>
                    <template v-else>{{ message.content }}</template>
                </div>
            </div>
        </div>
        <div class="chat-input">
            <el-input v-model="inputMessage" placeholder="请输入您的问题" :rows="3" type="textarea" @keyup.enter.native.prevent="sendMessage" />
            <el-button type="primary" @click="sendMessage" :loading="loading">发送</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { io, Socket } from 'socket.io-client'

interface Message {
    content: string
    type: 'user' | 'bot' | 'room'
    username?: string
    time?: string
}

const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)
const chatContent = ref<HTMLElement | null>(null)

// socket.io 聊天室相关
const socket: Socket = io('http://localhost:3000') // 端口按实际后端为准
const username = '用户' + Math.floor(Math.random() * 1000)

onMounted(() => {
    // 添加欢迎消息
    messages.value.push({
        content: '您好！我是绿野仙踪的智能客服助手，很高兴为您服务。请问有什么可以帮助您的吗？',
        type: 'bot',
    })

    // 聊天室：接收历史消息
    socket.on('chat history', (history: any[]) => {
        history.forEach((msg) => {
            messages.value.push({
                content: msg.content,
                type: 'room',
                username: msg.username,
                time: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '',
            })
        })
        scrollToBottom()
    })
    // 聊天室：接收新消息
    socket.on('chat message', (msg: any) => {
        messages.value.push({
            content: msg.message || msg.content,
            type: 'room',
            username: msg.username,
            time: msg.time ? new Date(msg.time).toLocaleTimeString() : '',
        })
        scrollToBottom()
    })
})

onBeforeUnmount(() => {
    socket.disconnect()
})

const scrollToBottom = async () => {
    await nextTick()
    if (chatContent.value) {
        chatContent.value.scrollTop = chatContent.value.scrollHeight
    }
}

// 修改sendMessage：所有聊天室消息都用type: 'room'，带上username
const sendMessage = async () => {
    if (!inputMessage.value.trim()) return

    const token = localStorage.getItem('token')
    if (!token) {
        messages.value.push({
            content: '请先登录后再继续对话。',
            type: 'bot',
        })
        return
    }

    // 添加本地消息（也用type: 'room'，带username）
    messages.value.push({
        content: inputMessage.value,
        type: 'room',
        username,
    })

    // 聊天室：发送消息到socket.io
    socket.emit('chat message', {
        username,
        message: inputMessage.value,
        token: localStorage.getItem('token'), // 新增token
    })

    // 不再本地追加AI回复，AI回复由socket.io广播
    inputMessage.value = ''
    loading.value = false
    await scrollToBottom()
}
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