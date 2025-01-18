// 这里存放本地图标，在 src/layout/index.vue 文件中加载，避免在首启动加载
import { addIcon } from '@iconify/vue/dist/offline';

// 本地菜单图标，后端在路由的 icon 中返回对应的图标字符串并且前端在此处使用 addIcon 添加即可渲染菜单图标

// @iconify-icons/ep
import Delete from '@iconify-icons/ep/delete';
import Edit from '@iconify-icons/ep/edit';
import HomeFilled from '@iconify-icons/ep/home-filled';
import Key from '@iconify-icons/ep/key';
import Setting from '@iconify-icons/ep/setting';
import User from '@iconify-icons/ep/user';
import Add from '@iconify-icons/ep/plus';
addIcon('ep:setting', Setting);
addIcon('ep:home-filled', HomeFilled);
addIcon('ep:edit', Edit);
addIcon('ep:delete', Delete);
addIcon('ep:key', Key);
addIcon('ep:user', User);
addIcon('ep:plus', Add);

// @iconify-icons/ri
import InformationLine from '@iconify-icons/ri/information-line';
import Search from '@iconify-icons/ri/search-line';
addIcon('ri:search-line', Search);
addIcon('ri:information-line', InformationLine);
