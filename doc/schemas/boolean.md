# BooleanSchema
  * [rawSchema][]
    ```typescript
    interface RawBooleanDataSchema {
      type: 'boolean'
      required?: boolean
      default?: boolean
    }
    ```

  * [schema][]
    ```typescript
    interface BooleanDataSchema {
      type: 'boolean'
      required: boolean
      default?: boolean
    }
    ```

  * properties:

     property   | description                       | default | required
    :-----------|:----------------------------------|:--------|:---------------------------------------
     `type`     | the type of DataSchema            | -       | Yes (and the value must be `'boolean'`)
     `required` | whether the data must be set      | `false` | No
     `default`  | default value of this DataSchema  | -       | No


# demo

  ```typescript
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
    return result.value
  }

  validate(undefined)   // undefined; and will print errors
  validate(false)       // false;
  validate(true)        // true;
  validate([])          // undefined; and will print errors
  ```

* also see:
  - [demo][]
  - [test cases][test-cases]


[rawSchema]: ../../src/schema/boolean.ts#RawBooleanDataSchema
[schema]: ../../src/schema/boolean.ts#BooleanDataSchema
[demo]: ../../demo/boolean
[test-cases]: ../../test/cases/base-schema/boolean
