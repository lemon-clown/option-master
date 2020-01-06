import { BaseDataSchemaCompiler, DataSchemaCompileResult, DataSchemaCompiler } from '../_core/compiler'
import { BOOLEAN_V_TYPE as V, BOOLEAN_T_TYPE as T, RawBooleanDataSchema as RDS, BooleanDataSchema as DS } from '../schema/boolean'
import { coverBoolean } from '../_util/cover-util'


/**
 * BooleanDataSchema 编译结果的数据类型
 */
export type BooleanDataSchemaCompileResult = DataSchemaCompileResult<T, V, RDS, DS>


/**
 * 布尔类型的模式的编译器
 */
export class BooleanDataSchemaCompiler
  extends BaseDataSchemaCompiler<T, V, RDS, DS>
  implements DataSchemaCompiler<T, V, RDS, DS> {

  public readonly type: T = T

  /**
   * compile RawSchema to Schema
   * @param rawSchema
   */
  public compile (rawSchema: RDS): BooleanDataSchemaCompileResult {
    const result: BooleanDataSchemaCompileResult = super.compile(rawSchema)
    rawSchema = result._rawSchema

    const defaultValueResult = result.compileConstraint<V>('default', coverBoolean)

    // BooleanDataSchema
    const schema: DS = {
      ...result.value!,
      default: defaultValueResult.value,
    }

    return result.setValue(schema)
  }
}
