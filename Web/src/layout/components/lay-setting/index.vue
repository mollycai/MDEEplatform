<template>
  <LayPanel>
    <div class="p-5">
      <p :class="pClass">{{ t('panel.overallStyle') }}</p>
      <el-radio-group v-model="mode" aria-label="mode" @change="modeChange">
        <template v-for="option in modeOptions" :key="option.value">
          <el-radio-button :value="option.value">
            <div class="flex">
              <IconifyIconOffline :icon="option.icon" class="mr-1" />
              {{ option.content }}
            </div>
          </el-radio-button>
        </template>
      </el-radio-group>

      <p :class="['mt-8', pClass]">{{ t('panel.themeColor') }}</p>
      <ul class="theme-color">
        <li
          v-for="(item, index) in themeColors"
          v-show="showThemeColors(item.themeColor)"
          :key="index"
          :style="getThemeColorStyle(item.color)"
          @click="setLayoutThemeColor(item.themeColor as themeColorValue)"
        >
          <el-icon style="margin: 0.1em 0.1em 0 0" :size="17" :color="getThemeColor(item.themeColor)">
            <IconifyIconOffline :icon="Check" />
          </el-icon>
        </li>
      </ul>

      <p :class="['mt-8', pClass]">{{ t('panel.themeColor') }}</p>
      <ul class="moly-theme">
        <li ref="verticalRef" :class="Layout === 'vertical' ? 'is-select' : ''" @click="setLayout('vertical')">
          <div />
          <div />
        </li>
        <li
          ref="horizontalRef"
          v-if="device !== 'mobile'"
          :class="Layout === 'horizontal' ? 'is-select' : ''"
          @click="setLayout('horizontal')"
        >
          <div />
          <div />
        </li>
      </ul>

      <p :class="['mt-8', pClass]">{{ t('panel.interfaceDisplay') }}</p>
      <ul class="setting">
        <li>
          <span class="dark:text-white">{{ t('panel.greyModel') }}</span>
          <el-switch
            v-model="settings.grey"
            inline-prompt
            :active-text="t('buttons.openText')"
            :inactive-text="t('buttons.closeText')"
            @change="greyChange"
          />
        </li>
        <li>
          <span class="dark:text-white">{{ t('panel.hiddenTags') }}</span>
          <el-switch
            v-model="settings.hideTabs"
            inline-prompt
            :active-text="t('buttons.openText')"
            :inactive-text="t('buttons.closeText')"
            @change="tabsChange"
          />
        </li>
        <li>
          <span class="dark:text-white">{{ t('panel.hiddenFooter') }}</span>
          <el-switch
            v-model="settings.hideFooter"
            inline-prompt
            :active-text="t('buttons.openText')"
            :inactive-text="t('buttons.closeText')"
            @change="footerChange"
          />
        </li>
        <li>
          <span class="dark:text-white">Logo</span>
          <el-switch
            v-model="settings.showLogo"
            inline-prompt
            :active-text="t('buttons.openText')"
            :inactive-text="t('buttons.closeText')"
            @change="logoChange"
          />
        </li>
        <li>
          <span class="dark:text-white">{{ t('panel.multiTagsCache') }}</span>
          <el-switch
            v-model="settings.multiTagsCache"
            inline-prompt
            :active-text="t('buttons.openText')"
            :inactive-text="t('buttons.closeText')"
            @change="multiTabsCacheChange"
          />
        </li>
      </ul>
    </div>
  </LayPanel>
</template>

<script lang="ts" setup>
import LayPanel from '../lay-panel/index.vue';

import { computed, reactive, ref } from 'vue';
import { useThemeChange } from '@/layout/hooks/useThemeChange';
import { useGlobalConfig } from '@/config';
import { useMultiTagsStoreHook } from '@/store/modules/multiTag';
import { useTranslationLang } from '@/layout/hooks/useTranslationLang';
import { useNav } from '@/layout/hooks/useNav';

import Check from '@iconify-icons/ep/check';
import LightIcon from '@iconify-icons/ep/sunny';
import DarkIcon from '@iconify-icons/ep/moon';

const pClass = computed(() => {
  return ['mb-[12px]', 'font-medium', 'text-sm', 'dark:text-white', 'font-semibold'];
});

