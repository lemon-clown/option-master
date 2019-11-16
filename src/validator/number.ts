import { DataValidator, DataValidationResult, DataValidatorFactory } from './_base'
import { NUMBER_V_TYPE as V, NUMBER_T_TYPE as T, NumberDataSchema as DS } from '../schema/number'
import { coverNumber } from '../_util/cover-util'
import { stringify } from '../_util/type-util'


/**
 * NumberDataSchema 校验结果的数据类型
 */
export type NumberDataValidationResult = DataValidationResult<T, V, DS>


/**
 * 数字类型的校验器
 */
export class NumberDataValidator implements DataValidator<T, V, DS> {
  private readonly schema: DS
  public readonly type: T = T

  public constructor (schema: DS) {
    this.schema = schema
  }

  /**
   * 包装 NumberDataSchema 的实例，使其具备校验给定数据是否为合法数字的能力
   * @param data
   */
  public validate (data: any): NumberDataValidationResult {
    const { schema } = this
    const result: NumberDataValidationResult = new DataValidationResult(schema)
    data = result.baseValidate(data)

    // 若未设置值，则无需进一步校验
    if (data == null) return result

    // 检查是否为数字
    const value = result.validateBaseType(coverNumber, data)!
    if (result.hasError) return result

    // 检查最小值（可取到）
    if (schema.minimum != null && schema.minimum > value) {
      return result.addError({
        constraint: 'minimum',
        reason: `minimum value expected is ${ stringify(schema.minimum) }, but got (${ stringify(value) }).`
      })
    }

    // 检查最大值（可取到）
    if (schema.maximum != null && schema.maximum < value) {
      return result.addError({
        constraint: 'maximum',
        reason: `maximum value expected is ${ stringify(schema.maximum) }, but got (${ stringify(value) }).`
      })
    }

    // 检查最小值（不可取到）
    if (schema.exclusiveMinimum != null && schema.exclusiveMinimum >= value) {
      return result.addError({
        constraint: 'exclusiveMinimum',
        reason: `exclusiveMinimum value expected is ${ stringify(schema.exclusiveMinimum) }, but got (${ stringify(value) }).`
      })
    }

    // 检查最大值（不可取到）
    if (schema.exclusiveMaximum != null && schema.exclusiveMaximum <= value) {
      return result.addError({
        constraint: 'exclusiveMaximum',
        reason: `exclusiveMaximum value expected is ${ stringify(schema.exclusiveMaximum) }, but got (${ stringify(value) }).`
      })
    }

    // 检查枚举值
    if (schema.enum != null && schema.enum.length > 0 && schema.enum.indexOf(value) < 0) {
      return result.addError({
        constraint: 'enum',
        reason: `expected values are ${ stringify(schema.enum) }, but got (${ stringify(value) }).`
      })
    }

    // 通过校验
    return result.setValue(value)
  }
}


/**
 * 数字类型的校验器的工厂对象实例
 */

export class NumberDataValidatorFactory extends DataValidatorFactory<T, V, DS> {
  public readonly type: T = T

  public create(schema: DS) {
    return new NumberDataValidator(schema)
  }
}
