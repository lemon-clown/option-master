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
 * 数据模式解析器的管理对象
 *  - 注册操作：使得一个用户自定义的 Schema 类型能被正确解析
 *  - 替换操作：替换一个原有类型的 Schema 的解析器
 *  - 解析操作：对于指定的 RawSchema 对象，寻找合适的解析器解析其值，得到 Schema
 *
 * 对于引用节点，必须保证在解析到其时，其引用的节点已被解析到
 */
export class DataSchemaParserMaster implements DataSchemaParserContext {
  /**
   * DataSchema.type 和 DataSchemaParser 的映射
   */
  protected readonly parserMap: Map<string, DSParser>
  /**
   * 数据模式管理对象实例
   * 用于解析引用节点
   */
  protected readonly definitionSchemaMaster: DefinitionDataSchemaMaster

  public constructor(parserMap?: Map<string, DSParser>) {
    this.parserMap = parserMap != null ? parserMap : new Map()
    this.definitionSchemaMaster = new DefinitionDataSchemaMaster()
  }

  /**
   * 添加 DataSchemaParser，若指定的 type 已存在，则忽略此次添加
   * @param type
   * @param schemaParser
   */
  public registerParser(type: string, schemaParser: DSParser): void {
    if (this.parserMap.has(type)) return
    this.parserMap.set(type, schemaParser)
  }

  /**
   * 覆盖已有的 DataSchemaParser，若指定的 type 之前没有对应的 DataSchemaParser，也做添加操作
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

    // add schema (parsing finished)
    this.definitionSchemaMaster.addSchema($path, result.value)
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
   * @see DataSchemaParserContext#coverRawSchema
   */
  public inheritRawSchema<T extends RDSchema>(defaultRawSchema: RDSchema, rawSchema: T): T {
    return {
      required: defaultRawSchema.required,
      ...rawSchema,
    }
  }
}