const { isDark, themeColors, setLayoutThemeColor, setModeColor, toggleClass } = useThemeChange();
const { getConfig, setConfig } = useGlobalConfig();
const { t } = useTranslationLang();
const { device } = useNav();

const theme = computed(() => getConfig().Theme);

const mode = ref<number>(isDark.value ? 1 : 0);
const modeOptions = computed(() => {
  return [
    {
      value: 0,
      content: t('panel.overallStyleLight'),
      icon: LightIcon,
    },
    {
      value: 1,
      content: t('panel.overallStyleDark'),
      icon: DarkIcon,
    },
  ];
});

/** 深浅模式切换 */
function modeChange(mode) {
  mode === 0 ? setConfig({ DarkMode: false }) : setConfig({ DarkMode: true });
  setModeColor();
}

const getThemeColorStyle = computed(() => {
  return (color) => {
    return { background: color };
  };
});

/** 当网页整体为暗色风格时不显示亮白色主题配色切换选项 */
const showThemeColors = computed(() => {
  return (themeColor) => {
    return themeColor === 'light' && mode.value ? false : true;
  };
});

const getThemeColor = computed(() => {
  return (current) => {
    if (current === theme.value && theme.value !== 'light') {
      return '#fff';
    } else if (current === theme.value && theme.value === 'light') {
      return '#1d2b45';
    } else {
      return 'transparent';
    }
  };
});

const Layout = computed(() => getConfig().Layout);

/** 切换布局 */
function setLayout(layout: string) {
  setConfig({ Layout: layout });
  window.document.body.setAttribute('layout', layout);
}

const { Grey, HideTabs, ShowLogo, HideFooter, MultiTagsCache } = computed(() => getConfig()).value;

const settings = reactive({
  grey: Grey,
  hideTabs: HideTabs,
  showLogo: ShowLogo,
  hideFooter: HideFooter,
  multiTagsCache: MultiTagsCache,
});

/** 灰色模式切换 */
function greyChange() {
  toggleClass(settings.grey, 'html-grey', document.querySelector('html'));
  setConfig({ Grey: settings.grey });
}
/** 多标签显示切换 */
function tabsChange() {
  setConfig({ HideTabs: settings.hideTabs });
}
/** 页脚显示切换 */
function footerChange() {
  setConfig({ HideFooter: settings.hideFooter });
}
/** logo显示切换 */
function logoChange() {
  setConfig({ ShowLogo: settings.showLogo });
}
/** 多标签缓存切换 */
function multiTabsCacheChange() {
  const multiTagsCache = settings.multiTagsCache;
  setConfig({ MultiTagsCache: multiTagsCache });
  useMultiTagsStoreHook().multiTagsCacheChange(multiTagsCache);
}
</script>

<style lang="scss" scoped>
.theme-color {
  height: 20px;

  li {
    float: left;
    height: 20px;
    width: 20px;
    margin-right: 8px;
    cursor: pointer;
    border-radius: 4px;

    &:nth-child(1) {
      border: 1px solid #ddd;
    }
  }
}

.moly-theme {
  display: flex;
  gap: 12px;

  li {
    position: relative;
    width: 46px;
    height: 36px;
    overflow: hidden;
    cursor: pointer;
    background: #f0f2f5;
    border-radius: 4px;
    box-shadow: 0 1px 2.5px 0 rgb(0 0 0 / 18%);

    &:nth-child(1) {
      div {
        &:nth-child(1) {
          width: 30%;
          height: 100%;
          background: #1b2a47;
        }

        &:nth-child(2) {
          position: absolute;
          top: 0;
          right: 0;
          width: 70%;
          height: 30%;
          background: #fff;
          box-shadow: 0 0 1px #888;
        }
      }
    }

    &:nth-child(2) {
      div {
        &:nth-child(1) {
          width: 100%;
          height: 30%;
          background: #1b2a47;
          box-shadow: 0 0 1px #888;
        }
      }
    }

    &:nth-child(3) {
      div {
        &:nth-child(1) {
          width: 100%;
          height: 30%;
          background: #1b2a47;
          box-shadow: 0 0 1px #888;
        }

        &:nth-child(2) {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 30%;
          height: 70%;
          background: #fff;
          box-shadow: 0 0 1px #888;
        }
      }
    }
  }
}

.is-select {
  border: 2px solid var(--el-color-primary);
}

.setting {
  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 3px 0;
    font-size: 14px;
  }
}
</style>
