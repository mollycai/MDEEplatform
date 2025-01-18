/** 操作主题的Hook */
import { getPlatformConfig, useGlobalConfig } from '@/config';
import { nameSpace } from '@/config/constants';
import { router } from '@/router';
import { useMultiTagsStoreHook } from '@/store/modules/multiTag';
import { removeToken } from '@/utils/auth';
import { localCache } from '@/utils/cache';
import { darken, lighten } from '@/utils/color';
import { computed, ref } from 'vue';
import { setThemeVariables } from '../theme';
import { routerArrays, themeColorsType } from '../types';

export function useThemeChange() {
  const { setConfig, getConfig } = useGlobalConfig();

  // 颜色表
  const themeColors = ref<Array<themeColorsType>>([
    /* 亮白色 */
    { color: '#ffffff', themeColor: 'light' },
    /* 道奇蓝 */
    { color: '#1b2a47', themeColor: 'default' },
    /* 深紫罗兰色 */
    { color: '#722ed1', themeColor: 'saucePurple' },
    /* 深粉色 */
    { color: '#eb2f96', themeColor: 'darkPink' },
    /* 猩红色 */
    { color: '#f5222d', themeColor: 'dusk' },
    /* 橙红色 */
    { color: '#fa541c', themeColor: 'volcano' },
    /* 绿宝石 */
    { color: '#13c2c2', themeColor: 'mingQing' },
    /* 酸橙绿 */
    { color: '#52c41a', themeColor: 'auroraGreen' },
  ]);

  /** 给DOM添加类的方法 */
  const toggleClass = (flag: boolean, clsName: string, target?: HTMLElement) => {
    const targetEl = target || document.body;
    let { className } = targetEl;
    className = className.replace(clsName, '').trim();
    targetEl.className = flag ? `${className} ${clsName}` : className;
  };

  // 是否开启暗黑模式
  const isDark = computed(() => getConfig().DarkMode);

  const setPropertyPrimary = (mode: string, i: number, color: string) => {
    document.documentElement.style.setProperty(
      `--el-color-primary-${mode}-${i}`,
      isDark.value ? darken(color, i / 10) : lighten(color, i / 10),
    );
  };

  /** 设置布局主题颜色 */
  const setLayoutThemeColor = (theme = getConfig().Theme ?? 'default', isClick = true) => {
    setConfig({ Theme: isClick ? theme : getConfig().Theme });
    setThemeVariables(theme);
    if (theme === 'default' || theme === 'light') {
      setEpThemeColor('#409EFF');
    } else {
      const colors = themeColors.value.find((item) => item.themeColor === theme);
      setEpThemeColor(colors.color);
    }
  };

  /** 设置 `element-plus` 主题色，包括刷新时进行再次调用 */
  const setEpThemeColor = (color: string, isFresh = false) => {
    !isFresh && setConfig({ EpThemeColor: color });
    document.documentElement.style.setProperty('--el-color-primary', color);
    for (let i = 1; i <= 2; i++) {
      setPropertyPrimary('dark', i, color);
    }
    for (let i = 1; i <= 9; i++) {
      setPropertyPrimary('light', i, color);
    }
  };

  /** 切换日间或夜间模式 */
  const setModeColor = () => {
    const theme = getConfig().Theme;
    // theme === 'light' && isDark.value ? setLayoutThemeColor('default') : setLayoutThemeColor(theme, false);
    theme === 'light' && isDark.value && setLayoutThemeColor('default');
    // @TODO 此处可以优化，如果当前的主题是light，切换为夜间模式时，将主题换为default，当切换回为日间模式时，再将主题切换为light
    // if (... === 'light') {
    //   setLayoutThemeColor('light', false);
    // }
    toggleClass(isDark.value, 'dark', document.querySelector('html'));
    // 最后在更新一下element-plus的颜色
    // setEpThemeColor(getConfig().EpThemeColor, false);
  };

  const resetLoading = ref<boolean>(false);

  /** 清空缓存并返回登录页 */
  const onReset = () => {
    // clear不能清除vususe的响应式storage，暂时采用重新请求配置并覆盖这种方案
    resetLoading.value = true;
    getPlatformConfig()
      .then((config) => {
        removeToken();
        localCache.clear();
        useGlobalConfig().setConfig(config);
        localCache.remove(nameSpace);
        router.push('/login');
        useMultiTagsStoreHook().handleTags('equal', [...routerArrays]);
        // @TODO 待考虑不加resetRouter的影响
        // resetRouter();
      })
      .finally(() => {
        resetLoading.value = false;
      });
  };

  return {
    isDark,
    themeColors,
    resetLoading,
    toggleClass,
    setLayoutThemeColor,
    setEpThemeColor,
    setModeColor,
    onReset,
  };
}
