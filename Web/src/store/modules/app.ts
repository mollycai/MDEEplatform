import { defineStore } from 'pinia';
import { store } from '..';
import { deviceType, useDevice } from '@/layout/hooks/useDevice';

export const useAppStore = defineStore({
  id: 'app',
  state: (): any => ({
    sidebar: {
      opened: true,
      isClickCollapse: false, // 判断是否手动点击Collapse
    },
    device: useDevice().device,
    //关于浏览器视口，多端适配的属性
    viewportSize: {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    },
  }),
  getters: {
    getSidebarStatus(state) {
      return state.sidebar.opened;
    },
    getDevice(state) {
      return state.device;
    },
    getSidebarIsClickCollapse(state) {
      return state.sidebar.isClickCollapse;
    },
  },
  actions: {
    toggleSideBar(opened?: boolean, resize?: string) {
      if (opened) {
        this.sidebar.opened = true;
      } else if (!opened && resize) {
        this.sidebar.opened = false;
      } else if (!opened && !resize) {
        this.sidebar.opened = !this.sidebar.opened;
      }
    },
    toggleDevice(device: deviceType) {
      this.device = device;
    },
    setViewportSize(size) {
      this.viewportSize = size;
    },
  },
});

export function useAppStoreHook() {
  return useAppStore(store);
}
