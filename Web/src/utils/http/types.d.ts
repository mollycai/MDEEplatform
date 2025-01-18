import { Method, AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';

export type RequestMethods = Extract<Method, 'get' | 'post' | 'put' | 'delete' | 'patch' | 'option' | 'head'>;

export interface MolyHttpError extends AxiosError {
  isCancelRequest?: boolean;
}

export interface MolyHttpResponse extends AxiosResponse {
  config: MolyHttpRequestConfig;
}

export interface MolyHttpRequestConfig extends AxiosRequestConfig {
  beforeRequestCallback?: (request: MolyHttpRequestConfig) => void;
  beforeResponseCallback?: (Response: MolyHttpResponse) => void;
}

export default class MolyHttp {}
