import { cloneDeep } from 'lodash-es';
import { isProxy, toRaw } from 'vue';
import { RouteRecordRaw, type RouteComponent } from 'vue-router';

/** 按照路由中meta里的rank等级升序排列 */
export function ascending(arr: any[]) {
  arr.forEach((item, index) => {
    // 没有rank时自动创建，同时保证路由首页在第一位
    if (!item.meta) item.meta = {};
    if (!item.meta || !item.meta.rank) item.meta.rank = index + 1;
  });
  return arr.sort((a: { meta: { rank: number } }, b: { meta: { rank: number } }) => {
    return a?.meta.rank - b?.meta.rank;
  });
}

/** 过滤meta中showLink为false的菜单 */
export function filterTree(data: RouteComponent[]) {
  const newTree = cloneDeep(data).filter((item: { meta: { showLink: boolean } }) => item.meta?.showLink !== false);
  // 递归
  newTree.forEach((item: { children }) => item.children && (item.children = filterTree(item.children)));
  return newTree;
}

/**
 * 将多级嵌套路由处理成一维数组
 * @param routesList 传入路由
 * @returns 返回处理后的一维路由
 */
export function formatFlatteningRoutes(routesList: RouteRecordRaw[]) {
  if (routesList.length === 0) return routesList;
  for (let i = 0; i < routesList.length; i++) {
    if (routesList[i].children) {
      // 如果有children，则取出children并插入到i后面的一个位置
      routesList = routesList.slice(0, i + 1).concat(routesList[i].children, routesList.slice(i + 1));
    }
  }
  return routesList;
}

// 导入全部页面
const viewsRoutes = import.meta.glob('/src/views/**/*.{vue,tsx}');

/** 过滤后端传来的动态路由 重新生成规范路由 */
export function formatAsyncRoute(asyncRoutes: Array<RouteRecordRaw>) {
  if (!asyncRoutes || !asyncRoutes.length) return;
  const viewsRoutesKeys = Object.keys(viewsRoutes);
  asyncRoutes.forEach((route) => {
    // 标记为后端返回的路由
    route.meta.backstage = true;
    // 父级的redirect属性取值：如果子级存在且父级的redirect属性不存在，默认取第一个子级的path
    if (route?.children && route.children.length && !route.redirect) {
      route.redirect = route.children[0].path;
    }
    // 对叶子菜单项添加component，否则继续递归
    if (route?.children && route.children.length) {
      formatAsyncRoute(route.children);
    } else {
      // component组件路径跟path保持一致
      const index = viewsRoutesKeys.findIndex((item) => item.includes(route.path));
      route.component = viewsRoutes[viewsRoutesKeys[index]];
    }
  });
  return asyncRoutes;
}

/** 根据路径查找对应的路由信息 */
export function findRouteByPath(path: string, routes: RouteRecordRaw[]) {
  let res = routes.find((item: { path: string }) => item.path === path);
  if (res) {
    return isProxy ? toRaw(res) : res;
  } else {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].children instanceof Array && routes[i].children.length > 0) {
        res = findRouteByPath(path, routes[i].children);
        if (res) {
          return isProxy ? toRaw(res) : res;
        }
      }
    }
    return null;
  }
}

/** 通过指定的key获取父级路径，默认key为path */
export function getParentPaths(value: string, routes: RouteRecordRaw[], key = 'path') {
  // 回溯
  function dfs(routes: RouteRecordRaw[], value: string, parents: string[]) {
    for (let i = 0; i < routes.length; i++) {
      const item = routes[i];
      // 返回父级path
      if (item[key] === value) return parents;
      // 递归终点
      if (!item.children || !item.children.length) continue;
      // 往下查找时将当前的path入栈
      parents.push(item.path);
      if (dfs(item.children, value, parents).length) return parents;
      // 回溯
      parents.pop();
    }
    return [];
  }
  return dfs(routes, value, []);
}

/**
 * 一维数组处理成多级嵌套数组（三级及以上的路由全部拍成二级，keep-alive 只支持到二级缓存）
 * @param routesList 处理后的一维路由菜单数组
 * @returns 返回将一维数组重新处理成规定路由的格式
 */
export function formatTwoStageRoutes(routesList: RouteRecordRaw[]) {
  if (routesList.length === 0) return routesList;
  const newRoutesList: RouteRecordRaw[] = [];
  routesList.forEach((item: RouteRecordRaw) => {
    if (item.path === '/') {
      newRoutesList.push({
        component: item.component,
        name: item.name,
        path: item.path,
        redirect: item.redirect,
        meta: item.meta,
        children: [],
      });
    } else {
      newRoutesList[0]?.children.push({ ...item });
    }
  });
  return newRoutesList;
}
