import { DataValidator, DataValidationResult, DataValidatorFactory } from './_base'
import { DataSchema } from '../schema/_base'


type T = string
type V = any
type DS = DataSchema<T, V>
export type DValidator = DataValidator<T, V, DS>
export type DValidatorFactory = DataValidatorFactory<T, V, DS>
export type DValidationResult = DataValidationResult<T, V, DS>


/**
 * DataValidatorFactory 的控制器
 *  - 注册操作：使得一个用户自定义的 Schema 类型对应的数据能被正确校验
 *  - 替换操作：替换一个原有类型的数据校验器
 *  - 解析操作：对于指定的 Schema 对象和数据对象，校验数据是否符合此 Schema 的定义
 */
export class DataValidatorMaster {
  /**
   * DataSchema.type 和 DataValidator 的映射
   */
  private readonly validatorFactoryMap: Map<string, DValidatorFactory> = new Map()

  /**
   * 添加 DataValidatorFactory，若指定的 type 已存在，则忽略此次添加
   * @param type
   * @param DataValidatorFactory
   */
  public registerValidatorFactory (type: string, DataValidatorFactory: DValidatorFactory): void {
    if (this.validatorFactoryMap.has(type)) return
    this.validatorFactoryMap.set(type, DataValidatorFactory)
  }

  /**
   * 覆盖已有的 DataValidatorFactory，若指定的 type 之前没有对应的 DataSchemaParser，也做添加操作
   * @param type
   * @param dataValidatorFactory
   */
  public replaceValidatorFactory (type: string, dataValidatorFactory: DValidatorFactory) {
    this.validatorFactoryMap.set(type, dataValidatorFactory)
  }

  /**
   * 执行解析操作
   * @param schema
   * @param data
   */
  public validate(schema: DS, data: any): DValidationResult {
    // 获取 DataValidatorFactory
    const validatorFactory = this.validatorFactoryMap.get(schema.type)
    if (validatorFactory == null) {
      const result: DValidationResult = new DataValidationResult(schema)
      return result.addError({
        constraint: 'type',
        reason: `unknown schema type: ${ schema.type }.`
      })
    }

    // 创建 DataValidator，并返回其校验结果
    const validator = validatorFactory.create(schema)
    return validator.validate(data)
  }
}
