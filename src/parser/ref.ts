import { BaseDataSchemaParser, DataSchemaParseResult } from '../_core/parser'
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
export class RefDataSchemaParser extends BaseDataSchemaParser<T, V, RDS, DS> {
  public readonly type: T = T

  /**
   * parse RawSchema to Schema
   * @param rawSchema
   */
  public parse (rawSchema: RDS): RefDataSchemaParserResult {
    const result: RefDataSchemaParserResult = super.parse(rawSchema)
    rawSchema = result._rawSchema

    // check $ref
    const $refResult = result.parseProperty<string>('$ref', coverString)
    if ($refResult.hasError || $refResult.value == null) {
      return result.addError({
        constraint: '$ref',
        reason: `bad \`$ref\`, expected a string, but got (${ stringify(rawSchema.$ref)}).`
      })
    }

    // check if the referenced DataSchema exists
    const $ref = $refResult.value!
    if (!this.context.hasDefinition($ref)) {
      return result.addError({
        constraint: '$ref',
        reason: `bad \`$ref\`, cannot find DataSchema with $id(${ $ref })`
      })
    }

    // set the default value of the optional property to the property value
    // corresponding to the referenced DataSchema
    const rawDefinitionSchema = this.context.getRawDefinition($ref)!
    rawSchema = this.context.inheritRawSchema(rawDefinitionSchema, rawSchema)
    const basicResult: RefDataSchemaParserResult = super.parse(rawSchema)

    // RefDataSchema
    const schema: DS = {
      ...basicResult.value!,
      $ref,
      default: rawSchema.default,
    }

    return result.setValue(schema)
  }
}
