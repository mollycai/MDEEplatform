<template>
  <div class="select-none">
    <img :src="bg" class="wave" />
    <div class="flex-c absolute right-5 top-3">
      <!-- 主题 -->
      <el-switch
        v-model="isDark"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="setModeColor"
      />
      <!-- 国际化 -->
      <el-dropdown trigger="click">
        <globalization
          class="hover:text-primary hover:!bg-[transparent] w-[20px] h-[20px] ml-1.5 cursor-pointer outline-none duration-300"
        />
        <template #dropdown>
          <el-dropdown-menu class="translation">
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'zh')"
              :class="['dark:!text-white', getDropdownItemClass(locale, 'zh')]"
              @click="translationCh"
            >
              <IconifyIconOffline v-show="locale === 'zh'" class="check-zh" :icon="Check" />
              简体中文
            </el-dropdown-item>
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'en')"
              :class="['dark:!text-white', getDropdownItemClass(locale, 'en')]"
              @click="translationEn"
            >
              <span v-show="locale === 'en'" class="check-en">
                <IconifyIconOffline :icon="Check" />
              </span>
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="login-container">
      <div class="img">
        <component :is="toRaw(illustration)" />
      </div>
      <div class="login-box">
        <div class="login-form">
          <Motion>
            <h2 class="outline-none">{{ title }}</h2>
          </Motion>

          <el-form ref="ruleFormRef" :model="ruleForm" :rules="loginRules" size="large">
            <Motion :delay="100">
              <el-form-item
                :rules="[
                  {
                    required: true,
                    message: $t('login.usernameReg'),
                    trigger: 'blur',
                  },
                ]"
                prop="username"
              >
                <el-input
                  v-model="ruleForm.username"
                  clearable
                  :placeholder="t('login.username')"
                  :prefix-icon="User"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input
                  v-model="ruleForm.password"
                  clearable
                  show-password
                  :placeholder="t('login.password')"
                  :prefix-icon="Lock"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="250">
              <el-button
                class="w-full mt-4"
                size="default"
                type="primary"
                :loading="loading"
                @click="onLogin(ruleFormRef)"
              >
                {{ t('login.login') }}
              </el-button>
            </Motion>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalConfig } from '@/config';
import { CodeEnum } from '@/enums/httpEnums';
import { useNav } from '@/layout/hooks/useNav';
import { useThemeChange } from '@/layout/hooks/useThemeChange';
import { useTranslationLang } from '@/layout/hooks/useTranslationLang';
import { $t } from '@/plugins/i18n';
import { initRouter } from '@/router';
import { useUserStoreHook } from '@/store/modules/user';
import { Lock, User } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';
import { onBeforeUnmount, onMounted, reactive, ref, toRaw } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { loginRules } from './utils/rule';
import { bg, illustration } from './utils/static';

import feedback from '@/utils/feedback';
import Motion from './utils/motion';

import darkIcon from '@/assets/svg/dark.svg?component';
import dayIcon from '@/assets/svg/day.svg?component';
import globalization from '@/assets/svg/globalization.svg?component';
import Check from '@iconify-icons/ep/check';

const { setConfig, getConfig } = useGlobalConfig();
const router = useRouter();
const { t } = useI18n();
const { title, getDropdownItemStyle, getDropdownItemClass } = useNav();
const { toggleClass } = useThemeChange();
const { locale, translationCh, translationEn } = useTranslationLang();

const isDark = ref<boolean>(getConfig().DarkMode);
const loading = ref(false);
const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive({
  username: 'superadmin',
  password: '123qwe',
});
// @TODO 此处待优化，因为如果使用useNav的isDark的computed，与v-model相冲突
const setModeColor = () => {
  setConfig({ DarkMode: isDark.value });
  toggleClass(isDark.value, 'dark', document.querySelector('html'));
};

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid) => {
    if (valid) {
      loading.value = true;
      useUserStoreHook()
        .loginByUsername({ username: ruleForm.username, password: ruleForm.password })
        .then((res) => {
          if (res.code === CodeEnum.SUCCESS) {
            // 获取后端路由
            return initRouter().then(() => {
              // @TODO topmenu暂时为welcome
              router.push('/welcome').then(() => {
                feedback.msgSuccess(t('login.loginSuccess'));
              });
            });
          } else {
            feedback.msgError(t('login.loginFail'));
          }
        })
        .finally(() => (loading.value = false));
    }
  });
};

/** 使用公共函数，避免`removeEventListener`失效 */
function onkeypress({ code }: KeyboardEvent) {
  if (['Enter', 'NumpadEnter'].includes(code)) {
    onLogin(ruleFormRef.value);
  }
}

onMounted(() => {
  window.document.addEventListener('keypress', onkeypress);
});

onBeforeUnmount(() => {
  window.document.removeEventListener('keypress', onkeypress);
});
</script>

<style scoped>
@import url('@/style/login.css');
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}

.translation {
  ::v-deep(.el-dropdown-menu__item) {
    padding: 5px 40px;
  }

  .check-zh {
    position: absolute;
    left: 20px;
  }

  .check-en {
    position: absolute;
    left: 20px;
  }
}
</style>
