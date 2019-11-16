import { RawDataSchema, DataSchema } from '../schema/_base'
import { isObject, stringify, isString } from '../_util/type-util'
import { CoverOperationFunc, CoverOperationResult, coverBoolean } from '../_util/cover-util'
import { DataHandleResult } from '../_util/handle-result'
import { DataSchemaParserMaster } from './_master'


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
  DS extends DataSchema<T, V>,
> extends DataHandleResult<DS> {
  public readonly _rawSchema: RDS

  /**
   * @param rawSchema 待解析的 RawDataSchema
   */
  public constructor (rawSchema: RDS) {
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
  public parseBaseTypeProperty<P> (
    propertyName: keyof RDS,
    coverFunc: CoverOperationFunc<P>,
    defaultValue?: P,
  ): CoverOperationResult<P> {
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
  public ensureObject (propertyName: keyof RDS): boolean {
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


/**
 * DataSchema 解析器，将用户定义的内容解析成 DataSchema
 *
 * @template T    typeof <X>DataSchema.type
 * @template V    typeof <X>DataSchema.V
 * @template DS   typeof <X>DataSchema
 * @template RDS  typeof <X>RawDataSchema
 */
export abstract class DataSchemaParser<
  T extends string,
  V,
  RDS extends RawDataSchema<T, V>,
  DS extends DataSchema<T, V>,
> {
  /**
   * 对应 RawDataSchema 中的 type，用作唯一标识
   * 表示该解析器接收何种类型的 RawDataSchema
   */
  public abstract readonly type: T

  protected readonly parserMaster: DataSchemaParserMaster

  public constructor (parserMaster: DataSchemaParserMaster) {
    this.parserMaster = parserMaster
  }

  /**
   * parse RawSchema to Schema
   * @param rawSchema   待解析的 RawDataSchema
   */
  public parse (rawSchema: RawDataSchema<T, V>): DataSchemaParseResult<T, V, RDS, DS> {
    rawSchema = this.parserMaster.normalizeRawSchema(rawSchema) as RawDataSchema<T, V>
    const result: DataSchemaParseResult<T, V, RDS, DS> = (new DataSchemaParseResult(rawSchema)) as any

    // required 的默认值为 false
    const requiredResult = result.parseBaseTypeProperty<boolean>('required', coverBoolean, false)

    const schema: DS = {
      type: rawSchema.type,
      required: Boolean(requiredResult.value),
    } as any
    return result.setValue(schema)
  }
}
