import { optionMaster } from '../../src'


const rawSchema = {
  type: 'string',
  transform: ['trim', 'lowercase'],
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

validate(undefined)             // undefined; and will print errors (`required` is not satisfied)
validate(' Apple ')             // apple
validate('   Cat  Dog')         // cat  dog
