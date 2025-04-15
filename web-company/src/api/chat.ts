import request from '@/utils/request';

// 创建新对话
export function createChat() {
  return request({
    url: '/web/chat/create',
    method: 'post'
  });
}

// 发送消息
export function sendMessage(data: { chatId: string; message: string }) {
  return request({
    url: '/web/chat/send',
    method: 'post',
    data
  });
}

// 获取对话历史
export function getChatHistory(chatId: string) {
  return request({
    url: `/web/chat/history/${chatId}`,
    method: 'get'
  });
}

// 获取对话列表
export function getChatList() {
  return request({
    url: '/web/chat/list',
    method: 'get'
  });
}

// 删除对话
export function deleteChat(chatId: string) {
  return request({
    url: `/web/chat/${chatId}`,
    method: 'delete'
  });
}