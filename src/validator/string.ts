import { DataValidator, DataValidationResult, DataValidatorFactory } from './_base'
import { STRING_V_TYPE as V, STRING_T_TYPE as T, StringDataSchema as DS, StringFormat } from '../schema/string'
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
    const value = result.validateBaseType(coverString, data)!
    if (result.hasError) return result

    // 检查 minLength
    if (schema.minLength != null && schema.minLength > value.length) {
      return result.addError({
        constraint: 'minLength',
        reason: `minLength expected is ${ schema.minLength }, but got value (${ stringify(value) }) with length (${ value.length }).`
      })
    }

    // 检查 maxLength
    if (schema.maxLength != null && schema.maxLength < value.length) {
      return result.addError({
        constraint: 'maxLength',
        reason: `maxLength expected is ${ schema.maxLength }, but got value (${ stringify(value) }) with length (${ value.length }).`
      })
    }

    // 检查是否匹配指定的模式
    if (schema.pattern != null && !schema.pattern.test(value)) {
      return result.addError({
        constraint: 'pattern',
        reason: `expected value pattern is (${ stringify(schema.pattern.source) }), but got (${ stringify(value) }).`
      })
    }

    // 检查 format
    if (schema.format != null && schema.format.length > 0) {
      let valid = false
      for (const format of schema.format) {
        const test = () => {
          if (format === StringFormat.IPV4) {
            // see https://stackoverflow.com/a/25969006
            const regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
            return regex.test(value)
          }
          if (format === StringFormat.IPV6) {
            // see https://stackoverflow.com/a/17871737
            const regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/
            return regex.test(value)
          }
          if (format === StringFormat.EMAIL) {
            // see https://stackoverflow.com/a/1373724
            const regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
            return regex.test(value)
          }
          return false
        }

        // 校验通过
        if (test()) {
          valid = true
          break
        }
      }
      if (!valid) {
        return result.addError({
          constraint: 'format',
          reason: `not matched any of ${ stringify(schema.format) }`,
        })
      }
    }

    // 检查枚举值
    if (schema.enum != null && schema.enum.length > 0 && schema.enum.indexOf(value) < 0) {
      return result.addError({
        constraint: 'enum',
        reason: `expected value should in the ${ stringify(schema.enum) }, but got (${ stringify(value) }).`
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
