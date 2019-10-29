import { DataSchemaParser, DataSchemaParseResult } from './_base'
import { DataSchemaParserMaster } from './_master'
import { OBJECT_V_TYPE as V, OBJECT_T_TYPE as T, RawObjectDataSchema as RDS, ObjectDataSchema as DS, RawObjectDataSchema, ObjectDataSchema } from '../schema/object'
import { StringDataSchema, STRING_T_TYPE } from '../schema/string'
import { stringify, isString } from '../_util/type-util'
import { coverBoolean } from '../_util/cover-util'


/**
 * ObjectDataSchema 解析结果的数据类型
 */
export type ObjectDataSchemaParserResult = DataSchemaParseResult<T, V, RDS, DS>


/**
 * 对象类型的模式的解析器
 *
 * enum 将忽略所有非对象的值
 */
export class ObjectDataSchemaParser implements DataSchemaParser<T, V, RDS, DS> {
  private readonly parserMaster: DataSchemaParserMaster
  public readonly type: T = T

  public constructor (parserMaster: DataSchemaParserMaster) {
    this.parserMaster = parserMaster
  }

  /**
   * parse RawSchema to Schema
   * @param path
   * @param rawSchema
   */
  public parse (path: string, rawSchema: RDS): ObjectDataSchemaParserResult {
    const result: ObjectDataSchemaParserResult = new DataSchemaParseResult(path, rawSchema)

    // required 的默认值为 false
    const required = result.parseProperty<boolean>('required', coverBoolean, false)

    // allowAdditionalProperties 的默认值为 false
    const allowAdditionalProperties = result.parseProperty<boolean>('allowAdditionalProperties', coverBoolean, false)

    // 检查 defaultValue 是否为对象
    let defaultValue: ObjectDataSchema['default'] = undefined
    if (rawSchema.default != null) {
      if (result.ensureObject('default')) {
        defaultValue = rawSchema.default
      }
    }

    // 解析 properties
    let properties: ObjectDataSchema['properties'] = undefined
    if (rawSchema.properties != null) {
      if (result.ensureObject('properties')) {
        properties = {}
        for (const propertyName of Object.getOwnPropertyNames(rawSchema.properties)) {
          const propertyValue = rawSchema.properties[propertyName]
          const propertyParserResult = this.parserMaster.parse(path + '.' + propertyName, propertyValue)

          // 如果存在错误，则忽略此属性
          if (propertyParserResult.hasError) {
            result.addError({
              constraint: 'properties',
              reason: `${ propertyName }: ` + propertyParserResult.errorSummary,
            })
            continue
          }

          // 添加属性对应的 DataSchema
          properties[propertyName] = propertyParserResult.schema!
        }
      }
    }

    // 解析 propertyNames
    let propertyNames: ObjectDataSchema['propertyNames'] = undefined
    if (rawSchema.propertyNames != null) {
      if (rawSchema.propertyNames.type !== STRING_T_TYPE) {
        result.addError({
          constraint: 'propertyNames',
          reason: `propertyNames must be a StringDataSchema, but got ${ stringify(rawSchema.propertyNames) }.`
        })
      } else {
        const propertyNamesParserResult = this.parserMaster.parse(path + '.$propertyNames', rawSchema.propertyNames)
        propertyNames = propertyNamesParserResult.schema as StringDataSchema
      }
    }

    // 解析 dependencies
    let dependencies: ObjectDataSchema['dependencies'] = undefined
    if (rawSchema.dependencies != null) {
      if (result.ensureObject('dependencies')) {
        dependencies = {}
        for (const propertyName of Object.getOwnPropertyNames(rawSchema.dependencies)) {
          const propertyValue = rawSchema.dependencies[propertyName]
          if (!isString(propertyValue)) {
            result.addError({
              constraint: 'dependencies',
              reason: `dependencies[${ propertyName }] expected a string value. but got ${ stringify(propertyValue) }`
            })
            continue
          }
          dependencies[propertyName] = propertyValue
        }
      }
    }

    // ObjectDataSchema
    const schema: DS = {
      type: this.type,
      path,
      required: Boolean(required.value),
      default: defaultValue,
      allowAdditionalProperties: Boolean(allowAdditionalProperties.value),
      properties,
      propertyNames,
      dependencies,
    }

    return result.setSchema(schema)
  }
}
