import path from 'path'
import { it, before } from 'mocha'
import { DataSchemaCompilerTestCaseMaster } from './util/schema-compiler-case-util'
import { optionMaster } from '../src'


it('This is a required placeholder to allow before() to work', () => { })
before(async function test() {
  const caseRootDirectory = path.resolve('test/cases')
  const caseMaster = new DataSchemaCompilerTestCaseMaster(optionMaster, { caseRootDirectory })
  await caseMaster.scan(path.join(caseRootDirectory, 'data-schema'))

  describe('DataSchemaCompiler test cases', function () {
    caseMaster.test()
  })
})
