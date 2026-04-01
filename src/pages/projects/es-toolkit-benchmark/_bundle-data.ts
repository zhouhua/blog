// Bundle size cases for browser-side esbuild measurement.
// 这里不再保存具体字节数，只保存「要对比的函数 + 模块信息」。
export interface BundleSizeCase {
  category: 'Array' | 'Function' | 'Math' | 'Object' | 'String';
  fn: string;
  esToolkitModule: string;
  esToolkitSymbol: string;
  lodashModule: string;
  lodashIsDefault: boolean;
}

export const bundleSizeCases: BundleSizeCase[] = [
  // Array
  {
    category: 'Array',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/array/chunk.mjs',
    esToolkitSymbol: 'chunk',
    fn: 'chunk',
    lodashIsDefault: true,
    lodashModule: 'lodash-es/chunk',
  },
  {
    category: 'Array',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/array/uniq.mjs',
    esToolkitSymbol: 'uniq',
    fn: 'uniq',
    lodashIsDefault: true,
    lodashModule: 'lodash-es/uniq',
  },
  {
    category: 'Array',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/array/groupBy.mjs',
    esToolkitSymbol: 'groupBy',
    fn: 'groupBy',
    lodashIsDefault: true,
    lodashModule: 'lodash-es/groupBy',
  },
  {
    category: 'Array',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/array/intersection.mjs',
    esToolkitSymbol: 'intersection',
    fn: 'intersection',
    lodashIsDefault: true,
    lodashModule: 'lodash-es/intersection',
  },
  {
    category: 'Array',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/array/intersectionWith.mjs',
    esToolkitSymbol: 'intersectionWith',
    fn: 'intersectionWith',
    lodashIsDefault: true,
    lodashModule: 'lodash-es/intersectionWith',
  },
  {
    category: 'Array',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/array/difference.mjs',
    esToolkitSymbol: 'difference',
    fn: 'difference',
    lodashIsDefault: true,
    lodashModule: 'lodash-es/difference',
  },
  {
    category: 'Array',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/array/differenceWith.mjs',
    esToolkitSymbol: 'differenceWith',
    fn: 'differenceWith',
    lodashIsDefault: true,
    lodashModule: 'lodash-es/differenceWith',
  },
  {
    category: 'Array',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/array/unionBy.mjs',
    esToolkitSymbol: 'unionBy',
    fn: 'unionBy',
    lodashIsDefault: true,
    lodashModule: 'lodash-es/unionBy',
  },
  // Object
  {
    category: 'Object',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/object/pick.mjs',
    esToolkitSymbol: 'pick',
    fn: 'pick',
    lodashIsDefault: true,
    lodashModule: 'lodash-es/pick',
  },
  {
    category: 'Object',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/object/omit.mjs',
    esToolkitSymbol: 'omit',
    fn: 'omit',
    lodashIsDefault: true,
    lodashModule: 'lodash-es/omit',
  },
  {
    category: 'Object',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/object/mapValues.mjs',
    esToolkitSymbol: 'mapValues',
    fn: 'mapValues',
    lodashIsDefault: true,
    lodashModule: 'lodash-es/mapValues',
  },
  // Function
  {
    category: 'Function',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/function/debounce.mjs',
    esToolkitSymbol: 'debounce',
    fn: 'debounce',
    lodashIsDefault: true,
    lodashModule: 'lodash-es/debounce',
  },
  {
    category: 'Function',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/function/throttle.mjs',
    esToolkitSymbol: 'throttle',
    fn: 'throttle',
    lodashIsDefault: true,
    lodashModule: 'lodash-es/throttle',
  },
  {
    category: 'Function',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/function/memoize.mjs',
    esToolkitSymbol: 'memoize',
    fn: 'memoize',
    lodashIsDefault: true,
    lodashModule: 'lodash-es/memoize',
  },
  // Math
  {
    category: 'Math',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/math/clamp.mjs',
    esToolkitSymbol: 'clamp',
    fn: 'clamp',
    lodashIsDefault: true,
    lodashModule: 'lodash-es/clamp',
  },
  {
    category: 'Math',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/math/sum.mjs',
    esToolkitSymbol: 'sum',
    fn: 'sum',
    lodashIsDefault: true,
    lodashModule: 'lodash-es/sum',
  },
  // String
  {
    category: 'String',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/string/camelCase.mjs',
    esToolkitSymbol: 'camelCase',
    fn: 'camelCase',
    lodashIsDefault: true,
    lodashModule: 'lodash-es/camelCase',
  },
  {
    category: 'String',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/string/snakeCase.mjs',
    esToolkitSymbol: 'snakeCase',
    fn: 'snakeCase',
    lodashIsDefault: true,
    lodashModule: 'lodash-es/snakeCase',
  },
];
