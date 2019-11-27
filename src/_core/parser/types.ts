import {
  RawDataSchema,
  DataSchema,
  RDSchema,
  DSchema,
  RDDSchema,
  DDSchema,
  RTDSchema,
  TDSchema,
} from '../schema'
import { DataSchemaParseResult } from './result'


// short format of DataSchemaParseResult (value?: DataSchema)
export type DSPResult = DataSchemaParseResult<string, any, RDSchema, DSchema>

// short format of DataSchemaParseResult (value?: DefinitionDataSchema)
export type DDSPResult = DataSchemaParseResult<string, any, RDDSchema, DDSchema>

// short format of DataSchemaParseResult (value?: TopDataSchema)
export type TDSPResult = DataSchemaParseResult<string, any, RTDSchema, TDSchema>

// short format of DataSchemaParser
export type DSParser = DataSchemaParser<string, any, RDSchema, DSchema>

// short format of DataSchemaParserConstructor
export type DSParserConstructor = DataSchemaParserConstructor<string, any, RDSchema, DSchema>


/**
 * the context of DataSchemaParser
 *
 * 数据模式解析器的上下文
 */
export interface DataSchemaParserContext {
  /**
   * 解析 DataSchema
   * @param rawSchema
   */
  parseDataSchema(rawSchema: RDSchema): DSPResult
  /**
   * Parse DefinitionDataSchema, DefinitionDataSchema defines the type declaration (reusable data schema),
   * and can be referenced by other DataSchemas in the top-level DataSchema;
   * it can also define recursive reference data schema
   *
   * 解析 DefinitionDataSchema，DefinitionDataSchema 定义了类型的声明（可重用的数据模式），可被顶层 DataSchema
   * 中的其它 DataSchema 引用；也可以定义递归引用的数据模式
   * @param name
   * @param rawSchema
   */
  parseDefinitionDataSchema(name: string, rawSchema: RDDSchema): DDSPResult
  /**
   * Parsing the top-level DataSchema, which has unique attributes
   * such as definitions and is a unit of the configuration file
   *
   * 解析顶层 DataSchema，顶层 DataSchema 中拥有 definitions 等独有属性，是配置文件的单元
   * @param rawSchema
   */
  parseTopDataSchema(rawSchema: RTDSchema): TDSPResult
  /**
   * Check if a RawDefinitionDataSchema with the specified id/path exists
   *
   * 判断是否存在指定的 id/path 的 RawDefinitionDataSchema
   * @param idOrPath
   */
  hasDefinition(idOrPath: string): boolean
  /**
   * Get RawDefinitionDataSchema by id/path of DefinitionDataSchema
   *
   * 通过 id/path 获取 RawDefinitionDataSchema
   * @param idOrPath
   */
  getRawDefinition(idOrPath: string): RDDSchema | undefined
  /**
   * Format rawDataSchema:
   *  - When rawDataSchema is a string, the schema defined as the type of this string
   *
   * 格式化 rawDataSchema：
   *  - 当 rawDataSchema 为字符串时，表示定义为此字符串的类型的 Schema
   * @param rawSchema
   */
  normalizeRawSchema(rawSchema: RDSchema): RDSchema
  /**
   * Set the default value of an optional attribute to the value
   * of the corresponding attribute in the parent data schema object
   *
   * 将可选属性的默认值置为父数据模式对象中对应属性的值
   * @param parentRawSchema 父数据模式对象
   * @param rawSchema       数据模式对象
   */
  inheritRawSchema<T extends RDSchema>(parentRawSchema: RDSchema, rawSchema: T): T
}


/**
 * 数据模式的解析器
 */
export interface DataSchemaParser<
  T extends string,
  V,
  RDS extends RawDataSchema<T, V>,
  DS extends DataSchema<T, V>> {
  /**
   * Corresponds to the type in RawDataSchema, used as a unique identifier,
   * indicates what type of RawDataSchema the parser receives
   *
   * 对应 RawDataSchema 中的 type，用作唯一标识
   * 表示该解析器接收何种类型的 RawDataSchema
   */
  readonly type: T
  /**
   * 解析数据模式的原始数据
   * @param rawSchema
   */
  parse(rawSchema: RawDataSchema<T, V>): DataSchemaParseResult<T, V, RDS, DS>
}


/**
 * DataSchema parser's constructor interface
 *
 * DataSchema 解析器的构造函数接口
 */
export interface DataSchemaParserConstructor<
  T extends string,
  V,
  RDS extends RawDataSchema<T, V>,
  DS extends DataSchema<T, V>> {
  /**
   * constructor of DataSchemaParser<T, V, RDS, DS>
   *
   * @param context   the context of DataSchemaParser
   */
  new(context: DataSchemaParserContext): DataSchemaParser<T, V, RDS, DS>
}
