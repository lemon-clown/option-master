import { BaseDataValidator, BaseDataValidatorFactory, DataValidationResult } from '../_core/validator'
import { BOOLEAN_V_TYPE as V, BOOLEAN_T_TYPE as T, BooleanDataSchema as DS } from '../schema/boolean'
import { coverBoolean } from '../_util/cover-util'


/**
 * BooleanDataSchema 校验结果的数据类型
 */
export type BooleanDataValidationResult = DataValidationResult<T, V, DS>


/**
 * 布尔值类型的校验器
 */
export class BooleanDataValidator extends BaseDataValidator<T, V, DS> {
  public readonly type: T = T

  /**
   * 包装 BooleanDataSchema 的实例，使其具备校验给定数据是否为合法布尔值的能力
   * @param data
   */
  public validate(data: any): BooleanDataValidationResult {
    const result: BooleanDataValidationResult = super.validate(data)
    data = result.value
    result.setValue(undefined)

    // 若未设置值，则无需进一步校验
    if (data === undefined) return result

    const value = result.validateType(coverBoolean, data, v => typeof v === 'boolean')

    // 若未产生错误，则通过校验，并设置 value
    if (!result.hasError) result.setValue(value)
    return result
  }
}


/**
 * 布尔值类型的校验器的工厂对象
 */
export class BooleanDataValidatorFactory extends BaseDataValidatorFactory<T, V, DS> {
  public readonly type: T = T

  public create(schema: DS) {
    return new BooleanDataValidator(schema, this.context)
  }
}
