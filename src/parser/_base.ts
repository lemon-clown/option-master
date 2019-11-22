import { RawDataSchema, DataSchema, DSchema } from '../schema/_base'
import { coverBoolean, coverString } from '../_util/cover-util'
import { DataSchemaParserMaster } from './_master'
import { DataSchemaParseResult } from './_result'


/**
 * DataSchema 解析器，将用户定义的内容解析成 DataSchema
 *
 * @template T    typeof <X>DataSchema.type
 * @template V    typeof <X>DataSchema.V
 * @template DS   typeof <X>DataSchema
 * @template RDS  typeof <X>RawDataSchema
 */
export abstract class DataSchemaParser<
  T extends string,
  V,
  RDS extends RawDataSchema<T, V>,
  DS extends DataSchema<T, V>,
> {
  /**
   * 对应 RawDataSchema 中的 type，用作唯一标识
   * 表示该解析器接收何种类型的 RawDataSchema
   */
  public abstract readonly type: T

  protected readonly parserMaster: DataSchemaParserMaster

  public constructor (parserMaster: DataSchemaParserMaster) {
    this.parserMaster = parserMaster
  }

  /**
   * parse RawSchema to Schema
   * @param rawSchema   待解析的 RawDataSchema
   */
  public parse (rawSchema: RawDataSchema<T, V>): DataSchemaParseResult<T, V, RDS, DS> {
    rawSchema = this.parserMaster.normalizeRawSchema(rawSchema) as RawDataSchema<T, V>
    const result: DataSchemaParseResult<T, V, RDS, DS> = (new DataSchemaParseResult(rawSchema)) as any

    // required 的默认值为 false
    const requiredResult = result.parseBaseTypeProperty<boolean>('required', coverBoolean, false)

    // id 可不设置
    const $idResult = result.parseBaseTypeProperty<string>('$id', coverString, undefined)

    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    const schema: DS = {
      type: rawSchema.type,
      $id: $idResult.value == null ? undefined : $idResult.value.trim(),
      required: Boolean(requiredResult.value),
    } as DSchema as DS

    return result.setValue(schema)
  }
}


/**
 * DataSchema 解析器的构造函数接口
 */
export interface DataSchemaParserConstructor<
  T extends string,
  V,
  RDS extends RawDataSchema<T, V>,
  DS extends DataSchema<T, V>,
> {
  new (parserMaster: DataSchemaParserMaster): DataSchemaParser<T, V, RDS, DS>
}
