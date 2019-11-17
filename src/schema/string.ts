import { DataSchema, RawDataSchema } from './_base'


// IntegerDataSchema.type 的类型
export const STRING_T_TYPE = 'string'
export type STRING_T_TYPE = typeof STRING_T_TYPE

// IntegerDataSchema.value 的类型
export type STRING_V_TYPE = string


/**
 * 特定类型的字符串格式
 */
export enum StringFormat {
  /**
   * ipv4 地址
   */
  IPV4 = 'ipv4',
  /**
   * ipv6 地址
   */
  IPV6 = 'ipv6',
  /**
   * 邮件格式
   */
  EMAIL = 'email',
}

// StringFormat 集合
export const StringFormatSet = new Set<string>(Object.values(StringFormat))


/**
 * 字符串数据的转换方式
 */
export enum StringTransformType {
  /**
   * 全部转成小写
   */
  LOWERCASE = 'lowercase',
  /**
   * 全部转成大写
   */
  UPPERCASE = 'uppercase',
  /**
   * 清除头尾的空白字符
   */
  TRIM = 'trim',
}


// StringTransformType 集合
export const StringTransformTypeSet = new Set<string>(Object.values(StringTransformType))


/**
 * 原生的字符串类型数据模式，用户在配置文件中指定的对象类型
 * 参见 https://json-schema.org/understanding-json-schema/reference/string.html
 */
export interface RawStringDataSchema extends RawDataSchema<STRING_T_TYPE, STRING_V_TYPE> {
  /**
   * 最小的长度，需大于等于 0
   */
  minLength?: number
  /**
   * 最长的长度，需大于 0
   */
  maxLength?: number
  /**
   * 字符串的模式
   */
  pattern?: string
  /**
   * 预置的模式，和其它属性按照“与”逻辑进行校验
   * 若指定了多个，则表示“或”的关系，如 { format: ['ipv4', 'ipv6' ] } 表示既可为 ipv4 地址也可为 ipv6 地址
   */
  format?: StringFormat | StringFormat[]
  /**
   * 数据转换方式
   * 若指定了多个，则表示“或”的关系，如 { transform: ['lowercase', 'trim' ] } 表示执行 `s.toLowercase().trim()`
   */
  transform?: StringTransformType | StringTransformType[]
  /**
   * 枚举项列表，数据项的值包括 default 均需为 enum 中的值
   */
  enum?: string[]
}


/**
 * 字符串类型的数据模式，解析 RawStringDataSchema 后得到的结果
 */
export interface StringDataSchema extends DataSchema<STRING_T_TYPE, STRING_V_TYPE> {
  /**
   * 最小的长度，需大于等于 0
   */
  minLength?: number
  /**
   * 最长的长度，需大于 0
   */
  maxLength?: number
  /**
   * 字符串的模式
   */
  pattern?: RegExp
  /**
   * 预置的模式，和其它属性按照“与”逻辑进行校验
   * 若指定了多个，则表示“或”的关系，如 { format: ['ipv4', 'ipv6' ] } 表示既可为 ipv4 地址也可为 ipv6 地址
   */
  format?: StringFormat[]
  /**
   * 数据转换方式
   * 若指定了多个，则表示“或”的关系，如 { transform: ['lowercase', 'trim' ] } 表示执行 `s.toLowercase().trim()`
   */
  transform?: StringTransformType | StringTransformType[]
  /**
   * 枚举项列表，数据项的值包括 default 均需为 enum 中的值
   */
  enum?: string[]
}
