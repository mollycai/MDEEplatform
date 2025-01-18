import { http } from '@/utils/http';

export function getAllUser() {
  return http.request<any>('get', '/api/get/hello');
}
