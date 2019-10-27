import { DataSchemaParser, DataSchemaParseResult } from './_base'
import { NUMBER_V_TYPE as V, NUMBER_T_TYPE as T, RawNumberDataSchema as RDS, NumberDataSchema as DS } from '../schema/number'
import { coverNumber, coverBoolean, coverArray } from '../cover-util'


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
   * @param rawSchema
   */
  public parse (rawSchema: RDS): NumberDataSchemaParserResult {
    const result = new DataSchemaParseResult<T, V, RDS, DS>(rawSchema)

    // required 的默认值为 false
    const required = result.parseProperty<boolean>(rawSchema, 'required', coverBoolean, false)
    const defaultValue = result.parseProperty<V>(rawSchema, 'default', coverNumber)
    const minimum = result.parseProperty<number>(rawSchema, 'minimum', coverNumber)
    const maximum = result.parseProperty<number>(rawSchema, 'maximum', coverNumber)
    const exclusiveMinimum = result.parseProperty<number>(rawSchema, 'exclusiveMinimum', coverNumber)
    const exclusiveMaximum = result.parseProperty<number>(rawSchema, 'exclusiveMaximum', coverNumber)
    const enumValue = result.parseProperty<number[]>(rawSchema, 'enum', coverArray<number>(coverNumber))

    // NumberDataSchema
    const schema: DS = {
      type: this.type,
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
