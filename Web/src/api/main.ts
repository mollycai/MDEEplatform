import { http } from '@/utils/http';
import { Result } from './type';

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<Result>('post', '/api/login', { data });
};

/** 获取验证码 */
export const getCaptchaIamge = () => {
  return http.request('get', '/api/captchaIamge');
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<Result>('post', '/api/refresh-token', { data });
};

/** 获取路由 */
export const getAsyncRoutes = (userId: number) => {
  return http.request<Result>('get', '/api/route', {
    params: {
      userId,
    },
  });
};
