import { DataSchemaParser, DataSchemaParseResult } from './_base'
import { NUMBER_V_TYPE as V, NUMBER_T_TYPE as T, RawNumberDataSchema as RDS, NumberDataSchema as DS } from '../schema/number'
import { coverNumber, coverBoolean, coverArray } from '../_util/cover-util'


/**
 * NumberDataSchema 解析结果的数据类型
 */
export type NumberDataSchemaParserResult = DataSchemaParseResult<T, V, RDS, DS>


/**
 * 数字类型的模式的解析器
 *
 * enum 将忽略所有非数字（或数字字符串）的值
 */
export class NumberDataSchemaParser implements DataSchemaParser<T, V, RDS, DS> {
  public readonly type: T = T

  /**
   * parse RawSchema to Schema
   * @param path
   * @param rawSchema
   */
  public parse (path: string, rawSchema: RDS): NumberDataSchemaParserResult {
    const result: NumberDataSchemaParserResult = new DataSchemaParseResult(path, rawSchema)

    // required 的默认值为 false
    const required = result.parseProperty<boolean>('required', coverBoolean, false)
    const defaultValue = result.parseProperty<V>('default', coverNumber)
    const minimum = result.parseProperty<number>('minimum', coverNumber)
    const maximum = result.parseProperty<number>('maximum', coverNumber)
    const exclusiveMinimum = result.parseProperty<number>('exclusiveMinimum', coverNumber)
    const exclusiveMaximum = result.parseProperty<number>('exclusiveMaximum', coverNumber)
    const enumValue = result.parseProperty<number[]>('enum', coverArray<number>(coverNumber))

    // NumberDataSchema
    const schema: DS = {
      type: this.type,
      path,
      required: Boolean(required.value),
      default: defaultValue.value,
      minimum: minimum.value,
      maximum: maximum.value,
      exclusiveMinimum: exclusiveMinimum.value,
      exclusiveMaximum: exclusiveMaximum.value,
      enum: enumValue.value,
    }

    return result.setSchema(schema)
  }
}
