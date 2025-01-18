import { remainingPaths } from '@/router';
import { useAppStoreHook } from '@/store/modules/app';
import { usePermissionStoreHook } from '@/store/modules/permission';
import { useUserStoreHook } from '@/store/modules/user';
import { emitter } from '@/utils/mitt';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useGlobalConfig } from '@/config';
import { localCache } from '@/utils/cache';
import { userKey } from '@/utils/auth';

// @TODO 封装所有与导航相关的hook
export function useNav() {
  const molyApp = useAppStoreHook();
  const { getConfig } = useGlobalConfig();

  // 完整菜单
  const { wholeMenus } = storeToRefs(usePermissionStoreHook());
  // 用户名
  const user = localCache.get<any>(userKey);
  const username = ref(user ? user.username : '');
  // 用户头像
  const userAvatar = ref('https://avatars.githubusercontent.com/u/99068236?v=4');
  // 头像样式
  const avatarsStyle = computed(() => {
    return username.value ? { marginRight: '10px' } : '';
  });
  // 设备
  const device = computed(() => {
    return molyApp.getDevice;
  });
  // 标题
  const title = computed(() => {
    return getConfig().Title;
  });

  /** 设置国际化选中后的样式 */
  const getDropdownItemStyle = computed(() => {
    return (locale, t) => {
      return {
        background: locale === t ? getConfig().EpThemeColor : '',
        color: locale === t ? '#f4f4f5' : '#000',
      };
    };
  });

  const getDropdownItemClass = computed(() => {
    return (locale, t) => {
      return locale === t ? '' : 'dark:hover:!text-primary';
    };
  });

  /** 菜单点击事件 */
  function menuSelect(indexPath: string) {
    if (wholeMenus.value.length === 0 || isRemaining(indexPath)) return;
    emitter.emit('changLayoutRoute', indexPath);
  }

  /** 判断路径是否参与菜单 */
  function isRemaining(path: string) {
    return remainingPaths.includes(path);
  }

  /** 触发侧边栏是否显示 */
  function toggleSideBar() {
    molyApp.toggleSideBar();
  }

  const isCollapse = computed(() => {
    return !molyApp.getSidebarStatus;
  });

  /** 退出登录 */
  function logout() {
    useUserStoreHook().logOut();
  }

  /** 设置面板事件 */
  function onPanel() {
    emitter.emit('openPanel');
  }

  return {
    molyApp,
    username,
    userAvatar,
    avatarsStyle,
    device,
    title,
    getDropdownItemStyle,
    getDropdownItemClass,
    isCollapse,
    toggleSideBar,
    menuSelect,
    logout,
    onPanel,
  };
}
