<template>
  <div v-loading="loading" :class="['sidebar-container', showLogo ? 'has-logo' : 'no-logo']">
    <lay-sidebar-logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar
      :class="[device === 'mobile' ? 'mobile' : 'pc']"
      wrap-class="scrollbar-wrapper"
      class="sidebar-scrollbar"
    >
      <el-menu
        unique-opened
        mode="vertical"
        class="outer-most select-none"
        :collapse="!isCollapse"
        :collapse-transition="false"
        :default-active="activeIndex"
      >
        <lay-sidebar-item
          class="outer-most select-none"
          v-for="routes in menuData"
          :key="routes.path"
          :item="routes"
          :base-path="routes.path"
        />
      </el-menu>
    </el-scrollbar>
    <sidebar-collapse-left
      v-if="device !== 'mobile'"
      :is-active="molyApp.sidebar.opened"
      @toggleClick="toggleSideBar"
    />
  </div>
</template>

<script lang="ts" setup>
import { usePermissionStoreHook } from '@/store/modules/permission';
import { useAppStoreHook } from '@/store/modules/app';
import { useGlobalConfig } from '@/config';

import LaySidebarLogo from './components/sidebar-logo.vue';
import LaySidebarItem from './components/sidebar-item.vue';
import sidebarCollapseLeft from './components/sidebar-collapse-left.vue';

import { computed, ref, onMounted, watch } from 'vue';
import { isEmpty } from 'lodash-es';
import { useRoute } from 'vue-router';
import { useNav } from '@/layout/hooks/useNav';

const molyApp = useAppStoreHook();
const { getConfig } = useGlobalConfig();
const { device } = useNav();

const menuData = computed(() => usePermissionStoreHook().wholeMenus);
const loading = computed(() => (menuData.value.length === 0 ? true : false));
const isCollapse = computed(() => molyApp.getSidebarStatus);
const showLogo = computed(() => getConfig().ShowLogo);

function toggleSideBar() {
  molyApp.toggleSideBar();
}

const route = useRoute();
const activeIndex = ref<string>('/');

onMounted(() => {
  activeIndex.value = !isEmpty(route.meta?.activePath) ? route.meta.activePath : route.path;
});

watch(
  () => route.path,
  () => {
    activeIndex.value = route.path;
  },
);
</script>

<style lang="scss" scoped>
.sidebar-scrollbar {
  height: calc(100% - 92px);
}
</style>
