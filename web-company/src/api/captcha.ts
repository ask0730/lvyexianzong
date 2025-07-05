import { queryPOST } from './config';

// 生成验证码
export const generateCaptcha = (data: { width?: number; height?: number }) => {
  return queryPOST('/webapi/captcha/generate', data);
}

// 验证滑动验证码
export const verifyCaptcha = (data: { sessionId: string; sliderLeft: number }) => {
  return queryPOST('/webapi/captcha/verify', data);
}

// 检查验证码状态
export const checkCaptcha = (data: { sessionId: string }) => {
  return queryPOST('/webapi/captcha/check', data);
} 