<template>
  <div class="sidebar-logo-container" :class="{ collapses: collapse }">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" :title="title" class="sidebar-logo-link" to="/">
        <img :src="getLogo()" alt="logo" />
        <span class="sidebar-title">{{ title }}</span>
      </router-link>
      <router-link v-else key="expand" :title="title" class="sidebar-logo-link" to="/">
        <img :src="getLogo()" alt="logo" />
        <span class="sidebar-title">{{ title }}</span>
      </router-link>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useGlobalConfig } from '@/config';
const { getConfig } = useGlobalConfig();

const title = computed(() => getConfig().Title);

defineProps({
  collapse: Boolean,
});

function getLogo() {
  return new URL('/logo.svg', import.meta.url).href;
}
</script>

<style lang="scss" scoped>
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 48px;
  overflow: hidden;
  background-color: var(--sidebarLogo);

  .sidebar-logo-link {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    height: 100%;
    padding-left: 10px;

    img {
      display: inline-block;
      height: 32px;
    }

    .sidebar-title {
      display: inline-block;
      height: 32px;
      margin: 2px 0 0 12px;
      overflow: hidden;
      font-size: 18px;
      font-weight: 600;
      line-height: 32px;
      color: var(--subMenuActiveText);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
