/**
 * 判断是否为数字
 * @param x
 */
export function isNumber(x: any): x is number {
  return Object.prototype.toString.call(x) === '[object Number]'
}


/**
 * 判断是否为字符串
 * @param x
 */
export function isString(x: any): x is string {
  return Object.prototype.toString.call(x) === '[object String]'
}


/**
 * 判断是否为数字或内容为有效数字的字符串
 * @param x
 */
export function isNumberLike(x: any): x is (number | string) {
  if (typeof x === 'number') return true
  return isString(x) && !Number.isNaN(Number(x))
}


/**
 * 判断是否为数组
 * @param x
 */
export function isArray(x: any): x is any[] {
  return Array.isArray(x)
}

/**
 * 判断是否为对象
 * @param x
 */
export function isObject(x: any): x is object {
  return x != null && typeof x === 'object'
}


/**
 * 将字符串转为数字，要求整个字符串的内容为合法的数字，否则返回 NaN
 * @param x
 */
export function convertToNumber(x: string | number): number {
  return Number(x)
}


/**
 * 将对象内容转成字符串
 * @param x
 */
export function stringify (x: any) {
  if (x == null) return '' + x
  if (typeof x === 'object') return JSON.stringify(x)
  return '' + x
}
