import { DataValidator, DataValidationResult, DataValidatorFactory } from './_base'
import { COMBINE_V_TYPE as V, COMBINE_T_TYPE as T, CombineDataSchema as DS, CombineStrategy } from '../schema/combine'
import { DataValidatorMaster, DValidationResult } from './_master'


/**
 * CombineDataSchema 校验结果的数据类型
 */
export type CombineDataValidationResult = DataValidationResult<T, V, DS>


/**
 * 组合类型的校验器
 */
export class CombineDataValidator implements DataValidator<T, V, DS> {
  private readonly validatorMaster: DataValidatorMaster
  private readonly schema: DS
  public readonly type: T = T

  public constructor(schema: DS, validatorMaster: DataValidatorMaster) {
    this.schema = schema
    this.validatorMaster = validatorMaster
  }

  /**
   * 包装 CombineDataSchema 的实例，使其具备校验给定数据是否为合法组合的能力
   * @param data
   */
  public validate (data: any): CombineDataValidationResult {
    const { schema } = this
    const { strategy, allOf, anyOf, oneOf } = schema
    const result: CombineDataValidationResult = new DataValidationResult(schema)
    data = result.baseValidate(data)

    // 若未设置值，则无需进一步校验
    if (data == null) return result

    // 已检查的项的个数
    let checkedCount = 0
    // 通过校验的项的个数
    let validCount = 0

    let allOfResult: DValidationResult | undefined = undefined  // allOf 的校验结果
    let anyOfResult: DValidationResult | undefined = undefined  // oneOf 的校验结果
    let oneOfResult: DValidationResult | undefined = undefined  // anyOf 的校验结果

    // 检查是否要判断 allOf
    if (allOf != null && allOf.length > 0) {
      let valid = true
      let value = data
      allOfResult = new DataValidationResult(schema)
      for (const xSchema of allOf) {
        const xValidateResult = this.validatorMaster.validate(xSchema, value)
        allOfResult.addHandleResult('allOf', xValidateResult)
        if (xValidateResult.hasError) {
          valid = false
          break
        } else {
          // 如果没有错误，则更新 value，因为若是 allOf 全通过的话，value 值应都相同
          value = xValidateResult.value
          allOfResult.setValue(value)
        }
      }
      ++checkedCount
      if (valid) ++validCount
      else {
        allOfResult.addError({
          constraint: 'allOf',
          reason: 'not matched all of DataSchemas defined in `allOf`',
        })
      }
    }

    // 检查是否要判断 anyOf
    if (anyOf != null && anyOf.length > 0) {
      let valid = false
      anyOfResult = new DataValidationResult(schema)
      for (const xSchema of anyOf) {
        const xValidateResult = this.validatorMaster.validate(xSchema, data)
        // anyOf 不需要符合每一项模式，不符合则继续匹配
        // 因此仅在匹配到时才添加 `warning`
        if (xValidateResult.hasError) continue

        // 通过校验，不过仍要合并可能的 warning
        valid = true
        anyOfResult
          .addHandleResult('allOf', xValidateResult)
          .setValue(xValidateResult.value)
        break
      }
      ++checkedCount
      if (valid) ++validCount
      else {
        anyOfResult.addError({
          constraint: 'anyOf',
          reason: 'not matched any of DataSchemas defined in `anyOf`',
        })
      }
    }

    // 检查是否要判断 oneOf
    if (oneOf != null && oneOf.length > 0) {
      let count = 0
      oneOfResult = new DataValidationResult(schema)
      for (const xSchema of oneOf) {
        const xValidateResult = this.validatorMaster.validate(xSchema, data)
        // oneOf 需要匹配每一项模式，不符合则继续匹配
        // 因此仅在匹配到时才添加 `warning`
        if (xValidateResult.hasError) continue

        // 通过校验，不过仍要合并可能的 warning
        oneOfResult
          .addHandleResult('oneOf', xValidateResult)
          .setValue(xValidateResult.value)
        ++count
      }

      ++checkedCount
      if (count === 1) ++validCount
      else {
        oneOfResult.addError({
          constraint: 'oneOf',
          reason: `expected matched only one of the DataSchemas defined in \`oneOf\`, but matched ${ count } DataSchemas`
        })
      }
    }

    let valid = false
    let reason = ''
    switch (strategy) {
      case CombineStrategy.ALL:
        valid = checkedCount === validCount
        if (!valid) reason = 'not matched all of [allOf, anyOf, oneOf]'
        break
      case CombineStrategy.ANY:
        valid = validCount > 0
        if (!valid) reason = 'not matched any of [allOf, anyOf, oneOf]'
        break
      case CombineStrategy.ONE:
        valid = validCount === 1
        if (!valid) reason = `expected matched oneOf [allOf, anyOf, oneOf], but matched ${ validCount } of them`
        break
    }

    if (!valid) {
      if (allOfResult != null) result.merge(allOfResult)
      if (anyOfResult != null) result.merge(anyOfResult)
      if (oneOfResult != null) result.merge(oneOfResult)
      result.addError({ constraint: 'strategy', reason })
      return result
    }
    return result.setValue(data)
  }
}


/**
 * 组合类型的校验器的工厂对象实例
 */

export class CombineDataValidatorFactory implements DataValidatorFactory<T, V, DS> {
  private readonly validatorMaster: DataValidatorMaster
  public readonly type: T = T


  public create(schema: DS) {
    return new CombineDataValidator(schema, this.validatorMaster)
  }

  public constructor(validatorMaster: DataValidatorMaster) {
    this.validatorMaster = validatorMaster
  }
}
