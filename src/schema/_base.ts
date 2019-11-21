/**
 * 原生的 DataSchema 对象，用户在配置文件中指定的对象类型
 */
export interface RawDataSchema<T extends string, V> {
  /**
   * 模式类型
   */
  type: T
  /**
   * DataSchema 的唯一标识
   */
  $id?: string
  /**
   * 默认值
   */
  default?: V
  /**
   * 是否必须
   * @default false
   */
  required?: boolean
}


/**
 * 数据模式对象
 */
export interface DataSchema<T extends string, V> {
  /**
   * 模式类型
   */
  readonly type: T
  /**
   * DataSchema 的唯一标识；若指定此值，则可以被引用类型的数据模式对象所引用
   */
  readonly $id?: string
  /**
   * 是否必须
   */
  readonly required: boolean
  /**
   * 默认值
   */
  readonly default?: V
}


export type RDSchema = RawDataSchema<string, any>
export type DSchema = DataSchema<string, any>
