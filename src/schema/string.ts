import { DataSchema, RawDataSchema } from './_base'


// IntegerDataSchema.type 的类型
export const STRING_T_TYPE = 'string'
export type STRING_T_TYPE = typeof STRING_T_TYPE

// IntegerDataSchema.value 的类型
export type STRING_V_TYPE = string


/**
 * 原生的字符串类型数据模式，用户在配置文件中指定的对象类型
 * 参见 https://json-schema.org/understanding-json-schema/reference/string.html
 */
export interface RawStringDataSchema extends RawDataSchema<STRING_T_TYPE, STRING_V_TYPE> {
  /**
   * 字符串的模式
   */
  pattern?: string
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
   * 字符串的模式
   */
  pattern?: RegExp
  /**
   * 枚举项列表，数据项的值包括 default 均需为 enum 中的值
   */
  enum?: string[]
}
