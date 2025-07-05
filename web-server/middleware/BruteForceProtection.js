const LoginAttemptModel = require('../models/LoginAttemptModel');

// 防爆破配置
const BRUTE_FORCE_CONFIG = {
  // 用户级别限制
  USER_MAX_ATTEMPTS: 5,
  USER_LOCK_MINUTES: 30,
  
  // IP级别限制
  IP_MAX_ATTEMPTS: 10,
  IP_LOCK_MINUTES: 30,
  
  // 清理配置
  CLEANUP_HOURS: 24
};

// 获取客户端IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.ip || 
         'unknown';
};

// 记录登录尝试
const recordLoginAttempt = async (username, ip, userAgent, success, reason = '') => {
  try {
    await LoginAttemptModel.create({
      username,
      ip,
      userAgent,
      success,
      reason
    });
  } catch (error) {
    console.error('记录登录尝试失败:', error);
  }
};

// 清理过期记录
const cleanupOldRecords = async () => {
  try {
    await LoginAttemptModel.cleanOldRecords(BRUTE_FORCE_CONFIG.CLEANUP_HOURS);
  } catch (error) {
    console.error('清理过期记录失败:', error);
  }
};

// 防爆破中间件
const bruteForceProtection = async (req, res, next) => {
  const username = req.body.username;
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'] || '';
  
  try {
    // 检查用户是否被锁定
    const isUserLocked = await LoginAttemptModel.isUserLocked(
      username, 
      BRUTE_FORCE_CONFIG.USER_MAX_ATTEMPTS, 
      BRUTE_FORCE_CONFIG.USER_LOCK_MINUTES
    );
    
    if (isUserLocked) {
      const remainingTime = await LoginAttemptModel.getLockRemainingTime(
        username, 
        BRUTE_FORCE_CONFIG.USER_MAX_ATTEMPTS, 
        BRUTE_FORCE_CONFIG.USER_LOCK_MINUTES
      );
      
      await recordLoginAttempt(username, ip, userAgent, false, '用户账户被锁定');
      
      return res.status(429).json({
        code: 1,
        msg: `账户已被锁定，请等待 ${Math.ceil(remainingTime / 1000 / 60)} 分钟后重试`,
        locked: true,
        remainingTime
      });
    }
    
    // 检查IP是否被锁定
    const isIPLocked = await LoginAttemptModel.isIPLocked(
      ip, 
      BRUTE_FORCE_CONFIG.IP_MAX_ATTEMPTS, 
      BRUTE_FORCE_CONFIG.IP_LOCK_MINUTES
    );
    
    if (isIPLocked) {
      await recordLoginAttempt(username, ip, userAgent, false, 'IP地址被锁定');
      
      return res.status(429).json({
        code: 1,
        msg: 'IP地址已被锁定，请稍后重试',
        locked: true
      });
    }
    
    // 添加登录结果处理到响应对象
    res.locals.recordLoginResult = async (success, reason = '') => {
      await recordLoginAttempt(username, ip, userAgent, success, reason);
    };
    
    next();
  } catch (error) {
    console.error('防爆破检查失败:', error);
    next(); // 出错时继续处理，不阻塞登录
  }
};

// 定期清理过期记录
setInterval(cleanupOldRecords, 60 * 60 * 1000); // 每小时清理一次

module.exports = {
  bruteForceProtection,
  recordLoginAttempt,
  cleanupOldRecords,
  BRUTE_FORCE_CONFIG
}; 