import fs from 'fs-extra'
import path from 'path'
import { DSchema, DSParseResult, RDSchema, optionMaster } from '../src'
import { DataHandleResultException } from '../src/_util/handle-result'


/**
 * test case
 *
 * 测试用例
 */
export interface UseCaseItem {
  /**
   * 测试用例所处的文件夹名称
   */
  path: string
  /**
   * case title
   *
   * 测试用例的标题
   */
  title: string
  /**
   * encoding type input/output/answer data file
   *
   * 输入/输出/答案 数据文件的文件编码
   */
  encoding: string
  /**
   *
   * 是否含有多个数据案例
   */
  multipleCase: boolean
  /**
   * file path of DataSchema
   *
   * DataSchema 的文件路径
   */
  schemaFilePath: string
  /**
   * file path of input data
   *
   * 输入数据文件的文件路径
   */
  inputDataFilePath: string
  /**
   * file path of output data
   *
   * 输出数据文件的文件路径
   */
  outputDataFilePath: string
  /**
   * file path of answer
   *
   * 答案数据文件的文件路径
   */
  answerDataFilePath: string
}


/**
 * 测试用例组
 */
export interface UseCaseGroup {
  /**
   * title of use case group
   *
   * 用例组的标题
   */
  readonly title: string
  /**
   * use cases of current group
   *
   * 组内的测试用例
   */
  readonly cases: UseCaseItem[]
  /**
   * sub use case group
   *
   * 子组
   */
  readonly subUseCaseGroups: UseCaseGroup[]
}


/**
 * 异常信息对象
 */
interface ExceptionItem {
  /**
   * 约束项
   */
  constraint: string
  /**
   * 解析/校验 异常的属性名
   */
  property?: string
  /**
   * 错误原因
   */
  reason?: string
  /**
   * 错误的详情
   */
  traces?: ExceptionItem[]
}


/**
 * the data type of the file (outputDataFilePath/answerDataFilePath) content
 *
 * 输出/答案文件 内容的数据类型
 */
export interface AnswerResult<T = any> {
  /**
   * data matched the corresponding DataSchema
   *
   * 匹配对应数据模式的数据
   */
  data: T
  /**
   * error messages generated during validation using the corresponding data schema.
   * sorted by <constraint, property>
   *
   * 使用对应数据模式进行校验时产生的错误信息
   * 为了方便比较，将按照 <constraint, property> 进行排序
   */
  errors: ExceptionItem[]
  /**
   * warning messages generated during validation using the corresponding data schema.
   * sorted by <constraint, property>
   *
   * 使用对应数据模式进行校验时产生的错误信息
   * 为了方便比较，将按照 <constraint, property> 进行排序
   */
  warnings: ExceptionItem[]
}


/**
 * params to create instance of TestCaseMaster
 *
 * 创建 TestCaseMaster 的参数
 */
interface TestCaseMasterProps {
  /**
   * encoding type input/output/answer data file
   *
   * 输入/输出/答案 数据文件的文件编码
   * @default utf-8
   */
  readonly encoding?: string
  /**
   * filename suffix of DataSchema file
   *
   * DataSchema 文件的文件名后缀
   * @default _schema.json
   */
  readonly schemaFileName?: string
  /**
   * filename suffix of single data input file
   *
   * 单个数据的输入文件的文件名后缀
   * @default .input.json
   */
  readonly inputDataFilePathSuffix?: string
  /**
   * filename suffix of multiple data input file
   *
   * 多个数据的输入文件的文件名后缀
   * @default .inputs.json
   */
  readonly multipleInputDataFilePathSuffix?: string
  /**
   * filename suffix of single data output file
   *
   * 单个数据的输出文件的文件名后缀
   * @default .output.json
   */
  readonly outputDataFilePathSuffix?: string
  /**
   * filename suffix of multiple data output file
   *
   * 多个数据的输出文件的文件名后缀
   * @default .outputs.json
   */
  readonly multipleOutputDataFilePathSuffix?: string
  /**
   * filename suffix of single data answer file
   *
   * 单个数据的答案文件的文件名后缀
   * @default .answer.json
   */
  readonly answerDataFilePathSuffix?: string
  /**
   * filename suffix of multiple data answer file
   *
   * 多个数据的答案文件的文件名后缀
   * @default .answers.json
   */
  readonly multipleAnswerDataFilePathSuffix?: string
}


export class TestCaseMaster {
  private readonly _cases: UseCaseItem[]
  private readonly _schemaMap: Map<string, DSchema>   // <schemaFilePath, DSchema>
  private readonly encoding: string
  private readonly schemaFileName: string
  private readonly inputDataFilePathSuffix: string
  private readonly multipleInputDataFilePathSuffix: string
  private readonly outputDataFilePathSuffix: string
  private readonly multipleOutputDataFilePathSuffix: string
  private readonly answerDataFilePathSuffix: string
  private readonly multipleAnswerDataFilePathSuffix: string

