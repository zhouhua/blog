import type * as Esbuild from 'esbuild-wasm';
import type { BundleSizeCase } from './_bundle-data';
import { cn } from '@lib/utils';
import { Button } from '@react/ui/button';
import { gzip } from 'pako';
import { useEffect, useState } from 'react';
import { bundleSizeCases } from './_bundle-data';

interface MeasuredBundleSize extends BundleSizeCase {
  esToolkit: number;
  esToolkitGzip: number;
  lodashEs: number;
  lodashEsGzip: number;
  error?: null | string;
}

let esbuildPromise: null | Promise<typeof Esbuild> = null;
let cachedResults: MeasuredBundleSize[] | null = null;

const HTTP_URL_REGEX = /^https?:\/\//;
const ANY_REGEX = /.*/;
const INITIALIZE_ERROR_REGEX = /initialize/i;

async function getEsbuild(): Promise<typeof Esbuild> {
  if (!esbuildPromise) {
    esbuildPromise = (async () => {
      const esbuild = await import('esbuild-wasm');
      try {
        await esbuild.initialize({
          wasmURL: 'https://esm.sh/esbuild-wasm@0.27.4/esbuild.wasm',
        });
      }
      catch (e) {
        if (!(e instanceof Error && INITIALIZE_ERROR_REGEX.test(e.message))) {
          throw e;
        }
        // already initialized – ignore in HMR / multiple calls
      }
      return esbuild;
    })();
  }

  return esbuildPromise;
}

function createHttpPlugin(): Esbuild.Plugin {
  return {
    name: 'http-loader',
    setup(build) {
      // Already-absolute http(s) URLs
      build.onResolve({ filter: HTTP_URL_REGEX }, args => ({
        namespace: 'http-url',
        path: args.path,
      }));

      // Follow-up imports inside downloaded modules (relative or absolute)
      build.onResolve({ filter: ANY_REGEX, namespace: 'http-url' }, (args) => {
        const url = new URL(args.path, args.importer);
        return {
          namespace: 'http-url',
          path: url.toString(),
        };
      });

      // Bare module specifiers from our entry code
      build.onResolve({ filter: ANY_REGEX }, (args) => {
        const path = `https://esm.sh/${args.path}`;
        return {
          namespace: 'http-url',
          path,
        };
      });

      build.onLoad({ filter: ANY_REGEX, namespace: 'http-url' }, async (args) => {
        const res = await fetch(args.path);
        if (!res.ok) {
          throw new Error(`Failed to fetch ${args.path}: ${res.status}`);
        }
        const contents = await res.text();
        return {
          contents,
          loader: 'js',
        };
      });
    },
  };
}

async function measureWithEsbuild(
  esbuild: typeof Esbuild,
  code: string,
): Promise<{ raw: number; gzip: number }> {
  const result = await esbuild.build({
    bundle: true,
    format: 'esm',
    minify: true,
    plugins: [createHttpPlugin()],
    stdin: {
      contents: code,
      loader: 'js',
      resolveDir: '/',
      sourcefile: 'entry.js',
    },
    treeShaking: true,
    write: false,
  });

  const output = result.outputFiles?.[0]?.text ?? '';
  const raw = new Blob([output]).size;
  const gzipped = gzip(output);
  return { gzip: gzipped.byteLength, raw };
}

