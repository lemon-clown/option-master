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
   * @param path
   * @param rawSchema
   */
  public parse (path: string, rawSchema: RDS): BooleanDataSchemaParserResult {
    const result: BooleanDataSchemaParserResult = new DataSchemaParseResult(path, rawSchema)

    // required 的默认值为 false
    const required = result.parseProperty<boolean>('required', coverBoolean, false)
    const defaultValue = result.parseProperty<V>('default', coverBoolean)

    // BooleanDataSchema
    const schema: DS = {
      type: this.type,
      path,
      required: Boolean(required.value),
      default: defaultValue.value,
    }

    return result.setSchema(schema)
  }
}
