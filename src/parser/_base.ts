import { RawDataSchema, DataSchema } from '../schema/_base'
import { CoverOperationFunc, CoverOperationResult } from '../_util/cover-util'
import { isObject, stringify } from '../_util/type-util'
import { HandleResult } from '../_util/handle-result'


/**
 * DataSchema 解析错误的错误信息对象
 */
export interface DataSchemaParseError {
  /**
   * 解析错误的属性名（约束项）
   */
  constraint: string
  /**
   * 错误原因
   */
  reason: string
}


/**
 * 解析时的警告信息对象
 */
export type DataSchemaParseWarning = DataSchemaParseError


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
> extends HandleResult<DataSchemaParseError, DataSchemaParseWarning> {
  private _schema?: DS
  public readonly _rawSchema: RDS

  public constructor (rawSchema: RDS, schema?: DS) {
    super()
    this._schema = schema
    this._rawSchema = rawSchema
  }

  /**
   * 若解析成功，该值不为 undefined
   */
  public get schema(): DS | undefined {
    return this._schema
  }

  /**
   * 错误信息汇总
   */
  public get errorSummary(): string {
    return '[' + this._errors.map(error => `${ error.constraint }: ${ error.reason }`).join(',\n') + ']'
  }

  /**
   * 警告消息汇总
   */
  public get warningSummary(): string {
    return '[' + this._warnings.map(error => `${ error.constraint }: ${ error.reason }`).join(',\n') + ']'
  }

  /**
   * 设置解析结果
   * @param schema
   */
  public setSchema(schema: DS): this {
    this._schema = schema
    return this
  }

  /**
   * 解析给定 RawDataSchema 中的属性的值
   *
   * @param propertyName  RawDataSchema 中定义的属性名
   * @param coverFunc     覆盖属性的函数
   * @param defaultValue  属性的默认值
   * @template P  typeof rawSchema[propertyName]
   */
  public parseProperty<P> (
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
        reason: `${ propertyName } must be an object, but got ${ stringify(rawSchema[propertyName]) }`
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
export interface DataSchemaParser<
  T extends string,
  V,
  RDS extends RawDataSchema<T, V>,
  DS extends DataSchema<T, V>,
> {
  /**
   * 对应 RawDataSchema 中的 type，用作唯一标识
   * 表示该解析器接收何种类型的 RawDataSchema
   */
  readonly type: T

  /**
   * parse RawSchema to Schema
   * @param rawSchema
   */
  parse (rawSchema: RawDataSchema<T, V>): DataSchemaParseResult<T, V, RDS, DS>
}
