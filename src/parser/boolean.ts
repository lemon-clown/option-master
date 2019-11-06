import { DataSchemaParser, DataSchemaParseResult } from './_base'
import { BOOLEAN_V_TYPE as V, BOOLEAN_T_TYPE as T, RawBooleanDataSchema as RDS, BooleanDataSchema as DS } from '../schema/boolean'
import { coverBoolean } from '../_util/cover-util'


/**
 * BooleanDataSchema 解析结果的数据类型
 */
export type BooleanDataSchemaParserResult = DataSchemaParseResult<T, V, RDS, DS>


/**
 * 布尔类型的模式的解析器
 */
export class BooleanDataSchemaParser implements DataSchemaParser<T, V, RDS, DS> {
  public readonly type: T = T

  /**
   * parse RawSchema to Schema
   * @param rawSchema
   */
  public parse (rawSchema: RDS): BooleanDataSchemaParserResult {
    const result: BooleanDataSchemaParserResult = new DataSchemaParseResult(rawSchema)

    // required 的默认值为 false
    const requiredResult = result.parseBaseTypeProperty<boolean>('required', coverBoolean, false)
    const defaultValueResult = result.parseBaseTypeProperty<V>('default', coverBoolean)

    // BooleanDataSchema
    const schema: DS = {
      type: this.type,
      required: Boolean(requiredResult.value),
      default: defaultValueResult.value,
    }

    return result.setValue(schema)
  }
}
