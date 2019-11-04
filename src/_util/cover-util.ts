import { convertToNumber, isString, isArray, stringify } from './type-util'
import { HandleResult } from './handle-result'


/**
 * CoverOperationResult 实现类
 */
export class CoverOperationResult<T> extends HandleResult<string, string> {
  private _value?: T

  /**
   * 错误信息汇总
   */
  public get errorSummary(): string {
    return '[' + this._errors.join(',\n') + ']'
  }

  /**
   * 警告消息汇总
   */
  public get warningSummary(): string {
    return '[' + this._warnings.join(',\n') + ']'
  }

  /**
   * 最终的值
   */
  public get value(): T | undefined {
    return this._value
  }

  /**
   * 设置值，并返回当前对象
   * @param value
   */
  public setValue (value?: T): this {
    this._value =value
    return this
  }
}


/**
 * 覆盖操作
 * 若传进来的值不是一个合法的值，则会将 value 置为 defaultValue（除非有特殊说明），并添加对应的错误消息
 *
 * @param defaultValue  默认值
 * @param value         传进来的值
 */
export type CoverOperationFunc<T> = (defaultValue?: T, value?: any) => CoverOperationResult<T>


/**
 * 传进来的选项覆盖默认值
 * 若传进来的值为 null/undefined 或非数字，则返回默认值；
 * 否则将传进来的值转为 number 并返回
 */
 export const coverNumber: CoverOperationFunc<number> = (defaultValue, value) => {
  const result: CoverOperationResult<number> = new CoverOperationResult()
  if (value == null) return result.setValue(defaultValue)
  if (typeof value === 'boolean') {
    return result.addError(`expected a number, but got boolean: ${ value }`)
  }

  // 转为 number
  value = convertToNumber(value)
  if (Number.isNaN(value)) {
    return result
      .addError(`(${ stringify(value) }) is not a valid number (or number string)`)
      .setValue(defaultValue)
  }

  return result.setValue(value)
}


/**
 * 传进来的选项覆盖默认值
 * 若传进来的值为 null/undefined 或非数字（且非数字字符串），则返回默认值；
 * 若传进来的值为数字（或数字字符串），但并非整数（或整数字符串），则添加一条错误消息，并仍将此值置为返回结果中的 value
 * 否则将传进来的值转为 number 并返回
 */
export const coverInteger: CoverOperationFunc<number> = (defaultValue, value) => {
  const result: CoverOperationResult<number> = new CoverOperationResult()
  if (value == null) return result.setValue(defaultValue)

  // 转为 number
  value = convertToNumber(value)
  if (Number.isNaN(value)) {
    return result
      .addError(`(${ stringify(value) }) is not a valid number (or number string)`)
      .setValue(defaultValue)
  }

  if (!Number.isInteger(value)) {
    result
      .addError(`(${ stringify(value) }) is not a valid integer (or integer string)`)
  }
  return result.setValue(value)
}


/**
 * 如果是字符串，则
 *  - 'false'（不区分大小写）视作 false
 *  - 'true'（不区分大小写）视作 true
 *  - 其余值视作 undefined
 *
 * 否则，若不是布尔值，视作类型错误
 */
export const coverBoolean: CoverOperationFunc<boolean> = (defaultValue, value) => {
  const result: CoverOperationResult<boolean> = new CoverOperationResult()
  if (value == null) return result.setValue(defaultValue)

  // 检查是否字符串
  if (isString(value)) {
    value = value.toLocaleLowerCase()
  }

  switch (value) {
    case 'false':
    case false: return result.setValue(false)
    case 'true':
    case true: return result.setValue(true)
    default:
      return result.addError(`(${ stringify(value) }) is not a valid boolean type (or boolean string)`)
  }
}


/**
 * 传进来的选项覆盖默认值
 * 若传进来的值为 null/undefined 或空字符串，则返回默认值
 */
export const coverString: CoverOperationFunc<string> = (defaultValue, value) => {
  const result: CoverOperationResult<string> = new CoverOperationResult()
  if (value == null) return result.setValue(defaultValue)

  // 检查是否为字符串
  if (!isString(value)) {
    return result
      .addError(`${ stringify(value) } is not a valid string`)
      .setValue(defaultValue)
  }

  return result.setValue(value)
}


/**
 * 若传进来的值不是一个合法的正则表达式字符串，则会将 value 置为 defaultValue，
 * 并添加对应的错误信息
 */
export const coverRegex: CoverOperationFunc<RegExp> = (defaultValue, value) => {
  const result: CoverOperationResult<RegExp> = new CoverOperationResult()
  if (value == null) return result.setValue(defaultValue)

  try {
    const regex = new RegExp(value)
    result.setValue(regex)
  } catch (error) {
    result
      .addError(error.message || `${ stringify(value) } is not a valid regex.`)
      .setValue(defaultValue)
  }

  return result
}


/**
 * 覆盖数组的数据选项
 * @param elemCoverFunc   针对每个元素做覆盖操作的函数
 */
export function coverArray<T> (elemCoverFunc: CoverOperationFunc<T>): CoverOperationFunc<T[]> {
  return (defaultValue?: T[], value?: any): CoverOperationResult<T[]> => {
    const result: CoverOperationResult<T[]> = new CoverOperationResult()
    if (value == null) return result.setValue(defaultValue)

    // 如果不是数组，则直接置为默认值，并添加错误信息
    if (!isArray(value)) {
      return result
        .addError(`${ stringify(value) } is not a valid array`)
        .setValue(defaultValue)
    }

    const resolvedValue: T[] = []
    for (let i = 0; i < value.length; ++i) {
      const v = value[i]
      const xResult = elemCoverFunc(undefined, v)

      // 忽略错误的值
      if (xResult.hasError) {
        result.addError(`index(${ i }): ` + xResult.errorSummary)
        continue
      }

      resolvedValue.push(xResult.value!)
    }

    return result.setValue(resolvedValue)
  }
}
