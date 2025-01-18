<template>
  <el-dialog
    v-model="dialogVisible"
    :title="status === DialogTypeEnum.EDIT ? '编辑用户' : '新增用户'"
    width="600px"
    @close="closeDialog"
    align-center
  >
    <el-form ref="userFormRef" :model="userForm" :rules="formRules" label-width="100px">
      <!-- 用户账号 -->
      <el-form-item label="用户账号" prop="userName" required>
        <el-input v-model="userForm.userName" placeholder="请输入用户账号" />
      </el-form-item>
      <!-- 用户昵称 -->
      <el-form-item label="用户昵称" prop="nickName" required>
        <el-input v-model="userForm.nickName" placeholder="请输入用户昵称" />
      </el-form-item>
      <!-- 手机号码 -->
      <el-form-item label="密码" prop="password" v-if="status !== DialogTypeEnum.EDIT" required>
        <el-input v-model="userForm.password" placeholder="请输入密码" type="password" />
      </el-form-item>
      <!-- 手机号码 -->
      <el-form-item label="手机号码" prop="phoneNumber">
        <el-input v-model="userForm.phoneNumber" placeholder="请输入手机号码" />
      </el-form-item>
      <!-- 邮箱 -->
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="userForm.email" placeholder="请输入邮箱" />
      </el-form-item>
      <!-- @TODO 头像地址 -->
      <el-form-item label="头像地址" prop="avatar">
        <el-input v-model="userForm.avatar" placeholder="请输入头像地址" />
      </el-form-item>
      <el-form-item label="角色" prop="roleIds" required>
        <el-select v-model="userForm.roleIds" multiple placeholder="请选择">
          <el-option
            v-for="item in roleOptions"
            :key="item.roleId"
            :label="item.roleName"
            :value="item.roleId"
            :disabled="item.status === StatusEnum.STOP"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- 性别 -->
      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="userForm.sex">
          <el-radio :value="SexEnum.MAN">男</el-radio>
          <el-radio :value="SexEnum.WOMAN">女</el-radio>
          <el-radio :value="SexEnum.SECRET">未知</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 状态 -->
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="userForm.status">
          <el-radio :value="StatusEnum.NORMAL">正常</el-radio>
          <el-radio :value="StatusEnum.STOP">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 备注 -->
      <el-form-item label="备注" prop="remark">
        <el-input v-model="userForm.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <!-- 弹窗底部按钮 -->
    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="submit(userFormRef)">提交</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { createUser, getRoleOptions, updateUser } from '@/api/system';
import { CodeEnum } from '@/enums/httpEnums';
import feedback from '@/utils/feedback';
import type { FormInstance, FormRules } from 'element-plus';
import { cloneDeep } from 'lodash-es';
import { onMounted, reactive, ref } from 'vue';
import type { RoleOptions } from './types';
import { DialogTypeEnum, SexEnum, StatusEnum } from '@/enums/dataEnum';

// 获取参数
const props = defineProps({
  status: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['refresh']);

const userFormInit: any = {
  // 暂时解决不了，用any
  roleIds: [],
  userName: '',
  nickName: '',
  phoneNumber: '',
  password: '',
  avatar: '', // @TODO 待改成上传头像
  email: '',
  sex: SexEnum.MAN,
  status: StatusEnum.NORMAL,
  remark: '',
};
const userForm = ref(cloneDeep(userFormInit));
const dialogVisible = ref<boolean>(false);
const userFormRef = ref<FormInstance>();
const roleOptions = ref<Array<RoleOptions>>([]);
const roleListLoading = ref<boolean>(false);

// 暴露参数
defineExpose({
  userForm,
  dialogVisible,
});

// 表单校验规则
const formRules = reactive<FormRules>({
  userName: [
    { required: true, message: '用户账号不能为空', trigger: 'blur' },
    { min: 5, max: 18, message: '长度应该在5-18个字符', trigger: 'blur' },
  ],
  nickName: [
    { required: true, message: '用户昵称不能为空', trigger: 'blur' },
    { min: 5, max: 18, message: '长度应该在5-18个字符', trigger: 'blur' },
  ],
  password:
    props.status === DialogTypeEnum.EDIT
      ? []
      : [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { min: 5, max: 18, message: '长度应该在5-18个字符', trigger: 'blur' },
        ],
  phoneNumber: [{ pattern: /^[1][3-9][0-9]{9}$/, message: '手机号码格式不正确', trigger: 'blur' }],
  email: [{ pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '邮箱格式不正确', trigger: 'blur' }],
  roleIds: [{ required: true, message: '请选择至少一个角色', trigger: 'change' }],
  remark: [{ max: 200, message: '备注长度不能超过200个字符', trigger: 'blur' }],
});

const closeDialog = () => {
  dialogVisible.value = false;
  userForm.value = cloneDeep(userFormInit);
  userFormRef.value.clearValidate();
};

const submit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid) => {
    if (valid) {
      if (props.status === DialogTypeEnum.CREATE) {
        createUser(userForm.value).then(({ code, msg }) => {
          if (code === CodeEnum.SUCCESS) {
            feedback.msgSuccess(`${msg}`);
            dialogVisible.value = false;
            emit('refresh');
          } else {
            feedback.msgWarning(`${code}: ${msg}`);
          }
        });
      }
      if (props.status === DialogTypeEnum.EDIT) {
        updateUser(userForm.value).then(({ code, msg }) => {
          if (code === CodeEnum.SUCCESS) {
            feedback.msgSuccess(`${msg}`);
            dialogVisible.value = false;
            emit('refresh');
          } else {
            feedback.msgWarning(`${code}: ${msg}`);
          }
        });
      }
    }
  });
};

onMounted(() => {
  roleListLoading.value = true;
  getRoleOptions()
    .then((data) => {
      if (data.code === CodeEnum.SUCCESS) {
        roleOptions.value = data.data;
      }
    })
    .finally(() => {
      roleListLoading.value = false;
    });
});
</script>
