import path from 'path'
import { DataSchemaParserTestCaseMaster } from './util/schema-parser-case-util'
import { DataValidatorTestCaseMaster } from './util/schema-validator-case-util'


/**
 * create answer (to be checked)
 */
async function answer() {
  const caseRootDirectory: string = path.resolve('test/cases')

  // DataSchemaParser cases
  const parserCaseMaster = new DataSchemaParserTestCaseMaster({ caseRootDirectory })
  await parserCaseMaster.scan(path.resolve(caseRootDirectory, 'data-schema'))
  await parserCaseMaster.answer()

  // DataValidator cases
  const dataValidatorMaster = new DataValidatorTestCaseMaster({ caseRootDirectory })
  await dataValidatorMaster.scan(path.resolve(caseRootDirectory, 'data-schema'))
  await dataValidatorMaster.answer()
}


answer()
