import { DataSchema, DSchema, TDSchema } from '../schema'
import { DataValidationResult } from './result'


// short format of DataValidationResult (value?: DataSchema)
export type DVResult = DataValidationResult<string, any, DSchema>

// short format of DataValidationResult (value?: TopDataSchema)
export type TDVResult = DataValidationResult<string, any, TDSchema>

// short format of DataValidator
export type DValidator = DataValidator<string, any, DSchema>

// short format of DataValidatorFactory
export type DVFactory = DataValidatorFactory<string, any, DSchema>

// short format of DataValidatorFactoryConstructor
export type DVFactoryConstructor = DataValidatorFactoryConstructor<string, any, DSchema>


/**
 * 数据校验器的上下文
 */
export interface DataValidatorContext {
  /**
   *
   * @param schema
   * @param data
   */
  validateDataSchema(schema: DSchema, data: any): DVResult
  /**
   *
   * @param schema
   * @param data
   */
  validateTopDataSchema(schema: TDSchema, data: any): TDVResult
  /**
   * 通过 $id 获取 DataSchema
   * @param idOrPath
   */
  getDefinition(idOrPath: string): DSchema | undefined
}


/**
 * 数据校验器
 */
export interface DataValidator<T extends string, V, DS extends DataSchema<T, V>> {
  /**
   * 对应 DataSchema 中的 type，用作唯一表示
   * 表示该校验器接收何种类型的 DataSchema 实例
   */
  readonly type: T
  /**
   * 校验数据 & 解析数据（通过 default 等值为计算数据的最终结果）
   * @param data
   */
  validate(data: any): DataValidationResult<T, V, DS>
}


/**
 * 数据校验器的工厂类
 */
export interface DataValidatorFactory<T extends string, V, DS extends DataSchema<T, V>> {
  /**
   * 对应 DataSchema 中的 type，用作唯一标识
   * 表示该校验器工厂类生产何种类型的校验器
   */
  readonly type: T

  /**
   * 通过 DataSchema 创建与之对应的数据校验器
   * @param schema
   */
  create (schema: DS): DataValidator<T, V, DS>
}


/**
 * DataValidator 工厂类的构造函数接口
 */
export interface DataValidatorFactoryConstructor<
  T extends string,
  V,
  DS extends DataSchema<T, V>,
> {
  /**
   *
   */
  new (context: DataValidatorContext): DataValidatorFactory<T, V, DS>
}
