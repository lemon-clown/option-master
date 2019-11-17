# StringSchema
  * [rawSchema][]
    ```typescript
    enum StringFormat {
      IPV4 = 'ipv4',
      IPV6 = 'ipv6',
      EMAIL = 'email',
    }

    interface RawStringDataSchema {
      type: 'string'
      required?: boolean
      default?: boolean
      minLength?: number
      maxLength?: number
      pattern?: string
      format?: StringFormat | StringFormat[]
      enum?: string[]
    }
    ```

  * [schema][]
    ```typescript
    interface StringDataSchema {
      type: 'string'
      required: boolean
      default?: boolean
      minLength?: number
      maxLength?: number
      pattern?: string
      format?: StringFormat[]
      enum?: string[]
    }
    ```

  * properties:

     property           | description                               | default | required
    :-------------------|:------------------------------------------|:--------|:---------------------------------------
     `type`             | the type of DataSchema                    | -       | Yes (and the value must be `'string'`)
     `required`         | whether the data must be set              | `false` | No
     `default`          | default value of this DataSchema          | -       | No
     `minLength`        | minimum length ($x.length \geqslant$)     | -       | No
     `maxLength`        | maximum length ($x.length \leqslant$)     | -       | No
     `pattern`          | a regular expression defined data pattern | -       | No
     `format`           | see [format][]                            | -       | No
     `transform`        | see [transform][]                         | -       | No
     `enum`             | acceptable values ($x \in$)               | -       | No

## format

  * 指定字符串的类型，和 `StringDataSchema` 中其它属性按照“与”逻辑进行校验
  * 若指定了多个，则表示“或”的关系，如 { format: ['ipv4', 'ipv6' ] } 表示既可为 ipv4 地址也可为 ipv6 地址，现在支持的有：
    - `ipv4`
    - `ipv6`
    - `email`

  ---

  * Specify the format of the string.
  * If more than one format is specified, any of these formats matched is ok, such as `{ format: ['ipv4', 'ipv6' ] }` means that it can be either an `ipv4` address or an `ipv6` address., now supported are:
    - `ipv4`:
    - `ipv6`:
    - `email`:

## transform
  * 指定字符串的转换函数，现在支持的有：
    - `lowercase`: 转成小写
    - `uppercase`: 转成大写
    - `trim`: 去除头尾空白字符

  ----

  * Specify The conversion function for string, now supported are:
      - `lowercase`: convert to lowercase
      - `uppercase`: converted to uppercase
      - `trim`: remove the head and tail blank words



# demo

## demo1

  ```typescript
  import { parserMaster, validatorMaster } from 'option-master'

  const rawSchema = {
    type: 'string',
    minLength: 10,
    maxLength: 25,
    pattern: '^[^@]+@[^\\.]+\\..+$',
    required: true
  }

  // parse rawSchema
  const { value: schema } = parserMaster.parse(rawSchema)
  const validate = (data: any): boolean | undefined => {
    const result = validatorMaster.validate(schema!, data)
    if (result.hasError) {
      console.error(result.errorDetails)
    }
    if (result.hasWarning) {
      console.error(result.warningDetails)
    }
    console.log('value:', result.value)
    return result.value
  }

  validate(undefined)                             // undefined; and will print errors (`required` is not satisfied)
  validate('alice@gmail.com')                     // alice@gmail.com;
  validate('alice.gmail.com')                     // undefined; and will print errors (`pattern` is not satisfied)
  validate('a@ss.com')                            // undefined; and will print errors (`minLength` is not satisfied)
  validate('apple_banana_cat_dog@something.com')  // undefined; and will print errors (`maxLength` is not satisfied)
  validate([])                                    // undefined; and will print errors (`type` is not satisfied)
  ```

## demo2
  ```typescript
  import { parserMaster, validatorMaster } from 'option-master'

  const rawSchema = {
    type: 'string',
    format: ['ipv4', 'ipv6'],
    required: true
  }

  // parse rawSchema
  const { value: schema } = parserMaster.parse(rawSchema)
  const validate = (data: any): boolean | undefined => {
    const result = validatorMaster.validate(schema!, data)
    if (result.hasError) {
      console.error(result.errorDetails)
    }
    if (result.hasWarning) {
      console.error(result.warningDetails)
    }
    console.log('value:', result.value)
    return result.value
  }

  validate(undefined)             // undefined; and will print errors (`required` is not satisfied)
  validate('1::')                 // '1::';
  validate('1::8')                // '1::8';
  validate('1::7:8')              // '1::7:8';
  validate('1.2.3.4')             // '1.2.3.4';
  validate('127.0.0.1')           // '127.0.0.1';
  validate('1:2:3:4:5:6:7:8:9')   // undefined; and will print errors (`format` is not satisfied: neither ipv4 nor ipv6)
  validate('127.1')               // undefined; and will print errors (`format` is not satisfied: neither ipv4 nor ipv6)
  validate('192.168.1.256')       // undefined; and will print errors (`format` is not satisfied: neither ipv4 nor ipv6)
  ```

## more
  * also see:
    - [demo][]
    - [test cases][test-cases]


[rawSchema]: ../../src/schema/string.ts#RawStringDataSchema
[schema]: ../../src/schema/string.ts#StringDataSchema
[demo]: ../../demo/string
[test-cases]: ../../test/cases/base-schema/string
