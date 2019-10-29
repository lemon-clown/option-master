import { DataSchemaParser, DataSchemaParseResult } from './_base'
import { INTEGER_V_TYPE as V, INTEGER_T_TYPE as T, RawIntegerDataSchema as RDS, IntegerDataSchema as DS } from '../schema/integer'
import { coverInteger, coverBoolean, coverArray } from '../_util/cover-util'


/**
 * IntegerDataSchema 解析结果的数据类型
 */
export type IntegerDataSchemaParserResult = DataSchemaParseResult<T, V, RDS, DS>


/**
 * 数字类型的模式的解析器
 *
 * minimum 和 exclusiveMaximum 若非整数，则做上取整
 * maximum 和 exclusiveMinimum 若非整数，则做下取整
 * enum 将忽略所有非整数（或整数字符串）的值
 */
export class IntegerDataSchemaParser implements DataSchemaParser<T, V, RDS, DS> {
  public readonly type: T = T

  /**
   * parse RawSchema to Schema
   * @param path
   * @param rawSchema
   */
  public parse (path: string, rawSchema: RDS): IntegerDataSchemaParserResult {
    const result: IntegerDataSchemaParserResult = new DataSchemaParseResult(path, rawSchema)

    // required 的默认值为 false
    const required = result.parseProperty<boolean>('required', coverBoolean, false)
    const defaultValue = result.parseProperty<V>('default', coverInteger)
    const minimum = result.parseProperty<number>('minimum', coverInteger)
    const maximum = result.parseProperty<number>('maximum', coverInteger)
    const exclusiveMinimum = result.parseProperty<number>('exclusiveMinimum', coverInteger)
    const exclusiveMaximum = result.parseProperty<number>('exclusiveMaximum', coverInteger)
    const enumValue = result.parseProperty<number[]>('enum', coverArray<number>(coverInteger))

    const ceil = (x?: number) => x == null ? x : Math.ceil(x)
    const floor = (x?: number) => x == null ? x : Math.floor(x)

    // IntegerDataSchema
    const schema: DS = {
      type: this.type,
      path,
      required: Boolean(required.value),
      default: defaultValue.value,
      minimum: ceil(minimum.value),
      maximum: floor(maximum.value),
      exclusiveMinimum: floor(exclusiveMinimum.value),
      exclusiveMaximum: ceil(exclusiveMaximum.value),
      enum: enumValue.value,
    }

    return result.setSchema(schema)
  }
}
