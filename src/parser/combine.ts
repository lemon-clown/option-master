import { DataSchemaParser } from './_base'
import { DataSchemaParseResult } from './_result'
import { COMBINE_V_TYPE as V, COMBINE_T_TYPE as T, RawCombineDataSchema as RDS, CombineDataSchema as DS, CombineStrategy } from '../schema/combine'
import { RDSchema, DSchema } from '../schema/_base'
import { coverString } from '../_util/cover-util'
import { stringify } from '../_util/type-util'


/**
 * CombineDataSchema 解析结果的数据类型
 */
export type CombineDataSchemaParserResult = DataSchemaParseResult<T, V, RDS, DS>


/**
 * 组合类型的模式的解析器
 *
 * enum 将忽略所有非组合（或组合字符串）的值
 */
export class CombineDataSchemaParser extends DataSchemaParser<T, V, RDS, DS> {
  public readonly type: T = T

  /**
   * parse RawSchema to Schema
   * @param rawSchema
   */
  public parse (rawSchema: RDS): CombineDataSchemaParserResult {
    const result: CombineDataSchemaParserResult = super.parse(rawSchema)
    rawSchema = result._rawSchema

    const defaultValue = rawSchema.default

    // strategy 的默认值为 all
    const strategyResult = result.parseBaseTypeProperty<CombineStrategy>('strategy', coverString as any, CombineStrategy.ALL)
    switch (strategyResult.value) {
      case CombineStrategy.ALL:
      case CombineStrategy.ANY:
      case CombineStrategy.ONE:
        break
      default:
        result.addError({
          constraint: 'strategy',
          reason: `unknown strategy: ${ stringify(rawSchema.strategy) }`
        })
        strategyResult.setValue(CombineStrategy.ALL)
    }

    /**
     * 解析 DataSchema 列表
     *
     * @param constraint
     * @param rawSchemas
     */
    const parseSchemas = (constraint: 'allOf' | 'anyOf' | 'oneOf', rawSchemas?: RDSchema[]): DSchema[] | undefined => {
      if (rawSchemas == null || rawSchemas.length <= 0) return undefined
      const schemas: DSchema[] = []
      for (let i = 0; i < rawSchemas.length; ++i) {
        const itemRawSchema = rawSchemas[i]
        const itemSchema = this.parserMaster.parse(itemRawSchema)
        result.addHandleResult(constraint, itemSchema)

        // 存在错误则跳过
        if (itemSchema.hasError) continue
        schemas.push(itemSchema.value!)
      }

      if (schemas.length <= 0) return undefined
      return schemas
    }

    const allOf: DSchema[] | undefined = parseSchemas('allOf', rawSchema.allOf)
    const anyOf: DSchema[] | undefined = parseSchemas('anyOf', rawSchema.anyOf)
    const oneOf: DSchema[] | undefined = parseSchemas('oneOf', rawSchema.oneOf)

    // allOf, anyOf, oneOf 至少要设置一项有效值
    if ((allOf == null || allOf.length <= 0) && (anyOf == null || anyOf.length <= 0) && (oneOf == null || oneOf.length <= 0)) {
      return result.addError({
        constraint: 'type',
        reason: 'CombineDataSchema must be set at least one valid value of properties: `allOf`, `anyOf`, `oneOf`.'
      })
    }

    // CombineDataSchema
    const schema: DS = {
      ...result.value!,
      default: defaultValue,
      strategy: strategyResult.value!,
      allOf,
      anyOf,
      oneOf,
    }

    return result.setValue(schema)
  }
}
