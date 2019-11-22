import { RawDataSchema, DataSchema, RDSchema } from '../schema/_base'
import { DataSchemaMaster } from '../schema/_master'
import { isString, stringify } from '../_util/type-util'
import { DataSchemaParser, DataSchemaParserConstructor } from './_base'
import { DataSchemaParseResult } from './_result'


type T = string
type V = any
type DS = DataSchema<T, V>
type RDS = RawDataSchema<T, V>
export type DSParser = DataSchemaParser<T, V, RDS, DS>
export type DSParserConstructor = DataSchemaParserConstructor<T, V, RDS, DS>
export type DSParseResult = DataSchemaParseResult<T, V, RDS, DS>


/**
 * 解析模式
 */
export enum ParserMode {
  /**
   * 对 RawDataSchema 进行且拷贝
   */
  SHALLOW_CLONE = 'shallow-clone',
  /**
   * 对 RawDataSchema 进行深拷贝
   */
  DEEP_CLONE = 'deep-clone'
}


/**
 * 数据模式解析器的管理对象
 *  - 注册操作：使得一个用户自定义的 Schema 类型能被正确解析
 *  - 替换操作：替换一个原有类型的 Schema 的解析器
 *  - 解析操作：对于指定的 RawSchema 对象，寻找合适的解析器解析其值，得到 Schema
 *
 * 对于引用节点，必须保证在解析到其时，其引用的节点已被解析到
 */
export class DataSchemaParserMaster {
  /**
   * 解析模式
   *  - 对 RawDataSchema 的拷贝模式
   */
  protected readonly mode: ParserMode

  /**
   * DataSchema.type 和 DataSchemaParser 的映射
   */
  protected readonly parserMap: Map<string, DSParser>

  /**
   * 数据模式管理对象实例
   * 用于解析引用节点
   */
  protected readonly dataSchemaMaster: DataSchemaMaster

  public constructor(
    dataSchemaMaster?: DataSchemaMaster,
    mode?: ParserMode,
    parserMap?: Map<string, DSParser>,
  ) {
    this.dataSchemaMaster = dataSchemaMaster != null ? dataSchemaMaster : new DataSchemaMaster()
    this.mode = mode != null ? mode : ParserMode.SHALLOW_CLONE
    this.parserMap = parserMap != null ? parserMap : new Map()
  }

  /**
   * 清除当前已解析到的 RawDataSchema
   */
  public reset() {
    this.dataSchemaMaster.clear()
  }

  /**
   * 通过 $id 获取 RawDataSchema
   * @param $id
   */
  public getRawDataSchema($id: string): RDSchema | undefined {
    return this.dataSchemaMaster.getRawDataSchema($id)
  }

  /**
   * 是否存在含指定 $id 的 RawDataSchema
   * @param $id
   */
  public has($id: string): boolean {
    return this.dataSchemaMaster.has($id)
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
   * 执行解析操作
   * @param rawDataSchema   待解析的 RawDataSchema
   */
  public parse(rawDataSchema: RDS): DSParseResult {
    rawDataSchema = this.normalizeRawSchema(rawDataSchema)

    // 注册 RawDataSchema
    if (rawDataSchema.$id != null) {
      // 检查 id 是否已被占用
      if (this.dataSchemaMaster.has(rawDataSchema.$id)) {
        const result: DSParseResult = new DataSchemaParseResult(rawDataSchema)
        return result.addError({
          constraint: '$id',
          reason: `Duplicated \`schema.$id\`(${ rawDataSchema.$id }).`
        })
      }
      // 否则，添加进映射中
      this.dataSchemaMaster.addRawDataSchema(rawDataSchema.$id, rawDataSchema)
    }

    // 先进行解析，无论结果如何，都要判断是否要更新 dataSchemaMaster
    const schemaResult = (() => {
      if (rawDataSchema == null || !isString(rawDataSchema.type)) {
        const result: DSParseResult = new DataSchemaParseResult(rawDataSchema)
        return result.addError({
          constraint: 'type',
          reason: `\`schema.type\` must be a string, but got (${ stringify(rawDataSchema.type) }).`
        })
      }

      const parser = this.parserMap.get(rawDataSchema.type)
      if (parser == null) {
        const result: DSParseResult = new DataSchemaParseResult(rawDataSchema)
        return result.addError({
          constraint: 'type',
          reason: `unknown \`schema.type\`: ${ stringify(rawDataSchema.type) }.`
        })
      }

      return parser.parse(rawDataSchema)
    })()

    // 缓存解析结果
    if (rawDataSchema.$id != null) {
      this.dataSchemaMaster.addDataSchema(rawDataSchema.$id, schemaResult.value)
    }
    return schemaResult
  }

  /**
   * 格式化 rawDataSchema
   * 当 rawDataSchema 为字符串时，表示定义为此字符串的类型的 Schema
   * @param rawDataSchema
   */
  public normalizeRawSchema(rawDataSchema: RawDataSchema<T, V>): RawDataSchema<T, V> {
    if (isString(rawDataSchema)) {
      return { type: rawDataSchema as unknown as T }
    }

    // 根据模式来决断对 RawDataSchema 的处理方式
    switch (this.mode) {
      case ParserMode.SHALLOW_CLONE:
        return { ...rawDataSchema }
      case ParserMode.DEEP_CLONE:
        return JSON.parse(JSON.stringify(rawDataSchema))
      default:
        return rawDataSchema
    }
  }
}
