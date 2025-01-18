/** @TODO 获取平台的配置，目前先选几个实现，此处的配置仍然存在问题，需要设计更好的响应式localStorage */
import axios from 'axios';
import { createGlobalState, useStorage } from '@vueuse/core';
import { isEmpty } from 'lodash-es';
import { localCache } from '@/utils/cache';
import { nameSpace } from './constants';

const { VITE_PUBLIC_PATH } = import.meta.env;

/** 获取项目动态全局配置 */
export const getPlatformConfig = async (): Promise<any> => {
  return axios({
    method: 'get',
    url: `${VITE_PUBLIC_PATH}platform-config.json`,
  })
    .then(({ data: config }) => {
      // 不采用挂载在app.config.globalProperties上这种方法，因为在ts文件中无法获取
      // 所以采用vueuse的createGlobalState创建全局变量
      return config;
    })
    .catch(() => {
      throw '请在public文件夹下添加platform-config.json配置文件';
    });
};

/** 操作全局配置的方法 */
export const useGlobalConfig = createGlobalState(() => {
  // 放在createGlobalState下的全局变量
  const globalConfig = useStorage<PlatformConfigs>(nameSpace, {});

  /** 初始化全局配置 */
  const initConfig = (storageNameSpace: string, config: PlatformConfigs) => {
    // 先判断localStorage是否有配置，没有再使用原始的配置
    // 注意配置的缓存没有expiretime，采用原生的操作方式
    const $config = localCache.get(storageNameSpace);
    if (isEmpty($config)) {
      localCache.set(storageNameSpace, config);
    } else {
      localCache.set(storageNameSpace, $config);
    }
  };

  const getConfig = (key?: string): PlatformConfigs => {
    // @TODO key判断机制
    return !isEmpty(globalConfig.value) ? globalConfig.value : localCache.get(nameSpace);
  };

  const setConfig = (cfg?: object) => {
    globalConfig.value = { ...getConfig(), ...cfg };
  };

  return {
    getConfig,
    setConfig,
    initConfig,
  };
});
