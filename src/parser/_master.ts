import { DataSchemaParser, DataSchemaParseResult } from './_base'
import { RawDataSchema, DataSchema } from '../schema/_base'
import { isString, stringify } from '../_util/type-util'


type T = string
type V = any
type DS = DataSchema<T, V>
type RDS = RawDataSchema<T, V>
export type DSParser = DataSchemaParser<T, V, RDS, DS>
export type DSParseResult = DataSchemaParseResult<T, V, RDS, DS>


/**
 * DataSchemaParser 的控制器
 *  - 注册操作：使得一个用户自定义的 Schema 类型能被正确解析
 *  - 替换操作：替换一个原有类型的 Schema 的解析器
 *  - 解析操作：对于指定的 RawSchema 对象，寻找合适的解析器解析其值，得到 Schema
 */
export class DataSchemaParserMaster {
  /**
   * DataSchema.type 和 DataSchemaParser 的映射
   */
  private readonly parserMap: Map<string, DSParser> = new Map()

  /**
   * 添加 DataSchemaParser，若指定的 type 已存在，则忽略此次添加
   * @param type
   * @param schemaParser
   */
  public registerParser (type: string, schemaParser: DSParser): void {
    if (this.parserMap.has(type)) return
    this.parserMap.set(type, schemaParser)
  }

  /**
   * 覆盖已有的 DataSchemaParser，若指定的 type 之前没有对应的 DataSchemaParser，也做添加操作
   * @param type
   * @param schemaParser
   */
  public replaceParser (type: string, schemaParser: DSParser) {
    this.parserMap.set(type, schemaParser)
  }

  /**
   * 执行解析操作
   * @param rawSchema   待解析的 RawDataSchema
   */
  public parse(rawDataSchema: RDS): DSParseResult {
    if (rawDataSchema == null || !isString(rawDataSchema.type)) {
      const result: DSParseResult = new DataSchemaParseResult(rawDataSchema)
      return result.addError({
        constraint: 'type',
        reason: '`schema.type` must be a string.'
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
  }
}
