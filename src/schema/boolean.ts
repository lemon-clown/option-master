import { DataSchema, RawDataSchema } from './_base'



// BooleanDataSchema.type 的类型
export const BOOLEAN_T_TYPE = 'boolean'
export type BOOLEAN_T_TYPE = typeof BOOLEAN_T_TYPE

// BooleanDataSchema.value 的类型
export type BOOLEAN_V_TYPE = boolean



/**
 * 布尔类型的数据选项
 */
export interface RawBooleanDataSchema extends RawDataSchema<BOOLEAN_T_TYPE, BOOLEAN_V_TYPE> {

}



/**
 * 布尔类型的数据选项
 */
export interface BooleanDataSchema extends DataSchema<BOOLEAN_T_TYPE, BOOLEAN_V_TYPE> {

}
