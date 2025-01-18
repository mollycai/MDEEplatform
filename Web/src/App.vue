<template>
  <el-config-provider :locale="currentLocale">
    <router-view />
  </el-config-provider>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { ElConfigProvider } from 'element-plus';
import en from 'element-plus/es/locale/lang/en';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import { useGlobalConfig } from './config';

export default defineComponent({
  name: 'app',
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
  },
  computed: {
    currentLocale() {
      const { getConfig } = useGlobalConfig();
      return getConfig().Locale === 'zh' ? zhCn : en;
    },
  },
});
</script>
