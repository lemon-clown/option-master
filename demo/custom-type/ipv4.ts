import {
  DataSchema, RawDataSchema, DataSchemaParseResult, DataValidationResult,
  BaseDataSchemaParser, BaseDataValidator, BaseDataValidatorFactory,
  DataValidatorContext, coverBoolean, coverString, optionMaster,
} from '../../src'


const T = 'ipv4'
type T = typeof T
type V = string
type RDS = RawDataSchema<T, V>
type DS = DataSchema<T, V>


/**
 * data type of Ipv4DataSchema parse result
 */
export type Ipv4DataSchemaParserResult = DataSchemaParseResult<T, V, RDS, DS>


/**
 * ipv4 schema parser
 */
export class Ipv4DataSchemaParser extends BaseDataSchemaParser<T, V, RDS, DS> {
  public readonly type: T = T

  public parse (rawSchema: RDS): Ipv4DataSchemaParserResult {
    const result: Ipv4DataSchemaParserResult = super.parse(rawSchema)
    const requiredResult = result.parseProperty<boolean>('required', coverBoolean, false)
    const defaultValueResult = result.parseProperty<V>('default', coverString)

    // Ipv4DataSchema
    const schema: DS = {
      type: this.type,
      required: Boolean(requiredResult.value),
      default: defaultValueResult.value,
    }

    return result.setValue(schema)
  }
}

/**
 * result type of Ipv4DataSchemaValidator.validate
 */
export type Ipv4DataValidationResult = DataValidationResult<T, V, DS>


/**
 * ipv4 validator
 */
export class Ipv4DataValidator extends BaseDataValidator<T, V, DS> {
  private readonly pattern: RegExp
  public readonly type: T = T

  public constructor (schema: DS, context: DataValidatorContext) {
    super(schema, context)
    this.pattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
  }

  public validate (data: any): Ipv4DataValidationResult {
    const result: Ipv4DataValidationResult = super.validate(data)
    data = result.value
    result.setValue(undefined)

    // if data is null/undefined, no further verification required
    if (data == null) return result

    // check if data is string
    const value = result.validateType(coverString, data)!
    if (result.hasError) return result

    // check pattern
    if (!this.pattern.test(value)) {
      return result.addError({
        constraint: 'type',
        reason: `value is not a valid ipv4 value. expected pattern is ${ this.pattern.source }`
      })
    }

    // passed validation
    return result.setValue(value)
  }
}


/**
 * Ipv4 validator factory
 */
export class Ipv4DataValidatorFactory extends BaseDataValidatorFactory<T, V, DS> {
  public readonly type: T = T

  public create(schema: DS) {
    return new Ipv4DataValidator(schema, this.context)
  }
}


// register parser and validator
optionMaster.registerParser(T, Ipv4DataSchemaParser)
optionMaster.registerValidatorFactory(T, Ipv4DataValidatorFactory)


// run test
const rawSchema = {
  type: 'ipv4',
  required: true
}


// parse rawSchema
const { value: schema } = optionMaster.parse(rawSchema)
const validate = (data: any): boolean | undefined => {
  const result = optionMaster.validate(schema!, data)
  if (result.hasError) {
    console.error(result.errorDetails)
  }
  if (result.hasWarning) {
    console.error(result.warningDetails)
  }
  console.log('value:', JSON.stringify(result.value, null, 2))
  return result.value
}

validate(undefined)         // undefined; and will print errors (`required` is not satisfied)
validate('www.github.com')  // undefined; and will print errors (`type` is not satisfied: not a valid ipv4 value)
validate('127.0.0.1')       // 127.0.0.1;
validate('192.168.0.10')    // 192.168.0.10;
validate('::1')             // undefined; and will print errors (`type` is not satisfied: not a valid ipv4 value)
validate('256.0.0.1')       // undefined; and will print errors (`type` is not satisfied: not a valid ipv4 value)
validate([])                // undefined; and will print errors (`type` is not satisfied: not a valid ipv4 value)
