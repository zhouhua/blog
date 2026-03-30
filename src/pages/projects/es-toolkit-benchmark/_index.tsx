import { useCallback, useState } from 'react';

// Bundle size data (measured via esbuild, minified+gzipped, approximate values from es-toolkit docs)
const bundleSizeData = [
  { esToolkit: 97, fn: 'chunk', lodashEs: 2100 },
  { esToolkit: 186, fn: 'debounce', lodashEs: 2400 },
  { esToolkit: 44, fn: 'groupBy', lodashEs: 2800 },
  { esToolkit: 109, fn: 'omit', lodashEs: 3100 },
  { esToolkit: 65, fn: 'pick', lodashEs: 2500 },
  { esToolkit: 217, fn: 'throttle', lodashEs: 2700 },
  { esToolkit: 64, fn: 'uniq', lodashEs: 1900 },
];

// Performance benchmark runners
function benchmarkFn(fn: () => void, iterations = 100_000): number {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  return performance.now() - start;
}

interface BenchmarkResult {
  name: string;
  esToolkitMs: number;
  lodashMs: number;
  ratio: number;
}

async function runBenchmarks(): Promise<BenchmarkResult[]> {
  const [{ chunk, groupBy, omit, pick, uniq }, lodashEsModule] = await Promise.all([
    import('es-toolkit'),
    import('lodash-es'),
  ]);
  const { chunk: lChunk, groupBy: lGroupBy, omit: lOmit, pick: lPick, uniq: lUniq } = lodashEsModule;

  const arr = Array.from({ length: 100 }, (_, i) => i);
  const arrWithDups = [...arr, ...arr.slice(0, 30)];
  const obj = Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`key${i}`, i]));
  const keys = Array.from({ length: 20 }, (_, i) => `key${i}`);
  const items = Array.from({ length: 100 }, (_, i) => ({ id: i % 10, val: i }));

  // Warm up
  for (let i = 0; i < 1000; i++) {
    chunk(arr, 5);
    lChunk(arr, 5);
  }

  // Yield to browser between each benchmark
  const results: BenchmarkResult[] = [];

  const cases: { name: string; es: () => void; lodash: () => void }[] = [
    { es: () => chunk(arr, 5), lodash: () => lChunk(arr, 5), name: 'chunk' },
    { es: () => uniq(arrWithDups), lodash: () => lUniq(arrWithDups), name: 'uniq' },
    { es: () => pick(obj, keys), lodash: () => lPick(obj, keys), name: 'pick' },
    { es: () => omit(obj, keys), lodash: () => lOmit(obj, keys), name: 'omit' },
    { es: () => groupBy(items, x => String(x.id)), lodash: () => lGroupBy(items, x => String(x.id)), name: 'groupBy' },
  ];

  for (const c of cases) {
    await new Promise(r => setTimeout(r, 0));
    const esMs = benchmarkFn(c.es);
    await new Promise(r => setTimeout(r, 0));
    const lodashMs = benchmarkFn(c.lodash);
    results.push({
      esToolkitMs: esMs,
      lodashMs,
      name: c.name,
      ratio: lodashMs / esMs,
    });
  }

  return results;
}

function Bar({ color, max, value }: { value: number; max: number; color: string }) {
  const pct = Math.max(2, (value / max) * 100);
  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        className="h-5 rounded transition-all duration-500"
        style={{ backgroundColor: color, width: `${pct}%` }}
      />
      <span className="whitespace-nowrap tabular-nums">{value}</span>
    </div>
  );
}

export default function EsToolkitBenchmark() {
  const [perfResults, setPerfResults] = useState<BenchmarkResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState<'perf' | 'size'>('size');

  const runPerf = useCallback(async () => {
    setRunning(true);
    setPerfResults(null);
    try {
      const results = await runBenchmarks();
      setPerfResults(results);
    }
    finally {
      setRunning(false);
    }
  }, []);

  const maxSize = Math.max(...bundleSizeData.flatMap(d => [d.esToolkit, d.lodashEs]));
  const maxPerf = perfResults ? Math.max(...perfResults.flatMap(r => [r.esToolkitMs, r.lodashMs])) : 1;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-2xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-1">es-toolkit vs lodash-es</h1>
      <p className="text-muted-foreground text-sm mb-6">Bundle size 与运行性能对比</p>

      <div className="flex gap-2 mb-6">
        {(['size', 'perf'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {t === 'size' ? 'Bundle Size' : '运行性能'}
          </button>
        ))}
      </div>

      {tab === 'size' && (
        <div>
          <p className="text-xs text-muted-foreground mb-4">单位：bytes（esbuild minify，未 gzip），数据来自 es-toolkit 官方文档</p>
          <div className="flex gap-3 text-xs mb-4">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#3b82f6' }} />
              es-toolkit
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#e5e7eb' }} />
              lodash-es
            </span>
          </div>
          <div className="space-y-4">
            {bundleSizeData.map(d => (
              <div key={d.fn}>
                <div className="flex justify-between text-sm mb-1">
                  <code className="font-mono">{d.fn}</code>
                  <span className="text-muted-foreground text-xs">
                    {Math.round(d.lodashEs / d.esToolkit)}
                    × smaller
                  </span>
                </div>
                <div className="space-y-1">
                  <Bar value={d.esToolkit} max={maxSize} color="#3b82f6" />
                  <Bar value={d.lodashEs} max={maxSize} color="#e5e7eb" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'perf' && (
        <div>
          <p className="text-xs text-muted-foreground mb-4">各函数执行 100,000 次的总耗时（ms），数值越小越好，在你的浏览器中实时运行</p>
          {!perfResults && (
            <button
              onClick={runPerf}
              disabled={running}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {running ? '测试中……' : '开始测试'}
            </button>
          )}
          {running && (
            <p className="text-sm text-muted-foreground mt-4">正在运行，请稍候……</p>
          )}
          {perfResults && (
            <>
              <div className="flex gap-3 text-xs mb-4">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#3b82f6' }} />
                  es-toolkit
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#e5e7eb' }} />
                  lodash-es
                </span>
              </div>
              <div className="space-y-4">
                {perfResults.map(r => (
                  <div key={r.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <code className="font-mono">{r.name}</code>
                      <span className={`text-xs ${r.ratio >= 1 ? 'text-green-500' : 'text-orange-400'}`}>
                        {r.ratio >= 1 ? `${r.ratio.toFixed(1)}× faster` : `${(1 / r.ratio).toFixed(1)}× slower`}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Bar value={Math.round(r.esToolkitMs)} max={maxPerf} color="#3b82f6" />
                      <Bar value={Math.round(r.lodashMs)} max={maxPerf} color="#e5e7eb" />
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={runPerf}
                className="mt-6 px-4 py-1.5 bg-muted text-muted-foreground rounded-lg text-sm"
              >
                重新测试
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
