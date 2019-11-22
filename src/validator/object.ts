import { DataValidator, DataValidatorFactory } from './_base'
import { DataValidationResult } from './_result'
import { OBJECT_V_TYPE as V, OBJECT_T_TYPE as T, ObjectDataSchema as DS } from '../schema/object'
import { stringify } from '../_util/type-util'


/**
 * ObjectDataSchema 校验结果的数据类型
 */
export type ObjectDataValidationResult = DataValidationResult<T, V, DS>


/**
 * 对象类型的校验器
 */
export class ObjectDataValidator extends DataValidator<T, V, DS> {
  public readonly type: T = T

  /**
   * 包装 ObjectDataSchema 的实例，使其具备校验给定数据是否为合法对象的能力
   * @param data
   */
  public validate(data: any): ObjectDataValidationResult {
    const { schema } = this
    const result: ObjectDataValidationResult = super.validate(data)
    data = result.value
    result.setValue(undefined)

    // 若未设置值，则无需进一步校验
    if (data == null) return result

    // 检查是否为对象
    if (!result.ensureObject('type', data)) return result

    const value: any = {}
    for (const propertyName of Object.getOwnPropertyNames(data)) {
      const propertyValue = data[propertyName]

      // 检查是否满足 properties 中的定义
      if (schema.properties != null) {
        // 在 properties 中定义了的属性
        if (schema.properties.hasOwnProperty(propertyName)) {
          // 使用指定的 DataSchema 进行检查
          const xSchema = schema.properties[propertyName]
          const xValidateResult = this.validatorMaster.validate(xSchema, propertyValue)
          result.addHandleResult('properties', xValidateResult, propertyName)

          // 若符合，则更新值
          if (!xValidateResult.hasError) {
            value[propertyName] = xValidateResult.value
          }
          continue
        }
      }

      // 若不允许额外的属性，则直接忽略
      if (!schema.allowAdditionalProperties) {
        if (!schema.silentIgnore) {
          result.addWarning({
            constraint: 'properties',
            property: propertyName,
            reason: `property(${ propertyName }) is not defined (allowAdditionalProperties is false), skipped.`
          })
        }
        continue
      }

      // 对额外属性做检查
      if (schema.propertyNames != null) {
        // 检查是否符合 propertyNames 的定义
        const xSchema = schema.propertyNames
        const xValidateResult = this.validatorMaster.validate(xSchema, propertyName)
        if (xValidateResult.hasError) {
          if (!schema.silentIgnore) {
            result.addWarning({
              constraint: 'propertyNames',
              property: propertyName,
              reason: `property(${ propertyName }) is not matched propertyNamesSchema, skipped.`,
              traces: [...xValidateResult.errors, ...xValidateResult.warnings],
            })
          }
        } else {
          result.addHandleResult('propertyNames', xValidateResult)
        }

        // 若不符合，则忽略
        if (xValidateResult.hasError) continue
      }
      // 属性名通过校验，直接更新值
      value[propertyName] = propertyValue
    }

    // 检查 schema 中定义的值
    if (schema.properties != null) {
      for (const propertyName of Object.getOwnPropertyNames(schema.properties)) {
        /**
         * 如果已经定义了，则忽略；
         * 不要使用 value.hasOwnProperty 判断，因为可能该属性的子判断结果存在异常，导致其值未设置
         * 因此使用 data.hasOwnProperty 进行判断
         */
        if (data.hasOwnProperty(propertyName)) continue
        const xSchema = schema.properties[propertyName]
        const xValidateResult = this.validatorMaster.validate(xSchema, undefined)
        result.addHandleResult('properties', xValidateResult, propertyName)

        // 若不存在 error 且值不为 undefined，则更新值
        if (!xValidateResult.hasError && xValidateResult.value !== undefined) {
          value[propertyName] = xValidateResult.value
        }
      }
    }

    // 检查是否满足 dependencies
    if (schema.dependencies != null) {
      for (const propertyName of Object.getOwnPropertyNames(schema.dependencies)) {
        const dependencies = schema.dependencies[propertyName]
        // 如果某个属性出现了，那么其依赖的属性也必须出现
        if (value.hasOwnProperty(propertyName)) {
          for (const dependencyName of dependencies) {
            if (!value.hasOwnProperty(dependencyName)) {
              result.addError({
                constraint: 'dependencies',
                property: propertyName,
                reason: `${ propertyName } depend on ${ stringify(dependencies) }, but "${ dependencyName }" is absent.`
              })
            }
          }
        }
      }
    }

    // 若未产生错误，则通过校验，并设置 value
    if (!result.hasError) result.setValue(value)
    return result
  }
}


/**
 * 对象类型的校验器的工厂对象
 */
export class ObjectDataValidatorFactory extends DataValidatorFactory<T, V, DS> {
  public readonly type: T = T

  public create(schema: DS) {
    return new ObjectDataValidator(schema, this.validatorMaster)
  }
}
