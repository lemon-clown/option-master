import camelcase from 'camelcase'


/**
 * 转为驼峰式(首字母大写)
 * @param s
 */
export function toCamelCase (s: string): string {
  return camelcase(s, { pascalCase: true })
}


/**
 * 转为小写驼峰式(首字母小写)
 * @param s
 */
export function toLittleCamelCase(s: string): string {
  return camelcase(s, {pascalCase: false})
}


/**
 * 转为串式
 * @param s
 * @see https://gist.github.com/thevangelist/8ff91bac947018c9f3bfaad6487fa149#gistcomment-2870157
 */
export function toKebabCase(s: string): string {
  let m = s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
  if (m == null) return ''
  return m.map(x => x.toLowerCase()).join('-')
}
