<template>
  <span class="fullscreen-icon navbar-bg-hover" @click="toggle">
    <IconifyIconOffline :icon="screenIcon" />
  </span>
</template>

<script lang="ts" setup>
import ExitFullscreen from '@iconify-icons/ri/fullscreen-exit-fill';
import Fullscreen from '@iconify-icons/ri/fullscreen-fill';

import { watch, ref } from 'vue';
import { useFullscreen } from '@vueuse/core';

const { isFullscreen, toggle } = useFullscreen();
const screenIcon = ref();

watch(
  isFullscreen,
  (full) => {
    screenIcon.value = full ? ExitFullscreen : Fullscreen;
  },
  {
    immediate: true,
  },
);
</script>
