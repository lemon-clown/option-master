import { DataSchemaParser, DataSchemaParseResult } from './_base'
import { STRING_V_TYPE as V, STRING_T_TYPE as T, RawStringDataSchema as RDS, StringDataSchema as DS } from '../schema/string'
import { coverString, coverBoolean, coverArray, coverRegex } from '../_util/cover-util'


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
    const required = result.parseProperty<boolean>('required', coverBoolean, false)
    const defaultValue = result.parseProperty<V>('default', coverString)
    const pattern = result.parseProperty<RegExp>('pattern', coverRegex)
    const enumValue = result.parseProperty<string[]>('enum', coverArray<string>(coverString))

    // StringDataSchema
    const schema: DS = {
      type: this.type,
      required: Boolean(required.value),
      default: defaultValue.value,
      pattern: pattern.value,
      enum: enumValue.value,
    }

    return result.setSchema(schema)
  }
}
