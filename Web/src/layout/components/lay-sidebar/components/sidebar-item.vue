<template>
  <sidebar-link-item
    v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren)"
    :to="item"
  >
    <el-menu-item :index="onlyOneChild.path" :class="{ 'submenu-title-noDropdown': !isNest }" v-bind="attrs">
      <div v-if="toRaw(item.meta.icon)" class="sub-menu-icon" :style="getSubMenuIconStyle">
        <!-- @TODO 可以思考下渲染icon的策略，封装一个hook可以渲染多种格式的icon -->
        <IconifyIconOnline :icon="item.meta && toRaw(item.meta.icon)" />
      </div>
      <!-- 没加此判断，light主题选中菜单的字体颜色一直不是白色 -->
      <el-text truncated :class="['!w-full', theme !== 'light' ? '!text-inherit' : '']">
        {{ item.meta.title }}
      </el-text>
    </el-menu-item>
  </sidebar-link-item>
  <el-sub-menu v-else ref="subMenu" teleported :index="item.path">
    <template #title>
      <div v-if="toRaw(item.meta.icon)" class="sub-menu-icon">
        <IconifyIconOnline :icon="item.meta && toRaw(item.meta.icon)" />
      </div>
      <el-text truncated :class="['!w-full', theme !== 'light' ? '!text-inherit' : '']">
        {{ item.meta.title }}
      </el-text>
    </template>
    <sidebar-item
      v-for="child in item.children"
      :key="child.path"
      :item="child"
      :base-path="child.path"
      :is-nest="true"
      class="nest-menu"
    />
  </el-sub-menu>
</template>

<script lang="ts" setup>
import sidebarLinkItem from './sidebar-link-item.vue';

import { PropType, ref, useAttrs, computed, CSSProperties } from 'vue';
import { menuType } from '@/layout/types';
import { toRaw } from 'vue';
import { useGlobalConfig } from '@/config';
import { useNav } from '@/layout/hooks/useNav';

const attrs = useAttrs();

const { getConfig } = useGlobalConfig();
const { isCollapse } = useNav();
const currentLayout = computed(() => getConfig().Layout);
const theme = computed(() => getConfig().Theme);

defineProps({
  item: {
    type: Object as PropType<menuType>,
  },
  isNest: {
    type: Boolean,
    default: false,
  },
  basePath: {
    type: String,
    default: '',
  },
});

// 提取叶子菜单
const onlyOneChild: menuType = ref(null);

// @TODO 不是很理解这段代码
function hasOneShowingChild(children: menuType[] = [], parent: menuType) {
  // if (!children) {
  //   return true;
  // }
  // 取出当前的菜单项
  const showingChildren = children.filter((item: any) => {
    onlyOneChild.value = item;
    return true;
  });
  // 判断是否展示父级节点
  if (showingChildren[0]?.meta?.showParent) {
    return false;
  }
  if (showingChildren.length === 1) {
    return true;
  }
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, noShowingChildren: true };
    return true;
  }
  return false;
}

const getSubMenuIconStyle = computed((): CSSProperties => {
  return {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: currentLayout.value === 'horizontal' ? '0 5px 0 0' : isCollapse.value ? '0 auto' : '0 5px 0 0',
  };
});
</script>

<style lang="scss" scoped>
.sub-menu-icon {
  margin-right: 5px;
  font-size: 18px;

  svg {
    width: 18px;
    height: 18px;
  }
}
</style>
