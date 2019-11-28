import { BaseDataSchemaCompiler, DataSchemaCompileResult } from '../_core/compiler'
import { NUMBER_V_TYPE as V, NUMBER_T_TYPE as T, RawNumberDataSchema as RDS, NumberDataSchema as DS } from '../schema/number'
import { coverNumber, coverArray } from '../_util/cover-util'


/**
 * NumberDataSchema 编译结果的数据类型
 */
export type NumberDataSchemaCompileResult = DataSchemaCompileResult<T, V, RDS, DS>


/**
 * 数字类型的模式的编译器
 *
 * enum 将忽略所有非数字（或数字字符串）的值
 */
export class NumberDataSchemaCompiler extends BaseDataSchemaCompiler<T, V, RDS, DS> {
  public readonly type: T = T

  /**
   * compile RawSchema to Schema
   * @param rawSchema
   */
  public compile (rawSchema: RDS): NumberDataSchemaCompileResult {
    const result: NumberDataSchemaCompileResult = super.compile(rawSchema)
    rawSchema = result._rawSchema

    // required 的默认值为 false
    const defaultValueResult = result.compileProperty<V>('default', coverNumber)
    const minimumResult = result.compileProperty<number>('minimum', coverNumber)
    const maximumResult = result.compileProperty<number>('maximum', coverNumber)
    const exclusiveMinimumResult = result.compileProperty<number>('exclusiveMinimum', coverNumber)
    const exclusiveMaximumResult = result.compileProperty<number>('exclusiveMaximum', coverNumber)
    const enumValueResult = result.compileProperty<number[]>('enum', coverArray<number>(coverNumber))

    // NumberDataSchema
    const schema: DS = {
      ...result.value!,
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