<template>
  <component :is="isExtraLink ? 'a' : 'router-link'" v-bind="getLinkProps(to)"><slot /></component>
</template>

<script lang="ts" setup>
import { menuType } from '@/layout/types';
import { isURL } from '@/utils/utils';
import { computed } from 'vue';

const props = defineProps<{ to: menuType }>();

// 判断是否是外链
const isExtraLink = computed(() => isURL(props.to.name));
const getLinkProps = (item: menuType) => {
  if (isExtraLink.value) {
    return {
      href: item.name,
      target: '_blank',
    };
  }
  return {
    to: item,
  };
};
</script>
