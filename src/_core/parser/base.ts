import { coverBoolean } from '../../_util/cover-util'
import { RawDataSchema, DataSchema } from '../schema'
import { DataSchemaParserContext, DataSchemaParser } from './types'
import { DataSchemaParseResult } from './result'


/**
 * DataSchema parser to parse RawDataSchema content into DataSchema
 *
 * 数据模式解析器，将用户定义的内容解析成 DataSchema
 * @template T    typeof <X>DataSchema.type
 * @template V    typeof <X>DataSchema.V
 * @template DS   typeof <X>DataSchema
 * @template RDS  typeof <X>RawDataSchema
 */
export abstract class BaseDataSchemaParser<
  T extends string,
  V,
  RDS extends RawDataSchema<T, V>,
  DS extends DataSchema<T, V>>
  implements DataSchemaParser<T, V, RDS, DS> {
  /**
   * override member variable
   * @see DataSchemaParser#type
   */
  public abstract readonly type: T

  protected readonly context: DataSchemaParserContext

  public constructor(context: DataSchemaParserContext) {
    this.context = context
  }

  /**
   * override method
   * @see DataSchemaParser#parse
   */
  public parse(rawSchema: RawDataSchema<T, V>): DataSchemaParseResult<T, V, RDS, DS> {
    rawSchema = this.context.normalizeRawSchema(rawSchema) as RawDataSchema<T, V>
    const result: DataSchemaParseResult<T, V, RDS, DS> = (new DataSchemaParseResult(rawSchema)) as any

    // required 的默认值为 false
    const requiredResult = result.parseProperty<boolean>('required', coverBoolean, false)

    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    const schema: DS = {
      type: rawSchema.type,
      required: Boolean(requiredResult.value),
      default: rawSchema.default,
    } as DS

    return result.setValue(schema)
  }
}
