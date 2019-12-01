import { isObject, isArray, isEmptyObject, isNotEmptyObject } from '../../../_util/type-util'
import { RawObjectDataSchema } from '../../../schema/object'
import { RTDSchema, RDSchema } from '../../schema'
import { DataSchemaAdaptor } from '../types'


/**
 *
 */
export class JsonSchemaV7Adaptor implements DataSchemaAdaptor {
  public convert(jsonSchema: any): RTDSchema {
    return this.subConvert(jsonSchema)
  }

  private subConvert(jsonSchema: any): RDSchema {
    // for object type
    if (isObject(jsonSchema)) {
      let j: any = jsonSchema

      // required
      if (isArray(j.required)) {
        if (j.type == undefined) j.type = 'object'
        j.requiredProperties = j.required
        j.required = undefined
      }

      // properties
      if (isObject(j.properties) || j.type === 'object') {
        if (j.type == undefined) j.type = 'object'
        const propertyNames: string[] = []
        const unRegisteredPropertyNames: string[] = isArray(j.requiredProperties) ? [...j.requiredProperties] : []

        // properties
        if (isNotEmptyObject(j.properties)) {
          const properties: RawObjectDataSchema['properties'] = {}
          for (const key of Object.getOwnPropertyNames(j.properties)) {
            const propertyRawSchema = j.properties[key]
            if (propertyRawSchema === null || isEmptyObject(propertyRawSchema)) {
              propertyNames.push(key)
            } else {
              properties[key] = this.subConvert(propertyRawSchema)
            }

            let index = unRegisteredPropertyNames.indexOf(key)
            if (index >= 0) {
              unRegisteredPropertyNames.splice(index, 1)
            }
          }
          j.properties = isNotEmptyObject(properties) ? properties : undefined
        }

        // propertyNames
        if (propertyNames.length > 0 || unRegisteredPropertyNames.length > 0) {
          const newPropertyNameSchema = {
            type: 'string',
            enum: [...propertyNames, ...unRegisteredPropertyNames],
          }
          if (j.propertyNames == null) {
            j.propertyNames = newPropertyNameSchema
          } else {
            j.propertyNames = {
              type: 'combine',
              anyOf: [
                j.propertyNames,
                newPropertyNameSchema,
              ]
            }
          }
        }
      }
    }

    return jsonSchema
  }
}


export const jsonSchemaV7Adaptor = new JsonSchemaV7Adaptor()
