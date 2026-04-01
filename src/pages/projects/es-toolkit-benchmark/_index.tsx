import type { BenchmarkResult } from './_types';
import type { WorkerBenchmarkResult } from './perf-worker';
import { cn } from '@lib/utils';
import { Badge } from '@react/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@react/ui/tabs';
import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PerfTab } from './_PerfTab';
import { SizeTab } from './_SizeTab';

interface EsToolkitBenchmarkProps {
  inEmbed?: boolean;
}

export default function EsToolkitBenchmark({ inEmbed = false }: EsToolkitBenchmarkProps) {
  const [perfResults, setPerfResults] = useState<BenchmarkResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const workerRef = useRef<null | Worker>(null);
  const TOTAL_CASES = 29;

  const runPerf = useCallback(async () => {
    if (running)
      return;

    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

    const worker = new Worker(
      new URL('./perf-worker.ts', import.meta.url),
      { type: 'module' },
    );

    workerRef.current = worker;
    setRunning(true);
    setPerfResults([]);

    worker.onmessage = (event: MessageEvent<{ payload?: WorkerBenchmarkResult; type: string }>) => {
      const { payload, type } = event.data;
      if (type === 'result' && payload) {
        setPerfResults((prev) => {
          const base = prev ?? [];
          const next: BenchmarkResult[] = [
            ...base,
            {
              esToolkitMs: payload.esToolkitMs,
              lodashMs: payload.lodashMs,
              name: payload.name,
              ratio: payload.ratio,
            },
          ];
          return next;
        });
      }
      if (type === 'done') {
        setRunning(false);
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
        }
      }
    };

    worker.postMessage({ type: 'run' });
  }, [running]);

  const maxPerf = useMemo(
    () => (perfResults && perfResults.length > 0
      ? Math.max(...perfResults.map(r => Math.max(r.esToolkitMs, r.lodashMs)))
      : 100),
    [perfResults],
  );
  const progressRatio = useMemo(
    () => (perfResults && perfResults.length > 0
      ? Math.min(1, perfResults.length / TOTAL_CASES)
      : 0),
    [perfResults, TOTAL_CASES],
  );

  return (
    <div
      className={cn(
        'rounded-2xl border bg-card/60 p-5 shadow-sm w-full min-h-[400px]',
        inEmbed && 'h-full max-h-full overflow-y-auto',
      )}
    >
      <Tabs defaultValue="size" className="mt-2">
        <div className="flex flex-row justify-between items-center mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight">
                es-toolkit vs lodash-es
              </h2>
              <Badge variant="outline" className="border-dashed text-[10px] uppercase tracking-[0.16em]">
                Benchmark Lab
              </Badge>
            </div>
            <p className="max-w-xl text-xs text-muted-foreground">
              比较常用工具函数在不同实现下的包体积与运行性能。
            </p>
          </div>
          <TabsList className="flex rounded-full bg-muted/60 p-0.5 text-xs">
            <TabsTrigger
              value="size"
              className="rounded-full px-3 py-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              包体积
            </TabsTrigger>
            <TabsTrigger
              value="perf"
              className="rounded-full px-3 py-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              运行性能
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="size" className="mt-0 space-y-4">
          <SizeTab />
        </TabsContent>

        <TabsContent value="perf" className="mt-0 space-y-4">
          <PerfTab
            running={running}
            onRun={runPerf}
            perfResults={perfResults}
            progressRatio={progressRatio}
            maxPerf={maxPerf}
            totalCases={TOTAL_CASES}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
