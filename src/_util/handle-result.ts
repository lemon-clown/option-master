/**
 * 处理结果的信息对象
 */
export abstract class HandleResult <E, W> {
  protected readonly _errors: E[]
  protected readonly _warnings: W[]

  public constructor () {
    this._errors = []
    this._warnings =[]
  }

  /**
   * 错误消息
   */
  public get errors (): E[] {
    return this._errors
  }

  /**
   * 获取错误消息的汇总
   */
  public abstract get errorSummary(): string

  /**
   * 检查是否存在错误消息
   */
  public get hasError (): boolean {
    return this._errors.length > 0
  }

  /**
   * 警告消息
   */
  public get warnings (): W[] {
    return this.warnings
  }

  /**
   * 获取警告消息的汇总
   */
  public abstract get warningSummary(): string

  /**
   * 检查是否存在警告消息
   */
  public get hasWarning (): boolean {
    return this._warnings.length > 0
  }

  /**
   * 追加校验错误信息对象
   * @param errors
   */
  public addError (...errors: E[]): this {
    this._errors.push(...errors)
    return this
  }

  /**
   * 追加校验警告信息对象
   * @param warnings
   */
  public addWarning (...warnings: W[]): this {
    this._warnings.push(...warnings)
    return this
  }

  /**
   * 合并结果
   * @param result
   */
  public merge (result: HandleResult<E, W>): this {
    this.addError(...result.errors)
    this.addWarning(...result.warnings)
    return this
  }
}
