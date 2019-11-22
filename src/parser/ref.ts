import { DataSchemaParser } from './_base'
import { DataSchemaParseResult } from './_result'
import { REF_V_TYPE as V, REF_T_TYPE as T, RawRefDataSchema as RDS, RefDataSchema as DS } from '../schema/ref'
import { coverString } from '../_util/cover-util'
import { stringify } from '../_util/type-util'


/**
 * RefDataSchema 解析结果的数据类型
 */
export type RefDataSchemaParserResult = DataSchemaParseResult<T, V, RDS, DS>


/**
 * 引用类型的模式的解析器
 */
export class RefDataSchemaParser extends DataSchemaParser<T, V, RDS, DS> {
  public readonly type: T = T

  /**
   * parse RawSchema to Schema
   * @param rawSchema
   */
  public parse (rawSchema: RDS): RefDataSchemaParserResult {
    const result: RefDataSchemaParserResult = super.parse(rawSchema)
    rawSchema = result._rawSchema

    const $refResult = result.parseBaseTypeProperty<string>('$ref', coverString)
    if ($refResult.hasError) {
      return result.addError({
        constraint: '$ref',
        reason: `bad \`$ref\`, expected a string, but got (${ stringify(rawSchema.$ref)}).`
      })
    }

    // check if $ref and $id are equal
    const $ref = $refResult.value!.trim()
    if ($ref === result.value!.$id) {
      return result.addError({
        constraint: '$ref',
        reason: 'bad `$ref`, DataSchema cannot ref to itself.'
      })
    }

    // check if the referenced DataSchema exists
    if (!this.parserMaster.has($ref)) {
      result.addError({
        constraint: '$ref',
        reason: `bad \`$ref\`, cannot find DataSchema with $id(${ $ref })`
      })
    }

    // RefDataSchema
    const schema: DS = {
      ...result.value!,
      $ref,
      default: rawSchema.default,
    }

    return result.setValue(schema)
  }
}
