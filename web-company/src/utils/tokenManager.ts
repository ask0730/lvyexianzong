// Token管理工具类
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly USER_INFO_KEY = 'userInfo';

  // 设置访问令牌
  static setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  // 获取访问令牌
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // 设置刷新令牌
  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  // 获取刷新令牌
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // 设置用户信息
  static setUserInfo(userInfo: any): void {
    localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
  }

  // 获取用户信息
  static getUserInfo(): any {
    const userInfo = localStorage.getItem(this.USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // 设置双token
  static setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  // 清除所有token和用户信息
  static clearAll(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_INFO_KEY);
  }

  // 检查是否有有效的访问令牌
  static hasValidAccessToken(): boolean {
    return !!this.getAccessToken();
  }

  // 检查是否有刷新令牌
  static hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }

  // 检查是否已登录
  static isLoggedIn(): boolean {
    return this.hasValidAccessToken() && this.hasRefreshToken();
  }
}

export default TokenManager; 