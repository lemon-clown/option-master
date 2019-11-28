# Introduction

* Compiler 的作用是编译 DataSchema 源数据，并格式化给定的数据，生成对应的 DataSchema

---

* The role of Compiler is to compile the DataSchema source data and format it to generate the corresponding DataSchema.

* Already implemented DataSchema compilers:

  - array：[ArrayDataSchemaCompiler](../src/compiler/array.ts)
  - boolean：[BooleanDataSchemaCompiler](../src/compiler/boolean.ts)
  - combine：[CombineDataSchemaCompiler](../src/compiler/combine.ts)
  - integer：[IntegerDataSchemaCompiler](../src/compiler/integer.ts)
  - number：[NumberDataSchemaCompiler](../src/compiler/number.ts)
  - object：[ObjectDataSchemaCompiler](../src/compiler/object.ts)
  - ref：[ObjectDataSchemaCompiler](../src/compiler/ref.ts)
  - string：[StringDataSchemaCompiler](../src/compiler/string.ts)

## DataSchemaCompileResult

  // todo: provide documents about DataSchemaCompileResult

## CompilerMaster
  * CompilerMaster 管理类型和编译器的映射关系，可以认为是编译器的注册中心，`option-master` 提供了默认的 CompilerMaster 实例，可通过 `import { compilerMaster } from 'option-master'` 引入

  * `option-master` 提供了一些基础的编译器，默认的 CompilerMaster 实例已注册了这些基础编译器；因此如果要手动创建实例，建议注册包中提供的编译器

  ---

  * CompilerMaster manages the mapping between types and compilers and can be thought of as the registry of DataSchemaCompiler. `option-master` provides the default CompilerMaster instance, which can be used across `import { compilerMaster } from 'option-master'`

  * `option-master` provides some basic compilers, which are registered by the default CompilerMaster instance; therefore, if you want to create an instance manually, it is recommended to register the compilers provided from `option-master`. For example:

    ```typescript
    import { ARRAY_T_TYPE } from 'option-master/lib/schema/array'
    import { BOOLEAN_T_TYPE } from 'option-master/lib/schema/boolean'
    import { COMBINE_T_TYPE } from 'option-master/lib/schema/combine'
    import { INTEGER_T_TYPE } from 'option-master/lib/schema/integer'
    import { NUMBER_T_TYPE } from 'option-master/lib/schema/number'
    import { OBJECT_T_TYPE } from 'option-master/lib/schema/object'
    import { REF_T_TYPE } from 'option-master/lib/schema/ref'
    import { STRING_T_TYPE } from 'option-master/lib/schema/string'
    import { ArrayDataSchemaCompiler } from 'option-master/lib/compiler/array'
    import { BooleanDataSchemaCompiler } from 'option-master/lib/compiler/boolean'
    import { CombineDataSchemaCompiler } from 'option-master/lib/compiler/combine'
    import { IntegerDataSchemaCompiler } from 'option-master/lib/compiler/integer'
    import { NumberDataSchemaCompiler } from 'option-master/lib/compiler/number'
    import { ObjectDataSchemaCompiler } from 'option-master/lib/compiler/object'
    import { RefDataSchemaCompiler } from 'option-master/lib/compiler/ref'
    import { StringDataSchemaCompiler } from 'option-master/lib/compiler/string'
    import { DataSchemaCompilerMaster } from 'option-master/lib/_core/compiler'

    // create CompilerMaster manually
    const compilerMaster = new DataSchemaCompilerMaster()
    compilerMaster.registerCompiler(ARRAY_T_TYPE, new ArrayDataSchemaCompiler(compilerMaster))
    compilerMaster.registerCompiler(BOOLEAN_T_TYPE, new BooleanDataSchemaCompiler())
    compilerMaster.registerCompiler(COMBINE_T_TYPE, new CombineDataSchemaCompiler(compilerMaster))
    compilerMaster.registerCompiler(INTEGER_T_TYPE, new IntegerDataSchemaCompiler())
    compilerMaster.registerCompiler(NUMBER_T_TYPE, new NumberDataSchemaCompiler())
    compilerMaster.registerCompiler(OBJECT_T_TYPE, new ObjectDataSchemaCompiler(compilerMaster))
    compilerMaster.registerCompiler(STRING_T_TYPE, new StringDataSchemaCompiler())
    ```

# Create new data schema compiler
  * create XRawDataSchema and XDataSchema type:
    ```typescript
    import { DataSchema, RawDataSchema } from 'option-master'

    const T = 'ipv4'
    type T = typeof T
    type V = string
    type RDS = RawDataSchema<T, V>
    type DS = DataSchema<T, V>
    ```

  * create XDataSchemaCompileResult type:
    ```typescript
    import { DataSchemaCompileResult } from 'option-master'
    export type Ipv4DataSchemaCompileResult = DataSchemaCompileResult<T, V, RDS, DS>
    ```

  * create XDataSchemaCompiler:
    ```typescript
    import { BaseDataSchemaCompiler } from 'option-master'
    export class Ipv4DataSchemaCompiler extends BaseDataSchemaCompiler<T, V, RDS, DS> {
      public readonly type: T = T

      public compile (rawSchema: RDS): Ipv4DataSchemaCompileResult {
        const result: Ipv4DataSchemaCompileResult = super.compile(rawSchema)
        const requiredResult = result.compileProperty<boolean>('required', coverBoolean, false)
        const defaultValueResult = result.compileProperty<V>('default', coverString)

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

  * register to `compilerMaster`:
    ```typescript
    import { DataSchemaCompilerMaster } from 'option-master'
    const compilerMaster = new DataSchemaCompilerMaster()
    compilerMaster.registerCompiler(T, new Ipv4DataSchemaCompiler(compilerMaster))
    ```

    or register to `optionMaster` (you also can create new instance of OptionMaster)
    ```typescript
    import { optionMaster } from 'option-master'
    optionMaster.registerCompiler(T, Ipv4DataValidatorFactory)
    ```

  * full code

    ```typescript
    import {
      DataSchema, RawDataSchema, DataSchemaCompileResult, BaseDataSchemaCompiler,
      coverBoolean, coverString, optionMaster,
    } from 'option-master'

    const T = 'ipv4'
    type T = typeof T
    type V = string
    type RDS = RawDataSchema<T, V>
    type DS = DataSchema<T, V>

    /**
     * data type of Ipv4DataSchema compile result
     */
    export type Ipv4DataSchemaCompileResult = DataSchemaCompileResult<T, V, RDS, DS>

    /**
     * ipv4 schema compiler
     */
    export class Ipv4DataSchemaCompiler extends BaseDataSchemaCompiler<T, V, RDS, DS> {
      public readonly type: T = T

      public compile (rawSchema: RDS): Ipv4DataSchemaCompileResult {
        const result: Ipv4DataSchemaCompileResult = new DataSchemaCompileResult(rawSchema)
        const requiredResult = result.compileProperty<boolean>('required', coverBoolean, false)
        const defaultValueResult = result.compileProperty<V>('default', coverString)

        // Ipv4DataSchema
        const schema: DS = {
          type: this.type,
          required: Boolean(requiredResult.value),
          default: defaultValueResult.value,
        }

        return result.setValue(schema)
      }
    }

    // register compiler
    optionMaster.registerCompiler(T, Ipv4DataSchemaCompiler)
    ```

  * see [demo/custom-type/ipv4.ts](../demo/custom-type/ipv4.ts)
