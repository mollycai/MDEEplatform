/**
 * @description: 将所有所有布局样式导出
 */
const modules: Record<string, any> = import.meta.glob('./*.vue', { eager: true });

const switchLayoutList: any[] = [];
for (const path in modules) {
  switchLayoutList.push(modules[path].default);
}

export default switchLayoutList;
