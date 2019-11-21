import { DataSchema } from '../schema/_base'
import { stringify, isObject } from '../_util/type-util'
import { DataHandleResult } from '../_util/handle-result'
import { CoverOperationFunc } from '../_util/cover-util'
import { DataValidatorMaster } from './_master'


/**
 * 数据项的校验结果
 *
 * @template T    typeof <X>DataSchema.type
 * @template V    typeof <X>DataSchema.V
 * @template DS   typeof <X>DataSchema
 */
export class DataValidationResult<T extends string, V, DS extends DataSchema<T, V>> extends DataHandleResult<V> {
  public readonly _schema: DS

  public constructor(schema: DS) {
    super()
    this._schema = schema
  }

  /**
   * 校验给定的基本类型数据是否符合指定数据类型
   *
   * @param coverFunc     覆盖属性的函数
   * @param data          待校验的数据
   */
  public validateBaseType (coverFunc: CoverOperationFunc<V>, data?: any): V | undefined {
    const schema = this._schema
    const result = coverFunc(schema.default, data)
    let a = /^[aeiou]/.test(schema.type) ? 'an' : 'a'
    if (result.hasError) {
      this.addError({
        constraint: 'type',
        reason: `expected ${ a } ${ schema.type }, but got (${ stringify(data) }): ` + result.errorSummary,
      })
    }
    return result.value
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
        reason: `expected an object, but got (${ stringify(data) }).`
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
export abstract class DataValidator<T extends string, V, DS extends DataSchema<T, V>> {
  /**
   * 对应 DataSchema 中的 type，用作唯一表示
   * 表示该校验器接收何种类型的 DataSchema 实例
   */
  public abstract readonly type: T

  /**
   * 校验器使用的数据模式
   */
  protected readonly schema: DS

  /**
   * 校验器管理器；用于分发/递归校验
   */
  protected readonly validatorMaster: DataValidatorMaster

  public constructor (schema: DS, validatorMaster: DataValidatorMaster) {
    this.schema = schema
    this.validatorMaster = validatorMaster
  }

  /**
   * 校验数据 & 解析数据（通过 default 等值为计算数据的最终结果）
   * @param data
   */
  public validate (data: any): DataValidationResult<T, V, DS> {
    const { schema } = this
    const result: DataValidationResult<T, V, DS> = new DataValidationResult(schema)

    // 检查是否为置任何值
    if (data == null) {
      // 检查 DataSchema 中是否有默认值
      if (schema.default != null) {
        data = schema.default as V
      }
    }

    // 检查是否为必填项
    if (schema.required && data == null) {
      result.addError({
        constraint: 'required',
        reason: `required, but got (${ stringify(data) }).`
      })
    }

    // 如果存在错误，则不能设置值
    if (result.hasError) return result

    // 通过校验
    return result.setValue(data)
  }
}


/**
 * DataValidator 的工厂类
 */
export abstract class DataValidatorFactory<T extends string, V, DS extends DataSchema<T, V>> {
  /**
   * 对应 DataSchema 中的 type，用作唯一标识
   * 表示该校验器工厂类生产何种类型的校验器
   */
  public abstract readonly type: T

  protected readonly validatorMaster: DataValidatorMaster

  public constructor(validatorMaster: DataValidatorMaster) {
    this.validatorMaster = validatorMaster
  }

  /**
   * 通过 DataSchema 创建与之对应的数据校验器
   * @param schema
   */
  public abstract create (schema: DS): DataValidator<T, V, DS>
}


/**
 * DataValidator 工厂类的构造函数接口
 */
export interface DataValidatorFactoryConstructor<
  T extends string,
  V,
  DS extends DataSchema<T, V>,
> {
  new (validatorMaster: DataValidatorMaster): DataValidatorFactory<T, V, DS>
}
