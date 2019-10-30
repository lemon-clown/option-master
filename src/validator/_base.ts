import { DataSchema } from '../schema/_base'
import { stringify, isObject } from '../_util/type-util'
import { HandleResult } from '../_util/handle-result'


/**
 * 校验时的错误信息对象
 */
export interface DataValidationError {
  /**
   * 检查项（DataSchema 中的属性名）
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
 * 校验时的警告信息对象
 */
export type DataValidationWarning = DataValidationError


/**
 * 数据项的校验结果
 *
 * @template T    typeof <X>DataSchema.type
 * @template V    typeof <X>DataSchema.V
 * @template DS   typeof <X>DataSchema
 */
export class DataValidationResult<T extends string, V, DS extends DataSchema<T, V>>
  extends HandleResult<DataValidationError, DataValidationWarning> {
  private _value?: V
  public readonly _schema: DS

  public constructor(schema: DS) {
    super()
    this._schema = schema
  }

  /**
   * 通过验证后的值
   * 若通过校验，此值应不为 undefined
   */
  public get value(): V | undefined {
    return this._value
  }

  /**
   * 错误信息汇总
   */
  public get errorSummary(): string {
    return '[' + this._errors.map(error => `${ error.constraint }: ${ error.reason }`).join(',\n') + ']'
  }

  /**
   * 追加校验错误信息对象
   * @param errors
   */
  public addError (...errors: PickPartial<DataValidationError, 'property'>[]): this {
    const property = this._schema.path
    for (const error of errors) {
      const e: DataValidationError = { property, ...error }
      this._errors.push(e)
    }
    return this
  }

  /**
   * 追加校验警告信息对象
   * @param warnings
   */
  public addWarning (...warnings: PickPartial<DataValidationWarning, 'property'>[]): this {
    const property = this._schema.path
    for (const warning of warnings) {
      const w: DataValidationWarning = { property, ...warning }
      this._warnings.push(w)
    }
    return this
  }

  /**
   * 警告消息汇总
   */
  public get warningSummary(): string {
    return '[' + this._warnings.map(warning=> `${ warning.constraint }: ${ warning.reason }`).join(',\n') + ']'
  }

  /**
   * 合并属性的校验结果
   * @param constraint  校验错误的属性名（约束项）
   * @param result      校验结果
   */
  public addHandleResult (constraint: string, result: HandleResult<any, any>): this {
    if (result.hasError) {
      this.addError({
        constraint,
        reason: result.errorSummary,
      })
    }
    if (result.hasWarning) {
      this.addError({
        constraint,
        reason: result.warningSummary,
      })
    }
    return this
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
        reason: `required, but got ${ stringify(data) }.`
      })
    }

    return data
  }

  /**
   * 确保指定的属性值为对象
   * @param constraint  约束项的名字，此处仅用于在发生异常时记录消息用
   * @param data        要校验的数据
   */
  public ensureObject (constraint: string, data: any): boolean {
    if (!isObject(data)) {
      this.addError({
        constraint,
        reason: `expected an object, but got ${ stringify(data) }`
      })
      return false
    }
    return true
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
