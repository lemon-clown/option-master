/**
 * 原生的 DataSchema 对象，用户在配置文件中指定的对象类型
 */
export interface RawDataSchema<T extends string, V> {
  /**
   * 模式类型
   */
  type: T
  /**
   * 属性路径，当前待解析的 RawDataSchema 在其所定义的数据类型树中的路径
   */
  path: string
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
   * 属性路径，当前待解析的 DataSchema 在其所定义的数据类型树中的路径
   */
  readonly path: string
  /**
   * 是否必须
   */
  readonly required: boolean
  /**
   * 默认值
   */
  readonly default?: V
}
