import { BaseDataSchemaCompiler, DataSchemaCompileResult } from '../_core/compiler'
import { INTEGER_V_TYPE as V, INTEGER_T_TYPE as T, RawIntegerDataSchema as RDS, IntegerDataSchema as DS } from '../schema/integer'
import { coverInteger, coverArray } from '../_util/cover-util'


/**
 * IntegerDataSchema 编译结果的数据类型
 */
export type IntegerDataSchemaCompileResult = DataSchemaCompileResult<T, V, RDS, DS>


/**
 * 数字类型的模式的编译器
 *
 * minimum 和 exclusiveMaximum 若非整数，则做上取整
 * maximum 和 exclusiveMinimum 若非整数，则做下取整
 * enum 将忽略所有非整数（或整数字符串）的值
 */
export class IntegerDataSchemaCompiler extends BaseDataSchemaCompiler<T, V, RDS, DS> {
  public readonly type: T = T

  /**
   * compile RawSchema to Schema
   * @param rawSchema
   */
  public compile (rawSchema: RDS): IntegerDataSchemaCompileResult {
    const result: IntegerDataSchemaCompileResult = super.compile(rawSchema)
    rawSchema = result._rawSchema

    const defaultValueResult = result.compileProperty<V>('default', coverInteger)
    const minimumResult = result.compileProperty<number>('minimum', coverInteger)
    const maximumResult = result.compileProperty<number>('maximum', coverInteger)
    const exclusiveMinimumResult = result.compileProperty<number>('exclusiveMinimum', coverInteger)
    const exclusiveMaximumResult = result.compileProperty<number>('exclusiveMaximum', coverInteger)
    const enumValueResult = result.compileProperty<number[]>('enum', coverArray<number>(coverInteger))

    const ceil = (x?: number) => x == null ? x : Math.ceil(x)
    const floor = (x?: number) => x == null ? x : Math.floor(x)

    // IntegerDataSchema
    const schema: DS = {
      ...result.value!,
      default: defaultValueResult.value,
      minimum: ceil(minimumResult.value),
      maximum: floor(maximumResult.value),
      exclusiveMinimum: floor(exclusiveMinimumResult.value),
      exclusiveMaximum: ceil(exclusiveMaximumResult.value),
      enum: enumValueResult.value,
    }

    return result.setValue(schema)
  }
}
