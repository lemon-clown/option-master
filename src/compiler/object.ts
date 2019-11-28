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

    // allowAdditionalProperties 的默认值为 false
    const allowAdditionalPropertiesResult = result.compileProperty<boolean>('allowAdditionalProperties', coverBoolean, false)

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

    // 编译 properties
    let properties: ObjectDataSchema['properties'] = undefined
    if (rawSchema.properties != null) {
      if (ensureObject('properties')) {
        properties = {}
        for (const propertyName of Object.getOwnPropertyNames(rawSchema.properties)) {
          const propertyValueSchema = rawSchema.properties[propertyName]
          const propertyCompileResult = this.context.compileDataSchema(propertyValueSchema)
          result.addHandleResult('properties', propertyCompileResult)

          // 如果存在错误，则忽略此属性
          // 否则，添加属性对应的 DataSchema
          if (propertyCompileResult.hasError) continue
          properties[propertyName] = propertyCompileResult.value!
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

    // ObjectDataSchema
    const schema: DS = {
      ...result.value!,
      default: defaultValue,
      allowAdditionalProperties: Boolean(allowAdditionalPropertiesResult.value),
      silentIgnore: Boolean(silentIgnoreResult.value),
      properties,
      propertyNames,
      dependencies,
    }

    return result.setValue(schema)
  }
}
