import { localCache } from '@/utils/cache';
import { defineStore } from 'pinia';
import { useGlobalConfig } from '@/config';
import { usePermissionStoreHook } from './permission';
import { multiType, positionType } from '../types';
import { isURL } from '@/utils/utils';
import { isBoolean } from 'lodash-es';
import { store } from '..';

const { getConfig } = useGlobalConfig();
const tagNameSpace = 'responsive-tags';

export const useMultiTagsStore = defineStore({
  id: 'multiTags',
  state: () => ({
    multiTags: getConfig()?.MultiTagsCache
      ? localCache.get(tagNameSpace)
      : [
          {
            path: '/welcome',
            meta: {
              title: '首页',
              icon: 'ep:home-filled',
            },
          },
          ...usePermissionStoreHook().flatteningRoutes.filter((v) => v?.meta?.fixedTag),
        ],
    // 是否缓存标签页
    multiTagsCache: getConfig()?.MultiTagsCache,
  }),
  getters: {
    getMultiTagsCache(state) {
      return state.multiTagsCache;
    },
  },
  actions: {
    multiTagsCacheChange(multiTagsCache: boolean) {
      this.multiTagsCache = multiTagsCache;
      if (multiTagsCache) {
        localCache.set(tagNameSpace, this.multiTags);
      } else {
        localCache.remove(tagNameSpace);
      }
    },
    tagsCache(multiTags) {
      this.multiTagsCache && localCache.set(tagNameSpace, multiTags);
    },
    handleTags<T>(mode: string, value?: T | multiType, position?: positionType): T {
      switch (mode) {
        case 'equal':
          // 直接赋值全部去情况
          this.multiTags = value;
          this.tagsCache(this.multiTags);
          break;
        case 'push':
          const currTag = value as multiType;
          // 不添加到标签页
          if (currTag?.meta?.hiddenTag) return;
          // 外链连接无需添加信息到标签页
          if (isURL(currTag?.name)) return;
          // 如果title为空拒绝添加空信息到标签页
          if (currTag?.meta?.title?.length === 0) return;
          // showLink: false 不添加到标签页
          if (isBoolean(currTag?.meta?.showLink) && !currTag?.meta?.showLink) return;
          const tagPath = currTag.path;
          // 判断tag是否存在
          const tagHasExits = this.multiTags.some((tag: multiType) => tag.path === tagPath);
          // @TODO 判断tag中query和param的键值是否相等，目前还没碰到菜单跳转带路由参数的
          // @TODO 判断动态路由可打开的最大值
          this.multiTags.push(value);
          this.tagsCache(this.multiTags);
          break;
        case 'splice':
          if (!position) {
            const index = this.multiTags.findIndex((tag: multiType) => tag.path === value);
            if (index === -1) return;
            this.multiTags.splice(index, 1);
          } else {
            this.multiTags.splice(position?.startIndex, position?.length);
          }
          this.tagsCache(this.multiTags);
          return this.multiTags;
        case 'slice':
          return this.multiTags.slice(-1);
      }
    },
  },
});

export function useMultiTagsStoreHook() {
  return useMultiTagsStore(store);
}
