export default {
  path: '/',
  name: 'Home',
  component: () => import('@/layout/index.vue'),
  redirect: '/welcome',
  meta: {
    icon: 'ep:home-filled',
    title: '首页',
    rank: 0,
  },
  children: [
    {
      path: '/welcome',
      name: 'Welcome',
      component: () => import('@/views/welcome/index.vue'),
      meta: {
        title: '首页',
      },
    },
  ],
} satisfies RouteConfigsTable;
