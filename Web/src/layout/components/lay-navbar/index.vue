<template>
  <div class="navbar bg-[#fff]">
    <!-- 顶部折叠 -->
    <sidebar-collapse-top
      v-if="device === 'mobile'"
      class="top-collapse-container"
      :is-active="molyApp.sidebar.opened"
      @toggleClick="toggleSideBar"
    />
    <!-- 面包屑 -->
    <breadCrumb v-if="device !== 'mobile'" class="breadcrumb-container" />
    <div class="vertical-header-right">
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
import sidebarCollapseTop from '../lay-sidebar/components/sidebar-collapse-top.vue';
import breadCrumb from './components/bread-crumb.vue';
import search from '../lay-search/index.vue';
import notice from '../lay-notice/index.vue';
import fullScreen from './components/full-screen.vue';
import translation from './components/translation.vue';

import Setting from '@iconify-icons/ri/settings-3-line';
import LogoutCircleRLine from '@iconify-icons/ri/logout-circle-r-line';

import { useTranslationLang } from '@/layout/hooks/useTranslationLang';
import { useNav } from '@/layout/hooks/useNav';

const { t } = useTranslationLang();
const { molyApp, username, userAvatar, avatarsStyle, device, toggleSideBar, logout, onPanel } = useNav();
</script>

<style lang="scss">
.navbar {
  width: 100%;
  height: 48px;
  overflow: hidden;
  border-bottom: var(--moly-border-color) 1px solid;

  .top-collapse-container {
    float: left;
    height: 100%;
    line-height: 48px;
    cursor: pointer;
  }

  .vertical-header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 280px;
    height: 48px;
    color: #000000d9;

    .el-dropdown-link {
      display: flex;
      align-items: center;
      justify-content: space-around;
      height: 48px;
      padding: 10px;
      color: #000000d9;
      cursor: pointer;

      p {
        font-size: 14px;
      }

      img {
        width: 22px;
        height: 22px;
        border-radius: 50%;
      }
    }
  }

  .breadcrumb-container {
    float: left;
    margin-left: 16px;
  }
}

.logout {
  width: 120px;

  ::v-deep(.el-dropdown-menu__item) {
    display: inline-flex;
    flex-wrap: wrap;
    min-width: 100%;
  }
}
</style>
