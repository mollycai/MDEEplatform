<template>
  <div
    class="px-3 mr-1 navbar-bg-hover"
    :title="isActive ? t('buttons.clickCollapse') : t('buttons.clickExpand')"
    @click="toggleClick"
  >
    <IconifyIconOffline
      :icon="isActive ? MenuFold : MenuUnfold"
      class="inline-block align-middle hover:text-primary dark:hover:!text-white"
    />
  </div>
</template>

<script lang="ts" setup>
import MenuFold from '@iconify-icons/ri/menu-fold-fill';
import MenuUnfold from '@iconify-icons/ri/menu-unfold-fill';

import { useI18n } from 'vue-i18n';

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
</script>
