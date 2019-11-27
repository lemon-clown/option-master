import { isString, stringify } from '../../_util/type-util'
import { coverString } from '../../_util/cover-util'
import {
  RDSchema,
  RDDSchema,
  RTDSchema,
  TDSchema,
  DDSchema,
  DefinitionDataSchemaMaster,
} from '../schema'
import { DSParser, DataSchemaParserContext, DSPResult, DDSPResult, TDSPResult } from './types'
import { DataSchemaParseResult } from './result'


/**
 * Objects managed by the data pattern parser
 *  - Registration operation: enable a user-defined Schema type to be correctly resolved
 *  - Replace operation: replace the parser of a schema of the original type
 *  - Parsing operation: for the specified RawSchema object, find a suitable parser
 *    to parse its value to get the Schema
 *
 * 数据模式解析器的管理对象
 *  - 注册操作：使得一个用户自定义的 Schema 类型能被正确解析
 *  - 替换操作：替换一个原有类型的 Schema 的解析器
 *  - 解析操作：对于指定的 RawSchema 对象，寻找合适的解析器解析其值，得到 Schema
 */
export class DataSchemaParserMaster implements DataSchemaParserContext {
  /**
   * Mapping of the DataSchema.type and DataSchemaParser
   *
   * DataSchema.type 和 DataSchemaParser 的映射
   */
  protected readonly parserMap: Map<string, DSParser>
  /**
   * DefinitionDataSchema management object instance for resolving reference nodes
   *
   * 数据模式管理对象实例，用于解析引用节点
   */
  protected readonly definitionSchemaMaster: DefinitionDataSchemaMaster

  public constructor(parserMap?: Map<string, DSParser>) {
    this.parserMap = parserMap != null ? parserMap : new Map()
    this.definitionSchemaMaster = new DefinitionDataSchemaMaster()
  }

  /**
   * Add DataSchemaParser, if the parser of the specified type already exists, ignore this addition
   *
   * 添加 DataSchemaParser，若指定的 type 的解析器已存在，则忽略此次添加
   * @param type
   * @param schemaParser
   */
  public registerParser(type: string, schemaParser: DSParser): void {
    if (this.parserMap.has(type)) return
    this.parserMap.set(type, schemaParser)
  }

  /**
   * Overwrite the existing DataSchemaParser.
   * If there is no corresponding DataSchemaParser before the specified type, add it.
   *
   * 覆盖已有的 DataSchemaParser；
   * 若指定的 type 之前没有对应的 DataSchemaParser，也做添加操作
   * @param type
   * @param schemaParser
   */
  public replaceParser(type: string, schemaParser: DSParser) {
    this.parserMap.set(type, schemaParser)
  }

  /**
   * override method
   * @see DataSchemaParserContext#parseDataSchema
   */
  public parseDataSchema(rawSchema: RDSchema): DSPResult {
    rawSchema = this.normalizeRawSchema(rawSchema)

    // check type
    if (rawSchema == null || !isString(rawSchema.type)) {
      const result: DSPResult = new DataSchemaParseResult(rawSchema)
      return result.addError({
        constraint: 'type',
        reason: `\`schema.type\` must be a string, but got (${ stringify(rawSchema.type) }).`
      })
    }

    // delegate to the specified type of parser
    const parser = this.parserMap.get(rawSchema.type)
    if (parser == null) {
      const result: DSPResult = new DataSchemaParseResult(rawSchema)
      return result.addError({
        constraint: 'type',
        reason: `unknown \`schema.type\`: ${ stringify(rawSchema.type) }.`
      })
    }

    return parser.parse(rawSchema)
  }

  /**
   * override method
   * @see DataSchemaParserContext#parseDefinitionDataSchema
   */
  public parseDefinitionDataSchema(name: string, rawSchema: RDDSchema): DDSPResult {
    rawSchema = this.normalizeRawSchema(rawSchema)
    const result: DDSPResult = new DataSchemaParseResult(rawSchema)

    // parse $id
    const $idResult = result.parseProperty('$id', coverString, undefined)

    // pre-add schema (parsing)
    const $path = this.definitionSchemaMaster.nameToPath(name)
    this.definitionSchemaMaster.addRawSchema($path, rawSchema, $idResult.value)

    const dataSchemaResult = this.parseDataSchema(rawSchema)
    result.merge(dataSchemaResult)
    if (!dataSchemaResult.hasError) {
      const schema: DDSchema = {
        ...dataSchemaResult.value!,
        $id: $idResult.value!,
      }
      result.setValue(schema)
    }

    return result
  }

  /**
   * override method
   * @see DataSchemaParserContext#parseTopDataSchema
   */
  public parseTopDataSchema(rawSchema: RTDSchema): TDSPResult {
    rawSchema = this.normalizeRawSchema(rawSchema)
    const result: TDSPResult = new DataSchemaParseResult(rawSchema)
    this.definitionSchemaMaster.clear()

    try {
      // parse definitions first
      let definitions: TDSchema['definitions'] = undefined
      if (rawSchema.definitions != null) {
        definitions = {}
        for (const name of Object.getOwnPropertyNames(rawSchema.definitions)) {
          const rawDefinitionSchema = rawSchema.definitions[name]
          const definitionSchemaResult = this.parseDefinitionDataSchema(name, rawDefinitionSchema)
          // merge errors and warnings
          if (definitionSchemaResult.hasError || definitionSchemaResult.hasWarning) {
            result.addHandleResult('definitions', definitionSchemaResult)
          }
          // collect definition
          if (!definitionSchemaResult.hasError) {
            definitions[name] = definitionSchemaResult.value!
          }
        }
      }

      // parse other property
      const dataSchemaResult = this.parseDataSchema(rawSchema)
      result.merge(dataSchemaResult)

      // check for errors
      if (!result.hasError) {
        const schema: TDSchema = {
          definitions,
          ...dataSchemaResult.value!,
        }
        result.setValue(schema)
      }
    } finally {
      // Need to clean up the definitionSchemaMaster even if an exception is thrown
      this.definitionSchemaMaster.clear()
    }

    return result
  }

  /**
   * override method
   * @see DataSchemaParserContext#hasDefinition
   */
  public hasDefinition(idOrPath: string): boolean {
    return this.definitionSchemaMaster.has(idOrPath)
  }

  /**
   * override method
   * @see DataSchemaParserContext#getRawDefinition
   */
  public getRawDefinition(idOrPath: string): RDDSchema | undefined {
    return this.definitionSchemaMaster.getRawSchema(idOrPath)
  }

  /**
   * override method
   * @see DataSchemaParserContext#normalizeRawSchema
   */
  public normalizeRawSchema(rawSchema: RDSchema): RDSchema {
    if (isString(rawSchema)) {
      return { type: rawSchema }
    }
    return { ...rawSchema }
  }

  /**
   * override method
   * @see DataSchemaParserContext#inheritRawSchema
   */
  public inheritRawSchema<T extends RDSchema>(defaultRawSchema: RDSchema, rawSchema: T): T {
    return {
      required: defaultRawSchema.required,
      ...rawSchema,
    }
  }
}
