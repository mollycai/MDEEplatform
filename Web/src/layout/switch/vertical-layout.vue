<template>
  <div v-show="device === 'mobile' && isSidebarOpened" class="app-mask" @click="useAppStoreHook().toggleSideBar()" />
  <!-- 侧边菜单 -->
  <lay-sidebar />
  <el-container class="main-container">
    <el-header :style="[hideTabs ? 'height: 48px' : 'height: 80px', 'padding: 0px']">
      <!-- 头部导航栏 -->
      <lay-navbar />
      <!-- 页面标签 -->
      <lay-tags v-if="!hideTabs" />
    </el-header>
    <el-main class="app-main">
      <lay-content></lay-content>
    </el-main>
  </el-container>
</template>

<script lang="ts">
import layContent from '../components/lay-content/index.vue';
import layNavbar from '../components/lay-navbar/index.vue';
import laySidebar from '../components/lay-sidebar/nav-vertical.vue';
import layTags from '../components/lay-tag/index.vue';

import { computed } from 'vue';
import { useGlobalConfig } from '@/config';
import { useNav } from '../hooks/useNav';
import { useAppStoreHook } from '@/store/modules/app';

export default {
  name: 'vertical',
  title: '垂直布局',
  components: {
    layContent,
    layNavbar,
    laySidebar,
    layTags,
  },
  setup() {
    const { getConfig } = useGlobalConfig();
    const { device, molyApp } = useNav();

    const hideTabs = computed(() => getConfig().HideTabs);
    const isSidebarOpened = computed(() => molyApp.getSidebarStatus);

    return {
      device,
      hideTabs,
      isSidebarOpened,
      useAppStoreHook,
    };
  },
};
</script>

<style lang="scss" scoped>
.app-mask {
  position: absolute;
  top: 0;
  z-index: 2001;
  width: 100%;
  height: 100%;
  background: #000;
  opacity: 0.3;
}
</style>
