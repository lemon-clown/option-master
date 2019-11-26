import { stringify } from '../../_util/type-util'
import { DataSchema } from '../schema'
import { DataValidationResult } from './result'
import { DataValidatorFactory, DataValidatorContext, DataValidator } from './types'


/**
 * DataSchema 校验器：
 *  - 封装 DataSchema 实例，使其具备校验数据是否符合其定义的数据类型的能力
 *
 * @template T    typeof <X>DataSchema.type
 * @template V    typeof <X>DataSchema.V
 * @template DS   typeof <X>DataSchema
 */
export abstract class BaseDataValidator<T extends string, V, DS extends DataSchema<T, V>>
  implements DataValidator<T, V, DS> {
  /**
   * 对应 DataSchema 中的 type，用作唯一表示
   * 表示该校验器接收何种类型的 DataSchema 实例
   */
  public abstract readonly type: T

  /**
   * 校验器使用的数据模式
   */
  protected readonly schema: DS

  /**
   *
   */
  protected readonly context: DataValidatorContext

  public constructor(schema: DS, context: DataValidatorContext) {
    this.schema = schema
    this.context = context
  }

  /**
   * 校验数据 & 解析数据（通过 default 等值为计算数据的最终结果）
   * @param data
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
   * 对应 DataSchema 中的 type，用作唯一标识
   * 表示该校验器工厂类生产何种类型的校验器
   */
  public abstract readonly type: T

  protected readonly context: DataValidatorContext

  public constructor(context: DataValidatorContext) {
    this.context = context
  }

  /**
   * 通过 DataSchema 创建与之对应的数据校验器
   * @param schema
   */
  public abstract create(schema: DS): DataValidator<T, V, DS>
}
