import { RawDataSchema, DataSchema } from '../schema/_base'
import { CoverOperationFunc, CoverOperationResult } from '../_util/cover-util'
import { isObject, stringify } from '../_util/type-util'


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
> {
  private _schema?: DS
  private readonly _errors: DataSchemaParseError[]
  public readonly _rawSchema: RDS

  public constructor (rawSchema: RDS, schema?: DS) {
    this._schema = schema
    this._rawSchema = rawSchema
    this._errors = []
  }

  /**
   * 若解析成功，该值不为 undefined
   */
  public get schema(): DS | undefined {
    return this._schema
  }

  /**
   * 错误信息
   */
  public get errors(): DataSchemaParseError[] {
    return this._errors
  }

  /**
   * 错误信息汇总
   */
  public get errorSummary(): string {
    return '[' + this._errors.map(error => `${ error.constraint }: ${ error.reason }`).join(',\n') + ']'
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
   * 追加解析错误的错误信息对象
   * @param errors
   */
  public addError (...errors: DataSchemaParseError[]): this {
    this.errors.push(...errors)
    return this
  }

  /**
   * 解析给定 RawDataSchema 中的属性的值
   *
   * @param rawSchema     用户给定的 RawDataSchema
   * @param propertyName  RawDataSchema 中定义的属性名
   * @param coverFunc     覆盖属性的函数
   * @param defaultValue  属性的默认值
   * @template T  typeof rawSchema.type
   * @template V  Exclude<typeof rawSchema.default, undefined>
   * @template P  typeof rawSchema[propertyName]
   */
  public parseProperty<P> (
    rawSchema: RDS,
    propertyName: keyof RDS,
    coverFunc: CoverOperationFunc<P>,
    defaultValue?: P,
  ): CoverOperationResult<P> {
    const result = coverFunc(defaultValue, rawSchema[propertyName])
    if (result.errors.length > 0) {
      this.addError({
        constraint: propertyName as string,
        reason: result.errors.join('\n'),
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
