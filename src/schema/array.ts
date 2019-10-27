import { DataSchema, RawDataSchema } from './_base'


// ArrayDataSchema.type 的类型
export const ARRAY_T_TYPE = 'array'
export type ARRAY_T_TYPE = typeof ARRAY_T_TYPE

// ArrayDataSchema.value 的类型
export type ARRAY_V_TYPE = any[]


/**
 * 原生的数组类型数据选项，用户在配置文件中指定的对象类型
 * 参见 https://json-schema.org/understanding-json-schema/reference/array.html
 */
export interface RawArrayDataSchema extends RawDataSchema<ARRAY_T_TYPE, ARRAY_V_TYPE> {
  /**
   * 数组元素的类型
   */
  items: RawDataSchema<string, any>
  /**
   * 数组的元素的值是否唯一
   * @default false
   */
  unique?: boolean
}


/**
 * 数组类型的数据选项
 */
export interface ArrayDataSchema extends DataSchema<ARRAY_T_TYPE, ARRAY_V_TYPE> {
  /**
   * 数组元素的类型
   */
  items: DataSchema<string, any>
  /**
   * 数组的元素的值是否唯一
   */
  unique: boolean
}
