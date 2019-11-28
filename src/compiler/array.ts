import { BaseDataSchemaCompiler, DataSchemaCompileResult } from '../_core/compiler'
import { ARRAY_V_TYPE as V, ARRAY_T_TYPE as T, RawArrayDataSchema as RDS, ArrayDataSchema as DS } from '../schema/array'
import { coverBoolean } from '../_util/cover-util'
import { isArray, stringify } from '../_util/type-util'


/**
 * ArrayDataSchema 编译结果的数据类型
 */
export type ArrayDataSchemaCompileResult = DataSchemaCompileResult<T, V, RDS, DS>


/**
 * 数组类型的模式的编译器
 *
 * enum 将忽略所有非数组的值
 */
export class ArrayDataSchemaCompiler extends BaseDataSchemaCompiler<T, V, RDS, DS> {
  public readonly type: T = T

  /**
   * compile RawSchema to Schema
   * @param rawSchema
   */
  public compile (rawSchema: RDS): ArrayDataSchemaCompileResult {
    const result: ArrayDataSchemaCompileResult = super.compile(rawSchema)
    rawSchema = result._rawSchema

    // unique 的默认值为 false
    const uniqueResult = result.compileProperty<boolean>('unique', coverBoolean, false)

    // 检查 defaultValue 是否为数组
    let defaultValue = undefined
    if (rawSchema.default != null) {
      if (!isArray(rawSchema.default)) {
        result.addError({
          constraint: 'default',
          reason: `expected an array, but got (${ stringify(rawSchema.default) }).`
        })
      } else {
        defaultValue = rawSchema.default
      }
    }

    // items 为必选项，若未给定，则编译异常
    if (rawSchema.items == null) {
      return result.addError({
        constraint: 'items',
        reason: `'items' is required, but got (${ stringify(rawSchema.items) }).`
      })
    }

    // 编译 items
    const itemsResult = this.context.compileDataSchema(rawSchema.items)
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
