import path from 'path'
import { DataSchemaCompilerTestCaseMaster } from './util/schema-compiler-case-util'
import { DataValidatorTestCaseMaster } from './util/schema-validator-case-util'
import { optionMaster } from '../src'


/**
 * create answer (to be checked)
 */
async function answer() {
  const caseRootDirectory: string = path.resolve('test/cases')

  // DataSchemaCompiler cases
  const compilerCaseMaster = new DataSchemaCompilerTestCaseMaster(optionMaster, { caseRootDirectory })
  await compilerCaseMaster.scan(path.resolve(caseRootDirectory, 'data-schema'))
  await compilerCaseMaster.answer()

  // DataValidator cases
  const dataValidatorMaster = new DataValidatorTestCaseMaster({ caseRootDirectory })
  await dataValidatorMaster.scan(path.resolve(caseRootDirectory, 'data-schema'))
  await dataValidatorMaster.answer()
}


answer()
