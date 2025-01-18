<template>
  <div>
    <div class="search-container w-[40px] h-[48px] flex-c cursor-pointer navbar-bg-hover" @click="handleSearch">
      <IconifyIconOffline :icon="SearchLine" />
    </div>
    <!-- @TODO 搜索框 -->
  </div>
</template>

<script setup lang="ts">
import SearchLine from '@iconify-icons/ri/search-line'
function handleSearch() {
  //@TODO
}
</script>
