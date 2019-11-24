import { DataSchema } from '../schema/_base'
import { stringify, isObject } from '../_util/type-util'
import { DataHandleResult } from '../_util/handle-result'
import { CoverOperationFunc } from '../_util/cover-util'


/**
 * 数据项的校验结果
 *
 * @template T    typeof <X>DataSchema.type
 * @template V    typeof <X>DataSchema.V
 * @template DS   typeof <X>DataSchema
 */
export class DataValidationResult<T extends string, V, DS extends DataSchema<T, V>> extends DataHandleResult<V> {
  public readonly _schema: DS;
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
  public validateBaseType(coverFunc: CoverOperationFunc<V>, data?: any): V | undefined {
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
  public ensureObject(constraint: string, data: any): boolean {
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