import { RTDSchema } from '../../schema'
import { DataSchemaAdaptor } from '../types'


/**
 *
 */
export class JsonSchemaV7Adaptor implements DataSchemaAdaptor {
  public convert(jsonSchema: any): RTDSchema {
    return jsonSchema
  }
}


export const jsonSchemaV7Adaptor = new JsonSchemaV7Adaptor()
