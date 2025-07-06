# Token 无感刷新功能说明

## 功能概述

本项目实现了完整的token无感刷新机制，包括：

1. **双Token机制**：Access Token（15分钟）+ Refresh Token（7天）
2. **自动刷新**：当Access Token过期时，自动使用Refresh Token获取新的Token
3. **401错误处理**：优雅处理401未授权错误
4. **请求队列**：防止并发刷新Token导致的竞态条件

## 后端实现

### 1. JWT工具类增强 (`web-server/utils/JWT.js`)

```javascript
// 生成访问令牌（短期）
generateAccessToken(value) // 15分钟过期

// 生成刷新令牌（长期）
generateRefreshToken(value) // 7天过期

// 验证访问令牌
verifyAccessToken(token)

// 验证刷新令牌
verifyRefreshToken(token)
```

### 2. 登录接口更新 (`web-server/routes/users.js`)

登录成功后返回：
```json
{
  "code": 0,
  "message": "登录成功",
  "data": { ... },
  "token": "access_token_here",
  "refreshToken": "refresh_token_here"
}
```

### 3. 新增刷新Token接口

**接口地址**：`POST /webapi/users/refresh-token`

**请求参数**：
```json
{
  "refreshToken": "refresh_token_here"
}
```

**响应**：
```json
{
  "code": 0,
  "message": "令牌刷新成功",
  "token": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

## 前端实现

### 1. Token管理工具类 (`src/utils/token.ts`)

提供统一的Token管理功能：

```typescript
// 获取访问令牌
TokenManager.getToken()

// 获取刷新令牌
TokenManager.getRefreshToken()

// 设置令牌
TokenManager.setTokens(token, refreshToken)

// 清除认证信息
TokenManager.clearAuth()

// 检查是否已登录
TokenManager.isLoggedIn()

// 检查token是否即将过期
TokenManager.isTokenExpiringSoon()
```

### 2. API拦截器配置 (`src/api/config.ts`)

实现了完整的请求/响应拦截器：

#### 请求拦截器
- 自动添加Authorization头
- 使用当前有效的Access Token

#### 响应拦截器
- 检测401错误
- 自动刷新Token
- 处理并发请求队列
- 失败时自动跳转登录页

### 3. 认证工具 (`src/utils/auth.ts`)

提供认证相关功能：

```typescript
// 退出登录
logout()

// 检查认证状态
isAuthenticated()

// 获取当前用户
getCurrentUser()
```

### 4. 路由守卫 (`src/router/guard.ts`)

保护需要登录的路由：

- 检查登录状态
- 自动刷新即将过期的Token
- 未登录时跳转登录页

## 使用流程

### 1. 用户登录
```typescript
// 登录成功后自动保存Token
TokenManager.setUserInfo(response.data.data)
TokenManager.setTokens(response.data.token, response.data.refreshToken)
```

### 2. 自动Token刷新
当API请求返回401时：
1. 检查是否有Refresh Token
2. 调用刷新接口获取新Token
3. 更新本地存储
4. 重试原始请求
5. 处理等待队列中的其他请求

### 3. 退出登录
```typescript
// 清除所有认证信息
await logout()
```

## 错误处理

### 401错误处理流程
1. 检测到401错误
2. 检查是否正在刷新Token
3. 如果正在刷新，将请求加入等待队列
4. 如果未在刷新，开始刷新流程
5. 刷新成功后重试原始请求
6. 刷新失败则跳转登录页

### 并发请求处理
- 使用队列机制避免重复刷新
- 所有等待中的请求在Token刷新成功后自动重试

## 安全特性

1. **短期Access Token**：减少Token泄露的风险
2. **长期Refresh Token**：提供良好的用户体验
3. **自动清理**：Token失效时自动清除本地存储
4. **安全跳转**：认证失败时自动跳转登录页

## 测试

可以使用 `src/utils/test-token.ts` 中的测试函数：

```typescript
// 测试Token刷新功能
testTokenRefresh()

// 测试401错误处理
test401Handling()
```

## 注意事项

1. **Token存储**：Token存储在localStorage中，确保HTTPS环境
2. **刷新频率**：Access Token 15分钟过期，Refresh Token 7天过期
3. **并发处理**：系统自动处理并发请求的Token刷新
4. **错误恢复**：Token刷新失败时自动跳转登录页

## 配置说明

### Token过期时间配置
在 `web-server/utils/JWT.js` 中：
- Access Token: 15分钟
- Refresh Token: 7天

### 前端配置
在 `src/api/config.ts` 中：
- 自动刷新Token
- 401错误处理
- 请求队列管理 