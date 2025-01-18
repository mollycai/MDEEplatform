<template>
  <div ref="appWrapperRef" :class="['app-wrapper', classes]">
    <!-- 主题布局 -->
    <component :is="currentLayout" />
    <!-- 系统设置 -->
    <lay-setting />
    <!-- 返回顶部 -->
    <el-backtop title="回到顶部" target=".main-container .el-scrollbar__wrap">
      <BackTopIcon />
    </el-backtop>
  </div>
</template>

<script lang="ts" setup>
import BackTopIcon from '@/assets/svg/back_top.svg?component';
import switchLayoutList from '@/layout/switch/index';
import laySetting from './components/lay-setting/index.vue';

import { useGlobalConfig } from '@/config';
import { useAppStoreHook } from '@/store/modules/app';
import { throttleFunction } from '@/utils/utils';
import { useResizeObserver } from '@vueuse/core';
import { cloneDeep } from 'lodash-es';
import { computed, ref } from 'vue';
import { deviceType } from './hooks/useDevice';
import { useNav } from './hooks/useNav';

const { getConfig, setConfig } = useGlobalConfig();

const layoutList = cloneDeep(switchLayoutList);
const layout = computed(() => getConfig().Layout ?? 'vertical');
const currentLayout = computed(() => layoutList.find((item) => item.name === layout.value));

const { device, molyApp } = useNav();
const classes = computed(() => {
  return {
    hideSidebar: !molyApp.getSidebarStatus,
    openSidebar: molyApp.getSidebarStatus,
    mobile: device.value === 'mobile',
  };
});

const appWrapperRef = ref();

function toggle(device: deviceType, bool: boolean) {
  useAppStoreHook().toggleDevice(device);
  useAppStoreHook().toggleSideBar(bool, 'resize');
}
// 响应式布局
useResizeObserver(
  appWrapperRef,
  throttleFunction((entries) => {
    const entry = entries[0];
    const { width, height } = entry.contentRect;
    useAppStoreHook().setViewportSize({ width, height });
    /** width app-wrapper类容器宽度
     * 0 < width <= 760 隐藏侧边栏
     * 760 < width <= 990 折叠侧边栏
     * width > 990 展开侧边栏
     */
    if (width > 0 && width <= 760) {
      toggle('mobile', false);
      // 当布局为垂直布局时，自动切换为水平布局，（但暂时不考虑宽度复原时，自动切换回垂直布局）
      if (layout.value === 'horizontal') {
        setConfig({ Layout: 'vertical' });
        // @TODO 暂时没有更好的方案，只能代码控制刷新
        window.location.reload();
      }
    } else if (width > 760 && width <= 990) {
      toggle('desktop', false);
    } else if (width > 990 && !useAppStoreHook().getSidebarIsClickCollapse) {
      toggle('desktop', true);
    } else {
      toggle('desktop', false);
    }
  }),
);
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  width: 100%;
  height: 100%;

  &::after {
    display: table;
    clear: both;
    content: '';
  }

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}
</style>
