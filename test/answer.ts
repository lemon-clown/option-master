import fs from 'fs-extra'
import path from 'path'
import { TestCaseMaster, AnswerResult } from './util'
import { coverBoolean, isString, coverString } from '../src'


const encoding = 'utf-8'

/**
 * if true, the answer() function will output the validation result into .answer.json files
 * otherwise, output into .output.json files
 *
 * 若为真，则 answer() 函数会将校验结果输出到 .answer.json 文件中；否则，输出到 .input.json 文件中
 */
const ANSWER_MODE: boolean = coverBoolean(false, process.env.ANSWER_MODE).value!
const needReason: boolean = coverBoolean(ANSWER_MODE ? false : true, process.env.NEED_REASON).value!
const caseRootDir: string = path.resolve(coverString('test/cases', process.env.CASE_ROOT_DIR).value!)


async function answer () {
  const caseMaster = new TestCaseMaster({ encoding })
  await caseMaster.scan(caseRootDir)

  for (const kase of caseMaster.cases) {
    const answerResult: AnswerResult | string = await caseMaster.consume(kase, needReason)
    if (isString(answerResult)) {
      throw answerResult
    }

    const data = JSON.stringify(answerResult, null, 2)
    const filepath: string = ANSWER_MODE ? kase.answerDataFilePath : kase.outputDataFilePath
    await fs.writeFile(filepath, data, encoding)
  }
}


answer()
