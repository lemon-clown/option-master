# StringSchema
  * [rawSchema][]
    ```typescript
    interface RawStringDataSchema {
      type: 'string'
      required?: boolean
      default?: boolean
      minLength?: number
      maxLength?: number
      pattern?: string
      enum?: string[]
    }
    ```

  * [schema][]
    ```typescript
    interface StringDataSchema {
      type: 'string'
      required: boolean
      default?: boolean
      minLength?: number
      maxLength?: number
      pattern?: string
    }
    ```

  * properties:

     property           | description                               | default | required
    :-------------------|:------------------------------------------|:--------|:---------------------------------------
     `type`             | the type of DataSchema                    | -       | Yes (and the value must be `'string'`)
     `required`         | whether the data must be set              | `false` | No
     `default`          | default value of this DataSchema          | -       | No
     `minLength`        | minimum length ($x.length \geqslant$)     | -       | No
     `maxLength`        | maximum length ($x.length \leqslant$)     | -       | No
     `pattern`          | a regular expression defined data pattern | -       | No
     `enum`             | acceptable values ($x \in$)               | -       | No


# demo

  ```typescript
  import { parserMaster, validatorMaster } from '../../src'

  const rawSchema = {
    type: 'string',
    minLength: 10,
    maxLength: 25,
    pattern: '^[^@]+@[^\\.]+\\..+$',
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

  validate(undefined)                             // undefined; and will print errors (`required` is not satisfied)
  validate('alice@gmail.com')                     // alice@gmail.com;
  validate('alice.gmail.com')                     // undefined; and will print errors (`pattern` is not satisfied)
  validate('a@ss.com')                            // undefined; and will print errors (`minLength` is not satisfied)
  validate('apple_banana_cat_dog@something.com')  // undefined; and will print errors (`maxLength` is not satisfied)
  validate([])                                    // undefined; and will print errors (`type` is not satisfied)
  ```

* also see:
  - [demo][]
  - [test cases][test-cases]


[rawSchema]: ../../src/schema/string.ts#RawStringDataSchema
[schema]: ../../src/schema/string.ts#StringDataSchema
[demo]: ../../demo/string
[test-cases]: ../../test/cases/base-schema/string
