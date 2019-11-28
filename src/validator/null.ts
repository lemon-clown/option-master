import { BaseDataValidator, BaseDataValidatorFactory, DataValidationResult } from '../_core/validator'
import { NULL_V_TYPE as V, NULL_T_TYPE as T, NullDataSchema as DS } from '../schema/null'
import { coverNull } from '../_util/cover-util'


/**
 * NullDataSchema 校验结果的数据类型
 */
export type NullDataValidationResult = DataValidationResult<T, V, DS>


/**
 * 布尔值类型的校验器
 */
export class NullDataValidator extends BaseDataValidator<T, V, DS> {
  public readonly type: T = T

  /**
   * 包装 NullDataSchema 的实例，使其具备校验给定数据是否为合法布尔值的能力
   * @param data
   */
  public validate(data: any): NullDataValidationResult {
    const result: NullDataValidationResult = super.validate(data)
    data = result.value
    result.setValue(undefined)

    // 若未设置值，则无需进一步校验
    if (data === undefined) return result

    const value = result.validateType(coverNull, data, v => v === null)

    // 若未产生错误，则通过校验，并设置 value
    if (!result.hasError) result.setValue(value)
    return result
  }
}


/**
 * 布尔值类型的校验器的工厂对象
 */
export class NullDataValidatorFactory extends BaseDataValidatorFactory<T, V, DS> {
  public readonly type: T = T

  public create(schema: DS) {
    return new NullDataValidator(schema, this.context)
  }
}
