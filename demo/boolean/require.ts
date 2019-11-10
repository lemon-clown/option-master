import { parserMaster, validatorMaster } from '../../src'


const rawSchema = {
  type: 'boolean',
  required: true
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

validate(undefined)   // undefined; and will print errors (`required` is not satisfied)
validate(false)       // false;
validate(true)        // true;
validate([])          // undefined; and will print errors (`type` is not satisfied)
