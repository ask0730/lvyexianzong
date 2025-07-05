const LoginAttemptModel = require('../../models/LoginAttemptModel');

const LoginAttemptService = {
  // 获取登录尝试统计
  getLoginAttemptStats: async () => {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const [hourlyStats, dailyStats, totalStats] = await Promise.all([
        // 最近1小时的尝试
        LoginAttemptModel.aggregate([
          { $match: { attemptTime: { $gte: oneHourAgo } } },
          { $group: { _id: '$success', count: { $sum: 1 } } }
        ]),
        
        // 最近24小时的尝试
        LoginAttemptModel.aggregate([
          { $match: { attemptTime: { $gte: oneDayAgo } } },
          { $group: { _id: '$success', count: { $sum: 1 } } }
        ]),
        
        // 总尝试次数
        LoginAttemptModel.aggregate([
          { $group: { _id: '$success', count: { $sum: 1 } } }
        ])
      ]);
      
      return {
        hourly: {
          success: hourlyStats.find(s => s._id === true)?.count || 0,
          failed: hourlyStats.find(s => s._id === false)?.count || 0
        },
        daily: {
          success: dailyStats.find(s => s._id === true)?.count || 0,
          failed: dailyStats.find(s => s._id === false)?.count || 0
        },
        total: {
          success: totalStats.find(s => s._id === true)?.count || 0,
          failed: totalStats.find(s => s._id === false)?.count || 0
        }
      };
    } catch (error) {
      console.error('获取登录尝试统计失败:', error);
      throw error;
    }
  },
  
  // 获取最近的登录尝试记录
  getRecentAttempts: async (limit = 50, page = 1) => {
    try {
      const skip = (page - 1) * limit;
      const attempts = await LoginAttemptModel.find({})
        .sort({ attemptTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      const total = await LoginAttemptModel.countDocuments({});
      
      return {
        attempts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('获取最近登录尝试失败:', error);
      throw error;
    }
  },
  
  // 获取特定用户的登录尝试
  getUserAttempts: async (username, limit = 20) => {
    try {
      return await LoginAttemptModel.find({ username })
        .sort({ attemptTime: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('获取用户登录尝试失败:', error);
      throw error;
    }
  },
  
  // 获取特定IP的登录尝试
  getIPAttempts: async (ip, limit = 20) => {
    try {
      return await LoginAttemptModel.find({ ip })
        .sort({ attemptTime: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('获取IP登录尝试失败:', error);
      throw error;
    }
  },
  
  // 清理过期记录
  cleanupOldRecords: async (hours = 24) => {
    try {
      const result = await LoginAttemptModel.cleanOldRecords(hours);
      return result;
    } catch (error) {
      console.error('清理过期记录失败:', error);
      throw error;
    }
  },
  
  // 获取被锁定的用户列表
  getLockedUsers: async () => {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      const lockedUsers = await LoginAttemptModel.aggregate([
        {
          $match: {
            success: false,
            attemptTime: { $gte: thirtyMinutesAgo }
          }
        },
        {
          $group: {
            _id: '$username',
            attempts: { $sum: 1 },
            lastAttempt: { $max: '$attemptTime' },
            reasons: { $addToSet: '$reason' }
          }
        },
        {
          $match: {
            attempts: { $gte: 5 } // 5次以上失败的用户
          }
        },
        {
          $sort: { lastAttempt: -1 }
        }
      ]);
      
      return lockedUsers;
    } catch (error) {
      console.error('获取锁定用户失败:', error);
      throw error;
    }
  },
  
  // 获取被锁定的IP列表
  getLockedIPs: async () => {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      const lockedIPs = await LoginAttemptModel.aggregate([
        {
          $match: {
            success: false,
            attemptTime: { $gte: thirtyMinutesAgo }
          }
        },
        {
          $group: {
            _id: '$ip',
            attempts: { $sum: 1 },
            lastAttempt: { $max: '$attemptTime' },
            usernames: { $addToSet: '$username' },
            reasons: { $addToSet: '$reason' }
          }
        },
        {
          $match: {
            attempts: { $gte: 10 } // 10次以上失败的IP
          }
        },
        {
          $sort: { lastAttempt: -1 }
        }
      ]);
      
      return lockedIPs;
    } catch (error) {
      console.error('获取锁定IP失败:', error);
      throw error;
    }
  },
  
  // 手动解锁用户
  unlockUser: async (username) => {
    try {
      // 删除该用户的所有失败记录
      const result = await LoginAttemptModel.deleteMany({
        username,
        success: false
      });
      
      return result;
    } catch (error) {
      console.error('解锁用户失败:', error);
      throw error;
    }
  },
  
  // 手动解锁IP
  unlockIP: async (ip) => {
    try {
      // 删除该IP的所有失败记录
      const result = await LoginAttemptModel.deleteMany({
        ip,
        success: false
      });
      
      return result;
    } catch (error) {
      console.error('解锁IP失败:', error);
      throw error;
    }
  }
};

module.exports = LoginAttemptService; 