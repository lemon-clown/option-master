import { BaseDataSchemaParser, DataSchemaParseResult } from '../_core/parser'
import { ARRAY_V_TYPE as V, ARRAY_T_TYPE as T, RawArrayDataSchema as RDS, ArrayDataSchema as DS } from '../schema/array'
import { coverBoolean } from '../_util/cover-util'
import { isArray, stringify } from '../_util/type-util'


/**
 * ArrayDataSchema 解析结果的数据类型
 */
export type ArrayDataSchemaParserResult = DataSchemaParseResult<T, V, RDS, DS>


/**
 * 数组类型的模式的解析器
 *
 * enum 将忽略所有非数组的值
 */
export class ArrayDataSchemaParser extends BaseDataSchemaParser<T, V, RDS, DS> {
  public readonly type: T = T

  /**
   * parse RawSchema to Schema
   * @param rawSchema
   */
  public parse (rawSchema: RDS): ArrayDataSchemaParserResult {
    const result: ArrayDataSchemaParserResult = super.parse(rawSchema)
    rawSchema = result._rawSchema

    // unique 的默认值为 false
    const uniqueResult = result.parseProperty<boolean>('unique', coverBoolean, false)

    // 检查 defaultValue 是否为数组
    let defaultValue = undefined
    if (rawSchema.default != null) {
      if (isArray(rawSchema.default)) {
        result.addError({
          constraint: 'default',
          reason: `expected an array, but got (${ stringify(rawSchema.default) }).`
        })
      } else {
        defaultValue = rawSchema.default
      }
    }

    // items 为必选项，若未给定，则解析异常
    if (rawSchema.items == null) {
      return result.addError({
        constraint: 'items',
        reason: `'items' is required, but got (${ stringify(rawSchema.items) }).`
      })
    }

    // 解析 items
    const itemsResult = this.context.parseDataSchema(rawSchema.items)
    result.addHandleResult('items', itemsResult)

    // ArrayDataSchema
    const schema: DS = {
      ...result.value!,
      default: defaultValue,
      items: itemsResult.value!,
      unique: Boolean(uniqueResult.value),
    }

    return result.setValue(schema)
  }
}
