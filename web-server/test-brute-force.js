const axios = require('axios');

// 测试配置
const BASE_URL = 'http://localhost:3000';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'wrongpassword';

// 测试防爆破功能
async function testBruteForceProtection() {
  console.log('🧪 开始测试防爆破功能...\n');

  try {
    // 测试1: 正常登录失败
    console.log('📝 测试1: 正常登录失败');
    for (let i = 1; i <= 3; i++) {
      try {
        const response = await axios.post(`${BASE_URL}/adminapi/user/login`, {
          username: TEST_USERNAME,
          password: TEST_PASSWORD
        });
        console.log(`   尝试 ${i}: 状态码 ${response.status}, 响应:`, response.data);
      } catch (error) {
        console.log(`   尝试 ${i}: 状态码 ${error.response?.status}, 响应:`, error.response?.data);
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
    }

    // 测试2: 验证码功能（第4次失败后应该显示验证码）
    console.log('\n📝 测试2: 验证码功能（第4次失败）');
    try {
      const response = await axios.post(`${BASE_URL}/adminapi/user/login`, {
        username: TEST_USERNAME,
        password: TEST_PASSWORD
      });
      console.log(`   尝试 4: 状态码 ${response.status}, 响应:`, response.data);
    } catch (error) {
      console.log(`   尝试 4: 状态码 ${error.response?.status}, 响应:`, error.response?.data);
    }

    // 测试3: 账户锁定（第5次失败后应该锁定）
    console.log('\n📝 测试3: 账户锁定（第5次失败）');
    try {
      const response = await axios.post(`${BASE_URL}/adminapi/user/login`, {
        username: TEST_USERNAME,
        password: TEST_PASSWORD
      });
      console.log(`   尝试 5: 状态码 ${response.status}, 响应:`, response.data);
    } catch (error) {
      console.log(`   尝试 5: 状态码 ${error.response?.status}, 响应:`, error.response?.data);
    }

    // 测试4: 锁定后继续尝试
    console.log('\n📝 测试4: 锁定后继续尝试');
    try {
      const response = await axios.post(`${BASE_URL}/adminapi/user/login`, {
        username: TEST_USERNAME,
        password: TEST_PASSWORD
      });
      console.log(`   锁定后尝试: 状态码 ${response.status}, 响应:`, response.data);
    } catch (error) {
      console.log(`   锁定后尝试: 状态码 ${error.response?.status}, 响应:`, error.response?.data);
    }

    // 测试5: 查看登录尝试统计
    console.log('\n📝 测试5: 查看登录尝试统计');
    try {
      const response = await axios.get(`${BASE_URL}/adminapi/login-attempts/stats`);
      console.log('   统计信息:', response.data);
    } catch (error) {
      console.log('   获取统计失败:', error.response?.data);
    }

    // 测试6: 查看被锁定用户
    console.log('\n📝 测试6: 查看被锁定用户');
    try {
      const response = await axios.get(`${BASE_URL}/adminapi/login-attempts/locked-users`);
      console.log('   被锁定用户:', response.data);
    } catch (error) {
      console.log('   获取锁定用户失败:', error.response?.data);
    }

    console.log('\n✅ 防爆破功能测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
if (require.main === module) {
  testBruteForceProtection();
}

module.exports = { testBruteForceProtection }; 