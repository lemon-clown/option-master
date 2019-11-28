import { BaseDataSchemaCompiler, DataSchemaCompileResult } from '../_core/compiler'
import {
  STRING_V_TYPE as V,
  STRING_T_TYPE as T,
  RawStringDataSchema as RDS,
  StringDataSchema as DS,
  StringFormat,
  StringFormatSet,
  StringTransformType,
  StringTransformTypeSet
} from '../schema/string'
import { coverString, coverArray, coverRegex, coverInteger } from '../_util/cover-util'
import { isString } from '../_util/type-util'


/**
 * StringDataSchema 编译结果的数据类型
 */
export type StringDataSchemaCompileResult = DataSchemaCompileResult<T, V, RDS, DS>


/**
 * 数字类型的模式的编译器
 *
 * enum 将忽略所有非字符串的值
 */
export class StringDataSchemaCompiler extends BaseDataSchemaCompiler<T, V, RDS, DS> {
  public readonly type: T = T

  /**
   * compile RawSchema to Schema
   * @param rawSchema
   */
  public compile (rawSchema: RDS): StringDataSchemaCompileResult {
    const result: StringDataSchemaCompileResult = super.compile(rawSchema)
    rawSchema = result._rawSchema

    const defaultValueResult = result.compileProperty<V>('default', coverString)
    const patternResult = result.compileProperty<RegExp>('pattern', coverRegex)
    const enumValueResult = result.compileProperty<string[]>('enum', coverArray<string>(coverString))
    const minLengthResult = result.compileProperty<number>('minLength', coverInteger)
    const maxLengthResult = result.compileProperty<number>('maxLength', coverInteger)

    let format: StringFormat[] | undefined
    if (rawSchema.format != null) {
      // 先检查是否为字符串数组
      const formats: string[] = isString(rawSchema.format) ? [rawSchema.format] : rawSchema.format
      const formatResult = coverArray<string>(coverString)(formats)
      if (formatResult.hasError) {
        result.addError({
          constraint: 'format',
          reason: formatResult.errorSummary,
        })
      } else {
        format = []
        for (let f of formatResult.value!) {
          f = f.toLowerCase()
          if (!StringFormatSet.has(f)) {
            result.addWarning({
              constraint: 'format',
              reason: `unsupported format: ${ f }`
            })
            continue
          }
          format.push(f as StringFormat)
        }
        if (format.length <= 0) format = undefined
      }
    }

    // transform
    let transform: StringTransformType[] | undefined
    if (rawSchema.transform != null) {
      // 先检查是否为字符串数组
      const transforms: string[] = isString(rawSchema.transform) ? [rawSchema.transform] : rawSchema.transform
      const transformResult = coverArray<string>(coverString)(transforms)
      if (transformResult.hasError) {
        result.addError({
          constraint: 'transform',
          reason: transformResult.errorSummary,
        })
      } else {
        transform = []
        for (let f of transformResult.value!) {
          f = f.toLowerCase()
          if (!StringTransformTypeSet.has(f)) {
            result.addWarning({
              constraint: 'transform',
              reason: `unsupported transform: ${ f }`
            })
            continue
          }
          transform.push(f as StringTransformType)
        }
        if (transform.length <= 0) transform = undefined
      }
    }


    if (minLengthResult.value != null) {
      if (minLengthResult.value < 0) {
        result.addError({
          constraint: 'minLength',
          reason: 'minLength must be a non-negative integer',
        })
      }
    }

    if (maxLengthResult.value != null) {
      if (maxLengthResult.value <= 0) {
        result.addError({
          constraint: 'maxLength',
          reason: 'maxLength must be a positive integer',
        })
      } else if (minLengthResult.value != null && minLengthResult.value > maxLengthResult.value) {
        result.addError({
          constraint: 'minLength',
          reason: 'minLength must be less than or equal maxLength',
        })
      }
    }

    // StringDataSchema
    const schema: DS = {
      ...result.value!,
      default: defaultValueResult.value,
      minLength: minLengthResult.value,
      maxLength: maxLengthResult.value,
      pattern: patternResult.value,
      format,
      transform,
      enum: enumValueResult.value,
    }

    return result.setValue(schema)
  }
}