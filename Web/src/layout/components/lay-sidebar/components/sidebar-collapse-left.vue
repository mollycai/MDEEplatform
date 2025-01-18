<template>
  <div class="left-collapse">
    <IconifyIconOffline
      :title="isActive ? t('buttons.clickCollapse') : t('buttons.clickExpand')"
      :icon="isActive ? MenuFold : MenuUnfold"
      :class="[iconClass, themeColor === 'light' ? '' : 'text-primary']"
      @click="toggleClick"
    />
  </div>
</template>

<script lang="ts" setup>
import MenuFold from '@iconify-icons/ri/menu-fold-fill';
import MenuUnfold from '@iconify-icons/ri/menu-unfold-fill';

import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { useGlobalConfig } from '@/config';

const { t } = useI18n();

interface Props {
  isActive: boolean;
}
withDefaults(defineProps<Props>(), {
  isActive: false,
});

const emit = defineEmits<{
  (e: 'toggleClick'): void;
}>();

const toggleClick = function () {
  emit('toggleClick');
};

const iconClass = computed(() => {
  return ['ml-4', 'mb-1', 'w-[16px]', 'h-[16px]', 'inline-block', 'align-middle', 'cursor-pointer', 'duration-[100ms]'];
});

const { getConfig } = useGlobalConfig();

const themeColor = computed(() => getConfig().EpThemeColor);
</script>

<style lang="scss" scoped>
.left-collapse {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 40px;
  line-height: 40px;
  box-shadow: 0 0 6px -3px var(--el-color-primary);
}
</style>
