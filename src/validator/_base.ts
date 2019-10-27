import { DataSchema } from '../schema/_base'


/**
 * 校验不通过时的错误信息对象
 */
export interface DataValidationError {
  /**
   * 检查项（DataSchema 中的属性名）
   */
  constraint: string
  /**
   * 错误原因
   */
  reason: string
}


/**
 * 数据项的校验结果
 */
export class DataValidationResult<T extends string, V, DS extends DataSchema<T, V>> {
  private _value?: V
  private readonly _errors: DataValidationError[]
  public readonly _schema: DS

  public constructor (schema: DS) {
    this._schema = schema
    this._errors = []
  }

  /**
   * 通过验证后的值
   * 若通过校验，此值应不为 undefined
   */
  public get value(): V | undefined {
    return this._value
  }

  /**
   * 错误消息
   */
  public get errors(): DataValidationError[] {
    return this._errors
  }

  /**
   * 错误信息汇总
   */
  public get errorSummary(): string {
    return '[' + this._errors.map(error => `${ error.constraint }: ${ error.reason }`).join(',\n') + ']'
  }

  /**
   * 设置值
   * @param value
   */
  public setValue(value: V): this {
    this._value = value
    return this
  }

  /**
   * 追加校验错误信息对象
   * @param error
   */
  public addError (...errors: DataValidationError[]): this {
    this.errors.push(...errors)
    return this
  }

  /**
   * 执行基本的数据校验，检查（并设置）是否要设置成默认值
   *
   * @template X  给定的值的数据类型
   */
  public baseValidate<X extends V = any>(data: X): X {
    const schema = this._schema

    // 检查是否为置任何值
    if (data == null) {
      // 检查 DataSchema 中是否有默认值
      if (schema.default != null) {
        data = schema.default as X
      }
    }

    // 检查是否为必填项
    if (schema.required && data == null) {
      this.addError({
        constraint: 'required',
        reason: `required, but got ${ data }.`
      })
    }

    return data
  }
}


/**
 * DataSchema 校验器：
 *  - 封装 DataSchema 实例，使其具备校验数据是否符合其定义的数据类型的能力
 *
 * @template T    typeof <X>DataSchema.type
 * @template V    typeof <X>DataSchema.V
 * @template DS   typeof <X>DataSchema
 */
export interface DataValidator<T extends string, V, DS extends DataSchema<T, V>> {
  /**
   * 对应 DataSchema 中的 type，用作唯一表示
   * 表示该校验器接收何种类型的 DataSchema 实例
   */
  readonly type: T

  /**
   * 校验数据 & 解析数据（通过 default 等值为计算数据的最终结果）
   * @param data
   */
  validate (data: any): DataValidationResult<T, V, DS>
}


/**
 * 创建 DataValidator 的工厂函数
 */
export interface DataValidatorFactory<T extends string, V, DS extends DataSchema<T, V>> {
  /**
   * 通过 DataSchema 创建与之对应的数据校验器
   * @param schema
   */
  create (schema: DS): DataValidator<T, V, DS>
}
