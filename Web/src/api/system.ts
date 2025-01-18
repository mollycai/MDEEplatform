import { http } from '@/utils/http';
import { PaginatingDto, PaginatingResult, Result } from './type';

interface ListRoleDto extends PaginatingDto {
  roleId?: string;
  roleName?: string;
  roleKey?: string;
  status?: string;
}

interface CreateRoleDto {
  roleName: string;
  roleKey: string;
  menuIds?: Array<number>;
  deptIds?: Array<number>;
  roleSort?: number;
  status: string;
  dataScope?: string;
  remark?: string;
  menuCheckStrictly?: boolean;
  deptCheckStrictly?: boolean;
}

interface UpdateRoleDto extends CreateRoleDto {
  roleId: number;
}

interface AllocatedListDto extends PaginatingDto {
  userName?: string;
  roleId: number;
}

interface BatchAuthDto {
  roleId: number;
  userIds: number[];
}

interface ListUserDto extends PaginatingDto {
  userId?: number;
  userName?: string;
  nickName?: string;
  phoneNumber?: string;
  status?: string;
}

interface CreateUserDto {
  deptId?: number;
  roleIds: number[];
  postId?: number;
  userName: string;
  nickName: string;
  password: string;
  email?: string;
  phoneNumber?: string;
  sex?: string;
  avatar?: string;
  status?: string;
  remark?: string;
}

interface UpdateUserDto extends CreateUserDto {
  userId: number;
}

interface MenuParamsDto {
  menuName?: string;
  status?: string;
}

interface CreateMenuDto {
  menuName: string;
  menuKey: string;
  parentId?: number;
  orderNum?: number;
  path?: string;
  component?: string;
  query?: string;
  isFrame?: number;
  isCache?: number;
  menuType: string;
  visible?: number;
  status?: number;
  perms?: string;
  icon?: string;
  remark?: string;
}

interface UpdateMenuDto extends CreateMenuDto {
  menuId: number;
}

/**
 *获取角色列表
 * @param listRoleDto
 * @returns
 */
export const getAllRoles = (listRoleDto: ListRoleDto) => {
  return http.request<PaginatingResult>('get', '/api/system/role', {
    params: listRoleDto,
  });
};

/**
 * 创建角色
 * @param createRoleDto
 * @returns
 */
export const createRole = (createRoleDto: CreateRoleDto) => {
  return http.request<Result>('post', '/api/system/role', {
    data: createRoleDto,
  });
};

/**
 * 更新角色
 * @param updateRoleDto
 * @returns
 */
export const updateRole = (updateRoleDto: UpdateRoleDto) => {
  return http.request<Result>('put', '/api/system/role', {
    data: updateRoleDto,
  });
};

/**
 * 删除角色
 * @param roleIds
 * @returns
 */
export const removeRole = (roleIds: number[]) => {
  return http.request<Result>('delete', `/api/system/role`, {
    data: {
      roleIds,
    },
  });
};

/**
 * 获取某角色下的已分配用户列表
 * @param allocatedListDto
 * @returns
 */
export const getAllocatedUsersByRoleId = (allocatedListDto: AllocatedListDto) => {
  return http.request<PaginatingResult>('get', '/api/system/role/auth/allocated', {
    params: allocatedListDto,
  });
};

/**
 * 获取某角色下未分配的用户列表
 * @param allocatedListDto
 * @returns
 */
export const getUnallocatedUsersByRoleId = (allocatedListDto: AllocatedListDto) => {
  return http.request<PaginatingResult>('get', '/api/system/role/auth/unallocated', {
    params: allocatedListDto,
  });
};

/**
 * 根据角色查询菜单列表
 * @param roleId
 * @returns
 */
export const roleMenuTreeSelect = (roleId: number) => {
  return http.request<Result>('get', '/api/system/role/roleMenuTreeSelect', {
    params: {
      roleId,
    },
  });
};

/**
 * 查询所有菜单列表
 * @param roleId
 * @returns
 */
export const menuTreeSelect = () => {
  return http.request<Result>('get', '/api/system/role/menuTreeSelect');
};

/**
 * 批量授权用户到角色
 * @param authDto
 * @returns
 */
export const batchAuthorizeUsers = (authDto: BatchAuthDto) => {
  return http.request<Result>('post', '/api/system/role/auth/grant', {
    data: authDto,
  });
};

/**
 * 批量解除用户授权
 * @param revokeDto
 * @returns
 */
export const batchRevokeUsers = (revokeDto: BatchAuthDto) => {
  return http.request<Result>('post', '/api/system/role/auth/cancel', {
    data: revokeDto,
  });
};

/**
 * 根据角色ID获取菜单
 * @param roleId
 * @returns
 */
export const getMenusByRoleId = (roleId: number) => {
  return http.request<Result>('get', `/api/system/role/roleMenuTreeSelect`, {
    params: {
      roleId,
    },
  });
};

/**
 * 获取用户列表
 * @param listUserDto
 * @returns
 */
export const getAllUsers = (listUserDto: ListUserDto) => {
  return http.request<Result>('get', '/api/system/user', {
    params: listUserDto,
  });
};

/**
 * 创建用户
 * @param createUserDto
 * @returns
 */
export const createUser = (createUserDto: CreateUserDto) => {
  return http.request<Result>('post', '/api/system/user', {
    data: createUserDto,
  });
};

/**
 * 更新用户
 * @param updateUserDto
 * @returns
 */
export const updateUser = (updateUserDto: UpdateUserDto) => {
  return http.request<Result>('put', '/api/system/user', {
    data: updateUserDto,
  });
};

/**
 * 删除用户
 * @param userId
 * @returns
 */
export const removeUser = (userIds: number[]) => {
  return http.request<Result>('delete', `/api/system/user`, {
    data: {
      userIds,
    },
  });
};

/**
 * 获取角色选项
 */
export const getRoleOptions = () => {
  return http.request<Result>('get', `/api/system/user/roleOptions`);
};

/**
 * 根据用户ID获取角色列表
 * @param userId
 * @returns
 */
export const getRolesByUserId = (userId: number) => {
  return http.request<Result>('get', `/api/system/user/role`, {
    params: {
      userId,
    },
  });
};

/**
 * 获取菜单列表
 * @param queryParams 查询参数
 * @returns
 */
export const getAllMenus = (menuParamsDto?: MenuParamsDto) => {
  return http.request<Result>('get', '/api/system/menu', {
    params: menuParamsDto,
  });
};

/**
 * 创建菜单
 * @param createMenuDto
 * @returns
 */
export const createMenu = (createMenuDto: CreateMenuDto) => {
  return http.request<Result>('post', '/api/system/menu', {
    data: createMenuDto,
  });
};

/**
 * 更新菜单
 * @param menuId 菜单ID
 * @param updateMenuDto
 * @returns
 */
export const updateMenu = (updateMenuDto: UpdateMenuDto) => {
  return http.request<Result>('put', `/api/system/menu/`, {
    data: updateMenuDto,
  });
};

/**
 * 删除菜单
 * @param menuId 菜单ID
 * @returns
 */
export const removeMenu = (menuId: number) => {
  return http.request<Result>('delete', `/api/system/menu`, {
    data: {
      menuId,
    },
  });
};
