import { DDSchema, TDSchema, RDDSchema } from './types'


/**
 * 数据模式节点
 */
export interface DefinitionDataSchemaNode {
  /**
   * 用于处理递归引用的问题：当引用节点引用的是其直系祖先节点时，会产生无限递归问题
   */
  finished: boolean
  /**
   *
   */
  rawSchema: Readonly<RDDSchema>
  /**
   * 用于缓存已解析的引用节点：
   *   - 当引用节点中没有覆盖属性（coverProperties) 时，可直接替换为其引用的节点（需要注意 $id 属性的更新）
   */
  schema?: Readonly<DDSchema>
}


/**
 *
 */
export class DefinitionDataSchemaMaster {
  /**
   * RawDefinitionDataSchema.$id 和 DataSchemaNode 的映射
   * 用于解析引用节点
   */
  protected readonly schemaIdMap: Map<string, DefinitionDataSchemaNode>
  /**
   *
   */
  protected readonly schemaPathMap: Map<string, DefinitionDataSchemaNode>
  /**
   *
   */
  protected readonly pathPrefix: string

  public constructor(pathPrefix?: string) {
    this.pathPrefix =  pathPrefix || '#/definitions/'
    this.schemaIdMap = new Map()
    this.schemaPathMap = new Map()
  }

  /**
   * 清空 Map
   */
  public clear(): void {
    this.schemaIdMap.clear()
    this.schemaPathMap.clear()
  }

  public nameToPath($name: string) {
    return this.pathPrefix + $name
  }

  /**
   *
   * @param $path
   * @param $id
   */
  public addRawSchema($path: string, rawSchema: RDDSchema, $id?: string) {
    // check if $id is duplicate
    if ($id != null && this.schemaIdMap.has($id)) {
      throw new Error(`[DefinitionDataSchemaMaster.preAddSchema] $id(${ $id }) has existed`)
    }

    // check if $path is duplicate
    if (this.schemaPathMap.has($path)) {
      throw new Error(`[DefinitionDataSchemaMaster.preAddSchema] $path(${ $path }) has existed`)
    }

    // add node
    const node: DefinitionDataSchemaNode = { finished: false, rawSchema }
    if ($id != null) this.schemaIdMap.set($id, node)
    this.schemaPathMap.set($path, node)
  }

  /**
   * 添加 DataSchema，并把 finished 状态置为 true
   * @param $path
   * @param schema
   */
  public addSchema($path: string, schema?: DDSchema) {
    const node = this.schemaPathMap.get($path)
    node!.finished = true
    node!.schema = schema
  }

  /**
   *
   * @param idOrPath
   */
  public getRawSchema(idOrPath: string): RDDSchema | undefined {
    const node = this.getByIdOrPath(idOrPath)
    return node != null ? node.rawSchema: undefined
  }

  /**
   * @param idOrPath
   */
  public getSchema(idOrPath: string): DDSchema | undefined {
    const node = this.getByIdOrPath(idOrPath)
    return node != null ? node.schema : undefined
  }

  /**
   * 是否存在含指定 $id 的 RawDataSchema
   * @param idOrPath
   */
  public has(idOrPath: string): boolean {
    return this.getByIdOrPath(idOrPath) != null
  }

  /**
   * 检查是否已解析完成
   * @param idOrPath
   */
  public isFinished(idOrPath: string): boolean {
    const node = this.getByIdOrPath(idOrPath)
    if (node == null) return true
    return node.finished
  }

  /**
   * get DefinitionDataSchemaNode by schema.$id or ref path
   * @param idOrPath
   */
  private getByIdOrPath(idOrPath: string): DefinitionDataSchemaNode | undefined {
    // try id
    let node = this.schemaIdMap.get(idOrPath)
    if (node != null) return node

    // try path
    node = this.schemaPathMap.get(idOrPath)
    if (node != null) return node

    // not found
    return undefined
  }
}


/**
 *
 */
export class TopDataSchemaMaster {
  protected readonly pathPrefix: string
  protected schema?: TDSchema

  public constructor(schema?: TDSchema, pathPrefix?: string) {
    this.schema = schema
    this.pathPrefix =  pathPrefix || '#/definitions/'
  }

  public resetSchema (schema: TDSchema) {
    this.schema = schema
  }

  /**
   * 通过 $id 或者 `#/definitions/<name>` 获取 DefinitionDataSchema
   *
   * @param idOrPath
   */
  public getDefinition(idOrPath: string): DDSchema | undefined {
    if (this.schema == null || this.schema.definitions == null) return undefined
    let definitionSchema: DDSchema | undefined

    // get by path (`#/definitions/<name>`)
    if (idOrPath.startsWith(this.pathPrefix)) {
      let $name = idOrPath.substr(this.pathPrefix.length)
      definitionSchema = this.schema.definitions[$name]
      if (definitionSchema != null) return definitionSchema
    }

    // get by $id
    for (const key of Object.getOwnPropertyNames(this.schema.definitions)) {
      definitionSchema = this.schema.definitions[key]
      if (definitionSchema.$id === idOrPath) return definitionSchema
    }

    // not found
    return undefined
  }
}
