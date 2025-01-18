/** 处理主题颜色的工具 */

/** hex转rgb */
const hexToRgb = (str) => {
  let hxs = str.replace('#', '').match(/../g);
  for (let i = 0; i < 3; i++) {
    hxs[i] = parseInt(hxs[i], 16);
  }
  return hxs;
};

/** rgb转hex */
const rgbToHex = (a, b, c) => {
  let hexs = [a.toString(16), b.toString(16), c.toString(16)];
  for (let i = 0; i < 3; i++) {
    if (hexs[i].length == 1) hexs[i] = `0${hexs[i]}`;
  }
  return `#${hexs.join('')}`;
};

/** 加深颜色值 */
export const darken = (color: string, level: number) => {
  let rgbc = hexToRgb(color);
  for (let i = 0; i < 3; i++) {
    rgbc[i] = Math.floor(rgbc[i] * (1 - level));
  }
  return rgbToHex(rgbc[0], rgbc[1], rgbc[2]);
};

/** 变浅颜色值 */
export const lighten = (color: string, level: number) => {
  let rgbc = hexToRgb(color);
  for (let i = 0; i < 3; i++) rgbc[i] = Math.floor((255 - rgbc[i]) * level + rgbc[i]);
  return rgbToHex(rgbc[0], rgbc[1], rgbc[2]);
};

