import { DataValidator, DataValidationResult, DataValidatorFactory } from './_base'
import { ARRAY_V_TYPE as V, ARRAY_T_TYPE as T, ArrayDataSchema as DS } from '../schema/array'
import { isArray, stringify } from '../_util/type-util'
import { DValidationResult, DataValidatorMaster } from './_master'


/**
 * ArrayDataSchema 校验结果的数据类型
 */
export type ArrayDataValidationResult = DataValidationResult<T, V, DS>


/**
 * 数组类型的校验器
 */
export class ArrayDataValidator implements DataValidator<T, V, DS> {
  private readonly validatorMaster: DataValidatorMaster
  private readonly schema: DS
  public readonly type: T = T

  public constructor(schema: DS, validatorMaster: DataValidatorMaster) {
    this.schema = schema
    this.validatorMaster = validatorMaster
  }

  /**
   * 包装 ArrayDataSchema 的实例，使其具备校验给定数据是否为合法数组的能力
   * @param data
   */
  public validate(data: any): ArrayDataValidationResult {
    const { schema } = this
    const result: ArrayDataValidationResult = new DataValidationResult(schema)
    data = result.baseValidate(data)

    // 若未设置值，则无需进一步校验
    if (data == null) return result

    // 检查是否为数组
    if (!isArray(data)) {
      return result.addError({
        constraint: 'type',
        reason: `expected a ${ T }, but got ${ stringify(data) }.\n`,
      })
    }

    // 检查是否唯一
    if (schema.unique) {
      const valueSet = new Set(data)
      if (valueSet.size !== data.length) {
        return result.addError({
          constraint: 'unique',
          reason: `expected a unique array, but got ${ stringify(data) }`
        })
      }
    }

    // 检查数据项是否符合 items 的定义
    for (let i = 0; i < data.length; ++i) {
      const d = data[i]
      const xValidateResult: DValidationResult = this.validatorMaster.validate(schema, d)
      if (xValidateResult.errors.length > 0) {
        return result.addError({
          constraint: 'items',
          reason: `index(${ i }): ` + xValidateResult.errorSummary,
        })
      }
    }

    // 通过校验
    return result.setValue(data)
  }
}


/**
 * 数组类型的校验器的工厂对象
 */
export class ArrayDataValidatorFactory implements DataValidatorFactory<T, V, DS> {
  private readonly validatorMaster: DataValidatorMaster
  public readonly type: T = T

  public create(schema: DS) {
    return new ArrayDataValidator(schema, this.validatorMaster)
  }

  public constructor(validatorMaster: DataValidatorMaster) {
    this.validatorMaster = validatorMaster
  }
}
