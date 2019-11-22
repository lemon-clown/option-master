import { DataValidator, DataValidatorFactory, DataValidatorFactoryConstructor } from './_base'
import { DataValidationResult } from './_result'
import { DataSchema, DSchema } from '../schema/_base'
import { DataSchemaMaster } from '../schema/_master'
import { stringify } from '../_util/type-util'


type T = string
type V = any
type DS = DataSchema<T, V>
export type DValidator = DataValidator<T, V, DS>
export type DValidatorFactory = DataValidatorFactory<T, V, DS>
export type DValidatorFactoryConstructor = DataValidatorFactoryConstructor<T, V, DS>
export type DValidationResult = DataValidationResult<T, V, DS>


/**
 * 数据校验器的管理对象
 *  - 注册操作：使得一个用户自定义的 Schema 类型对应的数据能被正确校验
 *  - 替换操作：替换一个原有类型的数据校验器
 *  - 解析操作：对于指定的 Schema 对象和数据对象，校验数据是否符合此 Schema 的定义
 */
export class DataValidatorMaster {
  /**
   * DataSchema.type 和 DataValidator 的映射
   */
  protected readonly validatorFactoryMap: Map<string, DValidatorFactory>

  /**
   * 数据模式管理对象实例
   * 用于校验引用节点
   */
  protected readonly dataSchemaMaster: DataSchemaMaster

  public constructor(
    dataSchemaMaster?: DataSchemaMaster,
    validatorFactoryMap?: Map<string, DValidatorFactory>,
  ) {
    this.dataSchemaMaster = dataSchemaMaster != null ? dataSchemaMaster : new DataSchemaMaster()
    this.validatorFactoryMap = validatorFactoryMap != null ? validatorFactoryMap : new Map()
  }

  /**
   * 通过 $id 获取 DataSchema
   * @param $id
   */
  public getDataSchema($id: string): DSchema | undefined {
    return this.dataSchemaMaster.getDataSchema($id)
  }

  /**
   * 添加 DataValidatorFactory，若指定的 type 已存在，则忽略此次添加
   * @param type
   * @param DataValidatorFactory
   */
  public registerValidatorFactory (type: string, DataValidatorFactory: DValidatorFactory): void {
    if (this.validatorFactoryMap.has(type)) return
    this.validatorFactoryMap.set(type, DataValidatorFactory)
  }

  /**
   * 覆盖已有的 DataValidatorFactory，若指定的 type 之前没有对应的 DataSchemaParser，也做添加操作
   * @param type
   * @param DataValidatorFactory
   */
  public replaceValidatorFactory (type: string, DataValidatorFactory: DValidatorFactory) {
    this.validatorFactoryMap.set(type, DataValidatorFactory)
  }

  /**
   * 执行校验操作
   * @param schema
   * @param data
   */
  public validate(schema: DS, data: any): DValidationResult {
    // 获取 DataValidatorFactory
    const validatorFactory = this.validatorFactoryMap.get(schema.type)
    if (validatorFactory == null) {
      const result: DValidationResult = new DataValidationResult(schema)
      return result.addError({
        constraint: 'type',
        reason: `unknown schema type: ${ stringify(schema.type) }.`
      })
    }

    // 创建 DataValidator，并返回其校验结果
    const validator = validatorFactory.create(schema)
    return validator.validate(data)
  }
}
