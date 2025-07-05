const express = require('express');
const LoginAttemptController = require('../../controllers/admin/LoginAttemptController');
const LoginAttemptRouter = express.Router();

// 获取登录尝试统计
LoginAttemptRouter.get('/adminapi/login-attempts/stats', LoginAttemptController.getStats);

// 获取最近的登录尝试记录
LoginAttemptRouter.post('/adminapi/login-attempts/recent', LoginAttemptController.getRecentAttempts);

// 获取特定用户的登录尝试
LoginAttemptRouter.post('/adminapi/login-attempts/user', LoginAttemptController.getUserAttempts);

// 获取特定IP的登录尝试
LoginAttemptRouter.post('/adminapi/login-attempts/ip', LoginAttemptController.getIPAttempts);

// 获取被锁定的用户列表
LoginAttemptRouter.get('/adminapi/login-attempts/locked-users', LoginAttemptController.getLockedUsers);

// 获取被锁定的IP列表
LoginAttemptRouter.get('/adminapi/login-attempts/locked-ips', LoginAttemptController.getLockedIPs);

// 手动解锁用户
LoginAttemptRouter.post('/adminapi/login-attempts/unlock-user', LoginAttemptController.unlockUser);

// 手动解锁IP
LoginAttemptRouter.post('/adminapi/login-attempts/unlock-ip', LoginAttemptController.unlockIP);

// 清理过期记录
LoginAttemptRouter.post('/adminapi/login-attempts/cleanup', LoginAttemptController.cleanupOldRecords);

module.exports = LoginAttemptRouter; 