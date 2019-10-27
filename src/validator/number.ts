import { DataValidator, DataValidationResult, DataValidatorFactory } from './_base'
import { NUMBER_V_TYPE as V, NUMBER_T_TYPE as T, NumberDataSchema as DS } from '../schema/number'
import { coverNumber } from '../_util/cover-util'


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

  public static create (schema: DS) {
    return new NumberDataValidator(schema)
  }

  private constructor (schema: DS) {
    this.schema = schema
  }

  /**
   * 包装 NumberDataSchema 的实例，使其具备校验给定数据是否为合法数字的能力
   * @param data
   */
  public validate (data: any): DataValidationResult<T, V, DS> {
    const { schema } = this
    const result = new DataValidationResult<T, V, DS>(schema)
    data = result.baseValidate(data)

    // 若未设置值，则无需进一步校验
    if (data == null) return result

    // 检查是否为数字
    const numberValue = coverNumber(undefined, data)
    if (numberValue.errors.length > 0) {
      return result.addError({
        constraint: 'type',
        reason: `expected a ${ T }, but got ${ data }.\n` + numberValue.errors.join('\n'),
      })
    }

    const value: number = numberValue.value!

    // 检查最小值（可取到）
    if (schema.minimum != null && schema.minimum > value) {
      return result.addError({
        constraint: 'minimum',
        reason: `minimum value expected is ${ schema.minimum }, but got ${ value }.`
      })
    }

    // 检查最大值（可取到）
    if (schema.maximum != null && schema.maximum < value) {
      return result.addError({
        constraint: 'maximum',
        reason: `maximum value expected is ${ schema.minimum }, but got ${ value }.`
      })
    }

    // 检查最小值（不可取到）
    if (schema.exclusiveMinimum != null && schema.exclusiveMinimum >= value) {
      return result.addError({
        constraint: 'exclusiveMinimum',
        reason: `exclusiveMinimum value expected is ${ schema.minimum }, but got ${ value }.`
      })
    }

    // 检查最大值（不可取到）
    if (schema.exclusiveMaximum != null && schema.exclusiveMaximum >= value) {
      return result.addError({
        constraint: 'exclusiveMaximum',
        reason: `exclusiveMaximum value expected is ${ schema.minimum }, but got ${ value }.`
      })
    }

    // 检查枚举值
    if (schema.enum != null && schema.enum.length > 0 && schema.enum.indexOf(value) < 0) {
      return result.addError({
        constraint: 'enum',
        reason: `expected values are ${ schema.enum }, but got ${ value }.`
      })
    }

    // 通过校验
    return result.setValue(value)
  }
}


/**
 * 数字类型的校验器的工厂对象实例
 */
export const numberDataValidatorFactory: DataValidatorFactory<T, V, DS> = NumberDataValidator
