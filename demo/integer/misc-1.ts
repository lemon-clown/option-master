import { parserMaster, validatorMaster } from '../../src'


const rawSchema = {
  type: 'integer',
  minimum: -23,
  exclusiveMaximum: 23,
  default: 0
}


// parse rawSchema
const { value: schema } = parserMaster.parse(rawSchema)
const validate = (data: any): boolean | undefined => {
  const result = validatorMaster.validate(schema!, data)
  if (result.hasError) {
    console.error(result.errorDetails)
  }
  if (result.hasWarning) {
    console.error(result.warningDetails)
  }
  console.log('value:', result.value)
  return result.value
}

validate(undefined)   // 0;
validate(1)           // 1;
validate('0xf')       // 15;
validate(23)          // undefined; and will print errors (`exclusiveMaximum` is not satisfied)
validate(2.8)         // undefined; and will print errors (`type` is not satisfied)
validate(-23)         // -23;
validate(-24)         // undefined; and will print errors (`minimum` is not satisfied)
validate([])          // undefined; and will print errors (`type` is not satisfied)
