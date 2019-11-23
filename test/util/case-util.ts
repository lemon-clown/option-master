import fs from 'fs-extra'
import path from 'path'
import { expect } from 'chai'
import { describe, it } from 'mocha'


/**
 * test case
 *
 * 测试用例
 */
export interface TestCase {
  /**
   * the path where the test case is located
   *
   * 测试用例所在的路径
   */
  readonly dir: string
  /**
   * title of test case
   *
   * 测试用例的标题
   */
  readonly title: string
  /**
   * file path of input data
   *
   * 输入文件的路径
   */
  readonly inputFilePath: string
  /**
   * file path of the located the expected result of the inputFilePath
   *
   * inputFilePath 定义的数据对应的答案数据所在的文件路径
   */
  readonly answerFilePath: string
}


/**
 * test case group
 *
 * 测试用例组
 */
export interface TestCaseGroup {
  /**
   * title of test case group
   *
   * 测试用例组的标题
   */
  readonly title: string
  /**
   * sub test group
   *
   * 子测试组
   */
  readonly subGroups: TestCaseGroup[]
  /**
   * test cases of current group
   *
   * 组内的测试用例
   */
  readonly cases: TestCase[]
}


/**
 * params of  TestCaseMaster.constructor
 */
export interface TestCaseMasterProps {
  /**
   *
   */
  caseRootDirectory: string
  /**
   * filename suffix of input data file
   *
   * 文件的文件名后缀
   */
  inputFileNameSuffix: string
  /**
   * filename suffix of the located the expected result of the inputFilePath
   *
   * inputFilePath 定义的数据对应的答案数据所在的文件路径后缀
   */
  answerFileNameSuffix: string
}


/**
 * 测试用例辅助类
 */
export abstract class TestCaseMaster<T, D> {
  protected readonly _caseGroups: TestCaseGroup[]
  protected readonly caseRootDirectory: string
  protected readonly inputFileNameSuffix: string
  protected readonly answerFileNameSuffix: string

  public constructor({ caseRootDirectory, inputFileNameSuffix, answerFileNameSuffix }: TestCaseMasterProps) {
    this._caseGroups = []
    this.caseRootDirectory = caseRootDirectory
    this.inputFileNameSuffix = inputFileNameSuffix
    this.answerFileNameSuffix = answerFileNameSuffix
  }

  /**
   * 获取测试用例组
   */
  public get caseGroups(): TestCaseGroup[] {
    return [...this._caseGroups]
  }

  /**
   * Scan test case directories to generate test case entries
   *
   * 扫描测试用例目录，生成测试用例条目
   * @param dir       测试用例目录（绝对路径）
   * @param recursive 是否递归扫描
   */
  public async scan(caseDirectory: string, recursive: boolean = true) {
    const self = this
    const scan = async (dir: string): Promise<TestCaseGroup> => {
      const caseGroup: TestCaseGroup = {
        title: path.relative(self.caseRootDirectory, dir),
        subGroups: [],
        cases: [],
      }

      const files: string[] = await fs.readdir(dir)
      for (const filename of files) {
        const absoluteFilepath = path.join(dir, filename)
        const stat = await fs.stat(absoluteFilepath)
        if (stat.isDirectory()) {
          // recursive scanning
          if (recursive) {
            const subGroup: TestCaseGroup = await scan(absoluteFilepath)

            /**
             * append sub-case groups directly to caseGroup if there are only sub-case groups and no sub-cases
             *
             * 如果只有子案例组而没有子案例，则直接将子案例组追加到 caseGroup 中
             */
            if (subGroup.cases.length > 0) {
              caseGroup.subGroups.push(subGroup)
            } else if (subGroup.subGroups.length > 0) {
              caseGroup.subGroups.push(...subGroup.subGroups)
            }
          }
          continue
        }
        if (stat.isFile()) {
          if (!filename.endsWith(self.inputFileNameSuffix)) continue
          const title = filename.slice(0, -self.inputFileNameSuffix.length)
          const answerFilePath = absoluteFilepath.slice(0, -self.inputFileNameSuffix.length) + self.answerFileNameSuffix
          const kase: TestCase = {
            title,
            dir,
            inputFilePath: absoluteFilepath,
            answerFilePath,
          }
          caseGroup.cases.push(kase)
          continue
        }
      }

      return caseGroup
    }

    /**
     * append sub-case groups directly to caseGroup if there are only sub-case groups and no sub-cases
     *
     * 如果只有子案例组而没有子案例，则直接将子案例组追加到 caseGroup 中
     */
    const caseGroup = await scan(caseDirectory)
    if (caseGroup.cases.length > 0) {
      self._caseGroups.push(caseGroup)
    } else if (caseGroup.subGroups.length > 0) {
      self._caseGroups.push(...caseGroup.subGroups)
    }
  }

  /**
   * 解析测试用例的数据，获得输出数据
   * @param kase
   */
  public abstract async consume(kase: TestCase): Promise<T>

  /**
   * 转成 json 数据
   * @param result
   */
  public abstract toJSON(result: T): D

  /**
   * 转成 string 类型，用于写入文件
   * @param data
   */
  public stringify(data: D): string {
    const stringifyFilter = (key: string, value: any) => {
      // RegExp to string
      if (value instanceof RegExp) {
        return value.source
      }
      return value
    }
    return JSON.stringify(data, stringifyFilter, 2)
  }

  /**
   * 检查输入与答案是否一致
   * @param output  输出数据
   * @param answer  答案数据
   */
  public async check(output: T, answer: T): Promise<void> {
    // check data
    const outputData: D = this.toJSON(output)
    const answerData: D = answer as any
    expect(outputData).to.deep.equal(answerData)
  }

  /**
   * 生成答案
   */
  public async answer(): Promise<void> {
    const self = this
    const answer = async (caseGroup: TestCaseGroup) => {
      // test group.cases
      for (const kase of caseGroup.cases) {
        const output: T = await self.consume(kase)
        const data: D = await this.toJSON(output)
        const content: string = await this.stringify(data)
        await fs.writeFile(kase.answerFilePath, content, 'utf-8')
      }
      // test sub groups
      for (const subGroup of caseGroup.subGroups) {
        await answer(subGroup)
      }
    }

    // generate answers
    for (const caseGroup of self._caseGroups) {
      await answer(caseGroup)
    }
  }

  /**
   * 执行测试
   */
  public test() {
    const self = this
    const test = (caseGroup: TestCaseGroup) => {
      describe(caseGroup.title, function () {
        // test group.cases
        for (const kase of caseGroup.cases) {
          it(kase.title, async function () {
            if (!fs.existsSync(kase.answerFilePath)) {
              throw new Error(`answer file (${ kase.answerFilePath }) not found`)
            }
            const answer: T = await fs.readJSON(kase.answerFilePath)
            const output: T = await self.consume(kase)
            await self.check(output, answer)
          })
        }
        // test sub groups
        for (const subGroup of caseGroup.subGroups) {
          test(subGroup)
        }
      })
    }

    // run test
    for (const caseGroup of self._caseGroups) {
      test(caseGroup)
    }
  }
}
