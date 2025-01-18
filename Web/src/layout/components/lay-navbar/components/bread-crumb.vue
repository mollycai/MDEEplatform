<template>
  <el-breadcrumb class="!leading-[50px] select-none !font-medium" separator="/">
    <template v-for="item in breadcrumb" :key="item.path">
      <el-breadcrumb-item :to="item.path">
        {{ item.meta.title }}
      </el-breadcrumb-item>
    </template>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { findRouteByPath, getParentPaths } from '@/router/utils';
import { onMounted, ref, watch } from 'vue';
import { usePermissionStoreHook } from '@/store/modules/permission';

const breadcrumb = ref([]);
const route = useRoute();
const router = useRouter();
const routes = usePermissionStoreHook().wholeMenus;

const getBreadcrumb = (): void => {
  // @TODO 添加判断带query和params参数的路由
  // 通过路径查找当前路由信息
  let currentRoute = findRouteByPath(router.currentRoute.value.path, routes);
  // 存放组成面包屑的数组
  const matched = [];
  // 当前路径的父级路径组成的数组
  const parentRoutes = getParentPaths(router.currentRoute.value.path, routes);
  parentRoutes.forEach((path) => {
    if (path !== '/') {
      matched.push(findRouteByPath(path, routes));
    }
  });
  matched.push(currentRoute);
  breadcrumb.value = matched.filter((item) => item?.meta && item?.meta.title !== false);
};

onMounted(() => {
  getBreadcrumb();
});

watch(
  () => route.path,
  () => {
    getBreadcrumb();
  },
  {
    deep: true,
  },
);
</script>
