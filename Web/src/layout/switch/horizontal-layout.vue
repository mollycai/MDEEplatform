<template>
  <el-container class="h-screen main-container">
    <el-header :style="[hideTabs ? 'height: 48px' : 'height: 80px', 'padding: 0px']">
      <!-- 头部导航栏与菜单 -->
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
import layNavbar from '../components/lay-sidebar/nav-horizontal.vue';
import layTags from '../components/lay-tag/index.vue';

import { useGlobalConfig } from '@/config';
import { computed } from 'vue';

export default {
  name: 'horizontal',
  title: '水平布局',
  components: {
    layContent,
    layNavbar,
    layTags,
  },
  setup() {
    const { getConfig } = useGlobalConfig();
    const hideTabs = computed(() => getConfig().HideTabs);
    return {
      hideTabs,
    };
  },
};
</script>
