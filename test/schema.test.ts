import fs from 'fs-extra'
import path from 'path'
import { describe, it } from 'mocha'
import * as chai from 'chai'
import chaiExclude from 'chai-exclude'
import { TestCaseMaster, AnswerResult, UseCaseGroup } from './util'
import { isString } from '../src'


chai.use(chaiExclude)
const { expect } = chai


it('This is a required placeholder to allow before() to work', () => { })
before(async function test() {
  const encoding = 'utf-8'
  const caseRootDir = path.resolve('test/cases')
  const caseMaster = new TestCaseMaster({ encoding })
  await caseMaster.scan(path.join(caseRootDir, 'abbr-schema'))
  await caseMaster.scan(path.join(caseRootDir, 'base-schema'))
  await caseMaster.scan(path.join(caseRootDir, 'combine-schema'))

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

          let answerResults: AnswerResult | AnswerResult[] | string = await caseMaster.consume(kase, false)
          if (isString(answerResults)) {
            throw answerResults
          }

          // 单个数据可以作为多个数据的一个特例进行处理
          let answers: any = await fs.readJSONSync(kase.answerDataFilePath)
          if (!kase.multipleCase) {
            answerResults = [answerResults] as AnswerResult[]
            answers = [answers]
          }

          // 输出和答案应有相同的数据数
          expect(answerResults)
            .to.be.an('array')
            .to.have.lengthOf(answers.length)

          for (let i = 0; i < answers.length; ++i) {
            const output = answerResults[i] as AnswerResult
            const answer = answers[i]

            // check errors
            if (answer.errors != null && answer.errors.length > 0) {
              expect(output.errors)
                .to.be.an('array')
                .to.have.lengthOf(answer.errors.length)
              expect(output.errors)
                .excludingEvery('reason')
                .to.deep.equal(answer.errors)
            }

            // check warnings
            if (answer.warnings != null && answer.warnings.length > 0) {
              expect(output.warnings)
                .to.be.an('array')
                .to.have.lengthOf(answer.warnings.length)
              expect(output.warnings)
                .excludingEvery('reason')
                .to.deep.equal(answer.warnings)
            }

            // check data
            expect(output.data).to.deep.equal(answer.data)
          }
        })
      }
    })
  }
})
