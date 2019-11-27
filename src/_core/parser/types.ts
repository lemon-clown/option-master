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
 * DataSchema 解析器的上下文
 */
export interface DataSchemaParserContext {
  /**
   * 递归解析 DataSchema
   * @param rawSchema
   */
  parseDataSchema(rawSchema: RDSchema): DSPResult
  /**
   *
   * @param name
   * @param rawSchema
   */
  parseDefinitionDataSchema(name: string, rawSchema: RDDSchema): DDSPResult
  /**
   *
   * @param rawSchema
   */
  parseTopDataSchema(rawSchema: RTDSchema): TDSPResult
  /**
   * 检查是否存在指定唯一标识符 (`$id`) 或者路径（`#/definitions/<name>`) 的 DefinitionDataSchema
   *
   * @param idOrPath
   */
  hasDefinition(idOrPath: string): boolean
  /**
   *
   * @param idOrPath
   */
  getRawDefinition(idOrPath: string): RDDSchema | undefined
  /**
   * 格式化 rawDataSchema
   * 当 rawDataSchema 为字符串时，表示定义为此字符串的类型的 Schema
   * @param rawSchema
   */
  normalizeRawSchema(rawSchema: RDSchema): RDSchema
  /**
   *
   * @param parentRawSchema
   * @param rawSchema
   */
  inheritRawSchema<T extends RDSchema>(parentRawSchema: RDSchema, rawSchema: T): T
}


/**
 *
 */
export interface DataSchemaParser<
  T extends string,
  V,
  RDS extends RawDataSchema<T, V>,
  DS extends DataSchema<T, V>> {
  /**
   * 对应 RawDataSchema 中的 type，用作唯一标识
   * 表示该解析器接收何种类型的 RawDataSchema
   */
  readonly type: T
  /**
   *
   *
   * @param rawSchema
   */
  parse(rawSchema: RawDataSchema<T, V>): DataSchemaParseResult<T, V, RDS, DS>
}


/**
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
