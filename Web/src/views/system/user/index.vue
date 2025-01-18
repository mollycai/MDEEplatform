<template>
  <div class="page-container">
    <!-- 搜索表单 -->
    <el-form
      :model="searchFormDto"
      ref="searchFormRef"
      label-width="100px"
      class="search-form"
      header-row-class-name="table-header-gray"
    >
      <el-row :gutter="20">
        <!-- 用户账号 -->
        <el-col :xs="24" :sm="12" :md="12" :lg="6">
          <el-form-item label="用户账号" prop="userName">
            <el-input v-model="searchFormDto.userName" placeholder="请输入用户账号"></el-input>
          </el-form-item>
        </el-col>
        <!-- 用户昵称 -->
        <el-col :xs="24" :sm="12" :md="12" :lg="6">
          <el-form-item label="用户昵称" prop="nickName">
            <el-input v-model="searchFormDto.nickName" placeholder="请输入用户昵称"></el-input>
          </el-form-item>
        </el-col>
        <!-- 状态 -->
        <el-col :xs="24" :sm="12" :md="12" :lg="6">
          <el-form-item label="状态" prop="status">
            <el-select v-model="searchFormDto.status" placeholder="请选择状态" clearable>
              <el-option label="启用" :value="StatusEnum.NORMAL"></el-option>
              <el-option label="禁用" :value="StatusEnum.STOP"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 手机号 -->
        <el-col :xs="24" :sm="12" :md="12" :lg="6">
          <el-form-item label="手机号" prop="phoneNumber">
            <el-input v-model="searchFormDto.phoneNumber" placeholder="请输入手机号"></el-input>
          </el-form-item>
        </el-col>
        <!-- 时间范围 -->
        <el-col :xs="24" :sm="12" :md="12" :lg="6">
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
        </el-col>
        <!-- 操作按钮 -->
        <el-col :xs="24" :md="12" class="button-group">
          <el-form-item>
            <el-button
              v-perms="[UserPermissions.QUERY]"
              type="primary"
              :icon="Search"
              @click="pageSearch"
              :loading="btnIsLoading"
            >
              搜索
            </el-button>
            <el-button v-perms="[UserPermissions.QUERY]" :icon="Refresh" @click="resetSearchForm">重置</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
  <div class="page-container">
    <!-- 操作 -->
    <div class="flex mb-[15px]">
      <el-button v-perms="[UserPermissions.ADD]" type="primary" :icon="Plus" @click="addUser" plain>新增</el-button>
      <el-button v-perms="[UserPermissions.REMOVE]" type="danger" :icon="Delete" @click="multipleDelete" plain>
        删除
      </el-button>
      <el-button v-perms="[UserPermissions.IMPORT]" type="warning" :icon="Upload" @click="importUser" plain>
        导入
      </el-button>
      <el-button v-perms="[UserPermissions.EXPORT]" type="success" :icon="Download" @click="exportUser" plain>
        导出
      </el-button>
    </div>
    <!-- 表格 -->
    <el-table
      v-loading="isLoading"
      row-key="userId"
      :data="userList"
      style="width: 100%"
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" :selectable="selectable" align="center" fixed="left" />
      <el-table-column prop="userId" label="用户编号" width="100" />
      <el-table-column prop="userName" label="用户账号" show-overflow-tooltip />
      <el-table-column prop="nickName" label="用户昵称" show-overflow-tooltip />
      <el-table-column prop="phoneNumber" label="手机号码" width="150" />
      <el-table-column prop="email" label="电子邮箱" width="200" show-overflow-tooltip />
      <el-table-column label="创建时间" width="200">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="登录时间" width="200">
        <template #default="{ row }">
          {{ formatDate(row.loginDate) }}
        </template>
      </el-table-column>
      <el-table-column prop="loginIp" label="登录IP" width="150" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-tooltip content="修改" placement="top" v-if="row.userId !== 1">
            <el-button v-perms="[UserPermissions.EDIT]" link type="primary" :icon="Edit" @click="editUser(row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top" v-if="row.userId !== 1">
            <el-button v-perms="[UserPermissions.REMOVE]" link type="danger" :icon="Delete" @click="deleteUser(row)" />
          </el-tooltip>
          <el-tooltip content="重置密码" placement="top" v-if="row.userId !== 1">
            <el-button
              v-perms="[UserPermissions.RESETPWD]"
              link
              type="warning"
              :icon="Key"
              @click="updatePassword(row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <template v-slot:empty>
        <el-empty description="没有数据" />
      </template>
    </el-table>
    <!--页脚-->
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
  <userDialog ref="userDialogRef" :status="userDialogStatus" @refresh="handlePageChange(pageParams)"></userDialog>
