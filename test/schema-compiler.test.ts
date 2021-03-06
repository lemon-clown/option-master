import { before, it } from 'mocha'
import path from 'path'
import { optionMaster } from '../src'
import {
  DataSchemaCompilerTestCaseMaster,
} from './util/schema-compiler-case-util'


it('This is a required placeholder to allow before() to work', () => { })
before(async function test() {
  const caseRootDirectory = path.resolve('test/cases')
  const caseMaster = new DataSchemaCompilerTestCaseMaster(optionMaster, { caseRootDirectory })
  await caseMaster.scan(path.join(caseRootDirectory, 'data-schema'))

  describe('DataSchemaCompiler test cases', function () {
    caseMaster.test()
  })
})
