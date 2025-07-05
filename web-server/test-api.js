const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 测试登录尝试管理API...\n');

  try {
    // 测试1: 统计接口
    console.log('📝 测试1: 统计接口');
    try {
      const response = await axios.get(`${BASE_URL}/adminapi/login-attempts/stats`);
      console.log('✅ 成功:', response.data);
    } catch (error) {
      console.log('❌ 失败:', error.response?.data || error.message);
    }

    // 测试2: 锁定用户接口
    console.log('\n📝 测试2: 锁定用户接口');
    try {
      const response = await axios.get(`${BASE_URL}/adminapi/login-attempts/locked-users`);
      console.log('✅ 成功:', response.data);
    } catch (error) {
      console.log('❌ 失败:', error.response?.data || error.message);
    }

    // 测试3: 锁定IP接口
    console.log('\n📝 测试3: 锁定IP接口');
    try {
      const response = await axios.get(`${BASE_URL}/adminapi/login-attempts/locked-ips`);
      console.log('✅ 成功:', response.data);
    } catch (error) {
      console.log('❌ 失败:', error.response?.data || error.message);
    }

    // 测试4: 最近记录接口
    console.log('\n📝 测试4: 最近记录接口');
    try {
      const response = await axios.post(`${BASE_URL}/adminapi/login-attempts/recent`, {
        limit: 10,
        page: 1
      });
      console.log('✅ 成功:', response.data);
    } catch (error) {
      console.log('❌ 失败:', error.response?.data || error.message);
    }

    console.log('\n✅ API测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI }; 