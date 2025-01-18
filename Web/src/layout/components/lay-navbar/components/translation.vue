<template>
  <el-dropdown trigger="hover">
    <div class="translation w-[40px] h-[48px] flex-c cursor-pointer navbar-bg-hover">
      <IconifyIconOffline :icon="Translation" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="translationEn">
          <el-text :class="[locale === 'en' ? 'item-active' : '']">English</el-text>
        </el-dropdown-item>
        <el-dropdown-item @click="translationCh">
          <el-text :class="[locale === 'zh' ? 'item-active' : '']">简体中文</el-text>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
import { useTranslationLang } from '@/layout/hooks/useTranslationLang';
import Translation from '@iconify-icons/ri/translate';

const { translationCh, translationEn, locale } = useTranslationLang();
</script>

<style lang="scss" scoped>
.item-active {
  color: var(--el-color-primary);
  font-weight: 700;
}
</style>
