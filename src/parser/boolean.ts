import { DataSchemaParser } from './_base'
import { DataSchemaParseResult } from './_result'
import { BOOLEAN_V_TYPE as V, BOOLEAN_T_TYPE as T, RawBooleanDataSchema as RDS, BooleanDataSchema as DS } from '../schema/boolean'
import { coverBoolean } from '../_util/cover-util'


/**
 * BooleanDataSchema 解析结果的数据类型
 */
export type BooleanDataSchemaParserResult = DataSchemaParseResult<T, V, RDS, DS>


/**
 * 布尔类型的模式的解析器
 */
export class BooleanDataSchemaParser extends DataSchemaParser<T, V, RDS, DS> {
  public readonly type: T = T

  /**
   * parse RawSchema to Schema
   * @param rawSchema
   */
  public parse (rawSchema: RDS): BooleanDataSchemaParserResult {
    const result: BooleanDataSchemaParserResult = super.parse(rawSchema)
    rawSchema = result._rawSchema

    const defaultValueResult = result.parseBaseTypeProperty<V>('default', coverBoolean)

    // BooleanDataSchema
    const schema: DS = {
      ...result.value!,
      default: defaultValueResult.value,
    }

    return result.setValue(schema)
  }
}
