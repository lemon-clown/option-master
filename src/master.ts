import { RDSchema, DSchema } from './_core/schema'
import { DataSchemaParserMaster, DSPResult, DSParserConstructor } from './_core/parser'
import { DataValidatorMaster, DVResult, DVFactoryConstructor } from './_core/validator'
import { ARRAY_T_TYPE } from './schema/array'
import { BOOLEAN_T_TYPE } from './schema/boolean'
import { COMBINE_T_TYPE } from './schema/combine'
import { INTEGER_T_TYPE } from './schema/integer'
import { NUMBER_T_TYPE } from './schema/number'
import { OBJECT_T_TYPE } from './schema/object'
import { REF_T_TYPE } from './schema/ref'
import { STRING_T_TYPE } from './schema/string'
import { ArrayDataSchemaParser } from './parser/array'
import { BooleanDataSchemaParser } from './parser/boolean'
import { CombineDataSchemaParser } from './parser/combine'
import { IntegerDataSchemaParser } from './parser/integer'
import { NumberDataSchemaParser } from './parser/number'
import { ObjectDataSchemaParser } from './parser/object'
import { RefDataSchemaParser } from './parser/ref'
import { StringDataSchemaParser } from './parser/string'
import { ArrayDataValidatorFactory } from './validator/array'
import { BooleanDataValidatorFactory } from './validator/boolean'
import { CombineDataValidatorFactory } from './validator/combine'
import { IntegerDataValidatorFactory } from './validator/integer'
import { NumberDataValidatorFactory } from './validator/number'
import { ObjectDataValidatorFactory } from './validator/object'
import { RefDataValidatorFactory } from './validator/ref'
import { StringDataValidatorFactory } from './validator/string'


/**
 * Management object for parsing data schema and verifying data
 *
 * 解析数据模式、校验数据的管理对象
 */
export class OptionMaster {
  /**
   * 数据模式解析器管理对象实例
   */
  protected readonly schemaParserMaster: DataSchemaParserMaster

  /**
   * 数据校验器管理对象实例
   */
  protected readonly dataValidatorMaster: DataValidatorMaster

  public constructor() {
    this.schemaParserMaster = new DataSchemaParserMaster()
    this.dataValidatorMaster = new DataValidatorMaster()
  }

  /**
   * Add DataSchemaParser, if the parser of the specified type already exists, ignore this addition
   *
   * 添加 DataSchemaParser，若指定的 type 的解析器已存在，则忽略此次添加
   * @param type
   * @param SchemaParserConstructor
   */
  public registerParser(type: string, SchemaParserConstructor: DSParserConstructor): this {
    const schemaParser = new SchemaParserConstructor(this.schemaParserMaster)
    this.schemaParserMaster.registerParser(type, schemaParser)
    return this
  }

  /**
   * Overwrite the existing DataSchemaParser.
   * If there is no corresponding DataSchemaParser before the specified type, add it.
   *
   * 覆盖已有的 DataSchemaParser；
   * 若指定的 type 之前没有对应的 DataSchemaParser，也做添加操作
   * @param type
   * @param SchemaParserConstructor
   */
  public replaceParser(type: string, SchemaParserConstructor: DSParserConstructor): this {
    const schemaParser = new SchemaParserConstructor(this.schemaParserMaster)
    this.schemaParserMaster.replaceParser(type, schemaParser)
    return this
  }

  /**
   * Add DataValidatorFactory, if the specified type already exists, ignore this addition
   *
   * 添加 DataValidatorFactory，若指定的 type 已存在，则忽略此次添
   * @param type
   * @param DataValidatorFactoryConstructor
   */
  public registerValidatorFactory(type: string, DataValidatorFactoryConstructor: DVFactoryConstructor): this {
    const dataValidatorFactory = new DataValidatorFactoryConstructor(this.dataValidatorMaster)
    this.dataValidatorMaster.registerValidatorFactory(type, dataValidatorFactory)
    return this
  }

  /**
   * Overwrite the existing DataValidatorFactory.
   * If there is no corresponding DataValidatorFactory before the specified type, add it
   *
   * 覆盖已有的 DataValidatorFactory，若指定的 type 之前没有对应的 DataValidatorFactory，也做添加操作
   * @param type
   * @param DataValidatorFactoryConstructor
   */
  public replaceValidatorFactory(type: string, DataValidatorFactoryConstructor: DVFactoryConstructor): this {
    const dataValidatorFactory = new DataValidatorFactoryConstructor(this.dataValidatorMaster)
    this.dataValidatorMaster.replaceValidatorFactory(type, dataValidatorFactory)
    return this
  }

  /**
   * 执行解析操作
   * @param rawDataSchema   待解析的 RawDataSchema
   */
  public parse(rawDataSchema: RDSchema): DSPResult {
    return this.schemaParserMaster.parseTopDataSchema(rawDataSchema)
  }

  /**
   * 执行校验操作
   * @param schema  预期的数据模式
   * @param data    待校验的数据a
   */
  public validate(schema: DSchema, data: any): DVResult {
    return this.dataValidatorMaster.validateTopDataSchema(schema, data)
  }

  /**
   * Register the preset DataSchema, its parser, and validator into the current OptionMaster instance
   *
   * 将预置的 DataSchema 及其解析器、校验器注册进当前 OptionMaster 实例中
   */
  public registerDefaultSchemas(): this {
    this
      // array
      .registerParser(ARRAY_T_TYPE, ArrayDataSchemaParser)
      .registerValidatorFactory(ARRAY_T_TYPE, ArrayDataValidatorFactory)

      // boolean
      .registerParser(BOOLEAN_T_TYPE, BooleanDataSchemaParser)
      .registerValidatorFactory(BOOLEAN_T_TYPE, BooleanDataValidatorFactory)

      // combine
      .registerParser(COMBINE_T_TYPE, CombineDataSchemaParser)
      .registerValidatorFactory(COMBINE_T_TYPE, CombineDataValidatorFactory)

      // integer
      .registerParser(INTEGER_T_TYPE, IntegerDataSchemaParser)
      .registerValidatorFactory(INTEGER_T_TYPE, IntegerDataValidatorFactory)

      // number
      .registerParser(NUMBER_T_TYPE, NumberDataSchemaParser)
      .registerValidatorFactory(NUMBER_T_TYPE, NumberDataValidatorFactory)

      // object
      .registerParser(OBJECT_T_TYPE, ObjectDataSchemaParser)
      .registerValidatorFactory(OBJECT_T_TYPE, ObjectDataValidatorFactory)

      // ref
      .registerParser(REF_T_TYPE, RefDataSchemaParser)
      .registerValidatorFactory(REF_T_TYPE, RefDataValidatorFactory)

      // string
      .registerParser(STRING_T_TYPE, StringDataSchemaParser)
      .registerValidatorFactory(STRING_T_TYPE, StringDataValidatorFactory)
    return this
  }
}


/**
 * 默认的 ParserMaster；
 * 支持类型包括：array, boolean, combine, integer, number, object, ref, string
 */
export const optionMaster = new OptionMaster()
optionMaster.registerDefaultSchemas()

