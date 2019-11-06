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
   * @param rawSchema
   */
  public parse (rawSchema: RDS): NumberDataSchemaParserResult {
    const result: NumberDataSchemaParserResult = new DataSchemaParseResult(rawSchema)

    // required 的默认值为 false
    const requiredResult = result.parseBaseTypeProperty<boolean>('required', coverBoolean, false)
    const defaultValueResult = result.parseBaseTypeProperty<V>('default', coverNumber)
    const minimumResult = result.parseBaseTypeProperty<number>('minimum', coverNumber)
    const maximumResult = result.parseBaseTypeProperty<number>('maximum', coverNumber)
    const exclusiveMinimumResult = result.parseBaseTypeProperty<number>('exclusiveMinimum', coverNumber)
    const exclusiveMaximumResult = result.parseBaseTypeProperty<number>('exclusiveMaximum', coverNumber)
    const enumValueResult = result.parseBaseTypeProperty<number[]>('enum', coverArray<number>(coverNumber))

    // NumberDataSchema
    const schema: DS = {
      type: this.type,
      required: Boolean(requiredResult.value),
      default: defaultValueResult.value,
      minimum: minimumResult.value,
      maximum: maximumResult.value,
      exclusiveMinimum: exclusiveMinimumResult.value,
      exclusiveMaximum: exclusiveMaximumResult.value,
      enum: enumValueResult.value,
    }

    return result.setValue(schema)
  }
}
