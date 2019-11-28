import { stringify } from '../../_util/type-util'
import { DataHandleResult } from '../../_util/handle-result'
import { CoverOperationFunc } from '../../_util/cover-util'
import { DataSchema } from '../schema'


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
  public validateType(coverFunc: CoverOperationFunc<V>, data: any, checkFunc: (v: any) => boolean): V | undefined {
    const schema = this._schema
    const result = coverFunc(schema.default, data)
    let a = /^[aeiou]/.test(schema.type) ? 'an' : 'a'
    if (result.hasError || !checkFunc(result.value)) {
      this.addError({
        constraint: 'type',
        reason: `expected ${ a } ${ schema.type }, but got (${ stringify(data) }): ` + result.errorSummary,
      })
    }
    return result.value
  }
}