  public constructor ({
    encoding = 'utf-8',
    schemaFileName = '_schema.json',
    inputDataFilePathSuffix = '.input.json',
    multipleInputDataFilePathSuffix = '.inputs.json',
    outputDataFilePathSuffix = '.output.json',
    multipleOutputDataFilePathSuffix = '.outputs.json',
    answerDataFilePathSuffix = '.answer.json',
    multipleAnswerDataFilePathSuffix = '.answers.json',
  }: TestCaseMasterProps = {}) {
    this._cases = []
    this._schemaMap = new Map()
    this.encoding = encoding
    this.schemaFileName = schemaFileName
    this.inputDataFilePathSuffix = inputDataFilePathSuffix
    this.multipleInputDataFilePathSuffix = multipleInputDataFilePathSuffix
    this.outputDataFilePathSuffix = outputDataFilePathSuffix
    this.multipleOutputDataFilePathSuffix = multipleOutputDataFilePathSuffix
    this.answerDataFilePathSuffix = answerDataFilePathSuffix
    this.multipleAnswerDataFilePathSuffix = multipleAnswerDataFilePathSuffix
  }

  /**
   * 获取测试项列表
   */
  public get cases(): UseCaseItem[] {
    return [...this._cases]
  }

  /**
   * 扫描测试项所在的目录，并解析成 TestCaseItem 列表
   * 目录中需要有一个 _schema.json 作为该目录的 DataSchema，
   * 对于子目录中，若不存在 schema.json，则使用最近含 _schema.json 的祖先节点的 _schema.json
   * 一个测试用例数据包括 *.input.json 和 *.answer.json 两个文件
   *
   * @param caseDirectory   测试项所在的目录
   * @param recursive       是否递归扫描子孙目录
   */
  public async scan(caseDirectory: string, recursive: boolean = true) {
    const cases: UseCaseItem[] = []
    const {
      schemaFileName,
      inputDataFilePathSuffix,
      multipleInputDataFilePathSuffix,
      outputDataFilePathSuffix,
      multipleOutputDataFilePathSuffix,
      answerDataFilePathSuffix,
      multipleAnswerDataFilePathSuffix,
    } = this
    const scan = async (dir: string, schemaFilePath?: string) => {
      const files = fs.readdirSync(dir)

      // 检查当前目录下是否有 schema.json；若无则沿用最近祖先节点的 _schema.json
      if (files.includes(schemaFileName)) {
        schemaFilePath = path.join(dir, schemaFileName)
      }

      for (let filename of files) {
        const filepath = path.join(dir, filename)
        const stat = await fs.stat(filepath)

        // 若为目录，则判断是否需要递归扫描
        if (stat.isDirectory()) {
          if (!recursive) continue
          await scan(filepath, schemaFilePath)
          continue
        }

        // 否则，若 _schema.json 不存在，则 continue
        if (schemaFilePath == null) continue

        // 检查是否存在输入文件（输出文件和答案文件都是可选的）
        if (filename.endsWith(inputDataFilePathSuffix)) {
          const title = filename.slice(0, -inputDataFilePathSuffix.length)
          const outputDataFilePath = path.join(dir, title + outputDataFilePathSuffix)
          const answerDataFilePath = path.join(dir, title + answerDataFilePathSuffix)

          const item: UseCaseItem = {
            path: dir,
            title,
            encoding: this.encoding,
            multipleCase: false,
            schemaFilePath,
            inputDataFilePath: filepath,
            outputDataFilePath,
            answerDataFilePath,
          }
          cases.push(item)
          continue
        }

        // 检查是否存在输入文件（输出文件和答案文件都是可选的）
        if (filename.endsWith(multipleInputDataFilePathSuffix)) {
          const title = filename.slice(0, -multipleInputDataFilePathSuffix.length)
          const outputDataFilePath = path.join(dir, title + multipleOutputDataFilePathSuffix)
          const answerDataFilePath = path.join(dir, title + multipleAnswerDataFilePathSuffix)

          const item: UseCaseItem = {
            path: dir,
            title,
            encoding: this.encoding,
            multipleCase: true,
            schemaFilePath,
            inputDataFilePath: filepath,
            outputDataFilePath,
            answerDataFilePath,
          }
          cases.push(item)
          continue
        }
      }
    }

    await scan(caseDirectory)
    this._cases.push(...cases)
  }

