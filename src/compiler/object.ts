import { BaseDataSchemaCompiler, DataSchemaCompileResult } from '../_core/compiler'
import { OBJECT_V_TYPE as V, OBJECT_T_TYPE as T, RawObjectDataSchema as RDS, ObjectDataSchema as DS, ObjectDataSchema } from '../schema/object'
import { StringDataSchema, STRING_T_TYPE } from '../schema/string'
import { stringify, isObject } from '../_util/type-util'
import { coverBoolean, coverArray, coverString } from '../_util/cover-util'


/**
 * ObjectDataSchema 编译结果的数据类型
 */
export type ObjectDataSchemaCompileResult = DataSchemaCompileResult<T, V, RDS, DS>


/**
 * 对象类型的模式的编译器
 *
 * enum 将忽略所有非对象的值
 */
export class ObjectDataSchemaCompiler extends BaseDataSchemaCompiler<T, V, RDS, DS> {
  public readonly type: T = T

  /**
   * compile RawSchema to Schema
   * @param rawSchema
   */
  public compile (rawSchema: RDS): ObjectDataSchemaCompileResult {
    const result: ObjectDataSchemaCompileResult = super.compile(rawSchema)
    rawSchema = result._rawSchema

    // silentIgnore 的默认值为 false
    const silentIgnoreResult = result.compileProperty<boolean>('silentIgnore', coverBoolean, false)

    // 校验属性是否为对象
    const ensureObject = (propertyName: keyof RDS) => {
      if (!isObject(rawSchema[propertyName])) {
        result.addError({
          constraint: propertyName as string,
          reason: `${ propertyName } must be an object, but got (${ stringify(rawSchema[propertyName]) }).`
        })
        return false
      }
      return true
    }

    // 检查 defaultValue 是否为对象
    let defaultValue: ObjectDataSchema['default'] = undefined
    if (rawSchema.default != null) {
      if (ensureObject('default')) {
        defaultValue = rawSchema.default
      }
    }

    // requiredProperties
    const { value: requiredProperties = [] } = result.compileProperty<string[]>(
      'requiredProperties', coverArray<string>(coverString)
    )

    // 编译 properties
    let properties: ObjectDataSchema['properties'] = undefined
    if (rawSchema.properties != null) {
      if (ensureObject('properties')) {
        properties = {}
        for (const propertyName of Object.getOwnPropertyNames(rawSchema.properties)) {
          let propertyValueSchema = rawSchema.properties[propertyName]

          // 如果属性在 requiredProperties 中定义了，则其 required 默认值为 true
          const requiredIndex = requiredProperties.indexOf(propertyName)
          if (requiredIndex >= 0) {
            propertyValueSchema = {
              required: true,
              ...propertyValueSchema
            }
          }

          const propertyCompileResult = this.context.compileDataSchema(propertyValueSchema)
          result.addHandleResult('properties', propertyCompileResult)

          // 如果存在错误，则忽略此属性
          if (propertyCompileResult.hasError) continue

          // 否则，添加属性对应的 DataSchema，同时检查该属性是否 required
          // 若是，则将其添加进 requiredProperties 中
          // 否则，则将其从 requiredProperties 中移除
          properties[propertyName] = propertyCompileResult.value!
          if (requiredIndex < 0 && properties[propertyName].required) {
            requiredProperties.push(propertyName)
          } else if (requiredIndex >= 0 && !properties[propertyName].required) {
            requiredProperties.splice(requiredIndex, 1)
          }
        }
      }
    }

    // 编译 propertyNames
    let propertyNames: ObjectDataSchema['propertyNames'] = undefined
    if (rawSchema.propertyNames != null) {
      if (rawSchema.propertyNames.type !== STRING_T_TYPE) {
        result.addError({
          constraint: 'propertyNames',
          reason: `propertyNames must be a StringDataSchema, but got (${ stringify(rawSchema.propertyNames) }).`
        })
      } else {
        const propertyNamesCompileResult = this.context.compileDataSchema(rawSchema.propertyNames)
        result.addHandleResult('propertyNames', propertyNamesCompileResult)
        // 如果存在错误，则忽略此属性
        if (!result.hasError) {
          propertyNames = propertyNamesCompileResult.value as StringDataSchema
        }
      }
    }

    // 编译 dependencies
    let dependencies: ObjectDataSchema['dependencies'] = undefined
    if (rawSchema.dependencies != null) {
      if (ensureObject('dependencies')) {
        dependencies = {}
        for (const propertyName of Object.getOwnPropertyNames(rawSchema.dependencies)) {
          const propertyValue = rawSchema.dependencies[propertyName]
          const xResult = coverArray(coverString)(propertyValue)
          if (xResult.hasError) {
            result.addError({
              constraint: 'dependencies',
              reason: xResult.errorSummary,
            })
            continue
          }
          dependencies[propertyName] = propertyValue
        }
      }
    }

    // allowAdditionalProperties 的默认值为 false
    // 若 propertyNames 不为 null，则默认值为 true
    const allowAdditionalPropertiesResult = result.compileProperty<boolean>(
      'allowAdditionalProperties', coverBoolean, propertyNames != null)

    // ObjectDataSchema
    const schema: DS = {
      ...result.value!,
      default: defaultValue,
      allowAdditionalProperties: Boolean(allowAdditionalPropertiesResult.value),
      silentIgnore: Boolean(silentIgnoreResult.value),
      properties,
      propertyNames,
      dependencies,
      requiredProperties,
    }

    return result.setValue(schema)
  }
}
