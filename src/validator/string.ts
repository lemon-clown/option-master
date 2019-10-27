import { DataValidator, DataValidationResult, DataValidatorFactory } from './_base'
import { STRING_V_TYPE as V, STRING_T_TYPE as T, StringDataSchema as DS } from '../schema/string'
import { coverString } from '../cover-util'


/**
 * StringDataSchema 校验结果的数据类型
 */
export type StringDataValidationResult = DataValidationResult<T, V, DS>


/**
 * 字符串类型的校验器
 */
export class StringDataValidator implements DataValidator<T, V, DS> {
  private readonly schema: DS
  public readonly type: T = T

  public static create (schema: DS) {
    return new StringDataValidator(schema)
  }

  private constructor (schema: DS) {
    this.schema = schema
  }

  /**
   * 包装 StringDataSchema 的实例，使其具备校验给定数据是否为合法字符串的能力
   * @param data
   */
  public validate (data: any): DataValidationResult<T, V, DS> {
    const { schema } = this
    const result = new DataValidationResult<T, V, DS>(schema)
    data = result.baseValidate(data)

    // 若未设置值，则无需进一步校验
    if (data == null) return result

    // 检查是否为字符串
    const stringValue = coverString(undefined, data)
    if (stringValue.errors.length > 0) {
      return result.addError({
        constraint: 'type',
        reason: `expected a ${ T }, but got ${ data }.\n` + stringValue.errors.join('\n'),
      })
    }

    const value: string = stringValue.value!

    // 检查是否匹配指定的模式
    if (schema.pattern != null && !schema.pattern.test(value)) {
      return result.addError({
        constraint: 'pattern',
        reason: `expected value pattern is ${ schema.pattern.source }, but got ${ value }.`
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
 * 字符串类型的校验器的工厂对象实例
 */
export const stringDataValidatorFactory: DataValidatorFactory<T, V, DS> = StringDataValidator
