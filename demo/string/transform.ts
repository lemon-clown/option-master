import { optionMaster } from '../../src'


const rawSchema = {
  type: 'string',
  transform: ['trim', 'lowercase'],
  required: true
}


// parse rawSchema
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
  console.log('value:', JSON.stringify(result.value, null, 2))
  return result.value
}

validate(undefined)             // undefined; and will print errors (`required` is not satisfied)
validate(' Apple ')             // apple
validate('   Cat  Dog')         // cat  dog
