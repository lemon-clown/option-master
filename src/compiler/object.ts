import { BaseDataSchemaCompiler, DataSchemaCompileResult } from '../_core/compiler'
import {
  OBJECT_V_TYPE as V,
  OBJECT_T_TYPE as T,
  RawObjectDataSchema as RDS,
  ObjectDataSchema as DS,
  ObjectDataSchema,
  RawObjectDataPropertyNameType,
  RawObjectDataPropertyItem
} from '../schema/object'
import { StringDataSchema, STRING_T_TYPE } from '../schema/string'
import { stringify, isObject } from '../_util/type-util'
import { coverBoolean, coverArray, coverString } from '../_util/cover-util'
import { DSchema } from '../_core/schema'


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
    let regexNameProperties: ObjectDataSchema['regexNameProperties'] = undefined
    if (rawSchema.properties != null) {
      if (ensureObject('properties')) {
        properties = {}
        regexNameProperties = []
        for (const propertyName of Object.getOwnPropertyNames(rawSchema.properties)) {
          let { nameType, ...propertyValueSchema } = rawSchema.properties[propertyName]

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


          // check nameType
          const nameTypeResult = coverString(RawObjectDataPropertyNameType.STRING, nameType)
          if (nameTypeResult.hasError) {
            result.addError({
              constraint: 'properties',
              reason: `nameType is invalid of (${ propertyName }): ${ nameTypeResult.errorSummary }`
            })
          } else {
            nameType = nameTypeResult.value as RawObjectDataPropertyNameType
          }

          // 检查该属性是否 required
          // 若是，则将其添加进 requiredProperties 中
          // 否则，则将其从 requiredProperties 中移除
          const propertySchema = propertyCompileResult.value!
          if (requiredIndex < 0 && propertySchema.required) {
            requiredProperties.push(propertyName)
          } else if (requiredIndex >= 0 && !propertySchema.required) {
            requiredProperties.splice(requiredIndex, 1)
          }

          switch (nameType) {
            // 字符串类型的属性名
            case RawObjectDataPropertyNameType.STRING:
              properties[propertyName] = propertyCompileResult.value!
              break
            // 正则表达式类型的属性名
            case RawObjectDataPropertyNameType.REGEX:
              let pattern: RegExp | undefined
              try {
                pattern = new RegExp(propertyName)
              } catch (e) {
                result.addError({
                  constraint: 'properties',
                  reason: `propertyName (${ propertyName }) is not a valid regex. ${ e.stack || e.message }`
                })
              } finally {
                if (pattern != null) {
                  regexNameProperties.push({
                    pattern,
                    schema: propertyCompileResult.value!
                  })
                }
              }
              break
            default:
              result.addError({
                constraint: 'properties',
                reason: `nameType of (${ propertyName }) is unknown: nameType(${ nameType })`
              })
          }
        }

        // 如果没有有效值，则置为 undefined
        if (Object.getOwnPropertyNames(properties).length <= 0) properties = undefined
        if (regexNameProperties.length <= 0) regexNameProperties = undefined
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
      regexNameProperties,
      propertyNames,
      dependencies,
      requiredProperties,
    }

    return result.setValue(schema)
  }

  /**
   * override method
   * @see DataSchemaCompiler#normalizeRawSchema
   */
  public normalizeRawSchema(rawSchema: RDS): RDS {
    rawSchema = super.normalizeRawSchema(rawSchema)
    if (rawSchema.properties != null && isObject(rawSchema.properties)) {
      for (const propertyName of Object.getOwnPropertyNames(rawSchema.properties)) {
        const rawPropertySchema: RawObjectDataPropertyItem = rawSchema.properties[propertyName]
        rawSchema.properties[propertyName] = {
          ...super.normalizeRawSchema(rawPropertySchema as RDS),
          nameType: rawPropertySchema.nameType,
        }
      }
    }
    return rawSchema
  }

  /**
   * override method
   * @see DataSchemaCompiler#toJSON
   */
  public toJSON(schema: DS): object {
    const json: any = {
      ...super.toJSON(schema),
      requiredProperties: schema.requiredProperties,
      allowAdditionalProperties: schema.allowAdditionalProperties,
      dependencies: schema.dependencies,
      silentIgnore: schema.silentIgnore,
    }

    // json-ify properties
    if (schema.properties != null && Object.getOwnPropertyNames(schema.properties).length > 0) {
      json.properties = {}
      for (const propertyName of Object.getOwnPropertyNames(schema.properties)) {
        json.properties[propertyName] = this.context.toJSON(schema.properties[propertyName])
      }
    }

    // json-ify regexNameProperties
    if (schema.regexNameProperties != null && schema.regexNameProperties.length > 0) {
      json.regexNameProperties = []
      for (const property of schema.regexNameProperties) {
        const { pattern, schema: propertySchema } = property
        const propertySchemaJson = this.context.parseJSON(propertySchema)
        json.regexNameProperties.push({ pattern: pattern.source, schema: propertySchemaJson })
      }
    }

    if (schema.propertyNames != null) {
      json.propertyNames = this.context.toJSON(schema.propertyNames)
    }

    return json
  }

  /**
   * override method
   * @see DataSchemaCompiler#parseJSON
   */
  public parseJSON(json: any): DS {
    const schema: DS = {
      ...super.parseJSON(json),
      requiredProperties: json.requiredProperties,
      allowAdditionalProperties: json.allowAdditionalProperties,
      dependencies: json.dependencies,
      silentIgnore: json.silentIgnore
    }

    // parse properties
    if (json.properties != null && Object.getOwnPropertyNames(json.properties).length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      schema.properties = {} as Exclude<DS['properties'], undefined>
      for (const propertyName of Object.getOwnPropertyNames(json.properties)) {
        schema.properties[propertyName] = this.context.parseJSON(json.properties[propertyName])
      }
    }

    // parse regexNameProperties
    if (json.regexNameProperties != null && json.regexNameProperties.length > 0) {
      schema.regexNameProperties = []
      for (const property of json.regexNameProperties) {
        const { pattern, schema: propertySchemaJson } = property
        const propertySchema: DSchema = this.context.parseJSON(propertySchemaJson)
        schema.regexNameProperties.push({ pattern: new RegExp(pattern), schema: propertySchema })
      }
    }

    if (json.propertyNames != null) {
      schema.propertyNames = this.context.parseJSON(json.propertyNames) as StringDataSchema
    }
    return schema
  }
}
