/**
 * 用 navigator.userAgent + 正则判断是移动端还是PC端
 */

export type deviceType = 'mobile' | 'desktop' | 'unknown';

export function useDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  // PC端
  const isDesktop = /desktop/i.test(userAgent) || /windows|macintosh|linux/i.test(userAgent);
  // 移动端
  const isMobile = /mobile/i.test(userAgent) || /tablet/i.test(userAgent);

  const device = isDesktop ? 'desktop' : isMobile ? 'mobile' : 'unknown';

  return { device };
}
