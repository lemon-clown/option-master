import { isString, stringify } from '../../_util/type-util'
import { coverString } from '../../_util/cover-util'
import {
  RDSchema,
  RDDSchema,
  RTDSchema,
  TDSchema,
  DDSchema,
  DefinitionDataSchemaMaster,
} from '../schema'
import { DSCompiler, DataSchemaCompilerContext, DSCResult, DDSCResult, TDSCResult } from './types'
import { DataSchemaCompileResult } from './result'


/**
 * Objects managed by the data pattern compiler
 *  - Registration operation: enable a user-defined Schema type to be correctly resolved
 *  - Replace operation: replace the compiler of a schema of the original type
 *  - Parsing operation: for the specified RawSchema object, find a suitable compiler
 *    to compile its value to get the Schema
 *
 * 数据模式编译器的管理对象
 *  - 注册操作：使得一个用户自定义的 Schema 类型能被正确编译
 *  - 替换操作：替换一个原有类型的 Schema 的编译器
 *  - 编译操作：对于指定的 RawSchema 对象，寻找合适的编译器编译其值，得到 Schema
 */
export class DataSchemaCompilerMaster implements DataSchemaCompilerContext {
  /**
   * Mapping of the DataSchema.type and DataSchemaCompiler
   *
   * DataSchema.type 和 DataSchemaCompiler 的映射
   */
  protected readonly compilerMap: Map<string, DSCompiler>
  /**
   * DefinitionDataSchema management object instance for resolving reference nodes
   *
   * 数据模式管理对象实例，用于编译引用节点
   */
  protected readonly definitionSchemaMaster: DefinitionDataSchemaMaster

  public constructor(compilerMap?: Map<string, DSCompiler>) {
    this.compilerMap = compilerMap != null ? compilerMap : new Map()
    this.definitionSchemaMaster = new DefinitionDataSchemaMaster()
  }

  /**
   * Add DataSchemaCompiler, if the compiler of the specified type already exists, ignore this addition
   *
   * 添加 DataSchemaCompiler，若指定的 type 的编译器已存在，则忽略此次添加
   * @param type
   * @param schemaCompiler
   */
  public registerCompiler(type: string, schemaCompiler: DSCompiler): void {
    if (this.compilerMap.has(type)) return
    this.compilerMap.set(type, schemaCompiler)
  }

  /**
   * Overwrite the existing DataSchemaCompiler.
   * If there is no corresponding DataSchemaCompiler before the specified type, add it.
   *
   * 覆盖已有的 DataSchemaCompiler；
   * 若指定的 type 之前没有对应的 DataSchemaCompiler，也做添加操作
   * @param type
   * @param schemaCompiler
   */
  public replaceCompiler(type: string, schemaCompiler: DSCompiler) {
    this.compilerMap.set(type, schemaCompiler)
  }

  /**
   * override method
   * @see DataSchemaCompilerContext#compileDataSchema
   */
  public compileDataSchema(rawSchema: RDSchema): DSCResult {
    rawSchema = this.normalizeRawSchema(rawSchema)

    // check type
    if (rawSchema == null || !isString(rawSchema.type)) {
      const result: DSCResult = new DataSchemaCompileResult(rawSchema)
      return result.addError({
        constraint: 'type',
        reason: `\`schema.type\` must be a string, but got (${ stringify(rawSchema.type) }).`
      })
    }

    // delegate to the specified type of compiler
    const compiler = this.compilerMap.get(rawSchema.type)
    if (compiler == null) {
      const result: DSCResult = new DataSchemaCompileResult(rawSchema)
      return result.addError({
        constraint: 'type',
        reason: `unknown \`schema.type\`: ${ stringify(rawSchema.type) }.`
      })
    }

    return compiler.compile(rawSchema)
  }

  /**
   * override method
   * @see DataSchemaCompilerContext#compileDefinitionDataSchema
   */
  public compileDefinitionDataSchema(name: string, rawSchema: RDDSchema): DDSCResult {
    rawSchema = this.normalizeRawSchema(rawSchema)
    const result: DDSCResult = new DataSchemaCompileResult(rawSchema)

    // compile $id
    const $idResult = result.compileProperty('$id', coverString, undefined)

    // pre-add schema (parsing)
    const $path = this.definitionSchemaMaster.nameToPath(name)
    this.definitionSchemaMaster.addRawSchema($path, rawSchema, $idResult.value)

    const dataSchemaResult = this.compileDataSchema(rawSchema)
    result.merge(dataSchemaResult)
    if (!dataSchemaResult.hasError) {
      const schema: DDSchema = {
        ...dataSchemaResult.value!,
        $id: $idResult.value!,
      }
      result.setValue(schema)
    }

    return result
  }

  /**
   * override method
   * @see DataSchemaCompilerContext#compileTopDataSchema
   */
  public compileTopDataSchema(rawSchema: RTDSchema): TDSCResult {
    rawSchema = this.normalizeRawSchema(rawSchema)
    const result: TDSCResult = new DataSchemaCompileResult(rawSchema)
    this.definitionSchemaMaster.clear()

    try {
      // compile definitions first
      let definitions: TDSchema['definitions'] = undefined
      if (rawSchema.definitions != null) {
        definitions = {}
        for (const name of Object.getOwnPropertyNames(rawSchema.definitions)) {
          const rawDefinitionSchema = rawSchema.definitions[name]
          const definitionSchemaResult = this.compileDefinitionDataSchema(name, rawDefinitionSchema)
          // merge errors and warnings
          if (definitionSchemaResult.hasError || definitionSchemaResult.hasWarning) {
            result.addHandleResult('definitions', definitionSchemaResult)
          }
          // collect definition
          if (!definitionSchemaResult.hasError) {
            definitions[name] = definitionSchemaResult.value!
          }
        }
      }

      // compile other property
      const dataSchemaResult = this.compileDataSchema(rawSchema)
      result.merge(dataSchemaResult)

      // check for errors
      if (!result.hasError) {
        const schema: TDSchema = {
          definitions,
          ...dataSchemaResult.value!,
        }
        result.setValue(schema)
      }
    } finally {
      // Need to clean up the definitionSchemaMaster even if an exception is thrown
      this.definitionSchemaMaster.clear()
    }

    return result
  }

  /**
   * override method
   * @see DataSchemaCompilerContext#hasDefinition
   */
  public hasDefinition(idOrPath: string): boolean {
    return this.definitionSchemaMaster.has(idOrPath)
  }

  /**
   * override method
   * @see DataSchemaCompilerContext#getRawDefinition
   */
  public getRawDefinition(idOrPath: string): RDDSchema | undefined {
    return this.definitionSchemaMaster.getRawSchema(idOrPath)
  }

  /**
   * override method
   * @see DataSchemaCompilerContext#normalizeRawSchema
   */
  public normalizeRawSchema(rawSchema: RDSchema): RDSchema {
    if (isString(rawSchema)) {
      return { type: rawSchema }
    }
    return { ...rawSchema }
  }

  /**
   * override method
   * @see DataSchemaCompilerContext#inheritRawSchema
   */
  public inheritRawSchema<T extends RDSchema>(defaultRawSchema: RDSchema, rawSchema: T): T {
    return {
      required: defaultRawSchema.required,
      ...rawSchema,
    }
  }
}
