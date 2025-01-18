/**
 * 刷新执行的操作
 */
import { useThemeChange } from '@/layout/hooks/useThemeChange';
import { useGlobalConfig } from '@/config';
import { localCache } from '@/utils/cache';
import { nameSpace } from '@/config/constants';

export function useRefresh() {
  const { setLayoutThemeColor, setModeColor, toggleClass } = useThemeChange();
  const { getConfig } = useGlobalConfig();

  const currentConfig: PlatformConfigs = localCache.get(nameSpace) || getConfig();

  const refresh = () => {
    // 设置主题颜色
    setLayoutThemeColor(currentConfig.Theme, false);
    // 设置深浅模式
    setModeColor();
    // 设置布局
    window.document.body.setAttribute('layout', currentConfig.Layout);
    // 设置是灰色模式
    toggleClass(currentConfig.Grey, 'html-grey', document.querySelector('html'));
  };

  return {
    refresh,
  };
}
