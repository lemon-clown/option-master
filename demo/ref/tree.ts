import { optionMaster } from '../../src'


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
