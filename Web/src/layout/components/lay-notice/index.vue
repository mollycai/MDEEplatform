<template>
  <el-dropdown trigger="click" placement="bottom-end">
    <span :class="['dropdown-badge', 'navbar-bg-hover', 'select-none', Number(noticesNum) !== 0 && 'mr-[10px]']">
      <el-badge :value="Number(noticesNum) === 0 ? '' : noticesNum" :max="99">
        <span class="header-notice-icon">
          <IconifyIconOffline :icon="BellIcon" />
        </span>
      </el-badge>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-tabs
          v-model="activeKey"
          :stretch="true"
          class="dropdown-tabs"
          :style="{ width: notices.length === 0 ? '200px' : '330px' }"
        >
          <el-empty v-if="notices.length === 0" description="暂无消息" :image-size="60" />
          <span v-else>
            <template v-for="item in notices" :key="item.key">
              <el-tab-pane :label="getLabel(item)" :name="`${item.key}`">
                <el-scrollbar max-height="330px">
                  <div class="noticeList-container">
                    <!-- <NoticeList :list="item.list" :emptyText="item.emptyText" /> -->
                  </div>
                </el-scrollbar>
              </el-tab-pane>
            </template>
          </span>
        </el-tabs>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import BellIcon from '@iconify-icons/ep/bell';
import { TabItem } from './type';
import { useTranslationLang } from '@/layout/hooks/useTranslationLang';

const { t } = useTranslationLang();

// @TODO 为什么这里切换语言后得刷新才能生效
const noticesData: TabItem[] = [
  {
    key: '1',
    name: t('notification.notify'),
    list: [],
    emptyText: t('notification.noNotify'),
  },
  {
    key: '2',
    name: t('notification.message'),
    list: [],
    emptyText: t('notification.noMessage'),
  },
  {
    key: '3',
    name: t('notification.todo'),
    list: [],
    emptyText: t('notification.noTodo'),
  },
];

const noticesNum = ref(0);
const notices = ref(noticesData);
const activeKey = ref(noticesData[0]?.key);

notices.value.map((v) => (noticesNum.value += v.list.length));

const getLabel = computed(() => (item) => item.name + (item.list.length > 0 ? `(${item.list.length})` : ''));
</script>

<style lang="scss" scoped>
.dropdown-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 48px;
  cursor: pointer;

  .header-notice-icon {
    font-size: 18px;
  }
}

.dropdown-tabs {
  .noticeList-container {
    padding: 15px 24px 0;
  }

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap)::after {
    height: 1px;
  }

  :deep(.el-tabs__nav-wrap) {
    padding: 0 36px;
  }
}
</style>
