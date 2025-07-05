# Token无感刷新功能说明

## 功能概述

本系统已实现完整的token无感刷新机制，用户在使用过程中无需手动重新登录，系统会自动处理token的刷新。

## 技术架构

### 双Token机制
- **Access Token（访问令牌）**：短期有效（15分钟），用于API访问认证
- **Refresh Token（刷新令牌）**：长期有效（7天），用于获取新的Access Token

### 核心特性
1. **自动刷新**：Access Token过期时自动使用Refresh Token获取新token
2. **请求队列**：刷新过程中，其他请求会排队等待，避免重复刷新
3. **无感体验**：用户完全感知不到token刷新过程
4. **安全可靠**：Refresh Token失效时自动跳转登录页面

## 实现细节

### 后端实现

#### 1. JWT工具类更新 (`web-server/utils/JWT.js`)
```javascript
// 生成访问令牌（短期）
generateAccessToken(value) {
  return jsonwebtoken.sign(value, secret, { expiresIn: '15m' });
}

// 生成刷新令牌（长期）
generateRefreshToken(value) {
  return jsonwebtoken.sign(value, refreshSecret, { expiresIn: '7d' });
}

// 生成双token
generateTokens(value) {
  return {
    accessToken: this.generateAccessToken(value),
    refreshToken: this.generateRefreshToken(value)
  };
}
```

#### 2. Token刷新接口 (`web-server/routes/users.js`)
- 路径：`POST /webapi/users/refresh-token`
- 功能：验证Refresh Token并返回新的双token

#### 3. 认证中间件更新 (`web-server/middleware/AuthMiddleware.js`)
- 支持自动token刷新
- 在响应头中返回新token

### 前端实现

#### 1. 请求拦截器
- 自动添加Access Token到请求头
- 自动添加Refresh Token到请求头（用于后端自动刷新）

#### 2. 响应拦截器
- 检测401错误，自动触发token刷新
- 处理刷新过程中的请求队列
- 自动更新本地存储的token

#### 3. Token管理工具类
- 统一的token存储和获取接口
- 提供登录状态检查方法

## 使用流程

### 1. 用户登录
```javascript
// 登录成功后，系统返回双token
{
  code: 0,
  message: '登录成功',
  data: { /* 用户信息 */ },
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

### 2. 自动token刷新
当Access Token过期时：
1. 前端检测到401错误
2. 自动调用刷新接口获取新token
3. 更新本地存储
4. 重试原请求
5. 用户无感知

### 3. 刷新失败处理
如果Refresh Token也过期：
1. 清除本地所有token
2. 跳转到登录页面
3. 提示用户重新登录

## 配置说明

### Token过期时间
- Access Token：15分钟
- Refresh Token：7天

### 安全配置
- 使用不同的密钥签名Access Token和Refresh Token
- Refresh Token存储在HttpOnly Cookie中（可选，当前使用localStorage）

## 兼容性说明

### 向后兼容
- 保留了原有的`JWT.generate()`和`JWT.verify()`方法
- 旧版本的token仍然可以正常工作
- 逐步迁移到新机制

### 数据迁移
- 旧版本存储的`token`字段会被自动迁移到`accessToken`
- 用户无需重新登录

## 测试方法

### 1. 正常使用测试
1. 用户登录获取token
2. 正常使用系统功能
3. 验证15分钟后token自动刷新

### 2. 刷新机制测试
1. 手动删除Access Token
2. 发起API请求
3. 验证自动刷新和重试

### 3. 失效处理测试
1. 删除Refresh Token
2. 发起API请求
3. 验证跳转到登录页面

## 注意事项

1. **安全性**：Refresh Token具有较长的有效期，请确保安全存储
2. **并发请求**：系统已处理并发请求的token刷新问题
3. **网络异常**：网络异常时token刷新失败会跳转登录
4. **浏览器兼容性**：支持所有现代浏览器

## 故障排除

### 常见问题

1. **Token刷新失败**
   - 检查Refresh Token是否有效
   - 检查网络连接
   - 查看浏览器控制台错误信息

2. **频繁跳转登录**
   - 检查localStorage是否被清除
   - 检查token格式是否正确
   - 查看后端日志

3. **请求队列问题**
   - 检查是否有重复的刷新请求
   - 查看网络请求时序

### 调试工具

使用浏览器开发者工具：
1. 查看Network面板的请求头
2. 查看Application面板的localStorage
3. 查看Console面板的错误信息

## 更新日志

- **v1.0.0**：实现基础的双token机制
- **v1.1.0**：添加自动刷新和请求队列功能
- **v1.2.0**：优化错误处理和用户体验 