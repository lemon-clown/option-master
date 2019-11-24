import { optionMaster } from '../../src'


const rawSchema = {
  type: 'integer',
  exclusiveMinimum: -23,
  maximum: 23,
  required: true,
}


// parse rawSchema
optionMaster.reset()
const { value: schema } = optionMaster.parse(rawSchema)

// validate data with schema
const validate = (data: any): boolean | undefined => {
  const result = optionMaster.validate(schema!, data)
  if (result.hasError) {
    console.error(result.errorDetails)
  }
  if (result.hasWarning) {
    console.error(result.warningDetails)
  }
  console.log('value:', result.value)
  return result.value
}

validate(undefined)   // undefined; and will print errors (`required` is not satisfied)
validate(1)           // 1;
validate('0xf')       // 15;
validate(-2.8)        // undefined; and will print errors (`type` is not satisfied)
validate(-23)         // undefined; and will print errors (`exclusiveMinimum` is not satisfied)
validate(23)          // 23
validate(24)          // undefined; and will print errors (`maximum` is not satisfied)
validate([])          // undefined; and will print errors (`type` is not satisfied)