export function SizeTab() {
  const [data, setData] = useState<MeasuredBundleSize[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  async function run() {
    if (typeof window === 'undefined') {
      return;
    }

    // 若已有缓存结果（例如切换 Tab 后返回），直接使用，避免重复计算
    if (cachedResults && cachedResults.length > 0 && !loading) {
      setData(cachedResults);
      return;
    }

    setLoading(true);
    setError(null);
    const localResults: MeasuredBundleSize[] = [];

    try {
      const esbuild = await getEsbuild();

      await Promise.all(
        bundleSizeCases.map(async (cfg) => {
          const makeEntry = (
            partial: Omit<MeasuredBundleSize, keyof BundleSizeCase>,
          ): MeasuredBundleSize => ({
            ...cfg,
            ...partial,
          });

          try {
            const esToolkitCode = `
                import { ${cfg.esToolkitSymbol} as fn } from '${cfg.esToolkitModule}';
                console.log(fn);
              `;

            const lodashCode = cfg.lodashIsDefault
              ? `
                  import fn from '${cfg.lodashModule}';
                  console.log(fn);
                `
              : `
                  import { ${cfg.esToolkitSymbol} as fn } from '${cfg.lodashModule}';
                  console.log(fn);
                `;

            const [esToolkit, lodashEs] = await Promise.all([
              measureWithEsbuild(esbuild, esToolkitCode),
              measureWithEsbuild(esbuild, lodashCode),
            ]);

            const entry = makeEntry({
              error: null,
              esToolkit: esToolkit.raw,
              esToolkitGzip: esToolkit.gzip,
              lodashEs: lodashEs.raw,
              lodashEsGzip: lodashEs.gzip,
            });

            localResults.push(entry);

            setData((prev) => {
              const base = prev ?? [];
              const existingIndex = base.findIndex(b => b.fn === entry.fn && b.category === entry.category);
              if (existingIndex === -1) {
                return [...base, entry];
              }
              const next = base.slice();
              next[existingIndex] = entry;
              return next;
            });
          }
          catch (e) {
            const entry = makeEntry({
              error: e instanceof Error ? e.message : 'Unknown error',
              esToolkit: 0,
              esToolkitGzip: 0,
              lodashEs: 0,
              lodashEsGzip: 0,
            });

            localResults.push(entry);

            setData((prev) => {
              const base = prev ?? [];
              const existingIndex = base.findIndex(b => b.fn === entry.fn && b.category === entry.category);
              if (existingIndex === -1) {
                return [...base, entry];
              }
              const next = base.slice();
              next[existingIndex] = entry;
              return next;
            });
          }
        }),
      );

      cachedResults = localResults;
    }
    catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 仅在有缓存时恢复上次结果，不自动触发计算
    if (cachedResults && cachedResults.length > 0) {
      setData(cachedResults);
    }

    return () => {
      // 不再在卸载时中断进行中的打包任务
    };
  }, []);

  const bundleSizeData = data ?? [];

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-3 text-xs flex-center">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-chart-1" />
              es-toolkit
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-chart-5" />
              lodash-es
            </span>
          </div>
          <span>
            单位：bytes；数据在浏览器中通过 esbuild + gzip 动态测量（es-toolkit@1.45.1，lodash-es@4.17.23）。
          </span>
        </div>
        <Button
          size="sm"
          onClick={() => {
            // 手动点击时允许重新计算
            cachedResults = null;
            void run();
          }}
          disabled={loading}
          className="min-w-[96px]"
        >
          {loading ? '计算中...' : '开始测试'}
        </Button>
      </div>

      {error && (
        <p className="mb-2 text-xs text-destructive">
          计算过程中出现错误：
          {error}
        </p>
      )}
      <div className="space-y-3">
        {bundleSizeData.map((d) => {
          const rowMax = Math.max(d.esToolkit, d.lodashEs);
          const ratio = d.esToolkit > 0 ? d.lodashEs / d.esToolkit : 0;
          const gzipRatio = d.esToolkitGzip > 0 ? d.lodashEsGzip / d.esToolkitGzip : 0;
          const label = ratio > 1
            ? `${ratio.toFixed(1)}× smaller`
            : ratio > 0
              ? `${(1 / ratio).toFixed(1)}× larger`
              : '—';

          const gzipLabel = gzipRatio > 1
            ? `${gzipRatio.toFixed(1)}× smaller`
            : gzipRatio > 0
              ? `${(1 / gzipRatio).toFixed(1)}× larger`
              : '—';

          return (
            <div key={d.fn} className="flex items-center gap-3 text-sm">
              <code className="font-mono w-36 shrink-0">{d.fn}</code>
              <div className="flex-1 space-y-1">
                <div
                  className="flex items-center gap-2 text-[11px] text-muted-foreground flex-1"
                  title={`es-toolkit: ${d.esToolkit} bytes / gzip ${d.esToolkitGzip} bytes`}
                >
                  <div
                    className="relative rounded bg-chart-1/40 overflow-hidden h-5"
                    style={{
                      width: rowMax > 0 ? `${(d.esToolkit / rowMax) * 100}%` : '0%',
                    }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 rounded bg-chart-1"
                      style={{
                        width: d.esToolkit > 0 ? `${(d.esToolkitGzip / d.esToolkit) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>
                <div
                  className="flex flex-1 items-center gap-2 text-[11px] text-muted-foreground"
                  title={`lodash-es: ${d.lodashEs} bytes / gzip ${d.lodashEsGzip} bytes`}
                >
                  <div
                    className="relative rounded bg-chart-5/40 overflow-hidden h-5"
                    style={{
                      width: rowMax > 0 ? `${(d.lodashEs / rowMax) * 100}%` : '0%',
                    }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 rounded bg-chart-5"
                      style={{
                        width: d.lodashEsGzip > 0 ? `${(d.lodashEsGzip / d.lodashEs) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>
              </div>
              <div
                className="w-30 shrink-0 text-right text-xs flex flex-col justify-center"
                title={`raw: ${label}; gzip: ${gzipLabel}`}
              >
                <div
                  className={cn(
                    ratio > 1 ? 'text-emerald-500' : ratio > 0 ? 'text-amber-500' : 'text-muted-foreground',
                  )}
                >
                  {label}
                </div>
                <div className="space-x-2">
                  <span className="text-muted-foreground/70">gzip:</span>
                  <span
                    className={cn(
                      'w-24 shrink-0 text-right text-xs',
                      gzipRatio > 1 ? 'text-emerald-500' : gzipRatio > 0 ? 'text-amber-500' : 'text-muted-foreground',
                    )}
                  >
                    {gzipLabel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {loading && (
          <p className="mb-2 text-xs text-muted-foreground">
            正在从 CDN 获取打包产物并计算包体积…
          </p>
        )}
      </div>
    </>
  );
}
