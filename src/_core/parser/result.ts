import { DataHandleResult } from '../../_util/handle-result'
import { CoverOperationFunc, CoverOperationResult } from '../../_util/cover-util'
import { RawDataSchema, DataSchema } from '../schema'


/**
 * DataSchema 的解析结果
 * 当 errors 为空数组时，schema 应不为 undefined
 *
 * @template T    typeof <X>DataSchema.type
 * @template V    typeof <X>DataSchema.V
 * @template DS   typeof <X>DataSchema
 * @template RDS  typeof <X>RawDataSchema
 */
export class DataSchemaParseResult<
  T extends string,
  V,
  RDS extends RawDataSchema<T, V>,
  DS extends DataSchema<T, V>>
  extends DataHandleResult<DS> {

  public readonly _rawSchema: RDS

  /**
   * @param rawSchema 待解析的 RawDataSchema
   */
  public constructor(rawSchema: RDS) {
    super()
    this._rawSchema = rawSchema
  }

  /**
   * 解析给定 RawDataSchema 中的属性的值
   *
   * @param propertyName  RawDataSchema 中定义的属性名
   * @param coverFunc     覆盖属性的函数
   * @param defaultValue  属性的默认值
   * @template P  typeof rawSchema[propertyName]
   */
  public parseProperty<P>(propertyName: keyof RDS, coverFunc: CoverOperationFunc<P>, defaultValue?: P): CoverOperationResult<P> {
    const rawSchema = this._rawSchema
    const result = coverFunc(defaultValue, rawSchema[propertyName])
    if (result.hasError) {
      this.addError({
        constraint: propertyName as string,
        reason: result.errorSummary,
      })
    }
    return result
  }
}
