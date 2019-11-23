import fs from 'fs-extra'
import path from 'path'
import * as chai from 'chai'
import chaiExclude from 'chai-exclude'
import { TestCaseMasterProps, TestCaseMaster, TestCase } from './case-util'
import { DValidationResult, optionMaster, DSParseResult, DSchema, DataHandleResultException } from '../../src'


chai.use(chaiExclude)
const { expect } = chai


/**
 * the content format in the input file of the DataValidator test case
 *
 * DataValidator 测试用例的输入文件中的内容格式
 */
export interface DataValidatorTestCaseInputData {
  /**
   * the path where the DataSchema corresponding to this test data is located (a relative path can be used)
   *
   * 此测试数据对应的 DataSchema 所在的路径（可使用相对路径）
   */
  schema: string
  /**
   * input data list, each element is a complete data type defined by DataSchema
   *
   * 输入数据列表，每个元素都是一个完整的对应 DataSchema 所定义的数据类型
   */
  cases: any[]
}


/**
 * expected verification results for the DataValidator test case
 *
 * DataValidator 测试用例的预期校验结果
 */
export type DataValidatorTestCaseAnswerData = any[]



/**
 * 输出数据
 */
export interface DataValidatorOutputData {
  value: DSParseResult['value']
  errors: DSParseResult['errors']
  warnings: DSParseResult['warnings']
}


/**
 * DataSchema 解析器测试用例辅助类
 */
export class DataValidatorTestCaseMaster extends TestCaseMaster<DValidationResult[], DataValidatorOutputData[]> {
  public constructor({
    caseRootDirectory,
    inputFileNameSuffix = 'input.json',
    answerFileNameSuffix = 'answer.json',
  }: PickPartial<TestCaseMasterProps, 'inputFileNameSuffix' | 'answerFileNameSuffix'>) {
    super({ caseRootDirectory, inputFileNameSuffix, answerFileNameSuffix })
  }

  // override
  public async consume(kase: TestCase): Promise<DValidationResult[] | never> {
    optionMaster.reset()
    const { dir, inputFilePath } = kase
    const inputData: DataValidatorTestCaseInputData = await fs.readJSON(inputFilePath)
    const { schema: schemaFilePath, cases } = inputData
    const absoluteSchemaFilePath = path.resolve(dir, schemaFilePath)

    // DataSchema not found
    if (!fs.existsSync(absoluteSchemaFilePath)) {
      throw `[Error] bad schema: ${ absoluteSchemaFilePath } is not exists.`
    }

    const rawDataSchema = await fs.readJSON(absoluteSchemaFilePath)
    const parserResult: DSParseResult = optionMaster.parse(rawDataSchema)

    // DataSchema is invalid
    if (parserResult.hasError) {
      throw `[Error] bad schema: ${ absoluteSchemaFilePath } exists errors: ${ parserResult.errorDetails }`
    }

    if (parserResult.hasWarning) {
      console.log(`[Warning] schema: ${ absoluteSchemaFilePath } exists warnings: ${ parserResult.warningDetails }`)
    }

    const schema: DSchema = parserResult.value!
    const results: DValidationResult[] = []
    for (const data of cases) {
      const result = optionMaster.validate(schema, data)
      results.push(result)
    }
    return results
  }

  // override
  public async check(outputs: DValidationResult[], answers: DValidationResult[]): Promise<void> {
    // 输出和答案应有相同的数据数
    expect(outputs)
      .to.be.an('array')
      .to.have.lengthOf(answers.length)

    const outputDataList = this.toJSON(outputs)
    const answerDataList = this.toJSON(answers)

    for (let i = 0; i < outputDataList.length; ++i) {
      const outputData = outputDataList[i]
      const answerData = answerDataList[i]

      // check errors
      if (answerData.errors != null && answerData.errors.length > 0) {
        expect(outputData.errors)
          .to.be.an('array')
          .to.have.lengthOf(answerData.errors.length)
        expect(outputData.errors)
          .excludingEvery('reason')
          .to.deep.equal(answerData.errors)
      }

      // check warnings
      if (answerData.warnings != null && answerData.warnings.length > 0) {
        expect(outputData.warnings)
          .to.be.an('array')
          .to.have.lengthOf(answerData.warnings.length)
        expect(outputData.warnings)
          .excludingEvery('reason')
          .to.deep.equal(answerData.warnings)
      }

      // check data
      expect(outputData.value).to.deep.equal(answerData.value)
    }
  }

  // override
  public toJSON(data: DValidationResult[]): DataValidatorOutputData[] {
    const mapper = (x: DataHandleResultException) => {
      const result: DataHandleResultException = { constraint: x.constraint, reason: x.reason }
      if (x.property != null) result.property = x.property
      if (x.traces != null) result.traces = x.traces.map(mapper)
      return result
    }
    const result: DataValidatorOutputData[] = data.map(d => ({
      value: d.value,
      errors: d.errors.map(mapper),
      warnings: d.warnings.map(mapper),
    }))
    return result
  }
}