  /**
   * 通过 DataSchema 和 InputData 生成 AnswerResult；若是多数据的输入，则生成 AnswerResult<T>[]
   * 若 DataSchema 存在错误，则返回错误消息
   *
   * @param item
   * @param needReason  AnswerResult 中是否需要添加错误原因
   */
  public async consume<T = any>(item: UseCaseItem, needReason: boolean = true): Promise<AnswerResult<T> | AnswerResult<T>[] | string> {
    const { encoding, schemaFilePath, inputDataFilePath } = item
    let schema: DSchema | undefined = this._schemaMap.get(schemaFilePath)

    optionMaster.reset()
    if (schema == null) {
      const rawDataSchemaContent: string = await fs.readFile(schemaFilePath, encoding)
      const rawDataSchema: RDSchema = JSON.parse(rawDataSchemaContent)
      const parseResult: DSParseResult = optionMaster.parse(rawDataSchema)

      // schema has error
      if (parseResult.hasError) {
        return `[error] bad schema: ${ parseResult.errorSummary }`
      }

      // schema has not recommend declaration
      if (parseResult.hasWarning) {
        console.warn('[warning] bad schema:', parseResult.warningSummary)
      }

      schema = parseResult.value
    }

    const handleInput = (rawData: any): AnswerResult<T> => {
      const validationResult = optionMaster.validate(schema!, rawData)

      // 比较器，constraint 优先，property 无值的优先
      const comparator = (x: ExceptionItem, y: ExceptionItem) => {
        if (x.constraint === y.constraint) {
          if (x.property == null) {
            if (y.property == null) return 0
            return -1
          }
          if (y.property == null) return 1
          return x.property < y.property ? -1 : 1
        }
        return x.constraint < y.constraint ? -1 : 1
      }

      // 映射器
      const mapper = (x: DataHandleResultException): ExceptionItem => {
        const result: ExceptionItem = { constraint: x.constraint }
        if (needReason) result.reason = x.reason
        if (x.property != null) result.property = x.property
        if (x.traces != null) result.traces = x.traces.map(mapper)
        return result
      }

      return {
        data: validationResult.value,
        errors: validationResult.errors
          .map(mapper)
          .sort(comparator),
        warnings: validationResult.warnings
          .map(mapper)
          .sort(comparator)
      }
    }

    // validate data
    const inputDataContent: string = await fs.readFile(inputDataFilePath, encoding)
    const inputData: any = JSON.parse(inputDataContent)

    // single data input file
    if (!item.multipleCase) {
      return handleInput(inputData)
    }

    // multiple data input file
    const results: AnswerResult<T>[] = []
    for (const a of inputData) {
      results.push(handleInput(a))
    }
    return results
  }

  /**
   * collect test cases which path is `caseRootDir` or `caseRootDir`'s subdirectory
   *
   * 收集路径为 `caseRootDir` 或 `caseRootDir` 子目录的测试用例
   * @param caseRootDir
   */
  public collectUseCases(caseRootDir: string): UseCaseGroup[] {
    const useCaseGroups: UseCaseGroup[] = []

    caseRootDir = path.normalize(caseRootDir + '/')
    const caseRootDirWithoutSlash = caseRootDir.replace(/[\/\\]*$/, '')
    const cases = this.cases
      // kase.path must equals caseRootDir or a sub directory path of caseRootDir
      .filter(kase => kase.path === caseRootDirWithoutSlash || kase.path.startsWith(caseRootDirWithoutSlash))
      // sort by <path, inputDataFilePath>
      .sort((x, y) => {
        if (x.path === y.path) {
          if (x.inputDataFilePath === y.inputDataFilePath) return 0
          return x.inputDataFilePath < y.inputDataFilePath ? -1 : 1
        }
        return x.path < y.path ? -1 : 1
      })

    // map TestCaseItem to mocha describe blocks
    for (let i = 0; i < cases.length;) {
      const collectDescribeRecursively = (): UseCaseGroup => {
        const firstIndex = i
        const currentKase = cases[firstIndex]
        const subUseCaseGroups: UseCaseGroup[] = []
        const useCaseItems: UseCaseItem[] = [currentKase]

        for (++i; i < cases.length; ++i) {
          const kase = cases[i]
          if (kase.path === currentKase.path) {
            useCaseItems.push(kase)
            continue
          }
          if (kase.path.startsWith(currentKase.path + path.sep)) {
            const group = collectDescribeRecursively()
            subUseCaseGroups.push(group)
            continue
          }
          break
        }

        const title = path.relative(caseRootDir, currentKase.path)
        return {
          title,
          cases: useCaseItems,
          subUseCaseGroups,
        }
      }

      const group = collectDescribeRecursively()
      useCaseGroups.push(group)
    }
    return useCaseGroups
  }
}
