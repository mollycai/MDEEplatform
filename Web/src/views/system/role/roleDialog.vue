<template>
  <el-dialog
    v-model="dialogVisible"
    :title="status === DialogTypeEnum.EDIT ? '修改角色' : '添加角色'"
    width="600px"
    @close="closeDialog"
    align-center
  >
    <el-form ref="roleFormRef" :model="roleForm" :rules="formRules" label-width="100px" size="default">
      <!-- 角色名称 -->
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" clearable />
      </el-form-item>
      <!-- 角色标识 -->
      <el-form-item label="角色标识" prop="roleKey">
        <el-input v-model="roleForm.roleKey" placeholder="请输入角色标识" clearable />
      </el-form-item>
      <!-- 角色排序 -->
      <el-form-item label="角色排序" prop="roleKey">
        <el-input-number v-model="roleForm.roleSort" controls-position="right" :min="0" />
      </el-form-item>
      <!-- 状态 -->
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="roleForm.status">
          <el-radio :value="StatusEnum.NORMAL">正常</el-radio>
          <el-radio :value="StatusEnum.STOP">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 菜单权限 -->
      <el-form-item label="菜单权限">
        <el-checkbox v-model="menuExpand" @change="checkedTreeExpand($event)"> 展开/折叠 </el-checkbox>
        <el-checkbox v-model="menuNodeAll" @change="checkedTreeNodeAll($event)"> 全选/全不选 </el-checkbox>
        <el-checkbox v-model="roleForm.menuCheckStrictly" @change="checkedTreeConnect($event)"> 父子联动 </el-checkbox>
        <el-tree
          class="tree-border"
          v-loading="parentMenuListLoading"
          ref="menuRef"
          :data="menuTree"
          :check-strictly="!roleForm.menuCheckStrictly"
          show-checkbox
          node-key="id"
          highlight-current
          empty-text="加载中，请稍候"
          :props="{ label: 'label', children: 'children' }"
        />
      </el-form-item>
      <!-- 备注 -->
      <el-form-item label="备注" prop="remark">
        <el-input v-model="roleForm.remark" type="textarea" :rows="3" placeholder="请输入备注" clearable />
      </el-form-item>
    </el-form>
    <!-- 操作按钮 -->
    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="submit(roleFormRef)">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { createRole, menuTreeSelect, updateRole } from '@/api/system';
import { StatusEnum } from '@/enums/dataEnum';
import { CodeEnum } from '@/enums/httpEnums';
import feedback from '@/utils/feedback';
import { FormInstance, FormRules } from 'element-plus';
import { cloneDeep } from 'lodash-es';
import { nextTick } from 'process';
import { onMounted, reactive, ref } from 'vue';
import { DialogTypeEnum } from '@/enums/dataEnum';

// 获取参数
const props = defineProps({
  status: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['refresh']);

// 表单数据
const roleFormInit: any = {
  roleName: '',
  roleKey: '',
  roleSort: 0,
  status: StatusEnum.NORMAL,
  remark: '',
  menuCheckStrictly: true,
  deptCheckStrictly: true, // dept暂时不做
};
const dialogVisible = ref<boolean>(false);
const roleForm = ref(cloneDeep(roleFormInit));
const roleFormRef = ref<FormInstance>();
// 菜单树形数据
const menuTree = ref<any>([]);
const menuRef = ref(null);
const menuExpand = ref<boolean>(false);
const menuNodeAll = ref<boolean>(false);
const parentMenuListLoading = ref<boolean>(false);

// 暴露给父级组件操作的方法
const setChecked = (v) => {
  nextTick(() => {
    menuRef.value.setChecked(v, true, false);
  });
};

// 暴露参数
defineExpose({
  roleForm,
  dialogVisible,
  menuTree,
  setChecked,
});

// 表单校验规则
const formRules = reactive<FormRules>({
  roleName: [
    { required: true, message: '角色名称不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度应为2-20个字符', trigger: 'blur' },
  ],
  roleKey: [
    { required: true, message: '权限标识不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '权限字符长度应为2-20个字符', trigger: 'blur' },
  ],
  remark: [{ max: 200, message: '备注长度不能超过200个字符', trigger: 'blur' }],
});

// 关闭弹窗
const closeDialog = () => {
  if (menuRef.value != undefined) {
    menuRef.value.setCheckedKeys([]);
  }
  dialogVisible.value = false;
  menuExpand.value = false;
  menuNodeAll.value = false;
  roleForm.value = cloneDeep(roleFormInit);
  roleFormRef.value.clearValidate();
};

// 提交表单
const submit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid) => {
    if (!valid) return;
    roleForm.value['menuIds'] = menuRef.value.getCheckedKeys();
    if (props.status === DialogTypeEnum.EDIT) {
      // 修改角色
      updateRole(roleForm.value).then(({ code, msg }) => {
        if (code === CodeEnum.SUCCESS) {
          feedback.msgSuccess(`${msg}`);
          dialogVisible.value = false;
          emit('refresh');
        } else {
          feedback.msgWarning(`${code}: ${msg}`);
        }
      });
    }
    if (props.status === DialogTypeEnum.CREATE) {
      // 添加角色
      createRole(roleForm.value).then(({ code, msg }) => {
        if (code === CodeEnum.SUCCESS) {
          feedback.msgSuccess(`${msg}`);
          dialogVisible.value = false;
          emit('refresh');
        } else {
          feedback.msgWarning(`${code}: ${msg}`);
        }
      });
    }
  });
};
// 展开
const checkedTreeExpand = (value) => {
  let treeList = menuTree.value;
  for (let i = 0; i < treeList.length; i++) {
    menuRef.value.store.nodesMap[treeList[i].id].expanded = value;
  }
};
// 全选
const checkedTreeNodeAll = (value) => {
  menuRef.value.setCheckedNodes(value ? menuTree.value : []);
};
// 父子联动
const checkedTreeConnect = (value) => {
  menuTree.value.menuCheckStrictly = value ? true : false;
};

onMounted(() => {
  parentMenuListLoading.value = true;
  menuTreeSelect()
    .then((data) => {
      if (data.code === CodeEnum.SUCCESS) {
        menuTree.value = data.data;
      }
    })
    .finally(() => {
      parentMenuListLoading.value = false;
    });
});
</script>

<style lang="scss" scoped>
.tree-border {
  margin-top: 5px;
  border: 1px solid #e5e6e7;
  border-radius: 4px;
  width: 100%;
}
</style>
