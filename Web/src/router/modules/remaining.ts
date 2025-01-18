export default [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/login.vue'),
    meta: {
      title: '登录',
      showLink: false,
      rank: 101,
    },
  },
] satisfies Array<RouteConfigsTable>;
