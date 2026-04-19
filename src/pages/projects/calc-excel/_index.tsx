import { Button } from '@react/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@react/ui/card';
import { Input } from '@react/ui/input';
import { Label } from '@react/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@react/ui/select';
import { Toaster } from '@react/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@react/ui/table';
import { Calculator } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { ExcelUploader } from './_ExcelUploader';

interface CalculationResult {
  rowNumber: number;
  rowData: Record<string, unknown>;
  cumulativeSum: number;
}

function CalcExcel() {
  const [workbook, setWorkbook] = useState<null | XLSX.WorkBook>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [sheetData, setSheetData] = useState<unknown[][]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [threshold, setThreshold] = useState<string>('');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleWorkbookLoaded = (wb: XLSX.WorkBook) => {
    setWorkbook(wb);
    setSelectedSheet('');
    setSheetData([]);
    setColumns([]);
    setSelectedColumn('');
    setResult(null);
  };

  const handleSheetSelect = (sheetName: string) => {
    if (!workbook)
      return;

    setSelectedSheet(sheetName);
    setSelectedColumn('');
    setResult(null);

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      toast.error('工作表不存在');
      return;
    }
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

    if (data.length === 0) {
      toast.error('工作表为空');
      setSheetData([]);
      setColumns([]);
      return;
    }

    setSheetData(data);
    const headerRow = data[0] as string[];
    setColumns(headerRow.map((col, idx) => col?.toString() || `列${idx + 1}`));
  };

  const handleCalculate = () => {
    setResult(null);

    if (!selectedColumn) {
      toast.error('请选择列');
      return;
    }

    const thresholdValue = Number.parseFloat(threshold);
    if (Number.isNaN(thresholdValue)) {
      toast.error('请输入有效的阈值');
      return;
    }

    const columnIndex = columns.indexOf(selectedColumn);
    if (columnIndex === -1) {
      toast.error('选择的列不存在');
      return;
    }

    let cumulativeSum = 0;
    for (let i = 1; i < sheetData.length; i++) {
      const row = sheetData[i];
      if (!row)
        continue;

      const cellValue = Number.parseFloat(String(row[columnIndex] || 0));

      if (Number.isNaN(cellValue)) {
        continue;
      }

      cumulativeSum += cellValue;

      if (cumulativeSum > thresholdValue) {
        const rowData: Record<string, unknown> = {};
        columns.forEach((col, idx) => {
          rowData[col] = row[idx];
        });

        setResult({
          cumulativeSum,
          rowData,
          rowNumber: i + 1,
        });
        toast.success(`找到目标行：第 ${i + 1} 行`);
        return;
      }
    }

    toast.warning(`所有行累加后的值为 ${cumulativeSum.toFixed(2)}，未超过阈值 ${thresholdValue}`);
  };

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">配置参数</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">上传 Excel 文件</Label>
                <ExcelUploader onWorkbookLoaded={handleWorkbookLoaded} />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">选择工作表</Label>
                <Select
                  value={selectedSheet}
                  onValueChange={handleSheetSelect}
                  disabled={!workbook}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={workbook ? '选择工作表' : '请先上传文件'} />
                  </SelectTrigger>
                  <SelectContent>
                    {workbook?.SheetNames.map(name => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">选择计算列</Label>
                <Select
                  value={selectedColumn}
                  onValueChange={setSelectedColumn}
                  disabled={!selectedSheet || columns.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedSheet ? '选择列' : '请先选择工作表'} />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map(col => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">阈值</Label>
                <Input
                  type="number"
                  placeholder="输入阈值"
                  value={threshold}
                  onChange={e => setThreshold(e.target.value)}
                  disabled={!selectedColumn}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleCalculate}
                disabled={!selectedColumn || !threshold}
              >
                <Calculator className="w-4 h-4 mr-2" />
                开始计算
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">计算结果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground mb-1">目标行号</div>
                  <div className="text-2xl font-bold">
                    第
                    {' '}
                    {result.rowNumber}
                    {' '}
                    行
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground mb-1">累加值</div>
                  <div className="text-2xl font-bold">{result.cumulativeSum.toFixed(2)}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">该行数据</div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>列名</TableHead>
                        <TableHead>值</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(result.rowData).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium">{key}</TableCell>
                          <TableCell className="font-mono">{String(value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

export default CalcExcel;
