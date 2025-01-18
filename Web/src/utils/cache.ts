import { cacheType } from '@/enums/cacheEnums';
import { isEmpty } from 'lodash-es';

const prefixKey = 'MOLY_ADMIN_';

/**
 * @description WebStorage缓存工具类
 */
export class WebStroage {
  private storage: Storage;

  constructor(type: cacheType) {
    this.storage = type === cacheType.LOCAL ? localStorage : sessionStorage;
  }

  private getKey(key: string): string {
    return `${prefixKey}${key}`.toUpperCase();
  }

  getKeyWithExpire<T>(key: string): T {
    key = this.getKey(key);
    const data = this.storage.getItem(key);
    if (!data) {
      return;
    }
    const { expire, value } = JSON.parse(data);
    if (expire && expire < this.time()) {
      this.storage.removeItem(key);
      return null;
    }
    return value;
  }

  setKeyWithExpire<T>(key: string, value: T, expire?: string): void {
    key = this.getKey(key);
    // 设置缓存（expire是缓存时效）
    let data: any = {
      expire: expire ? this.time() + expire : '',
      value,
    };
    data = JSON.stringify(data);
    this.storage.setItem(key, data);
  }

  get<T>(key: string): T {
    // 设置缓存时间好像暂时没必要，这又会与useStorage的功能有点冲突
    const value = this.storage.getItem(key);
    if (value) {
      return JSON.parse(value);
    }
  }

  set<T>(key: string, value: T): void {
    if (!isEmpty(value)) {
      this.storage.setItem(key, JSON.stringify(value));
    }
  }

  remove(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    this.storage.clear();
  }

  time(): number {
    return Math.round(new Date().getTime() / 1000);
  }
}

const localCache = new WebStroage(cacheType.LOCAL);
const sessionCache = new WebStroage(cacheType.SESSION);

export { localCache, sessionCache };
