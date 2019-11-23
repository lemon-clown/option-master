import path from 'path'
import { it, before } from 'mocha'
import { DataSchemaParserTestCaseMaster } from './util/schema-parser-case-util'


it('This is a required placeholder to allow before() to work', () => { })
before(async function test() {
  const caseRootDirectory = path.resolve('test/cases')
  const caseMaster = new DataSchemaParserTestCaseMaster({ caseRootDirectory })
  await caseMaster.scan(path.join(caseRootDirectory, 'data-schema'))

  describe('DataSchemaParser test cases', function () {
    caseMaster.test()
  })
})
