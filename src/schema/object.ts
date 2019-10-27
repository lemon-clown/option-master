import { DataSchema, RawDataSchema } from './_base'
import { RawStringDataSchema, StringDataSchema } from './string'


// ObjectDataSchema.type 的类型
export const OBJECT_T_TYPE = 'object'
export type OBJECT_T_TYPE = typeof OBJECT_T_TYPE

// ObjectDataSchema.value 的类型
export type OBJECT_V_TYPE = any[]


/**
 * 原生的对象类型数据选项，用户在配置文件中指定的对象类型
 * 参见 https://json-schema.org/understanding-json-schema/reference/object.html
 */
export interface RawObjectDataSchema extends RawDataSchema<OBJECT_T_TYPE, OBJECT_V_TYPE> {
  /**
   * 对象属性的类型，定义对象可能出现的若干属性的属性名及其类型
   * 参见 https://json-schema.org/understanding-json-schema/reference/object.html#properties
   */
  properties?: { [key: string]: RawDataSchema<string, any> }
  /**
   * 是否允许其它额外的属性，若为 false 且指定了 properties，
   * 则对象中只有 properties 中出现的属性会被采用，其它的属性将被忽略，
   * 如下的 Schema 中，数据对象不能出现除 `name` 以外的其它属性（解析器/校验器会忽略这些额外的属性）：
   *  {
   *    properties: {
   *      name: { type: 'string' }
   *    },
   *    additionalProperties: false
   *  }
   *
   * @default false
   */
  allowAdditionalProperties?: boolean
  /**
   * 对象属性名的数据类型
   * 参见 https://json-schema.org/understanding-json-schema/reference/object.html#property-names
   */
  propertyNames?: RawStringDataSchema
  /**
   * 定义对象的属性的依赖，如：若定义了属性 A，属性 B 和 C 必须出现，则可以定义为：
   * {
   *   ...
   *   dependencies: {
   *     A: ['B', 'C']
   *   }
   *   ...
   * }
   *
   * 参见 https://json-schema.org/understanding-json-schema/reference/object.html#dependencies
   */
  dependencies?: { [key: string]: string[] }
}


/**
 * 对象类型的数据选项
 */
export interface ObjectDataSchema extends DataSchema<OBJECT_T_TYPE, OBJECT_V_TYPE> {
  /**
   * 是否允许其它额外的属性，若为 false 且指定了 properties，
   * 则对象中只有 properties 中出现的属性会被采用，其它的属性将被忽略
   */
  allowAdditionalProperties: boolean
  /**
   * 对象属性的类型
   */
  properties?: { [key: string]: DataSchema<string, any> }
  /**
   * 对象属性名的数据类型
   */
  propertyNames?: StringDataSchema
  /**
   * 定义对象的属性的依赖，如：若定义了属性 A，属性 B 和 C 必须出现，则可以定义为：
   */
  dependencies?: { [key: string]: string[] }
}
