import { DataSchemaParser, DataSchemaParseResult } from './_base'
import { STRING_V_TYPE as V, STRING_T_TYPE as T, RawStringDataSchema as RDS, StringDataSchema as DS } from '../schema/string'
import { coverString, coverBoolean, coverArray, coverRegex, coverInteger } from '../_util/cover-util'


/**
 * StringDataSchema 解析结果的数据类型
 */
export type StringDataSchemaParserResult = DataSchemaParseResult<T, V, RDS, DS>


/**
 * 数字类型的模式的解析器
 *
 * enum 将忽略所有非字符串的值
 */
export class StringDataSchemaParser implements DataSchemaParser<T, V, RDS, DS> {
  public readonly type: T = T

  /**
   * parse RawSchema to Schema
   * @param rawSchema
   */
  public parse (rawSchema: RDS): StringDataSchemaParserResult {
    const result: StringDataSchemaParserResult = new DataSchemaParseResult(rawSchema)

    // required 的默认值为 false
    const requiredResult = result.parseBaseTypeProperty<boolean>('required', coverBoolean, false)
    const defaultValueResult = result.parseBaseTypeProperty<V>('default', coverString)
    const patternResult = result.parseBaseTypeProperty<RegExp>('pattern', coverRegex)
    const enumValueResult = result.parseBaseTypeProperty<string[]>('enum', coverArray<string>(coverString))
    const minLengthResult = result.parseBaseTypeProperty<number>('minLength', coverInteger)
    const maxLengthResult = result.parseBaseTypeProperty<number>('maxLength', coverInteger)

    if (minLengthResult.value != null) {
      if (minLengthResult.value < 0) {
        result.addError({
          constraint: 'minLength',
          reason: 'minLength must be a non-negative integer',
        })
      }
    }

    if (maxLengthResult.value != null) {
      if (maxLengthResult.value <= 0) {
        result.addError({
          constraint: 'maxLength',
          reason: 'maxLength must be a positive integer',
        })
      } else if (minLengthResult.value != null && minLengthResult.value > maxLengthResult.value) {
        result.addError({
          constraint: 'minLength',
          reason: 'minLength must be less than or equal maxLength',
        })
      }
    }

    // StringDataSchema
    const schema: DS = {
      type: this.type,
      required: Boolean(requiredResult.value),
      default: defaultValueResult.value,
      minLength: minLengthResult.value,
      maxLength: maxLengthResult.value,
      pattern: patternResult.value,
      enum: enumValueResult.value,
    }

    return result.setValue(schema)
  }
}
