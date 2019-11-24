import { optionMaster } from '../../src'


const rawSchema = {
  type: 'integer',
  enum: [1, 2, 4, 8, 16],
  required: true
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
validate(23)          // undefined; and will print errors (`enum` is not satisfied)
validate(16)          // 16;
validate([])          // undefined; and will print errors (`type` is not satisfied)
