import { ARRAY_T_TYPE } from './schema/array'
import { BOOLEAN_T_TYPE } from './schema/boolean'
import { COMBINE_T_TYPE } from './schema/combine'
import { INTEGER_T_TYPE } from './schema/integer'
import { NUMBER_T_TYPE } from './schema/number'
import { OBJECT_T_TYPE } from './schema/object'
import { STRING_T_TYPE } from './schema/string'
import { DataSchemaParserMaster } from './parser/_master'
import { ArrayDataSchemaParser } from './parser/array'
import { BooleanDataSchemaParser } from './parser/boolean'
import { CombineDataSchemaParser } from './parser/combine'
import { IntegerDataSchemaParser } from './parser/integer'
import { NumberDataSchemaParser } from './parser/number'
import { ObjectDataSchemaParser } from './parser/object'
import { StringDataSchemaParser } from './parser/string'
import { DataValidatorMaster } from './validator/_master'
import { ArrayDataValidatorFactory } from './validator/array'
import { BooleanDataValidatorFactory } from './validator/boolean'
import { CombineDataValidatorFactory } from './validator/combine'
import { IntegerDataValidatorFactory } from './validator/integer'
import { NumberDataValidatorFactory } from './validator/number'
import { ObjectDataValidatorFactory } from './validator/object'
import { StringDataValidatorFactory } from './validator/string'
import './types'


// export DataSchemas
export * from './schema/_base'
export * from './schema/boolean'
export * from './schema/combine'
export * from './schema/integer'
export * from './schema/number'
export * from './schema/object'
export * from './schema/string'

// export DataSchemaParsers
export * from './parser/_base'
export * from './parser/_master'
export * from './parser/boolean'
export * from './parser/combine'
export * from './parser/integer'
export * from './parser/number'
export * from './parser/object'
export * from './parser/string'

// export DataValidators
export * from './validator/_base'
export * from './validator/boolean'
export * from './validator/combine'
export * from './validator/integer'
export * from './validator/number'
export * from './validator/object'
export * from './validator/string'

// export utils
export * from './_util/cover-util'
export * from './_util/handle-result'
export * from './_util/type-util'


/**
 * 默认的 ParserMaster；支持类型包括：array, boolean, integer, number, string
 */
export const parserMaster = new DataSchemaParserMaster()
parserMaster.registerParser(ARRAY_T_TYPE, new ArrayDataSchemaParser(parserMaster))
parserMaster.registerParser(BOOLEAN_T_TYPE, new BooleanDataSchemaParser(parserMaster))
parserMaster.registerParser(COMBINE_T_TYPE, new CombineDataSchemaParser(parserMaster))
parserMaster.registerParser(INTEGER_T_TYPE, new IntegerDataSchemaParser(parserMaster))
parserMaster.registerParser(NUMBER_T_TYPE, new NumberDataSchemaParser(parserMaster))
parserMaster.registerParser(OBJECT_T_TYPE, new ObjectDataSchemaParser(parserMaster))
parserMaster.registerParser(STRING_T_TYPE, new StringDataSchemaParser(parserMaster))


/**
 * 默认的 DataValidatorMaster；支持类型包括：array, boolean, integer, number, string
 */
export const validatorMaster = new DataValidatorMaster()
validatorMaster.registerValidatorFactory(ARRAY_T_TYPE, new ArrayDataValidatorFactory(validatorMaster))
validatorMaster.registerValidatorFactory(BOOLEAN_T_TYPE, new BooleanDataValidatorFactory())
validatorMaster.registerValidatorFactory(COMBINE_T_TYPE, new CombineDataValidatorFactory(validatorMaster))
validatorMaster.registerValidatorFactory(INTEGER_T_TYPE, new IntegerDataValidatorFactory())
validatorMaster.registerValidatorFactory(NUMBER_T_TYPE, new NumberDataValidatorFactory())
validatorMaster.registerValidatorFactory(OBJECT_T_TYPE, new ObjectDataValidatorFactory(validatorMaster))
validatorMaster.registerValidatorFactory(STRING_T_TYPE, new StringDataValidatorFactory())
