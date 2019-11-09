import { DataValidator, DataValidationResult, DataValidatorFactory } from './_base'
import { BOOLEAN_V_TYPE as V, BOOLEAN_T_TYPE as T, BooleanDataSchema as DS } from '../schema/boolean'
import { coverBoolean } from '../_util/cover-util'


/**
 * BooleanDataSchema 校验结果的数据类型
 */
export type BooleanDataValidationResult = DataValidationResult<T, V, DS>


/**
 * 布尔值类型的校验器
 */
export class BooleanDataValidator implements DataValidator<T, V, DS> {
  private readonly schema: DS
  public readonly type: T = T

  public constructor (schema: DS) {
    this.schema = schema
  }

  /**
   * 包装 BooleanDataSchema 的实例，使其具备校验给定数据是否为合法布尔值的能力
   * @param data
   */
  public validate (data: any): BooleanDataValidationResult {
    const { schema } = this
    const result: BooleanDataValidationResult = new DataValidationResult(schema)
    data = result.baseValidate(data)

    // 若未设置值，则无需进一步校验
    if (data == null) return result

    const value = result.validateBaseType(coverBoolean, data)

    // 若未产生错误，则通过校验，并设置 value
    if (!result.hasError) result.setValue(value)
    return result
  }
}


/**
 * 布尔值类型的校验器的工厂对象
 */
export class BooleanDataValidatorFactory implements DataValidatorFactory<T, V, DS> {
  public readonly type: T = T

  public create(schema: DS) {
    return new BooleanDataValidator(schema)
  }
}
