import fs from 'fs-extra'
import * as chai from 'chai'
import chaiExclude from 'chai-exclude'
import { TestCaseMaster, TestCaseMasterProps, TestCase } from './case-util'
import { optionMaster, RDSchema, DSPResult, DataHandleResultException } from '../../src'


chai.use(chaiExclude)
const { expect } = chai


/**
 * 输出数据
 */
export interface DataSchemaParserOutputData {
  value: DSPResult['value']
  errors: DSPResult['errors']
  warnings: DSPResult['warnings']
}


/**
 * DataSchema 解析器测试用例辅助类
 */
export class DataSchemaParserTestCaseMaster extends TestCaseMaster<DSPResult, DataSchemaParserOutputData> {
  public constructor({
    caseRootDirectory,
    inputFileNameSuffix = 'schema.json',
    answerFileNameSuffix = 'schema.answer.json',
  }: PickPartial<TestCaseMasterProps, 'inputFileNameSuffix' | 'answerFileNameSuffix'>) {
    super({ caseRootDirectory, inputFileNameSuffix, answerFileNameSuffix })
  }

  // override
  public async consume(kase: TestCase): Promise<DSPResult | never> {
    const { inputFilePath: schemaFilePath } = kase
    const rawDataSchema: RDSchema = await fs.readJSON(schemaFilePath)
    const parserResult: DSPResult = optionMaster.parse(rawDataSchema)
    return parserResult
  }

  // override
  public async check(output: DSPResult, answer: DSPResult): Promise<void> {
    const outputData: DataSchemaParserOutputData = this.toJSON(output)
    const answerData: DataSchemaParserOutputData = this.toJSON(answer)

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

    // check data, ignore undefined property
    const outputDataValue = JSON.parse(super.stringify(outputData.value as any))
    const answerDataValue = JSON.parse(super.stringify(answerData.value as any))
    expect(outputDataValue).to.deep.equal(answerDataValue)
  }

  // override
  public toJSON(data: DSPResult): DataSchemaParserOutputData {
    const mapper = (x: DataHandleResultException) => {
      const result: DataHandleResultException = { constraint: x.constraint, reason: x.reason }
      if (x.property != null) result.property = x.property
      if (x.traces != null) result.traces = x.traces.map(mapper)
      return result
    }

    const result: DataSchemaParserOutputData = {
      value: data.value,
      errors: data.errors.map(mapper),
      warnings: data.warnings.map(mapper),
    }
    return result
  }
}
