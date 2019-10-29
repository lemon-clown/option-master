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
   * 属性路径；考虑到数组和对象可能会导致实际属性值未属性树的非根节点，因此记录属性路径是必要的
   */
  property: string
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

  /**
   *
   * @param path      当前待解析的 RawDataSchema 在其所定义的数据类型树中的路径
   * @param rawSchema 待解析的 RawDataSchema
   */
  public constructor (path: string, rawSchema: RDS) {
    super()
    this._rawSchema = rawSchema
    this._rawSchema.path = path
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
   * 追加校验错误信息对象
   * @param errors
   */
  public addError (...errors: PickPartial<DataSchemaParseError, 'property'>[]): this {
    const property = this._rawSchema.path || ''
    for (const error of errors) {
      const e: DataSchemaParseError = { property, ...error }
      this._errors.push(e)
    }
    return this
  }

  /**
   * 追加校验警告信息对象
   * @param warnings
   */
  public addWarning (...warnings: PickPartial<DataSchemaParseWarning, 'property'>[]): this {
    const property = this._rawSchema.path || ''
    for (const warning of warnings) {
      const w: DataSchemaParseWarning = { property, ...warning }
      this._warnings.push(w)
    }
    return this
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
   * @param path        当前待解析的 RawDataSchema 在其所定义的数据类型树中的路径
   * @param rawSchema   待解析的 RawDataSchema
   */
  parse (path: string, rawSchema: RawDataSchema<T, V>): DataSchemaParseResult<T, V, RDS, DS>
}
