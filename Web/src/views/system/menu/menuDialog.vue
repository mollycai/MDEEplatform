<template>
  <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" @close="closeDialog" align-center>
    <el-form ref="menuFormRef" :model="menuForm" :rules="formRules" label-width="120px">
      <!-- 上级菜单 -->
      <el-form-item label="上级菜单" prop="parentId">
        <el-tree-select
          v-loading="parentMenuListLoading"
          v-model="menuForm.parentId"
          :data="menuOptions"
          :props="{ value: 'id', label: 'label', children: 'children', disabled: 'disabled' }"
          value-key="id"
          placeholder="选择上级菜单"
          check-strictly
        />
      </el-form-item>
      <!-- 菜单类型 -->
      <el-form-item label="菜单类型" prop="menuType">
        <el-radio-group v-model="menuForm.menuType">
          <el-radio :value="MenuEnum.TYPE_DIR">目录</el-radio>
          <el-radio :value="MenuEnum.TYPE_MENU">菜单</el-radio>
          <el-radio :value="MenuEnum.TYPE_BUTTON">按钮</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 菜单图标 -->
      <el-form-item v-if="setType(MenuEnum.TYPE_DIR)" label="菜单图标" prop="icon">
        <el-input v-model="menuForm.icon" placeholder="请输入图标名称">
          <template #append><IconifyIconOnline :icon="menuForm.icon" /></template>
        </el-input>
      </el-form-item>
      <!-- 菜单名称 -->
      <el-form-item label="菜单名称" prop="menuName">
        <el-input v-model="menuForm.menuName" placeholder="请输入菜单名称" />
      </el-form-item>
      <!-- 显示排序 -->
      <el-form-item label="显示排序" prop="orderNum">
        <el-input-number v-model="menuForm.orderNum" :min="1" />
      </el-form-item>
      <!-- 是否外链 -->
      <el-form-item v-if="setType(MenuEnum.TYPE_DIR) || setType(MenuEnum.TYPE_MENU)" label="是否外链" prop="isFrame">
        <el-radio-group v-model="menuForm.isFrame">
          <el-radio :value="CharEnum.YES">是</el-radio>
          <el-radio :value="1">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 路由地址 -->
      <el-form-item v-if="setType(MenuEnum.TYPE_DIR) || setType(MenuEnum.TYPE_MENU)" label="路由地址" prop="path">
        <el-input v-model="menuForm.path" placeholder="请输入路由地址" />
      </el-form-item>
      <!-- 路由组件 -->
      <el-form-item v-if="setType(MenuEnum.TYPE_MENU)" label="路由组件" prop="component">
        <el-input v-model="menuForm.component" placeholder="请输入路由组件" />
      </el-form-item>
      <!-- 路由参数 -->
      <el-form-item v-if="setType(MenuEnum.TYPE_MENU)" label="路由参数" prop="query">
        <el-input v-model="menuForm.query" placeholder="请输入路由参数" />
      </el-form-item>
      <!-- 字符权限 -->
      <el-form-item v-if="setType(MenuEnum.TYPE_MENU) || setType(MenuEnum.TYPE_BUTTON)" label="字符权限" prop="perms">
        <el-input v-model="menuForm.perms" placeholder="请输入路由组件" />
      </el-form-item>
      <!-- 是否缓存 -->
      <el-form-item v-if="setType(MenuEnum.TYPE_MENU)" label="是否缓存" prop="isCache">
        <el-radio-group v-model="menuForm.isCache">
          <el-radio :value="CharEnum.YES">缓存</el-radio>
          <el-radio :value="1">不缓存</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 显示状态 -->
      <el-form-item v-if="setType(MenuEnum.TYPE_DIR) || setType(MenuEnum.TYPE_MENU)" label="显示状态" prop="visible">
        <el-radio-group v-model="menuForm.visible">
          <el-radio :value="CharEnum.YES">显示</el-radio>
          <el-radio :value="1">隐藏</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 菜单状态 -->
      <el-form-item v-if="setType(MenuEnum.TYPE_DIR) || setType(MenuEnum.TYPE_MENU)" label="菜单状态" prop="status">
        <el-radio-group v-model="menuForm.status">
          <el-radio :value="CharEnum.YES">正常</el-radio>
          <el-radio :value="1">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 备注 -->
      <el-form-item label="备注" prop="remark">
        <el-input v-model="menuForm.remark" type="textarea" :rows="2" placeholder="请输入备注" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="submit(menuFormRef)">保存</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { createMenu, menuTreeSelect, updateMenu } from '@/api/system';
