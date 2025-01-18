import { getLogin, refreshTokenApi } from '@/api/main';
import { Result } from '@/api/type';
import { CodeEnum } from '@/enums/httpEnums';
import { routerArrays } from '@/layout/types';
import { router } from '@/router';
import { DataInfo, removeToken, setToken, userKey } from '@/utils/auth';
import { localCache } from '@/utils/cache';
import { defineStore } from 'pinia';
import { store } from '..';
import { userType } from '../types';
import { useMultiTagsStoreHook } from './multiTag';

export const useUserStore = defineStore({
  id: 'user',
  state: (): userType => ({
    // 头像
    avatar: localCache.get<DataInfo<number>>(userKey)?.avatar ?? '',
    // 用户名
    username: localCache.get<DataInfo<number>>(userKey)?.username ?? '',
    // 昵称
    nickname: localCache.get<DataInfo<number>>(userKey)?.nickname ?? '',
    // 页面级别权限
    roles: localCache.get<DataInfo<number>>(userKey)?.roles ?? [],
    // 按钮级别权限
    permissions: localCache.get<DataInfo<number>>(userKey)?.permissions ?? [],
    // 是否勾选了登录页的免登录
    isRemembered: false,
    // 登录页的免登录存储几天，默认7天
    loginDay: 7,
  }),
  actions: {
    /** 存储头像 */
    SET_AVATAR(avatar: string) {
      this.avatar = avatar;
    },
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储昵称 */
    SET_NICKNAME(nickname: string) {
      this.nickname = nickname;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 存储按钮级别权限 */
    SET_PERMS(permissions: Array<string>) {
      this.permissions = permissions;
    },
    /** 存储是否勾选了登录页的免登录 */
    SET_ISREMEMBERED(bool: boolean) {
      this.isRemembered = bool;
    },
    /** 设置登录页的免登录存储几天 */
    SET_LOGINDAY(value: number) {
      this.loginDay = Number(value);
    },
    /** 登录 */
    async loginByUsername(data) {
      return new Promise<Result>((resolve, reject) => {
        getLogin(data)
          .then((data) => {
            if (data?.code == CodeEnum.SUCCESS) setToken(data.data);
            resolve(data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    /** 退出登录 */
    logOut() {
      this.username = '';
      this.roles = [];
      this.permissions = [];
      removeToken();
      useMultiTagsStoreHook().handleTags('equal', [...routerArrays]);
      // @TODO 待考虑不加resetRouter的影响
      // resetRouter();
      router.push('/login');
    },
    /** 刷新`token` */
    async handRefreshToken(data) {
      return new Promise<Result>((resolve, reject) => {
        refreshTokenApi(data)
          .then((data) => {
            if (data) {
              setToken(data.data);
              resolve(data);
            }
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },
});

export function useUserStoreHook() {
  return useUserStore(store);
}
