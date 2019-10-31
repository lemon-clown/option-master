import { DataSchemaParser, DataSchemaParseResult } from './_base'
import { DataSchemaParserMaster } from './_master'
import { COMBINE_V_TYPE as V, COMBINE_T_TYPE as T, RawCombineDataSchema as RDS, CombineDataSchema as DS, CombineStrategy } from '../schema/combine'
import { RawDataSchema, DataSchema } from '../schema/_base'
import { coverBoolean, coverString } from '../_util/cover-util'


/**
 * CombineDataSchema 解析结果的数据类型
 */
export type CombineDataSchemaParserResult = DataSchemaParseResult<T, V, RDS, DS>


/**
 * 组合类型的模式的解析器
 *
 * enum 将忽略所有非组合（或组合字符串）的值
 */
export class CombineDataSchemaParser implements DataSchemaParser<T, V, RDS, DS> {
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
  public parse (path: string, rawSchema: RDS): CombineDataSchemaParserResult {
    const result: CombineDataSchemaParserResult = new DataSchemaParseResult(path, rawSchema)

    // required 的默认值为 false
    const required = result.parseProperty<boolean>('required', coverBoolean, false)
    const defaultValue = rawSchema.default
    const strategyResult = result.parseProperty<CombineStrategy>('strategy', coverString as any, CombineStrategy.ALL)
    let strategy = strategyResult.value
    if (strategy !== CombineStrategy.ALL && strategy !== CombineStrategy.ANY && strategy !== CombineStrategy.ONE) {
      result.addError({
        constraint: 'strategy',
        reason: `unknown strategy: ${ strategy }`
      })
      strategy = CombineStrategy.ALL
    }

    /**
     * 解析 DataSchema 列表
     *
     * @param constraint
     * @param rawSchemas
     */
    const parseSchemas = (
      constraint: 'allOf' | 'anyOf' | 'oneOf',
      rawSchemas?: RawDataSchema<string, any>[]
    ): DataSchema<string, any>[] | undefined => {
      if (rawSchemas == null || rawSchemas.length <= 0) return undefined
      const schemas: DataSchema<string, any>[] = []
      const p: string = path + '.$' + constraint
      for (let i = 0; i < rawSchemas.length; ++i) {
        const itemRawSchema = rawSchemas[i]
        const itemSchema = this.parserMaster.parse(p + i, itemRawSchema)
        result.addHandleResult(constraint, itemSchema)

        // 存在错误则跳过
        if (itemSchema.hasError) continue
        schemas.push(itemSchema.schema!)
      }

      if (schemas.length <= 0) return undefined
      return schemas
    }

    const allOf: DataSchema<string, any>[] | undefined = parseSchemas('allOf', rawSchema.allOf)
    const anyOf: DataSchema<string, any>[] | undefined = parseSchemas('anyOf', rawSchema.allOf)
    const oneOf: DataSchema<string, any>[] | undefined = parseSchemas('oneOf', rawSchema.allOf)

    // allOf, anyOf, oneOf 至少要设置一项有效值
    if ((allOf == null || allOf.length <= 0) && (anyOf == null || anyOf.length <= 0) && (oneOf == null || oneOf.length <= 0)) {
      return result.addError({
        constraint: 'type',
        reason: 'CombineDataSchema must be set at least one valid value of properties: `allOf`, `anyOf`, `oneOf`.'
      })
    }

    // CombineDataSchema
    const schema: DS = {
      type: this.type,
      path,
      required: Boolean(required.value),
      default: defaultValue,
      strategy,
      allOf,
      anyOf,
      oneOf,
    }

    return result.setSchema(schema)
  }
}
