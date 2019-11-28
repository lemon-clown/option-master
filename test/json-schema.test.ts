import fs from 'fs-extra'
import path from 'path'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { DataSchemaAdaptor } from '../src/_core/adaptor/types'
import { optionMaster } from '../src'
import { JsonSchemaV7Adaptor } from '../src/_core/adaptor/json-schema/v7'


/**
 * test case
 */
interface TestCaseItem {
  /**
   * title of this test case
   */
  description: string
  /**
   * test data
   */
  data: any
  /**
   * answer
   */
  valid: boolean
}


/**
 * test case group
 */
interface TestCaseItemGroup {
  /**
   * title of this test group
   */
  description: string
  /**
   * json schema
   */
  schema: any
  /**
   * test cases
   */
  tests: TestCaseItem[]
}


/**
 * generate test codes
 * @param adaptor
 * @param testCasePaths
 */
async function generateTests(adaptor: DataSchemaAdaptor, testCasePaths: string[]) {
  const testItem = async (testCasePath: string) => {
    const stat = await fs.statSync(testCasePath)
    if (stat.isDirectory()) {
      const tasks: Promise<any>[] = []
      const files = await fs.readdir(testCasePath)
      for (const f of files) {
        const task = testItem(path.join(testCasePath, f))
        tasks.push(task)
      }
      await Promise.all(tasks)
    }
    if (stat.isFile()) {
      const content: TestCaseItemGroup[] = await fs.readJSON(testCasePath)
      for (const tg of content) {
        const rawSchema = adaptor.convert(tg.schema)
        const schemaResult = optionMaster.compile(rawSchema)
        const schema = schemaResult.value!

        describe(tg.description, function () {
          // test DataSchemaAdaptor
          it('schema adaptor', function () {
            expect(schemaResult.hasError).to.be.false
            expect(schemaResult.value).not.be.undefined
          })

          // test with use cases of JSON-Schema-Test-Suite
          for (const kase of tg.tests) {
            it(kase.description, function () {
              const validateResult = optionMaster.validate(schema, kase.data)
              expect(validateResult.hasError).to.be.equal(!kase.valid)
            })
          }
        })
      }
    }
  }

  const tasks: Promise<any>[] = []
  for (const testCasePath of testCasePaths) {
    const task = testItem(testCasePath)
    tasks.push(task)
  }
  await Promise.all(tasks)
}


it('This is a required placeholder to allow before() to work', () => { })
before(async function test() {
  // test JsonSchema with v7
  const v7CaseRootDir = path.resolve('test/JSON-Schema-Test-Suite/tests/draft7')
  const v7Adaptor = new JsonSchemaV7Adaptor()
  await generateTests(v7Adaptor, [
    'type.json',
  ].map(p => path.join(v7CaseRootDir, p)))
})
