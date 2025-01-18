<template>
  <div class="horizontal-header">
    <div v-if="showLogo" class="horizontal-header-left">
      <img :src="getLogo()" alt="logo" />
      <span>{{ title }}</span>
    </div>
    <el-menu ref="menuRef" mode="horizontal" class="horizontal-header-menu" :default-active="activeIndex">
      <LaySidebarItem v-for="route in menuData" :key="route.path" :item="route" :base-path="route.path" />
    </el-menu>
    <div class="horizontal-header-right">
      <!-- 搜索 -->
      <search id="search" />
      <!-- 国际化 -->
      <translation id="translation"></translation>
      <!-- 全屏 -->
      <fullScreen id="full-screen" />
      <!-- 消息通知 -->
      <notice id="notice"></notice>
      <!-- admin -->
      <el-dropdown trigger="click">
        <span class="el-dropdown-link navbar-bg-hover">
          <img :src="userAvatar" :style="avatarsStyle" />
          <p v-if="username" class="dark:text-white">{{ username }}</p>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="logout">
            <el-dropdown-item @click="logout">
              <IconifyIconOffline :icon="LogoutCircleRLine" style="margin: 5px" />
              {{ t('buttons.loginOut') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!-- 设置 -->
      <span class="set-icon navbar-bg-hover" title="打开系统配置" @click="onPanel">
        <IconifyIconOffline :icon="Setting" />
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import fullScreen from '../lay-navbar/components/full-screen.vue';
import translation from '../lay-navbar/components/translation.vue';
import notice from '../lay-notice/index.vue';
import search from '../lay-search/index.vue';
import LaySidebarItem from './components/sidebar-item.vue';

import { useGlobalConfig } from '@/config';
import { useNav } from '@/layout/hooks/useNav';
import { useTranslationLang } from '@/layout/hooks/useTranslationLang';
import { usePermissionStoreHook } from '@/store/modules/permission';
import { isEmpty } from 'lodash-es';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import LogoutCircleRLine from '@iconify-icons/ri/logout-circle-r-line';
import Setting from '@iconify-icons/ri/settings-3-line';

const { getConfig } = useGlobalConfig();

const showLogo = computed(() => getConfig().ShowLogo);
function getLogo() {
  return new URL('/logo.svg', import.meta.url).href;
}

const title = computed(() => getConfig().Title);
const menuData = computed(() => usePermissionStoreHook().wholeMenus);

const { t } = useTranslationLang();
const { username, userAvatar, avatarsStyle, logout, onPanel } = useNav();
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
