# Introduction

* Parser 的作用是解析 DataSchema 源数据，并格式化给定的数据，生成对应的 DataSchema

---

* The role of Parser is to parse the DataSchema source data and format it to generate the corresponding DataSchema.

* Already implemented DataSchema parsers:

  - array：[ArrayDataSchemaParser](../src/parser/array.ts)
  - boolean：[BooleanDataSchemaParser](../src/parser/boolean.ts)
  - combine：[CombineDataSchemaParser](../src/parser/combine.ts)
  - integer：[IntegerDataSchemaParser](../src/parser/integer.ts)
  - number：[NumberDataSchemaParser](../src/parser/number.ts)
  - object：[ObjectDataSchemaParser](../src/parser/object.ts)
  - ref：[ObjectDataSchemaParser](../src/parser/ref.ts)
  - string：[StringDataSchemaParser](../src/parser/string.ts)

## DataSchemaParseResult

  // todo: provide documents about DataSchemaParseResult

## ParserMaster
  * ParserMaster 管理类型和解析器的映射关系，可以认为是解析器的注册中心，`option-master` 提供了默认的 ParserMaster 实例，可通过 `import { parserMaster } from 'option-master'` 引入

  * `option-master` 提供了一些基础的解析器，默认的 ParserMaster 实例已注册了这些基础解析器；因此如果要手动创建实例，建议注册包中提供的解析器

  ---

  * ParserMaster manages the mapping between types and parsers and can be thought of as the registry of DataSchemaParser. `option-master` provides the default ParserMaster instance, which can be used across `import { parserMaster } from 'option-master'`

  * `option-master` provides some basic parsers, which are registered by the default ParserMaster instance; therefore, if you want to create an instance manually, it is recommended to register the parsers provided from `option-master`. For example:

    ```typescript
    import { ARRAY_T_TYPE } from 'option-master/lib/schema/array'
    import { BOOLEAN_T_TYPE } from 'option-master/lib/schema/boolean'
    import { COMBINE_T_TYPE } from 'option-master/lib/schema/combine'
    import { INTEGER_T_TYPE } from 'option-master/lib/schema/integer'
    import { NUMBER_T_TYPE } from 'option-master/lib/schema/number'
    import { OBJECT_T_TYPE } from 'option-master/lib/schema/object'
    import { REF_T_TYPE } from 'option-master/lib/schema/ref'
    import { STRING_T_TYPE } from 'option-master/lib/schema/string'
    import { ArrayDataSchemaParser } from 'option-master/lib/parser/array'
    import { BooleanDataSchemaParser } from 'option-master/lib/parser/boolean'
    import { CombineDataSchemaParser } from 'option-master/lib/parser/combine'
    import { IntegerDataSchemaParser } from 'option-master/lib/parser/integer'
    import { NumberDataSchemaParser } from 'option-master/lib/parser/number'
    import { ObjectDataSchemaParser } from 'option-master/lib/parser/object'
    import { RefDataSchemaParser } from 'option-master/lib/parser/ref'
    import { StringDataSchemaParser } from 'option-master/lib/parser/string'
    import { DataSchemaParserMaster } from 'option-master/lib/_core/parser'

    // create ParserMaster manually
    const parserMaster = new DataSchemaParserMaster()
    parserMaster.registerParser(ARRAY_T_TYPE, new ArrayDataSchemaParser(parserMaster))
    parserMaster.registerParser(BOOLEAN_T_TYPE, new BooleanDataSchemaParser())
    parserMaster.registerParser(COMBINE_T_TYPE, new CombineDataSchemaParser(parserMaster))
    parserMaster.registerParser(INTEGER_T_TYPE, new IntegerDataSchemaParser())
    parserMaster.registerParser(NUMBER_T_TYPE, new NumberDataSchemaParser())
    parserMaster.registerParser(OBJECT_T_TYPE, new ObjectDataSchemaParser(parserMaster))
    parserMaster.registerParser(STRING_T_TYPE, new StringDataSchemaParser())
    ```

# Create new data schema parser
  * create XRawDataSchema and XDataSchema type:
    ```typescript
    import { DataSchema, RawDataSchema } from 'option-master'

    const T = 'ipv4'
    type T = typeof T
    type V = string
    type RDS = RawDataSchema<T, V>
    type DS = DataSchema<T, V>
    ```

  * create XDataSchemaParserResult type:
    ```typescript
    import { DataSchemaParseResult } from 'option-master'
    export type Ipv4DataSchemaParserResult = DataSchemaParseResult<T, V, RDS, DS>
    ```

  * create XDataSchemaParser:
    ```typescript
    import { BaseDataSchemaParser } from 'option-master'
    export class Ipv4DataSchemaParser extends BaseDataSchemaParser<T, V, RDS, DS> {
      public readonly type: T = T

      public parse (rawSchema: RDS): Ipv4DataSchemaParserResult {
        const result: Ipv4DataSchemaParserResult = super.parse(rawSchema)
        const requiredResult = result.parseProperty<boolean>('required', coverBoolean, false)
        const defaultValueResult = result.parseProperty<V>('default', coverString)

        // Ipv4DataSchema
        const schema: DS = {
          type: this.type,
          required: Boolean(requiredResult.value),
          default: defaultValueResult.value,
        }

        return result.setValue(schema)
      }
    }
    ```

  * register to `parserMaster`:
    ```typescript
    import { DataSchemaParserMaster } from 'option-master'
    const parserMaster = new DataSchemaParserMaster()
    parserMaster.registerParser(T, new Ipv4DataSchemaParser(parserMaster))
    ```

    or register to `optionMaster` (you also can create new instance of OptionMaster)
    ```typescript
    import { optionMaster } from 'option-master'
    optionMaster.registerParser(T, Ipv4DataValidatorFactory)
    ```

  * full code

    ```typescript
    import {
      DataSchema, RawDataSchema, DataSchemaParseResult, BaseDataSchemaParser,
      coverBoolean, coverString, optionMaster,
    } from 'option-master'

    const T = 'ipv4'
    type T = typeof T
    type V = string
    type RDS = RawDataSchema<T, V>
    type DS = DataSchema<T, V>

    /**
     * data type of Ipv4DataSchema parse result
     */
    export type Ipv4DataSchemaParserResult = DataSchemaParseResult<T, V, RDS, DS>

    /**
     * ipv4 schema parser
     */
    export class Ipv4DataSchemaParser extends BaseDataSchemaParser<T, V, RDS, DS> {
      public readonly type: T = T

      public parse (rawSchema: RDS): Ipv4DataSchemaParserResult {
        const result: Ipv4DataSchemaParserResult = new DataSchemaParseResult(rawSchema)
        const requiredResult = result.parseProperty<boolean>('required', coverBoolean, false)
        const defaultValueResult = result.parseProperty<V>('default', coverString)

        // Ipv4DataSchema
        const schema: DS = {
          type: this.type,
          required: Boolean(requiredResult.value),
          default: defaultValueResult.value,
        }

        return result.setValue(schema)
      }
    }

    // register parser
    optionMaster.registerParser(T, Ipv4DataSchemaParser)
    ```

  * see [demo/custom-type/ipv4.ts](../demo/custom-type/ipv4.ts)
