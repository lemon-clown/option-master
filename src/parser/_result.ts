import { RawDataSchema, DataSchema } from '../schema/_base'
import { isObject, stringify } from '../_util/type-util'
import { DataHandleResult } from '../_util/handle-result'
import { CoverOperationFunc, CoverOperationResult } from '../_util/cover-util'


/**
 * DataSchema 的解析结果
 * 当 errors 为空数组时，schema 应不为 undefined
 *
 * @template T    typeof <X>DataSchema.type
 * @template V    typeof <X>DataSchema.V
 * @template DS   typeof <X>DataSchema
 * @template RDS  typeof <X>RawDataSchema
 */
export class DataSchemaParseResult<T extends string, V, RDS extends RawDataSchema<T, V>, DS extends DataSchema<T, V>> extends DataHandleResult<DS> {
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
  public parseBaseTypeProperty<P>(propertyName: keyof RDS, coverFunc: CoverOperationFunc<P>, defaultValue?: P): CoverOperationResult<P> {
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
  /**
   * 确保指定的属性值为对象
   * @param propertyName
   */
  public ensureObject(propertyName: keyof RDS): boolean {
    const rawSchema = this._rawSchema
    if (!isObject(rawSchema[propertyName])) {
      this.addError({
        constraint: propertyName as string,
        reason: `${ propertyName } must be an object, but got (${ stringify(rawSchema[propertyName]) }).`
      })
      return false
    }
    return true
  }
}
