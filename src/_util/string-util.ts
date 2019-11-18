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