import { CodeEnum } from '@/enums/httpEnums';
import { FormInstance, FormRules } from 'element-plus';
import { cloneDeep } from 'lodash-es';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { MenuTreeSelect } from './type';
import feedback from '@/utils/feedback';
import { CharEnum, DialogTypeEnum, MenuEnum, StatusEnum } from '@/enums/dataEnum';

// 获取参数
const props = defineProps({
  status: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['refresh']);

const dialogTitle = ref(props.status === DialogTypeEnum.EDIT ? '编辑菜单' : '新增菜单');
const dialogVisible = ref<boolean>(false);
const menuFormRef = ref<FormInstance>();
const parentMenuListLoading = ref<boolean>(false);

const menuFormInit: any = {
  parentId: 0, // 上级菜单
  menuType: MenuEnum.TYPE_DIR, // 菜单类型
  icon: '#', // 菜单图标
  menuName: '', // 菜单名称
  orderNum: 1, // 显示排序
  isFrame: CharEnum.YES, // 是否外链
  isCache: CharEnum.YES, // 是否缓存
  path: '', // 路由地址
  query: '', // 路由参数
  component: '', // 组件名称
  visible: CharEnum.YES, // 显示状态
  status: StatusEnum.NORMAL, // 菜单状态
  perms: '', // 权限标识
  remark: '',
};
const menuForm = ref(cloneDeep(menuFormInit));
const menuOptions = ref<MenuTreeSelect[]>([]);

const formRules = reactive<FormRules>({
  parentId: [{ required: true, message: '请选择上级菜单', trigger: 'change' }],
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  menuKey: [{ required: true, message: '请输入菜单标识', trigger: 'blur' }],
  orderNum: [{ required: true, message: '请输入显示排序', trigger: 'change' }],
  path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
  remark: [{ max: 200, message: '备注长度不能超过200个字符', trigger: 'blur' }],
});

const setType = computed(() => (type): boolean => {
  return menuForm.value.menuType === type;
});

// 获取树形菜单选项
const getTreeSelect = () => {
  menuOptions.value = [];
  parentMenuListLoading.value = true;
  menuTreeSelect()
    .then((data) => {
      if (data.code === CodeEnum.SUCCESS) {
        menuOptions.value = [{ id: 0, label: '主类目', children: [] }];
        menuOptions.value[0].children.push(...data.data);
        if (props.status === DialogTypeEnum.EDIT) {
          setSelfDisabled(menuForm.value.menuId, menuOptions.value);
        }
      }
    })
    .finally(() => {
      parentMenuListLoading.value = false;
    });
};

// 注意需要筛选，不能设置parentId是自己的id
const setSelfDisabled = (menuId: number, options = menuOptions.value) => {
  options.forEach((item) => {
    if (menuId === item.id) {
      item.disabled = true;
    }
    if (item.children && item.children.length) {
      setSelfDisabled(menuId, item.children);
    }
  });
};

const closeDialog = () => {
  dialogVisible.value = false;
  menuForm.value = cloneDeep(menuFormInit);
  menuFormRef.value.clearValidate();
};

const submit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid) => {
    if (!valid) return;
    if (props.status === DialogTypeEnum.CREATE) {
      // 添加菜单
      createMenu(menuForm.value).then(({ code, msg }) => {
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
      // 更新菜单
      updateMenu(menuForm.value).then(({ code, msg }) => {
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

defineExpose({
  dialogVisible,
  menuForm,
  getTreeSelect,
});
</script>
