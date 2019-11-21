import { RDSchema, DSchema } from './_base'


/**
 * 数据模式节点
 */
export interface DataSchemaNode {
  /**
   * 被解析的 RawDataSchema
   */
  rawDataSchema: Readonly<RDSchema>
  /**
   * 用于缓存已解析的引用节点：
   *   - 当引用节点中没有覆盖属性（coverProperties) 时，可直接替换为其引用的节点（需要注意 $id 属性的更新）
   */
  dataSchema?: Readonly<DSchema>
  /**
   * 用于处理递归引用的问题：当引用节点引用的是其直系祖先节点时，会产生无限递归问题
   */
  finished: boolean
}


/**
 * 数据模式管理器
 */
export class DataSchemaMaster {
  /**
   * RawDataSchema.$id 和 DataSchemaNode 的映射
   * 用于解析引用节点
   */
  private readonly dataSchemaNodeMap: Map<string, DataSchemaNode>

  public constructor(dataSchemaItemMap?: Map<string, DataSchemaNode>) {
    this.dataSchemaNodeMap = dataSchemaItemMap != null ? dataSchemaItemMap : new Map()
  }

  /**
   * 清空 Map
   */
  public clear(): void {
    this.dataSchemaNodeMap.clear()
  }

  /**
   * 添加新的 RawDataSchema，并把 finished 状态置为 false
   * @param $id
   * @param rawDataSchema
   */
  public addRawDataSchema($id: string, rawDataSchema: RDSchema) {
    const node: DataSchemaNode = {
      rawDataSchema,
      finished: false
    }
    this.dataSchemaNodeMap.set($id, node)
  }

  /**
   * 添加 DataSchema，并把 finished 状态置为 true
   * @param $id
   * @param dataSchema
   */
  public addDataSchema($id: string, dataSchema?: DSchema) {
    const node = this.dataSchemaNodeMap.get($id)
    node!.finished = true
    node!.dataSchema = dataSchema
  }

  /**
   * 通过 $id 获取 RawDataSchema
   * @param $id
   */
  public getRawDataSchema($id: string): RDSchema | undefined {
    const node = this.dataSchemaNodeMap.get($id)
    return node == null ? undefined : node.rawDataSchema
  }

  /**
   * 通过 $id 获取 DataSchema
   * @param $id
   */
  public getDataSchema($id: string): DSchema | undefined {
    const node = this.dataSchemaNodeMap.get($id)
    return node == null ? undefined : node.dataSchema
  }

  /**
   * 是否存在含指定 $id 的 RawDataSchema
   * @param $id
   */
  public has($id: string): boolean {
    return this.dataSchemaNodeMap.has($id)
  }

  /**
   * 检查是否已解析完成
   * @param $id
   */
  public isFinished($id: string): boolean {
    const node = this.dataSchemaNodeMap.get($id)
    if (node == null) return false
    return node.finished
  }
}
