import { DataSchemaMaster } from './schema/_master'
import { RDSchema, DSchema } from './schema/_base'
import { ARRAY_T_TYPE } from './schema/array'
import { BOOLEAN_T_TYPE } from './schema/boolean'
import { COMBINE_T_TYPE } from './schema/combine'
import { INTEGER_T_TYPE } from './schema/integer'
import { NUMBER_T_TYPE } from './schema/number'
import { OBJECT_T_TYPE } from './schema/object'
import { REF_T_TYPE } from './schema/ref'
import { STRING_T_TYPE } from './schema/string'
import { DataSchemaParserMaster, ParserMode, DSParseResult, DSParserConstructor } from './parser/_master'
import { ArrayDataSchemaParser } from './parser/array'
import { BooleanDataSchemaParser } from './parser/boolean'
import { CombineDataSchemaParser } from './parser/combine'
import { IntegerDataSchemaParser } from './parser/integer'
import { NumberDataSchemaParser } from './parser/number'
import { ObjectDataSchemaParser } from './parser/object'
import { RefDataSchemaParser } from './parser/ref'
import { StringDataSchemaParser } from './parser/string'
import { DataValidatorMaster, DValidationResult, DValidatorFactoryConstructor } from './validator/_master'
import { ArrayDataValidatorFactory } from './validator/array'
import { BooleanDataValidatorFactory } from './validator/boolean'
import { CombineDataValidatorFactory } from './validator/combine'
import { IntegerDataValidatorFactory } from './validator/integer'
import { NumberDataValidatorFactory } from './validator/number'
import { ObjectDataValidatorFactory } from './validator/object'
import { RefDataValidatorFactory } from './validator/ref'
import { StringDataValidatorFactory } from './validator/string'


export class OptionMaster {
  /**
   * 解析模式：对 RawDataSchema 的拷贝模式
   */
  protected readonly mode: ParserMode

  /**
   * 数据模式管理对象实例
   */
  protected readonly schemaMaster: DataSchemaMaster

  /**
   * 数据模式解析器管理对象实例
   */
  protected readonly schemaParserMaster: DataSchemaParserMaster

  /**
   * 数据校验器管理对象实例
   */
  protected readonly dataValidatorMaster: DataValidatorMaster

  public constructor(schemaMaster?: DataSchemaMaster, mode?: ParserMode) {
    this.mode = mode != null ? mode : ParserMode.SHALLOW_CLONE
    this.schemaMaster = schemaMaster != null ? schemaMaster : new DataSchemaMaster()
    this.schemaParserMaster = new DataSchemaParserMaster(this.schemaMaster, this.mode)
    this.dataValidatorMaster = new DataValidatorMaster(this.schemaMaster)
  }

  public reset () {
    this.schemaMaster.clear()
    this.schemaParserMaster.reset()
  }

  /**
   * 添加 DataSchemaParser，若指定的 type 已存在，则忽略此次添加
   * @param type
   * @param SchemaParserConstructor
   */
  public registerParser (type: string, SchemaParserConstructor: DSParserConstructor): this {
    const schemaParser = new SchemaParserConstructor(this.schemaParserMaster)
    this.schemaParserMaster.registerParser(type, schemaParser)
    return this
  }

  /**
   * 覆盖已有的 DataSchemaParser，若指定的 type 之前没有对应的 DataSchemaParser，也做添加操作
   * @param type
   * @param SchemaParserConstructor
   */
  public replaceParser(type: string, SchemaParserConstructor: DSParserConstructor): this {
    const schemaParser = new SchemaParserConstructor(this.schemaParserMaster)
    this.schemaParserMaster.replaceParser(type, schemaParser)
    return this
  }

  /**
   * 添加 DataValidatorFactory，若指定的 type 已存在，则忽略此次添加
   * @param type
   * @param DataValidatorFactory
   */
  public registerValidatorFactory (type: string, DataValidatorFactory: DValidatorFactoryConstructor): this {
    const dataValidatorFactory = new DataValidatorFactory(this.dataValidatorMaster)
    this.dataValidatorMaster.registerValidatorFactory(type, dataValidatorFactory)
    return this
  }

  /**
   * 覆盖已有的 DataValidatorFactory，若指定的 type 之前没有对应的 DataSchemaParser，也做添加操作
   * @param type
   * @param DataValidatorFactory
   */
  public replaceValidatorFactory (type: string, DataValidatorFactory: DValidatorFactoryConstructor): this {
    const dataValidatorFactory = new DataValidatorFactory(this.dataValidatorMaster)
    this.dataValidatorMaster.replaceValidatorFactory(type, dataValidatorFactory)
    return this
  }

  /**
   * 执行解析操作
   * @param rawDataSchema   待解析的 RawDataSchema
   */
  public parse(rawDataSchema: RDSchema): DSParseResult {
    return this.schemaParserMaster.parse(rawDataSchema)
  }

  /**
   * 执行校验操作
   * @param schema
   * @param data
   */
  public validate(schema: DSchema, data: any): DValidationResult {
    return this.dataValidatorMaster.validate(schema, data)
  }
}


/**
 * 默认的 ParserMaster；支持类型包括：array, boolean, integer, number, string
 */
export const optionMaster = new OptionMaster()

// array
optionMaster
  .registerParser(ARRAY_T_TYPE, ArrayDataSchemaParser)
  .registerValidatorFactory(ARRAY_T_TYPE, ArrayDataValidatorFactory)

// boolean
optionMaster
  .registerParser(BOOLEAN_T_TYPE, BooleanDataSchemaParser)
  .registerValidatorFactory(BOOLEAN_T_TYPE, BooleanDataValidatorFactory)

// combine
optionMaster
  .registerParser(COMBINE_T_TYPE, CombineDataSchemaParser)
  .registerValidatorFactory(COMBINE_T_TYPE, CombineDataValidatorFactory)

// integer
optionMaster
  .registerParser(INTEGER_T_TYPE, IntegerDataSchemaParser)
  .registerValidatorFactory(INTEGER_T_TYPE, IntegerDataValidatorFactory)

// number
optionMaster
  .registerParser(NUMBER_T_TYPE, NumberDataSchemaParser)
  .registerValidatorFactory(NUMBER_T_TYPE, NumberDataValidatorFactory)

// object
optionMaster
  .registerParser(OBJECT_T_TYPE, ObjectDataSchemaParser)
  .registerValidatorFactory(OBJECT_T_TYPE, ObjectDataValidatorFactory)

// ref
optionMaster
  .registerParser(REF_T_TYPE, RefDataSchemaParser)
  .registerValidatorFactory(REF_T_TYPE, RefDataValidatorFactory)

// string
optionMaster
  .registerParser(STRING_T_TYPE, StringDataSchemaParser)
  .registerValidatorFactory(STRING_T_TYPE, StringDataValidatorFactory)