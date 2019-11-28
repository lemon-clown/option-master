import fs from 'fs-extra'
import * as chai from 'chai'
import chaiExclude from 'chai-exclude'
import { TestCaseMaster, TestCaseMasterProps, TestCase } from './case-util'
import { optionMaster, RDSchema, DSCResult, DataHandleResultException } from '../../src'


chai.use(chaiExclude)
const { expect } = chai


/**
 * 输出数据
 */
export interface DataSchemaCompilerOutputData {
  value: DSCResult['value']
  errors: DSCResult['errors']
  warnings: DSCResult['warnings']
}


/**
 * DataSchema 编译器测试用例辅助类
 */
export class DataSchemaCompilerTestCaseMaster extends TestCaseMaster<DSCResult, DataSchemaCompilerOutputData> {
  public constructor({
    caseRootDirectory,
    inputFileNameSuffix = 'schema.json',
    answerFileNameSuffix = 'schema.answer.json',
  }: PickPartial<TestCaseMasterProps, 'inputFileNameSuffix' | 'answerFileNameSuffix'>) {
    super({ caseRootDirectory, inputFileNameSuffix, answerFileNameSuffix })
  }

  // override
  public async consume(kase: TestCase): Promise<DSCResult | never> {
    const { inputFilePath: schemaFilePath } = kase
    const rawDataSchema: RDSchema = await fs.readJSON(schemaFilePath)
    const CompileResult: DSCResult = optionMaster.compile(rawDataSchema)
    return CompileResult
  }

  // override
  public async check(output: DSCResult, answer: DSCResult): Promise<void> {
    const outputData: DataSchemaCompilerOutputData = this.toJSON(output)
    const answerData: DataSchemaCompilerOutputData = this.toJSON(answer)

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
  public toJSON(data: DSCResult): DataSchemaCompilerOutputData {
    const mapper = (x: DataHandleResultException) => {
      const result: DataHandleResultException = { constraint: x.constraint, reason: x.reason }
      if (x.property != null) result.property = x.property
      if (x.traces != null) result.traces = x.traces.map(mapper)
      return result
    }

    const result: DataSchemaCompilerOutputData = {
      value: data.value,
      errors: data.errors.map(mapper),
      warnings: data.warnings.map(mapper),
    }
    return result
  }
}
