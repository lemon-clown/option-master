import { RTDSchema } from '../schema'


export interface DataSchemaAdaptor {
  convert (rawSchema?: any): RTDSchema
}
