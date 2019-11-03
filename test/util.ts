import fs from 'fs-extra'
import path from 'path'
import {
  DataValidationError,
  DataValidationWarning,
  DSchema,
  DSParseResult,
  RDSchema,
  parserMaster,
  validatorMaster,
} from '../src'


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
 *
 * @member constraint   DataSchema 的约束项
 * @member property
 *
 */
type WarnOrErrorItem<T extends (DataValidationError | DataValidationWarning)> = PickPartial<Pick<T, 'constraint' | 'property' | 'reason'>, 'reason'>


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
   * sorted by <property, constraint>
   *
   * 使用对应数据模式进行校验时产生的错误信息
   * 为了方便比较，将按照 <property, constraint> 进行排序
   */
  errors: WarnOrErrorItem<DataValidationError>[]
  /**
   * warning messages generated during validation using the corresponding data schema.
   * sorted by <property, constraint>
   *
   * 使用对应数据模式进行校验时产生的错误信息
   * 为了方便比较，将按照 <property, constraint> 进行排序
   */
  warnings: WarnOrErrorItem<DataValidationWarning>[]
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
   * filename suffix of input data file
   *
   * 输入文件的文件名后缀
   * @default .input.json
   */
  readonly inputDataFilePathSuffix?: string
  /**
   * filename suffix of output data file
   *
   * 输出文件的文件名后缀
   * @default .output.json
   */
  readonly outputDataFilePathSuffix?: string
  /**
   * filename suffix of answer data file
   *
   * 答案文件的文件名后缀
   * @default .answer.json
   */
  readonly answerDataFilePathSuffix?: string
}


export class TestCaseMaster {
  private readonly _cases: UseCaseItem[]
  private readonly _schemaMap: Map<string, DSchema>   // <schemaFilePath, DSchema>
  private readonly encoding: string
  private readonly schemaFileName: string
  private readonly inputFilePathSuffix: string
  private readonly outputFilePathSuffix?: string
  private readonly answerFilePathSuffix?: string

  public constructor ({
    encoding = 'utf-8',
    schemaFileName = '_schema.json',
    inputDataFilePathSuffix: inputFilePathSuffix = '.input.json',
    outputDataFilePathSuffix: outputFilePathSuffix = '.output.json',
    answerDataFilePathSuffix: answerFilePathSuffix = '.answer.json',
  }: TestCaseMasterProps = {}) {
    this._cases = []
    this._schemaMap = new Map()
    this.encoding = encoding
    this.schemaFileName = schemaFileName
    this.inputFilePathSuffix = inputFilePathSuffix
    this.outputFilePathSuffix = outputFilePathSuffix
    this.answerFilePathSuffix = answerFilePathSuffix
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
    const { schemaFileName, inputFilePathSuffix, outputFilePathSuffix, answerFilePathSuffix } = this
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
        if (filename.endsWith(inputFilePathSuffix)) {
          const title = filename.slice(0, -inputFilePathSuffix.length)
          const outputDataFilePath = path.join(dir, title + outputFilePathSuffix)
          const answerDataFilePath = path.join(dir, title + answerFilePathSuffix)

          const item: UseCaseItem = {
            path: dir,
            title,
            encoding: this.encoding,
            schemaFilePath,
            inputDataFilePath: filepath,
            outputDataFilePath,
            answerDataFilePath,
          }
          cases.push(item)
        }
      }
    }

    await scan(caseDirectory)
    this._cases.push(...cases)
  }

  /**
   * 通过 DataSchema 和 InputData 生成 AnswerResult
   * 若 DataSchema 存在错误，则返回错误消息
   *
   * @param item
   * @param needReason  AnswerResult 中是否需要添加错误原因
   */
  public async consume<T = any>(item: UseCaseItem, needReason: boolean = true): Promise<AnswerResult<T> | string> {
    const { encoding, schemaFilePath, inputDataFilePath } = item
    let schema: DSchema | undefined = this._schemaMap.get(schemaFilePath)
    if (schema == null) {
      const rawDataSchemaContent: string = await fs.readFile(schemaFilePath, encoding)
      const rawDataSchema: RDSchema = JSON.parse(rawDataSchemaContent)
      const parseResult: DSParseResult = parserMaster.parse('', rawDataSchema)

      // schema has error
      if (parseResult.hasError) {
        return `[error] bad schema: ${ parseResult.errorSummary }`
      }

      // schema has not recommend declaration
      if (parseResult.hasWarning) {
        console.warn('[warning] bad schema:', parseResult.warningSummary)
      }

      schema = parseResult.schema
    }

    // validate data
    const inputDataContent: string = await fs.readFile(inputDataFilePath, encoding)
    const inputData: any = JSON.parse(inputDataContent)
    const validationResult = validatorMaster.validate(schema!, inputData)
    const comparator = (
      x: { property: string, constraint: string },
      y: { property: string, constraint: string },
    ) => {
      if (x.property === y.property) {
        if (x.constraint === y.constraint) return 0
        return x.constraint < y.constraint ? -1 : 1
      }
      return x.property < y.property ? -1 : 1
    }

    return {
      data: validationResult.value,
      errors: validationResult.errors
        .map(({ property, constraint, reason }) => {
          const result: WarnOrErrorItem<DataValidationError> = { property, constraint }
          if (needReason) result.reason = reason
          return result
        })
        .sort(comparator),
      warnings: validationResult.warnings
        .map(({ property, constraint, reason }) => {
          const result: WarnOrErrorItem<DataValidationWarning> = { property, constraint }
          if (needReason) result.reason = reason
          return result
        })
        .sort(comparator)
    }
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
