const axios = require('axios');

// 测试配置
const BASE_URL = 'http://localhost:3000';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = '123456';

// 测试密码加密移除后的功能
async function testPasswordRemoval() {
  console.log('🧪 开始测试密码加密移除后的功能...\n');

  try {
    // 测试1: 管理员登录（应该成功）
    console.log('📝 测试1: 管理员登录（使用明文密码）');
    try {
      const response = await axios.post(`${BASE_URL}/adminapi/user/login`, {
        username: TEST_USERNAME,
        password: TEST_PASSWORD
      });
      console.log(`   登录成功: 状态码 ${response.status}, 响应:`, response.data);
    } catch (error) {
      console.log(`   登录失败: 状态码 ${error.response?.status}, 响应:`, error.response?.data);
    }

    // 测试2: 用户注册（应该成功）
    console.log('\n📝 测试2: 用户注册（使用明文密码）');
    try {
      const response = await axios.post(`${BASE_URL}/webapi/users/register`, {
        username: 'testuser',
        password: 'testpass123',
        email: 'test@example.com'
      });
      console.log(`   注册成功: 状态码 ${response.status}, 响应:`, response.data);
    } catch (error) {
      console.log(`   注册失败: 状态码 ${error.response?.status}, 响应:`, error.response?.data);
    }

    // 测试3: 新用户登录（应该成功）
    console.log('\n📝 测试3: 新用户登录（使用明文密码）');
    try {
      const response = await axios.post(`${BASE_URL}/webapi/users/login`, {
        username: 'testuser',
        password: 'testpass123',
        captchaVerified: true
      });
      console.log(`   登录成功: 状态码 ${response.status}, 响应:`, response.data);
    } catch (error) {
      console.log(`   登录失败: 状态码 ${error.response?.status}, 响应:`, error.response?.data);
    }

    // 测试4: 错误密码登录（应该失败）
    console.log('\n📝 测试4: 错误密码登录（应该失败）');
    try {
      const response = await axios.post(`${BASE_URL}/webapi/users/login`, {
        username: 'testuser',
        password: 'wrongpassword',
        captchaVerified: true
      });
      console.log(`   登录成功: 状态码 ${response.status}, 响应:`, response.data);
    } catch (error) {
      console.log(`   登录失败: 状态码 ${error.response?.status}, 响应:`, error.response?.data);
    }

    console.log('\n✅ 密码加密移除功能测试完成！');
    console.log('📋 总结:');
    console.log('   - 密码现在以明文形式存储');
    console.log('   - 登录时直接比较明文密码');
    console.log('   - 不再使用bcrypt加密');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
if (require.main === module) {
  testPasswordRemoval();
}

module.exports = { testPasswordRemoval }; 