import { DataValidator, DataValidationResult, DataValidatorFactory } from './_base'
import { OBJECT_V_TYPE as V, OBJECT_T_TYPE as T, ObjectDataSchema as DS } from '../schema/object'
import { stringify } from '../_util/type-util'
import { DataValidatorMaster } from './_master'


/**
 * ObjectDataSchema 校验结果的数据类型
 */
export type ObjectDataValidationResult = DataValidationResult<T, V, DS>


/**
 * 对象类型的校验器
 */
export class ObjectDataValidator implements DataValidator<T, V, DS> {
  private readonly validatorMaster: DataValidatorMaster
  private readonly schema: DS
  public readonly type: T = T

  public constructor(schema: DS, validatorMaster: DataValidatorMaster) {
    this.schema = schema
    this.validatorMaster = validatorMaster
  }

  /**
   * 包装 ObjectDataSchema 的实例，使其具备校验给定数据是否为合法对象的能力
   * @param data
   */
  public validate(data: any): ObjectDataValidationResult {
    const { schema } = this
    const result: ObjectDataValidationResult = new DataValidationResult(schema)
    data = result.baseValidate(data)

    // 若未设置值，则无需进一步校验
    if (data == null) return result

    // 检查是否为对象
    result.ensureObject('type', data)

    const value: any = {}
    for (const propertyName of Object.getOwnPropertyNames(data)) {
      const propertyValue = data[propertyName]

      // 检查是否满足 properties 中的定义
      if (schema.properties != null) {
        // 未在 properties 中定义的属性
        if (schema.properties[propertyName] == null) {
          // 若不允许额外的属性，则直接忽略
          if (!schema.allowAdditionalProperties) {
            result.addWarning({
              constraint: 'properties',
              reason: `property(${ propertyName }) is not defined, ignore (allowAdditionalProperties is false).`
            })
            continue
          }

          // 检查是否符合 propertyNames 的定义
          if (schema.propertyNames != null) {
            const xValidateResult = this.validatorMaster.validate(schema.propertyNames, propertyName)

            // 若不符合，则忽略
            if (xValidateResult.hasError) {
              result.merge(xValidateResult)
              continue
            }
          }
        }

        // 在 properties 中定义了的属性，使用指定的 DataSchema 进行检查
        const xValidateResult = this.validatorMaster.validate(schema.properties[propertyName], propertyValue)

        // 若不符合，则终止解析
        if (xValidateResult.hasError) {
          return result.merge(xValidateResult)
        }

        // 否则，添加到值中
        value[propertyName] = propertyValue
      }
    }

    // 检查是否满足 dependencies
    if (schema.dependencies != null) {
      for (const propertyName of Object.getOwnPropertyNames(schema.dependencies)) {
        const propertyValue = schema.dependencies[propertyName]
        // 如果某个属性出现了，那么其依赖的属性也必须出现
        if (value[propertyName] != null) {
          for (const v of propertyValue) {
            if (value[v] == null) {
              return result.addError({
                constraint: 'dependencies',
                reason: `${ propertyName } depend on ${ stringify(propertyValue) }, but ${ v } is absent.`
              })
            }
          }
        }
      }
    }

    // 通过校验
    return result.setValue(value)
  }
}


/**
 * 对象类型的校验器的工厂对象
 */
export class ObjectDataValidatorFactory implements DataValidatorFactory<T, V, DS> {
  private readonly validatorMaster: DataValidatorMaster
  public readonly type: T = T

  public create(schema: DS) {
    return new ObjectDataValidator(schema, this.validatorMaster)
  }

  public constructor(validatorMaster: DataValidatorMaster) {
    this.validatorMaster = validatorMaster
  }
}
