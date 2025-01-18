import { useUserStoreHook } from '@/store/modules/user';
import Axios, { AxiosInstance, AxiosRequestConfig, CustomParamsSerializer } from 'axios';
import { stringify } from 'qs';
import { getToken } from '../auth';
import NProgress from '../progress';
import { MolyHttpError, MolyHttpRequestConfig, MolyHttpResponse, RequestMethods } from './types';

// 相关配置参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
  timeout: 10000,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  // 数组格式参数序列化
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer,
  },
};

class MolyHttp {
  constructor() {
    Axios.defaults.withCredentials = true; //让ajax携带cookie
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  /** token过期后，暂存待执行的请求 */
  private static requests: Function[] = [];

  /** 防止重复刷新token */
  private static isRefreshing = false;

  /** 初始化配置对象 */
  private static initConfig: MolyHttpRequestConfig = {};

  /** 保存当前Axios实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /** 重连原始请求 */
  private static retryOriginalRequest(config: MolyHttpRequestConfig) {
    return new Promise((resolve) => {
      MolyHttp.requests.push((token: string) => {
        config.headers['Authorization'] = token;
        resolve(config);
      });
    });
  }

  /** 请求拦截 */
  private httpInterceptorsRequest(): void {
    MolyHttp.axiosInstance.interceptors.request.use(
      async (config: MolyHttpRequestConfig): Promise<any> => {
        // 开启进度条动画
        NProgress.start();
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof config.beforeRequestCallback === 'function') {
          config.beforeRequestCallback(config);
          return config;
        }
        if (MolyHttp.initConfig.beforeRequestCallback) {
          MolyHttp.initConfig.beforeRequestCallback(config);
          return config;
        }
        /** 请求白名单，放置一些不需要`token`的接口（通过设置请求白名单，防止`token`过期后再请求造成的死循环问题） */
        const whiteList = ['/refresh-token', '/login'];
        // 不是白名单的api，返回新的promise
        return whiteList.some((url) => config.url?.endsWith(url))
          ? config
          : new Promise((resolve) => {
              // 对token判断并进行对应的处理
              const data = getToken();
              if (data) {
                const now = new Date().getTime();
                const expired = parseInt(data.expired) - now <= 0;
                if (expired) {
                  // 如果token过期， 并不在刷新状态
                  if (!MolyHttp.isRefreshing) {
                    MolyHttp.isRefreshing = true;
                    // token过期刷新
                    useUserStoreHook()
                      .handRefreshToken({ refreshToken: data.refreshToken })
                      .then((res) => {
                        // 获取新token
                        const token = res.data.accessToken;
                        config.headers['Authorization'] = token;
                        // 遍历并把token传入缓存的请求列表中
                        MolyHttp.requests.forEach((cb) => cb(token));
                        // 清空缓存的请求列表
                        MolyHttp.requests = [];
                      })
                      .finally(() => {
                        MolyHttp.isRefreshing = false;
                      });
                  }
                  // 将config传入缓存的请求列表
                  resolve(MolyHttp.retryOriginalRequest(config));
                } else {
                  // 没有过期
                  config.headers['Authorization'] = data.accessToken;
                  resolve(config);
                }
              } else {
                resolve(config);
              }
            });
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  /** 响应拦截 */
  private httpInterceptorsResponse(): void {
    const instance = MolyHttp.axiosInstance;
    instance.interceptors.response.use(
      (response: MolyHttpResponse) => {
        const $config = response.config;
        // 关闭进度条动画
        NProgress.done();
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof $config.beforeResponseCallback === 'function') {
          $config.beforeResponseCallback(response);
          return response.data;
        }
        if (MolyHttp.initConfig.beforeResponseCallback) {
          MolyHttp.initConfig.beforeResponseCallback(response);
          return response.data;
        }
        return response.data;
      },
      (error: MolyHttpError) => {
        const $error = error;
        $error.isCancelRequest = Axios.isCancel($error);
        // 关闭进度条动画
        NProgress.done();
        // 所有的响应异常 区分来源为取消请求/非取消请求
        return Promise.reject($error);
      },
    );
  }

  /** 通用请求工具函数 */
  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: MolyHttpRequestConfig,
  ): Promise<T> {
    // 重组配置
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig,
    } as MolyHttpRequestConfig;
    // 单独处理自定义请求/响应回调
    return new Promise<T>((resolve, reject) => {
      MolyHttp.axiosInstance
        .request<any, T>(config)
        .then((response: T) => {
          resolve(response);
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  /** get工具函数 */
  public get<T, P>(url: string, params?: AxiosRequestConfig<P>, config?: MolyHttpRequestConfig): Promise<T> {
    return this.request<T>('get', url, params, config);
  }
  /** post工具函数 */
  public post<T, P>(url: string, params?: AxiosRequestConfig<P>, config?: MolyHttpRequestConfig): Promise<T> {
    return this.request<T>('post', url, params, config);
  }
  /** put工具函数 */
  public put<T, P>(url: string, params?: AxiosRequestConfig<P>, config?: MolyHttpRequestConfig): Promise<T> {
    return this.request<T>('put', url, params, config);
  }
  /** delete工具函数 */
  public delete<T, P>(url: string, params?: AxiosRequestConfig<P>, config?: MolyHttpRequestConfig): Promise<T> {
    return this.request<T>('delete', url, params, config);
  }
}

export const http = new MolyHttp();
