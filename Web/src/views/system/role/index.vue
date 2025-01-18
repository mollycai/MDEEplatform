<template>
  <div class="page-container">
    <!-- 搜索表单 -->
    <el-form :model="searchForm" inline>
      <!-- 角色名称 -->
      <el-form-item label="角色名称">
        <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" />
      </el-form-item>
      <!-- 权限标识 -->
      <el-form-item label="权限标识">
        <el-input v-model="searchForm.roleKey" placeholder="请输入权限标识" />
      </el-form-item>
      <!-- 状态 -->
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" class="!w-[200px]" clearable>
          <el-option label="正常" :value="StatusEnum.NORMAL" />
          <el-option label="停用" :value="StatusEnum.STOP" />
        </el-select>
      </el-form-item>
      <!-- 创建时间 -->
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="createTimes"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="x"
          class="w-full"
          @clear="clearDate"
        >
        </el-date-picker>
      </el-form-item>
      <!-- 操作按钮 -->
      <el-form-item>
        <el-button
          v-perms="[RolePermissions.QUERY]"
          type="primary"
          :icon="Search"
          @click="pageSearch"
          :loading="btnIsLoading"
        >
          搜索
        </el-button>
        <el-button v-perms="[RolePermissions.QUERY]" :icon="Refresh" @click="resetSearchForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
  <div class="page-container">
    <!-- 操作 -->
    <div class="flex mb-[15px]">
      <el-button v-perms="[RolePermissions.ADD]" type="primary" :icon="Plus" @click="createRole" plain>新增</el-button>
      <el-button v-perms="[RolePermissions.REMOVE]" type="danger" :icon="Delete" @click="multipleDelete" plain>
        删除
      </el-button>
      <el-button v-perms="[RolePermissions.EXPORT]" type="success" :icon="Download" @click="exportRole" plain>
        导出
      </el-button>
    </div>
    <!-- 角色表格 -->
    <el-table
      :data="roleList"
      style="width: 100%"
      v-loading="isLoading"
      :pagination="false"
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" :selectable="selectable" align="center" fixed="left" />
      <el-table-column prop="roleId" label="角色ID" width="100" align="center" />
      <el-table-column prop="roleName" label="角色名称" width="150" show-overflow-tooltip />
      <el-table-column prop="roleKey" label="权限标识" width="150" show-overflow-tooltip />
      <el-table-column prop="roleSort" label="排序" width="80" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            size="small"
            :active-value="StatusEnum.NORMAL"
            :inactive-value="StatusEnum.STOP"
            @change="changeStatus"
          />
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-tooltip content="修改" placement="top" v-if="row.roleId !== 1">
            <el-button v-perms="[RolePermissions.EDIT]" link type="primary" :icon="Edit" @click="editRole(row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top" v-if="row.roleId !== 1">
            <el-button v-perms="['system:role:delete']" link type="danger" :icon="Delete" @click="deleteRole(row)" />
          </el-tooltip>
          <el-tooltip content="授权用户" placement="top" v-if="row.roleId !== 1">
            <el-button link type="success" :icon="User" @click="authUser(row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <div class="flex justify-end overflow-hidden">
      <el-pagination
        class="mt-[10px]"
        background
        v-model:current-page="pageParams.page"
        v-model:page-size="pageParams.limit"
        :page-sizes="[10, 20, 50, 100]"
        @current-change="(page) => handlePageChange({ page })"
        @size-change="(limit) => handlePageChange({ limit })"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </div>
  </div>
  <RoleDialog ref="roleDialogRef" :status="roleDialogStatus" @refresh="handlePageChange(pageParams)"></RoleDialog>
</template>
<script lang="ts" setup>
import { getAllRoles, removeRole, roleMenuTreeSelect } from '@/api/system';
import { Result } from '@/api/type';
import { CodeEnum } from '@/enums/httpEnums';
import feedback from '@/utils/feedback';
import { debounceFunction, formatDate } from '@/utils/utils';
import { Delete, Download, Edit, Plus, Refresh, Search, User } from '@element-plus/icons-vue';
import { cloneDeep } from 'lodash-es';
import { onMounted, ref } from 'vue';
import { default as RoleDialog, default as roleDialog } from './roleDialog.vue';
import { DialogStatus } from './type';
import { DialogTypeEnum, StatusEnum } from '@/enums/dataEnum';
import { RolePermissions } from '@/enums/auth';

