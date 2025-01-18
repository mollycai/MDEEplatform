import dayjs from 'dayjs';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';

/**
 * 判断是否是url
 * @param url
 * @returns
 */
export function isURL(url: string): boolean {
  const urlPattern = new RegExp(
    '^((https?:)?\\/\\/)?' + // 协议 (可选)
      '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|' + // 域名
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // 或者IP地址 (IPv4)
      '(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*' + // 端口号 (可选) 和路径
      '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + // 查询字符串 (可选)
      '(\\#[-a-zA-Z\\d_]*)?$', // 片段标识符 (可选)
    'i',
  );

  return urlPattern.test(url);
}

/**
 * 格式化日期
 * @param date
 * @returns
 */
export function formatDate(date: string): string {
  return date ? dayjs(date).format('YYYY-MM-DD hh:mm:ss') : '';
}

/**
 * 防抖
 * @param fn
 * @param delay
 * @returns
 */
export const debounceFunction = (fn, delay = 200) => debounce(fn, delay);

/**
 * 节流
 * @param fn
 * @param interval
 * @returns
 */
export const throttleFunction = (fn, interval = 400) => throttle(fn, interval);
