import { getAsyncRoutes } from '@/api/main'; // 动态路由
import { routerNameSpace } from '@/config/constants';
import { useRefresh } from '@/hooks/useRefresh';
import { usePermissionStoreHook } from '@/store/modules/permission';
import { DataInfo, multipleTabsKey, removeToken, userKey } from '@/utils/auth';
import { localCache } from '@/utils/cache';
import NProgress from '@/utils/progress';
import { isURL } from '@/utils/utils';
import Cookies from 'js-cookie';
import { cloneDeep, isEmpty } from 'lodash-es';
import { RouteComponent, RouteRecordRaw, Router, createRouter, createWebHistory } from 'vue-router';
import remainingRouter from './modules/remaining';
import { ascending, formatAsyncRoute, formatFlatteningRoutes, formatTwoStageRoutes } from './utils';

// 自动导入全部静态路由
const modules: Record<string, any> = import.meta.glob(['./modules/**/*.ts', '!./modules/**/remaining.ts'], {
  eager: true,
});

// 原始静态路由（未做任何处理）
const routes = [];
Object.keys(modules).forEach((key) => {
  routes.push(modules[key].default);
});

// 静态路由菜单
export const constantMenus: Array<RouteComponent> = ascending(routes.flat(Infinity)).concat(...remainingRouter);

/** 导出处理后的静态路由 */
export const constantRoutes: Array<RouteRecordRaw> = formatTwoStageRoutes(
  formatFlatteningRoutes(ascending(routes.flat(Infinity))),
);

/** 不参与菜单的路由 */
export const remainingPaths = Object.keys(remainingRouter).map((v) => {
  return remainingRouter[v].path;
});

/** 处理动态路由 */
function handleAsyncRoutes(routeList: any[]) {
  if (routeList.length !== 0) {
    // 获取home路由
    const homeRoute = router.options.routes.filter((item) => item.name === 'Home');
    // 对后端返回的路由进行格式化，重新生成路由规范
    formatAsyncRoute(routeList).map((item: RouteRecordRaw) => {
      // 防止重复添加路由
      if (homeRoute[0].children.findIndex((value) => value.path === item.path) !== -1) {
        return;
      } else {
        // 将路由push到routes后还需要再使用addRoute添加一次，注意要把业务路由加入到Home下
        if (!router.hasRoute(item?.name)) router.addRoute('Home', item);
      }
    });
  }
  usePermissionStoreHook().handleWholeMenus(routeList);
  addPathMatch();
}

function addPathMatch() {
  if (!router.hasRoute('pathMatch')) {
    router.addRoute({
      path: '/:pathMatch(.*)',
      name: 'pathMatch',
      redirect: '/error/404',
    });
  }
}

/** 初始化路由 */
export function initRouter() {
  // @TODO 判断是否缓存动态路由，此处默认缓存
  const key = routerNameSpace;
  const asyncRouteList = localCache.get(key) as any;
  if (asyncRouteList && asyncRouteList?.length > 0) {
    return new Promise((resolve) => {
      handleAsyncRoutes(asyncRouteList);
      resolve(router);
    });
  } else {
    return new Promise((resolve) => {
      const userId = localCache.get<DataInfo<Date>>(userKey).userId;
      getAsyncRoutes(userId).then(({ data }) => {
        handleAsyncRoutes(cloneDeep(data));
        // @考虑一下这里是否需要先过滤权限
        localCache.set(key, data);
        resolve(router);
      });
    });
  }
}

/** 创建路由实例 */
export const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes.concat(...(remainingRouter as any)),
});

/** 重置路由 */
export function resetRouter() {
  router.getRoutes().forEach((route) => {
    const { name, meta } = route;
    if (name && router.hasRoute(name) && meta?.backstage) {
      router.removeRoute(name);
      router.options.routes = formatTwoStageRoutes(formatFlatteningRoutes(ascending(routes.flat(Infinity))));
    }
  });
  usePermissionStoreHook().cleanAllPageCache();
}

const whiteList = ['/login'];

router.beforeEach(async (to: ToRouteType, _from, next) => {
  // @TODO 路由缓存处理机制
  // 获取用户信息
  const userInfo = localCache.get<DataInfo<number>>(userKey);
  NProgress.start();
  // 处理浏览器页面标题
  const externalLink = isURL(to?.name as string);
  if (!externalLink) {
    to.matched.some((item) => {
      if (!item.meta.title) return '';
      document.title = item.meta.title as string;
    });
  }
  // @TODO 刷新（考虑是否还有其他更好的策略）
  useRefresh().refresh();
  /** 如果已经登录并存在登录信息后不能跳转到路由白名单，而是继续保持在当前页面 */
  function toCorrectRoute() {
    whiteList.includes(to.fullPath) ? next(_from.fullPath) : next();
  }
  // 判断是否有权限，下列默认为有权限的操作，无权限需自动重定向到403
  if (Cookies.get(multipleTabsKey) && userInfo) {
    // @TODO 无权限跳转403页面
    // 判断是否是超链接，是的话用特定的打开方式
    if (_from?.name) {
      if (externalLink) {
        // @TODO 打开链接
        NProgress.done();
      } else {
        toCorrectRoute();
      }
    } else {
      // 当没用标签名时，刷新时对多标签页的处理
      if (usePermissionStoreHook().wholeMenus.length === 0 && to.path !== '/login') {
        initRouter().then((router: Router) => {
          // @TODO 考虑下是否需要处理多标签页
          // 确保动态路由完全加入路由列表并且不影响静态路由（
          if (isEmpty(to.name)) router.push(to.fullPath);
        });
      }
      toCorrectRoute();
    }
  } else {
    if (to.path !== '/login') {
      if (whiteList.indexOf(to.path) !== -1) {
        next();
      } else {
        removeToken();
        next({ path: '/login' });
      }
    } else {
      next();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
