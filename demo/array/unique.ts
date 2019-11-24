import { optionMaster } from '../../src'


const rawSchema = {
  type: 'array',
  items: {
    "type": "integer"
  },
  unique: true,
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
validate([1, 2])      // [1, 2];
validate([1, 1, 2])   // undefined; and will print errors (`unique` is not satisfied)
validate({})          // undefined; and will print errors (`type` is not satisfied)
validate('apple')     // undefined; and will print errors (`type` is not satisfied)
