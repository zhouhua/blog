import type { BenchmarkResult } from './_types';
import { cn } from '@lib/utils';
import { Button } from '@react/ui/button';
import { Bar } from './_Bar';

interface PerfTabProps {
  maxPerf: number;
  onRun: () => void;
  perfResults: BenchmarkResult[] | null;
  progressRatio: number;
  running: boolean;
}

export function PerfTab({
  maxPerf,
  onRun,
  perfResults,
  progressRatio,
  running,
}: PerfTabProps) {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          各函数执行 10,000 次的平均耗时（ms）。
        </p>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          { running && (
            <div className="flex min-w-[160px] flex-1 items-center gap-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressRatio * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {Math.round(progressRatio * 100)}
                %
              </span>
            </div>
          )}
          <Button
            size="sm"
            onClick={onRun}
            disabled={running}
            className="min-w-[96px]"
          >
            {running ? '测试中...' : '开始测试'}
          </Button>
        </div>
      </div>

      {perfResults && perfResults.length > 0 && (
        <>
          <div className="flex gap-3 text-xs mb-2">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#3b82f6' }} />
              es-toolkit
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#e5e7eb' }} />
              lodash-es
            </span>
          </div>
          <div className="space-y-3">
            {perfResults.map(r => (
              <div
                key={r.name}
                className="flex items-center gap-3 text-sm"
              >
                <code className="font-mono w-36 shrink-0">{r.name}</code>
                <div className="flex-1 space-y-1">
                  <Bar value={r.esToolkitMs} max={maxPerf} color="#3b82f6" />
                  <Bar value={r.lodashMs} max={maxPerf} color="#e5e7eb" />
                </div>
                <span
                  className={cn(
                    'w-24 text-right text-xs',
                    r.ratio >= 1 ? 'text-emerald-500' : 'text-amber-500',
                  )}
                >
                  {r.ratio >= 1
                    ? `${r.ratio.toFixed(1)}× faster`
                    : `${(1 / r.ratio).toFixed(1)}× slower`}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