</template>

<script lang="ts" setup>
import { getAllUsers, getRolesByUserId, removeUser } from '@/api/system';
import type { Result } from '@/api/type';
import { CodeEnum } from '@/enums/httpEnums';
import feedback from '@/utils/feedback';
import { debounceFunction, formatDate } from '@/utils/utils';
import { Delete, Download, Edit, Key, Plus, Refresh, Search, Upload } from '@element-plus/icons-vue';
import { cloneDeep } from 'lodash-es';
import { onMounted, ref } from 'vue';
import { DialogStatus } from './types';
import userDialog from './userDialog.vue';
import { DialogTypeEnum, StatusEnum } from '@/enums/dataEnum';
import { UserPermissions } from '@/enums/auth';

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

// 用户列表
const userList = ref<Array<any>>([]);
// 用户信息弹窗状态
const userDialogStatus = ref<DialogStatus>(DialogTypeEnum.CREATE);
// 搜索表单数据模型
const searchFormInit = {
  userName: '',
  nickName: '',
  status: '',
  phoneNumber: '',
  beginTime: '',
  endTime: '',
};
//开始和结束时间数据模型
const createTimes = ref([]);
const searchFormDto = ref(cloneDeep(searchFormInit));
// 多选删除列表
const deleteList = ref<Array<number>>([]);
// userDialog的ref
const userDialogRef = ref<InstanceType<typeof userDialog>>(null);
const selectable = (row) => ![1].includes(row.userId);

// 请求数据
const fetchData = async (page: number, limit: number) => {
  isLoading.value = true;
  //获取开始和结束时间
  if (createTimes.value.length == 2) {
    searchFormDto.value.beginTime = createTimes.value[StatusEnum.NORMAL];
    searchFormDto.value.endTime = createTimes.value[1];
  }
  getAllUsers({ ...searchFormDto.value, pageNum: page, pageSize: limit })
    .then((data: Result) => {
      if (data.code === CodeEnum.SUCCESS) {
        userList.value = data.data.records;
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
  searchFormDto.value = cloneDeep(searchFormInit);
  createTimes.value = [];
  handlePageChange();
};
// 清除日期
const clearDate = () => {
  createTimes.value = [];
  searchFormDto.value.beginTime = '';
  searchFormDto.value.endTime = '';
};
// 更新某个用户的状态
const handleStatusChange = (user) => {
  // 考虑一下这个的优化，当某个用户在登录状态时，然后突然被禁用，该怎么操作
};
// 添加用户
const addUser = () => {
  userDialogStatus.value = DialogTypeEnum.CREATE;
  userDialogRef.value.dialogVisible = true;
};
// @TODO 导出用户
const exportUser = () => {};
// @TODO 导入用户
const importUser = () => {};
// 修改用户
const editUser = async ({ userId, ...rest }) => {
  userDialogStatus.value = DialogTypeEnum.EDIT;
  // 需要再请求roleIds列表
  const { data: roleIds } = await getRolesByUserId(userId);
  userDialogRef.value.userForm = {
    userId,
    roleIds,
    ...rest,
  };
  userDialogRef.value.dialogVisible = true;
};
// 删除用户
const deleteUser = (row) => {
  feedback.confirm(`您确定删除用户 ${row.userName} ？`).then(() => {
    removeUser([row.userId]).then(({ code, msg }) => {
      if (code === CodeEnum.SUCCESS) {
        feedback.msg(`${msg}`);
        handlePageChange(pageParams.value);
      } else {
        feedback.msgWarning(`${code}: ${msg}`);
      }
    });
  });
};
// 多选删除
const selectionChange = (userList) => {
  deleteList.value = userList.map((item) => item.userId);
};
// 多选删除
const multipleDelete = () => {
  feedback.confirm(`您确定删除这些用户 ？`).then(() => {
    removeUser(deleteList.value).then(({ code, msg }) => {
      if (code === CodeEnum.SUCCESS) {
        feedback.msg(`${msg}`);
        handlePageChange(pageParams.value);
      } else {
        feedback.msgWarning(`${code}: ${msg}`);
      }
    });
  });
};
// @TODO 修改密码
const updatePassword = (row) => {};

onMounted(() => {
  handlePageChange();
});
</script>
