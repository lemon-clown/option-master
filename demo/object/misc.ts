import { optionMaster } from '../../src'


const rawSchema = {
  type: 'object',
  allowAdditionalProperties: true,
  silentIgnore: true,
  propertyNames: {
    type: 'string',
    enum: ['email', 'gender', 'sex']
  },
  properties: {
    name: {
      type: 'string',
      pattern: '^\\w{3,20}$',
      required: true,
    },
    age: {
      type: 'integer',
      minimum: 1,
    }
  },
  dependencies: {
    email: ['age', 'gender']
  },
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

validate(undefined)                                                               // undefined; and will print errors (`required` is not satisfied)
validate({ name: 'alice', age: 20 })                                              // { name: 'alice', age: 20 };
validate({ name: 'bob', gender: 'male' })                                         // { name: 'bob', gender: 'male' }
validate({ name: 'joy', age: 33, more: 'something', sex: 'female' })              // { name: 'joy', age: 33, sex: 'female' }
validate({ name: 'joy', email: 'joy@bob.com', more: 'something', sex: 'female' }) // undefined; and will print errors (`dependencies#email` is not satisfied)
validate({ name: 'joy', email: 'joy@bob.com', age: 33, gender: 'female' })        // { name: 'joy', email: 'joy@bob.com', age: 33, gender: 'female' }
validate(false)                                                                   // undefined; and will print errors (`type` is not satisfied)