// 加载
let isLoading = ref<boolean>(false);
let btnIsLoading = ref<boolean>(false);
// 分页条总记录数
let total = ref<number>(0);
// 分页数据
const pageParams = ref({ page: 1, limit: 10 });
// 页码变化
const handlePageChange = ({ page = 1, limit = pageParams.value.limit } = {}) => {
  pageParams.value.page = page;
  pageParams.value.limit = limit;
  fetchData(page, limit);
};

// 角色列表
const roleList = ref<Array<any>>([]);
// 角色信息弹窗状态
const roleDialogStatus = ref<DialogStatus>(DialogTypeEnum.CREATE);
// 搜索表单数据模型
const searchFormInit = {
  roleName: '',
  roleKey: '',
  status: StatusEnum.NORMAL,
  beginTime: '',
  endTime: '',
};
// 开始和结束时间数据模型
const createTimes = ref([]);
const searchForm = ref(cloneDeep(searchFormInit));
const roleDialogRef = ref<InstanceType<typeof roleDialog>>(null);
const selectable = (row) => ![1].includes(row.roleId);
// 多选删除列表
const deleteList = ref<Array<number>>([]);

// 请求数据
const fetchData = async (page: number, limit: number) => {
  isLoading.value = true;
  //获取开始和结束时间
  if (createTimes.value.length == 2) {
    searchForm.value.beginTime = createTimes.value[0];
    searchForm.value.endTime = createTimes.value[1];
  }
  getAllRoles({ ...searchForm.value, pageNum: page, pageSize: limit })
    .then((data: Result) => {
      if (data.code === CodeEnum.SUCCESS) {
        roleList.value = data.data.records;
        total.value = data.data.total;
      } else {
        feedback.msgWarning(`${data.code}: ${data.msg}`);
      }
    })
    .finally(() => {
      isLoading.value = false;
      btnIsLoading.value = false;
    });
};
// 搜索
const pageSearch = debounceFunction(() => {
  btnIsLoading.value = true;
  handlePageChange();
});
// 重置
const resetSearchForm = () => {
  searchForm.value = cloneDeep(searchFormInit);
  createTimes.value = [];
  handlePageChange();
};
// 清除日期
const clearDate = () => {
  createTimes.value = [];
  searchForm.value.beginTime = '';
  searchForm.value.endTime = '';
};
// 添加角色
const createRole = () => {
  roleDialogStatus.value = DialogTypeEnum.CREATE;
  roleDialogRef.value.dialogVisible = true;
};
// 编辑角色
const editRole = (role) => {
  roleDialogStatus.value = DialogTypeEnum.EDIT;
  roleDialogRef.value.roleForm = cloneDeep(role);
  roleMenuTreeSelect(role.roleId)
    .then((data: Result) => {
      if (data.code === CodeEnum.SUCCESS) {
        roleDialogRef.value.menuTree = data.data.menu;
        const checkedKeys = data.data.checkedKeys;
        checkedKeys.forEach((v) => {
          roleDialogRef.value.setChecked(v);
        });
      }
    })
    .finally(() => {
      roleDialogRef.value.dialogVisible = true;
    });
};
// 删除角色
const deleteRole = (role) => {
  feedback.confirm('确定删除该角色吗?').then(() => {
    removeRole([role.roleId]).then((data: Result) => {
      if (data.code === CodeEnum.SUCCESS) {
        feedback.msgSuccess('删除成功');
        handlePageChange();
      } else {
        feedback.msgWarning(`${data.code}: ${data.msg}`);
      }
    });
  });
};
// 多选删除
const selectionChange = (roleList) => {
  deleteList.value = roleList.map((item) => item.roleId);
};
// 多选删除
const multipleDelete = () => {
  feedback.confirm(`您确定删除这些角色 ？`).then(() => {
    removeRole(deleteList.value).then(({ code, msg }) => {
      if (code === CodeEnum.SUCCESS) {
        feedback.msgSuccess(`${msg}`);
        handlePageChange(pageParams.value);
      } else {
        feedback.msgWarning(`${code}: ${msg}`);
      }
    });
  });
};
// 授权用户
const authUser = (role) => {};
// 切换状态 @TODO 还是考虑下当禁用时，正在使用的角色如何处理
const changeStatus = (row) => {};
// 导出角色
const exportRole = () => {};

onMounted(() => {
  handlePageChange();
});
</script>
