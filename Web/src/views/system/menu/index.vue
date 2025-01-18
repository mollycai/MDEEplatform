<template>
  <div class="page-container">
    <!-- 搜索表单 -->
    <el-form ref="searchFormRef" :model="searchFormDto" inline>
      <el-form-item label="菜单名称" prop="roleName">
        <el-input v-model="searchFormDto.menuName" placeholder="请输入菜单名称"></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="searchFormDto.status" placeholder="请选择状态" class="!w-[200px]" clearable>
          <el-option label="启用" :value="StatusEnum.NORMAL"></el-option>
          <el-option label="禁用" :value="StatusEnum.STOP"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          v-perms="[MenuPermissions.QUERY]"
          type="primary"
          :icon="Search"
          @click="pageSearch"
          :loading="btnIsLoading"
        >
          搜索
        </el-button>
        <el-button v-perms="[MenuPermissions.QUERY]" :icon="Refresh" @click="resetSearchForm"> 重置 </el-button>
      </el-form-item>
    </el-form>
  </div>
  <div class="page-container">
    <div class="flex mb-[15px]">
      <el-button v-perms="[MenuPermissions.ADD]" type="primary" :icon="Plus" @click="createMenuFromRoot" plain>
        新增
      </el-button>
      <el-button type="warning" :icon="Sort" @click="toggleExpandAll" plain>展开/折叠</el-button>
    </div>
    <!-- 菜单表格 -->
    <el-table
      v-if="refreshTable"
      v-loading="isLoading"
      :data="menuList"
      row-key="id"
      style="width: 100%"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      :default-expand-all="isExpandAll"
    >
      <el-table-column prop="title" label="菜单名称" width="180" />
      <el-table-column prop="rank" label="排序" width="60" />
      <el-table-column prop="type" label="菜单类型" width="120">
        <template #default="{ row }">
          <el-tag v-if="row.type === MenuEnum.TYPE_DIR" type="primary">目录</el-tag>
          <el-tag v-if="row.type === MenuEnum.TYPE_MENU" type="warning">菜单</el-tag>
          <el-tag v-if="row.type === MenuEnum.TYPE_BUTTON" type="info">按钮</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="图标" width="100">
        <template #default="{ row }">
          <IconifyIconOnline :icon="row.icon"></IconifyIconOnline>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="组件路由" show-overflow-tooltip />
      <el-table-column prop="permission" label="权限标识" show-overflow-tooltip />
      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.status === StatusEnum.NORMAL" type="success">正常</el-tag>
          <el-tag v-if="row.status === StatusEnum.STOP" type="danger">停用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="200">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
            v-perms="[MenuPermissions.EDIT]"
            link
            size="small"
            type="primary"
            :icon="Edit"
            @click="editMenu(row)"
          >
            编辑
          </el-button>
          <el-button
            v-perms="[MenuPermissions.ADD]"
            link
            size="small"
            type="info"
            :icon="Plus"
            @click="createMenu(row)"
          >
            新增
          </el-button>
          <el-button
            v-perms="[MenuPermissions.REMOVE]"
            link
            size="small"
            type="danger"
            :icon="Delete"
            @click="deleteMenu(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <menuDialog ref="menuDialogRef" :status="menuDialogStatus" @refresh="fetchData"></menuDialog>
</template>
<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';
import { getAllMenus } from '@/api/system';
import { CodeEnum } from '@/enums/httpEnums';
import { formatDate } from '@/utils/utils';
import { Delete, Edit, Plus, Search, Refresh, Sort } from '@element-plus/icons-vue';
import { cloneDeep } from 'lodash-es';
import { DialogStatus } from './type';
import menuDialog from './menuDialog.vue';
import feedback from '@/utils/feedback';
import { Result } from '@/api/type';
import { removeMenu } from '@/api/system';
import { CharEnum, DialogTypeEnum, MenuEnum, StatusEnum } from '@/enums/dataEnum';
import { MenuPermissions } from '@/enums/auth';

const isLoading = ref<boolean>(false);
const btnIsLoading = ref<boolean>(false);
const menuDialogStatus = ref<DialogStatus>(DialogTypeEnum.CREATE);
const menuDialogRef = ref<InstanceType<typeof menuDialog>>(null);

const isExpandAll = ref(false);
const refreshTable = ref(true);

const menuList = ref<any>([]);
const serarchFormInit = {
  menuName: '',
  status: '',
};
const searchFormDto = ref(cloneDeep(serarchFormInit));

const pageSearch = () => {
  fetchData();
};
const resetSearchForm = () => {
  searchFormDto.value = cloneDeep(serarchFormInit);
  fetchData();
};
const fetchData = () => {
  isLoading.value = true;
  getAllMenus(searchFormDto.value)
    .then((data) => {
      if (data.code === CodeEnum.SUCCESS) {
        menuList.value = data.data;
      }
    })
    .finally(() => {
      isLoading.value = false;
    });
};
// 编辑菜单
const editMenu = (menu) => {
  const _menu = formatMenu(menu);
  menuDialogRef.value.menuForm = cloneDeep(_menu);
  menuDialogStatus.value = DialogTypeEnum.EDIT;
  menuDialogRef.value.getTreeSelect();
  menuDialogRef.value.dialogVisible = true;
};
// 创建菜单
const createMenuFromRoot = () => {
  menuDialogStatus.value = DialogTypeEnum.CREATE;
  menuDialogRef.value.getTreeSelect();
  menuDialogRef.value.dialogVisible = true;
};
const createMenu = (menu) => {
  menuDialogStatus.value = DialogTypeEnum.CREATE;
  menuDialogRef.value.menuForm.parentId = menu.id;
  menuDialogRef.value.getTreeSelect();
  menuDialogRef.value.dialogVisible = true;
};
// 删除菜单
const deleteMenu = (menu) => {
  feedback.confirm('确定删除该菜单吗?').then(() => {
    removeMenu(menu.id).then((data: Result) => {
      if (data.code === CodeEnum.SUCCESS) {
        feedback.msgSuccess('删除成功');
        fetchData();
      } else {
        feedback.msgWarning(`${data.code}: ${data.msg}`);
      }
    });
  });
};
// 展开折叠
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}
// 格式化菜单
const formatMenu = (originalMenuData) => {
  return {
    menuId: originalMenuData.id, // 菜单ID
    parentId: originalMenuData.parentId, // 上级菜单
    menuType: originalMenuData.type, // 菜单类型
    icon: originalMenuData.icon || '', // 菜单图标
    menuName: originalMenuData.title || '', // 菜单名称
    orderNum: originalMenuData.rank || 1, // 显示排序
    isFrame: originalMenuData.isFrame ? CharEnum.YES : CharEnum.NO, // 是否外链
    isCache: originalMenuData.isCache ? CharEnum.YES : CharEnum.NO, // 是否缓存
    path: originalMenuData.path || '', // 路由地址
    query: originalMenuData.query, // 路由参数
    component: originalMenuData.component || '', // 组件名称
    visible: originalMenuData.isShow ? CharEnum.YES : CharEnum.NO, // 显示状态
    status: originalMenuData.status || StatusEnum.NORMAL, // 菜单状态
    perms: originalMenuData.permission || '', // 权限标识
    remark: originalMenuData.remark, // 备注
  };
};
onMounted(() => {
  fetchData();
});
</script>
<style lang="scss" scoped></style>
