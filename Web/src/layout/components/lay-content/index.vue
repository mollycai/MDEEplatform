<template>
  <router-view>
    <template #default="{ Component, route }">
      <!-- @TODO 此处待考虑套多一层iframe，专用于外链页面 -->
      <el-scrollbar
        :wrap-style="{
          display: 'flex',
          'flex-wrap': 'wrap',
          'max-width': '100%',
          margin: '0 auto',
        }"
        :view-style="{
          display: 'flex',
          flex: 'auto',
          overflow: 'hidden',
          'flex-direction': 'column',
        }"
      >
        <Transition name="slide-fade">
          <div class="iframe">
            <component :is="Component" :key="route" />
          </div>
        </Transition>
        <lay-footer v-if="!hideFooter" />
      </el-scrollbar>
    </template>
  </router-view>
</template>

<script lang="ts" setup>
import layFooter from '@/layout/components/lay-footer/index.vue';
import router from '@/router';
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useGlobalConfig } from '@/config';
import { useNav } from '@/layout/hooks/useNav';
import { usePermissionStoreHook } from '@/store/modules/permission';

const currentRoute = useRoute();
const { getConfig } = useGlobalConfig();
const { menuSelect } = useNav();

const hideFooter = computed(() => getConfig().HideFooter);

// 注意不要在递归的sidebar-item里面监听路由变化
watch(
  () => [currentRoute.fullPath, usePermissionStoreHook().wholeMenus],
  () => {
    if (currentRoute.path.includes('/redirect')) return;
    router.push(currentRoute.path);
    menuSelect(currentRoute.path);
  },
);
</script>

<style lang="scss" scoped>
.el-scrollbar,
.el-scrollbar .el-scrollbar__view {
  height: 100%;
}
.iframe {
  flex-grow: 1;
  padding: 20px;
}
</style>
