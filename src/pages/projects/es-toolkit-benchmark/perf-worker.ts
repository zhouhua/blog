export interface WorkerBenchmarkResult {
  name: string;
  esToolkitMs: number;
  lodashMs: number;
  ratio: number;
}

interface RunMessage {
  type: 'run';
}

interface ResultMessage {
  type: 'result';
  payload: WorkerBenchmarkResult;
}

interface DoneMessage {
  type: 'done';
}

type WorkerMessage = DoneMessage | ResultMessage | RunMessage;

// eslint-disable-next-line no-restricted-globals
const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  if (event.data.type !== 'run')
    return;

  const [esModule, lodashEsModule] = await Promise.all([
    import('es-toolkit'),
    import('lodash-es'),
  ]);

  const {
    camelCase,
    chunk,
    clamp,
    difference,
    differenceWith,
    groupBy,
    intersection,
    intersectionWith,
    mapValues,
    memoize,
    omit,
    pick,
    snakeCase,
    sum,
    unionBy,
    uniq,
  } = esModule;
  const {
    camelCase: lCamelCase,
    chunk: lChunk,
    clamp: lClamp,
    difference: lDifference,
    differenceWith: lDifferenceWith,
    groupBy: lGroupBy,
    intersection: lIntersection,
    intersectionWith: lIntersectionWith,
    mapValues: lMapValues,
    memoize: lMemoize,
    omit: lOmit,
    pick: lPick,
    snakeCase: lSnakeCase,
    sum: lSum,
    unionBy: lUnionBy,
    uniq: lUniq,
  } = lodashEsModule;

  const arr = Array.from({ length: 100 }, (_, i) => i);
  const arr2 = Array.from({ length: 100 }, (_, i) => i * 2);
  const arrWithDups = [...arr, ...arr.slice(0, 30)];
  const arrLarge = Array.from({ length: 5_000 }, (_, i) => i % 97);
  const arrLarge2 = Array.from({ length: 5_000 }, (_, i) => (i * 3) % 97);

  const obj = Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`key${i}`, i]));
  const objLarge = Object.fromEntries(Array.from({ length: 2_000 }, (_, i) => [`field_${i}`, i]));
  const keys = Array.from({ length: 20 }, (_, i) => `key${i}`);
  const keysSparse = ['key0', 'key5', 'key10', 'key15', 'key25', 'key30', 'key40', 'key45'];

  const items = Array.from({ length: 100 }, (_, i) => ({ id: i % 10, val: i }));
  const itemsSkewed = Array.from(
    { length: 2_000 },
    (_, i) => ({ id: i % 3 === 0 ? 0 : i % 17, val: i }),
  );

  const objectsA = Array.from(
    { length: 2_000 },
    (_, i) => ({ id: i % 500, value: i }),
  );
  const objectsB = Array.from(
    { length: 2_000 },
    (_, i) => ({ id: (i * 7) % 500, value: i * 2 }),
  );
  const cmpById = (a: { id: number }, b: { id: number }) => a.id === b.id;

  const unionArr1 = Array.from(
    { length: 1_000 },
    (_, i) => ({ flag: i % 2 === 0, id: i }),
  );
  const unionArr2 = Array.from(
    { length: 1_000 },
    (_, i) => ({ flag: i % 3 === 0, id: 500 + i }),
  );

  const str = 'hello world foo bar';
  const strComplex = 'ES Toolkit vs lodash-es: BENCHMARK_example-case 2026!';

  const testCases = [
    { es: () => chunk(arr, 5), lodash: () => lChunk(arr, 5), name: 'chunk' },
    { es: () => chunk(arrLarge, 13), lodash: () => lChunk(arrLarge, 13), name: 'chunk/large' },
    { es: () => uniq(arrWithDups), lodash: () => lUniq(arrWithDups), name: 'uniq' },
    { es: () => uniq(arrLarge), lodash: () => lUniq(arrLarge), name: 'uniq/large' },
    { es: () => groupBy(items, x => String(x.id)), lodash: () => lGroupBy(items, x => String(x.id)), name: 'groupBy' },
    { es: () => groupBy(itemsSkewed, x => String(x.id)), lodash: () => lGroupBy(itemsSkewed, x => String(x.id)), name: 'groupBy/skewed' },
    { es: () => intersection(arr, arr2), lodash: () => lIntersection(arr, arr2), name: 'intersection' },
    { es: () => intersection(arrLarge, arrLarge2), lodash: () => lIntersection(arrLarge, arrLarge2), name: 'intersection/large' },
    { es: () => intersectionWith(objectsA, objectsB, cmpById), lodash: () => lIntersectionWith(objectsA, objectsB, cmpById), name: 'intersectionWith' },
    { es: () => difference(arr, arr2), lodash: () => lDifference(arr, arr2), name: 'difference' },
    { es: () => difference(arrLarge, arrLarge2), lodash: () => lDifference(arrLarge, arrLarge2), name: 'difference/large' },
    { es: () => differenceWith(objectsA, objectsB, cmpById), lodash: () => lDifferenceWith(objectsA, objectsB, cmpById), name: 'differenceWith' },
    { es: () => pick(obj, keys), lodash: () => lPick(obj, keys), name: 'pick' },
    { es: () => pick(objLarge, keysSparse), lodash: () => lPick(objLarge, keysSparse), name: 'pick/sparse-keys' },
    { es: () => omit(obj, keys), lodash: () => lOmit(obj, keys), name: 'omit' },
    { es: () => omit(objLarge, keysSparse), lodash: () => lOmit(objLarge, keysSparse), name: 'omit/sparse-keys' },
    { es: () => mapValues(obj, v => v * 2), lodash: () => lMapValues(obj, v => v * 2), name: 'mapValues' },
    { es: () => mapValues(objLarge, v => v * 3), lodash: () => lMapValues(objLarge, v => v * 3), name: 'mapValues/large' },
    { es: () => memoize((x: number) => x * 2)(42), lodash: () => lMemoize((x: number) => x * 2)(42), name: 'memoize' },
    { es: () => clamp(42, 0, 100), lodash: () => lClamp(42, 0, 100), name: 'clamp' },
    { es: () => sum(arr), lodash: () => lSum(arr), name: 'sum' },
    { es: () => sum(arrLarge), lodash: () => lSum(arrLarge), name: 'sum/large' },
    { es: () => camelCase(str), lodash: () => lCamelCase(str), name: 'camelCase' },
    { es: () => camelCase(strComplex), lodash: () => lCamelCase(strComplex), name: 'camelCase/complex' },
    { es: () => snakeCase(str), lodash: () => lSnakeCase(str), name: 'snakeCase' },
    { es: () => snakeCase(strComplex), lodash: () => lSnakeCase(strComplex), name: 'snakeCase/complex' },
    {
      es: () => unionBy(unionArr1, unionArr2, item => item.id),
      lodash: () => lUnionBy(unionArr1, unionArr2, 'id'),
      name: 'unionBy',
    },
  ];

  const callPerIter = 10_000;

  for (const c of testCases) {
    // 轻微让出事件循环，避免 worker 单次阻塞过久
    await new Promise(resolve => setTimeout(resolve, 0));

    const s1 = performance.now();
    for (let j = 0; j < callPerIter; j++) c.es();
    const esTotal = performance.now() - s1;

    const s2 = performance.now();
    for (let j = 0; j < callPerIter; j++) c.lodash();
    const lodashTotal = performance.now() - s2;

    const message: ResultMessage = {
      payload: {
        esToolkitMs: esTotal,
        lodashMs: lodashTotal,
        name: c.name,
        ratio: lodashTotal / esTotal,
      },
      type: 'result',
    };

    ctx.postMessage(message);
  }

  const done: DoneMessage = { type: 'done' };
  ctx.postMessage(done);
};
