import fs from 'fs-extra'
import path from 'path'
import { describe, it } from 'mocha'
import { expect } from 'chai'
import { TestCaseMaster, AnswerResult, UseCaseGroup } from './util'
import { isString } from '../src'


it('This is a required placeholder to allow before() to work', () => { })
before(async function test() {
  const encoding = 'utf-8'
  const caseRootDir = path.resolve('test/cases')
  const caseMaster = new TestCaseMaster({ encoding })
  await caseMaster.scan(caseRootDir)

  const useCaseGroups: UseCaseGroup[] = caseMaster.collectUseCases(caseRootDir)

  // print use cases
  // console.log(JSON.stringify(useCaseGroups, null, 2))

  for (const group of useCaseGroups) {
    describe(group.title, function () {
      for (const kase of group.cases) {
        it(kase.title, async function () {
          if (!fs.existsSync(kase.answerDataFilePath)) {
            throw new Error(`answer file (${ kase.answerDataFilePath }) not found`)
          }

          const answerResult: AnswerResult | string = await caseMaster.consume(kase, false)
          if (isString(answerResult)) {
            throw answerResult
          }

          const output: any = answerResult
          const answer: any = await fs.readJSONSync(kase.answerDataFilePath)

          // check errors
          if (answer.errors != null && answer.errors.length > 0) {
            expect(output.errors)
              .to.be.an('array')
              .to.have.lengthOf(answer.errors.length)
              .to.have.deep.members(answer.errors)
          }

          // check warnings
          if (answer.warnings != null && answer.warnings.length > 0) {
            expect(output.warnings)
              .to.be.an('array')
              .to.have.lengthOf(answer.warnings.length)
              .to.have.deep.members(answer.warnings)
          }

          // check data
          expect(output.data).to.eql(answer.data)
        })
      }
    })
  }
})
