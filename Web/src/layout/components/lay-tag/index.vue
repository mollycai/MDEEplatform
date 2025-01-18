<template>
  <div class="header-tags">
    <el-tag
      class="mr-1"
      v-for="tag in multiTags"
      :key="tag.meta.title"
      :closable="tag.path !== '/welcome'"
      :effect="tagIsActive(tag) ? 'dark' : 'plain'"
      @click="onTagsClick(tag)"
      @close="onTagsClose(tag)"
    >
      {{ tag.meta.title }}
    </el-tag>
  </div>
</template>
<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import { useMultiTagsStoreHook } from '@/store/modules/multiTag';
import { emitter } from '@/utils/mitt';
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { usePermissionStoreHook } from '@/store/modules/permission';

const route = useRoute();
const router = useRouter();

const multiTags: any = computed(() => {
  return useMultiTagsStoreHook().multiTags;
});

const tagIsActive = computed(() => {
  return (item) => {
    // @TODO 判断route带query或param的情况
    return route.path === item.path ? 'active' : '';
  };
});

/** 触发tags标签切换 */
function onTagsClick(item) {
  const { name, path } = item;
  if (name) {
    // @TODO 加个关于带query和param的判断 （目前不考虑带query和param的url）
    router.push({ name });
  } else {
    router.push({ path });
  }
}

/** 删除tags标签 */
function onTagsClose(item) {
  deleteDynamicTag(item, item.path);
}

/** 右键点击标签展示菜单 */
function onOpenMenu() {}

/** 刷新事件 */
function onRefresh() {}

/** 鼠标进入 */
function onMouseenter() {}

/** 鼠标离开 */
function onMouseleave() {}

/** 删除标签 */
function deleteDynamicTag(obj: any, current: any) {
  const valueIndex: number = multiTags.value.findIndex((item: any) => {
    // @TODO 当route带有query或param的情况
    return item.path === obj.path;
  });
  // @TODO 暂时不考虑关闭所有标签的情况
  function spliceRoute(startIndex?: number, length?: number) {
    useMultiTagsStoreHook().handleTags('splice', '', {
      startIndex,
      length,
    }) as any;
  }
  // 从当前匹配到的路径中删除
  spliceRoute(valueIndex, 1);
  const newRoute = useMultiTagsStoreHook().handleTags('slice');
  // 如果删除当前激活tag就自动切换到最后一个tag
  if (current === route.path) {
    // @TODO 当route带有query或param的情况
    router.push({ path: newRoute[0].path });
  }
}

/** 激活标签 */
function dynamicRouteTag(value: string): void {
  const hasValue = multiTags.value.some((item) => {
    return item.path === value;
  });
  function concatPath(arr: object[], value: string) {
    if (!hasValue) {
      arr.forEach((item: any) => {
        if (item.path === value) {
          useMultiTagsStoreHook().handleTags('push', {
            path: value,
            meta: item.meta,
            name: item.name,
          });
        } else {
          if (item.children && item.children.length > 0) {
            concatPath(item.children, value);
          }
        }
      });
    }
  }
  concatPath(usePermissionStoreHook().wholeMenus as any, value);
}

/** 右键标签页展示菜单 */
function showMenuModel(currentPath: string, query: object = {}, refresh = false) {}

onMounted(() => {
  //  接收侧边栏切换传递过来的参数
  emitter.on('changLayoutRoute', (indexPath) => {
    dynamicRouteTag(indexPath);
    setTimeout(() => {
      showMenuModel(indexPath);
    });
  });
  // 刷新时再激活当前的路由
  dynamicRouteTag(route.path);
});

onBeforeUnmount(() => {
  // 解绑公共事件
  emitter.off('changLayoutRoute');
});
</script>

<style lang="scss" scoped>
.header-tags {
  height: 32px;
  border-bottom: var(--moly-border-color) 1px solid;
  padding: 3px 6px;
  cursor: pointer;
  background-color: #fff;
}
</style>
