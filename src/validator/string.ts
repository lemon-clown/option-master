import { DataValidator, DataValidationResult, DataValidatorFactory } from './_base'
import { STRING_V_TYPE as V, STRING_T_TYPE as T, StringDataSchema as DS } from '../schema/string'
import { coverString } from '../_util/cover-util'
import { stringify } from '../_util/type-util'


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

  public constructor (schema: DS) {
    this.schema = schema
  }

  /**
   * 包装 StringDataSchema 的实例，使其具备校验给定数据是否为合法字符串的能力
   * @param data
   */
  public validate (data: any): StringDataValidationResult {
    const { schema } = this
    const result: StringDataValidationResult = new DataValidationResult(schema)
    data = result.baseValidate(data)

    // 若未设置值，则无需进一步校验
    if (data == null) return result

    // 检查是否为字符串
    const stringValue = coverString(undefined, data)
    if (stringValue.hasError) {
      return result.addError({
        constraint: 'type',
        reason: `expected a ${ T }, but got ${ stringify(data) }.\n` + stringValue.errorSummary,
      })
    }

    const value: string = stringValue.value!

    // 检查是否匹配指定的模式
    if (schema.pattern != null && !schema.pattern.test(value)) {
      return result.addError({
        constraint: 'pattern',
        reason: `expected value pattern is ${ stringify(schema.pattern.source) }, but got ${ stringify(value) }.`
      })
    }

    // 检查枚举值
    if (schema.enum != null && schema.enum.length > 0 && schema.enum.indexOf(value) < 0) {
      return result.addError({
        constraint: 'enum',
        reason: `expected value should in the ${ stringify(schema.enum) }, but got ${ stringify(value) }.`
      })
    }

    // 通过校验
    return result.setValue(value)
  }
}


/**
 * 字符串类型的校验器的工厂对象实例
 */
export class StringDataValidatorFactory implements DataValidatorFactory<T, V, DS> {
  public readonly type: T = T

  public create(schema: DS) {
    return new StringDataValidator(schema)
  }
}
