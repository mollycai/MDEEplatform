export enum UserPermissions {
  LIST = 'system:user:list',
  ADD = 'system:user:add',
  EDIT = 'system:user:edit',
  REMOVE = 'system:user:remove',
  QUERY = 'system:user:query',
  EXPORT = 'system:user:export',
  IMPORT = 'system:user:import',
  RESETPWD = 'system:user:resetpwd',
}

export enum RolePermissions {
  LIST = 'system:role:list',
  ADD = 'system:role:add',
  EDIT = 'system:role:edit',
  REMOVE = 'system:role:remove',
  QUERY = 'system:role:query',
  EXPORT = 'system:role:export',
}

export enum MenuPermissions {
  LIST = 'system:menu:list',
  ADD = 'system:menu:add',
  EDIT = 'system:menu:edit',
  REMOVE = 'system:menu:remove',
  QUERY = 'system:menu:query',
}

export enum DeptPermissions {
  LIST = 'system:dept:list',
  ADD = 'system:dept:add',
  EDIT = 'system:dept:edit',
  REMOVE = 'system:dept:remove',
  QUERY = 'system:dept:query',
}

export enum PostPermissions {
  LIST = 'system:post:list',
  ADD = 'system:post:add',
  EDIT = 'system:post:edit',
  REMOVE = 'system:post:remove',
  QUERY = 'system:post:query',
}

export enum LogPermissions {
  OPERATE_LIST = 'system:operatelog:list',
  LOGIN_LIST = 'system:loginlog:list',
}

export enum MonitorPermissions {
  ONLINE_LIST = 'monitor:online:list',
  DATA_LIST = 'monitor:data:list',
}

export enum ToolPermissions {
  TEST_LIST = 'tool:test:list',
}
