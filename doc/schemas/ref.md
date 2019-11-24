# RefSchema
  * [rawSchema][]
    ```typescript
    interface RawRefDataSchema {
      type: 'ref'
      $ref: string
      $id?: string
      required?: boolean
      default?: boolean
    }
    ```

  * [schema][]
    ```typescript
    interface NumberDataSchema {
      type: 'ref'
      $ref: string
      $id?: string
      required: boolean
      default?: boolean
    }
    ```

  * properties:

     property           | description                           | default | required
    :-------------------|:--------------------------------------|:--------|:---------------------------------------
     `type`             | the type of DataSchema                | -       | Yes (and the value must be `'number'`)
     `required`         | whether the data must be set          | `false` | No
     `default`          | default value of this DataSchema      | -       | No
     `$id`              | unique identifier for DataSchema      | -       | No
     `$ref`             | the $id of the referenced DataSchema  | -       | No


# demo

  ```typescript
  import { optionMaster } from 'option-master'


  const rawSchema = {
    type: 'object',
    $id: '#/node',
    required: true,
    properties: {
      name: {
        type: 'string',
        required: true
      },
      title: 'string',
      children: {
        type: 'array',
        items: {
          type: 'ref',
          $ref: '#/node'
        }
      }
    }
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

  /**
   * result:
   * {
   *   "value": {
   *     "title": "alice",
   *     "name": "alice",
   *     "children": [
   *       {
   *         "name": "alice-1"
   *       },
   *       {
   *         "name": "alice-2",
   *         "children": [
   *           {
   *             "name": "alice-2-1",
   *             "children": [
   *               {
   *                 "name": "alice-2-1-1"
   *               }
   *             ]
   *           }
   *         ]
   *       }
   *     ]
   *   },
   *   "errors": [],
   *   "warnings": []
   * }
   */
  validate({
    "title": "alice",
    "name": "alice",
    "children": [
      {
        "name": "alice-1"
      },
      {
        "name": "alice-2",
        "children": [
          {
            "name": "alice-2-1",
            "children": [
              {
                "name": "alice-2-1-1"
              }
            ]
          }
        ]
      }
    ]
  })

  // undefined; and will print errors (`children.1.children.0.children.0.name` is not satisfied)
  validate({
    "title": "alice",
    "name": "alice",
    "children": [
      {
        "name": "alice-1"
      },
      {
        "name": "alice-2",
        "children": [
          {
            "name": "alice-2-1",
            "children": [
              {}
            ]
          }
        ]
      }
    ]
  })
  ```

* also see:
  - [demo][]
  - [test cases][test-cases]


[rawSchema]: ../../src/schema/ref.ts#RawNumberDataSchema
[schema]: ../../src/schema/ref.ts#NumberDataSchema
[demo]: ../../demo/ref
[test-cases]: ../../test/cases/data-schema/base-schema/ref
