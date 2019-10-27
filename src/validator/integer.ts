import { DataValidator, DataValidationResult, DataValidatorFactory } from './_base'
import { INTEGER_V_TYPE as V, INTEGER_T_TYPE as T, IntegerDataSchema as DS } from '../schema/integer'
import { coverInteger } from '../_util/cover-util'
import { stringify } from '../_util/type-util'


/**
 * IntegerDataSchema 校验结果的数据类型
 */
export type IntegerDataValidationResult = DataValidationResult<T, V, DS>


/**
 * 整数类型的校验器
 */
export class IntegerDataValidator implements DataValidator<T, V, DS> {
  private readonly schema: DS
  public readonly type: T = T

  public constructor (schema: DS) {
    this.schema = schema
  }

  /**
   * 包装 IntegerDataSchema 的实例，使其具备校验给定数据是否为合法整数的能力
   * @param data
   */
  public validate (data: any): IntegerDataValidationResult {
    const { schema } = this
    const result: IntegerDataValidationResult = new DataValidationResult(schema)
    data = result.baseValidate(data)

    // 若未设置值，则无需进一步校验
    if (data == null) return result

    // 检查是否为整数
    const integerValue = coverInteger(undefined, data)
    if (integerValue.errors.length > 0) {
      return result.addError({
        constraint: 'type',
        reason: `expected a ${ T }, but got ${ stringify(data) }.\n` + integerValue.errors.join('\n'),
      })
    }

    const value: number = integerValue.value!

    // 检查最小值（可取到）
    if (schema.minimum != null && schema.minimum > value) {
      return result.addError({
        constraint: 'minimum',
        reason: `minimum value expected is ${ schema.minimum }, but got ${ stringify(value) }.`
      })
    }

    // 检查最大值（可取到）
    if (schema.maximum != null && schema.maximum < value) {
      return result.addError({
        constraint: 'maximum',
        reason: `maximum value expected is ${ schema.minimum }, but got ${ stringify(value) }.`
      })
    }

    // 检查最小值（不可取到）
    if (schema.exclusiveMinimum != null && schema.exclusiveMinimum >= value) {
      return result.addError({
        constraint: 'exclusiveMinimum',
        reason: `exclusiveMinimum value expected is ${ schema.minimum }, but got ${ stringify(value) }.`
      })
    }

    // 检查最大值（不可取到）
    if (schema.exclusiveMaximum != null && schema.exclusiveMaximum >= value) {
      return result.addError({
        constraint: 'exclusiveMaximum',
        reason: `exclusiveMaximum value expected is ${ schema.minimum }, but got ${ stringify(value) }.`
      })
    }

    // 检查枚举值
    if (schema.enum != null && schema.enum.length > 0 && schema.enum.indexOf(value) < 0) {
      return result.addError({
        constraint: 'enum',
        reason: `expected values are ${ schema.enum }, but got ${ stringify(value) }.`
      })
    }

    // 通过校验
    return result.setValue(value)
  }
}


/**
 * 整数类型的校验器的工厂对象
 */
export class IntegerDataValidatorFactory implements DataValidatorFactory<T, V, DS> {
  public readonly type: T = T

  public create(schema: DS) {
    return new IntegerDataValidator(schema)
  }
}
