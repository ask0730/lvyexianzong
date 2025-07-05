const LoginAttemptService = require('../../services/admin/LoginAttemptService');

const LoginAttemptController = {
  // 获取登录尝试统计
  getStats: async (req, res) => {
    try {
      const stats = await LoginAttemptService.getLoginAttemptStats();
      res.send({
        code: 0,
        data: stats
      });
    } catch (error) {
      console.error('获取登录尝试统计失败:', error);
      res.status(500).send({
        code: 1,
        msg: '获取统计信息失败'
      });
    }
  },

  // 获取最近的登录尝试记录
  getRecentAttempts: async (req, res) => {
    try {
      const { limit = 50, page = 1 } = req.body;
      const result = await LoginAttemptService.getRecentAttempts(parseInt(limit), parseInt(page));
      res.send({
        code: 0,
        data: result
      });
    } catch (error) {
      console.error('获取最近登录尝试失败:', error);
      res.status(500).send({
        code: 1,
        msg: '获取登录尝试记录失败'
      });
    }
  },

  // 获取特定用户的登录尝试
  getUserAttempts: async (req, res) => {
    try {
      const { username, limit = 20 } = req.body;
      if (!username) {
        return res.send({
          code: 1,
          msg: '用户名不能为空'
        });
      }
      
      const attempts = await LoginAttemptService.getUserAttempts(username, parseInt(limit));
      res.send({
        code: 0,
        data: attempts
      });
    } catch (error) {
      console.error('获取用户登录尝试失败:', error);
      res.status(500).send({
        code: 1,
        msg: '获取用户登录尝试失败'
      });
    }
  },

  // 获取特定IP的登录尝试
  getIPAttempts: async (req, res) => {
    try {
      const { ip, limit = 20 } = req.body;
      if (!ip) {
        return res.send({
          code: 1,
          msg: 'IP地址不能为空'
        });
      }
      
      const attempts = await LoginAttemptService.getIPAttempts(ip, parseInt(limit));
      res.send({
        code: 0,
        data: attempts
      });
    } catch (error) {
      console.error('获取IP登录尝试失败:', error);
      res.status(500).send({
        code: 1,
        msg: '获取IP登录尝试失败'
      });
    }
  },

  // 获取被锁定的用户列表
  getLockedUsers: async (req, res) => {
    try {
      const lockedUsers = await LoginAttemptService.getLockedUsers();
      res.send({
        code: 0,
        data: lockedUsers
      });
    } catch (error) {
      console.error('获取锁定用户失败:', error);
      res.status(500).send({
        code: 1,
        msg: '获取锁定用户失败'
      });
    }
  },

  // 获取被锁定的IP列表
  getLockedIPs: async (req, res) => {
    try {
      const lockedIPs = await LoginAttemptService.getLockedIPs();
      res.send({
        code: 0,
        data: lockedIPs
      });
    } catch (error) {
      console.error('获取锁定IP失败:', error);
      res.status(500).send({
        code: 1,
        msg: '获取锁定IP失败'
      });
    }
  },

  // 手动解锁用户
  unlockUser: async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.send({
          code: 1,
          msg: '用户名不能为空'
        });
      }
      
      const result = await LoginAttemptService.unlockUser(username);
      res.send({
        code: 0,
        msg: '用户解锁成功',
        data: {
          deletedCount: result.deletedCount
        }
      });
    } catch (error) {
      console.error('解锁用户失败:', error);
      res.status(500).send({
        code: 1,
        msg: '解锁用户失败'
      });
    }
  },

  // 手动解锁IP
  unlockIP: async (req, res) => {
    try {
      const { ip } = req.body;
      if (!ip) {
        return res.send({
          code: 1,
          msg: 'IP地址不能为空'
        });
      }
      
      const result = await LoginAttemptService.unlockIP(ip);
      res.send({
        code: 0,
        msg: 'IP解锁成功',
        data: {
          deletedCount: result.deletedCount
        }
      });
    } catch (error) {
      console.error('解锁IP失败:', error);
      res.status(500).send({
        code: 1,
        msg: '解锁IP失败'
      });
    }
  },

  // 清理过期记录
  cleanupOldRecords: async (req, res) => {
    try {
      const { hours = 24 } = req.body;
      const result = await LoginAttemptService.cleanupOldRecords(parseInt(hours));
      res.send({
        code: 0,
        msg: '清理过期记录成功',
        data: {
          deletedCount: result.deletedCount
        }
      });
    } catch (error) {
      console.error('清理过期记录失败:', error);
      res.status(500).send({
        code: 1,
        msg: '清理过期记录失败'
      });
    }
  }
};

module.exports = LoginAttemptController; 