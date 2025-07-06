// Token管理工具类
export class TokenManager {
  private static readonly TOKEN_KEY = 'token';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly USER_INFO_KEY = 'userInfo';

  // 获取访问令牌
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // 获取刷新令牌
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // 获取用户信息
  static getUserInfo(): any {
    const userInfo = localStorage.getItem(this.USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // 设置令牌
  static setTokens(token: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  // 设置用户信息
  static setUserInfo(userInfo: any): void {
    localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
  }

  // 清除所有认证信息
  static clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_INFO_KEY);
  }

  // 检查是否已登录
  static isLoggedIn(): boolean {
    // 只要有refreshToken就认为可以登录（可以自动刷新access token）
    return !!this.getRefreshToken();
  }

  // 检查token是否即将过期（提前5分钟刷新）
  static isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // 转换为毫秒
      const currentTime = Date.now();
      const fiveMinutes = 5 * 60 * 1000; // 5分钟

      return (expirationTime - currentTime) < fiveMinutes;
    } catch (error) {
      return false;
    }
  }
} 