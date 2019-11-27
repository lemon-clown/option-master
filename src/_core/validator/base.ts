import { stringify } from '../../_util/type-util'
import { DataSchema } from '../schema'
import { DataValidationResult } from './result'
import { DataValidatorFactory, DataValidatorContext, DataValidator } from './types'


/**
 * Data validator: Encapsulates a DataSchema instance with the ability to
 * verify that the data conforms to its defined data type
 *
 * 数据校验器：封装 DataSchema 实例，使其具备校验数据是否符合其定义的数据类型的能力
 * @template T    typeof <X>DataSchema.type
 * @template V    typeof <X>DataSchema.V
 * @template DS   typeof <X>DataSchema
 */
export abstract class BaseDataValidator<T extends string, V, DS extends DataSchema<T, V>>
  implements DataValidator<T, V, DS> {
  /**
   * override method
   * @see DataValidator#type
   */
  public abstract readonly type: T
  /**
   * 校验器使用的数据模式
   */
  protected readonly schema: DS

  protected readonly context: DataValidatorContext

  public constructor(schema: DS, context: DataValidatorContext) {
    this.schema = schema
    this.context = context
  }

  /**
   * override method
   * @see DataValidator#validate
   */
  public validate(data: any): DataValidationResult<T, V, DS> {
    const { schema } = this
    const result: DataValidationResult<T, V, DS> = new DataValidationResult(schema)

    // 检查是否为置任何值
    if (data == null) {
      // 检查 DataSchema 中是否有默认值
      if (schema.default != null) {
        data = schema.default as V
      }
    }

    // 检查是否为必填项
    if (schema.required && data == null) {
      result.addError({
        constraint: 'required',
        reason: `required, but got (${ stringify(data) }).`
      })
    }

    // 如果存在错误，则不能设置值
    if (result.hasError) return result

    // 通过校验
    return result.setValue(data)
  }
}


/**
 * DataValidator 的工厂类
 */
export abstract class BaseDataValidatorFactory<T extends string, V, DS extends DataSchema<T, V>>
  implements DataValidatorFactory<T, V, DS> {
  /**
   * override method
   * @see DataValidatorFactory#type
   */
  public abstract readonly type: T

  protected readonly context: DataValidatorContext

  public constructor(context: DataValidatorContext) {
    this.context = context
  }

  /**
   * override method
   * @see DataValidatorFactory#create
   */
  public abstract create(schema: DS): DataValidator<T, V, DS>
}
