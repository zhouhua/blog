import { Button } from '@react/ui/button';
import { Input } from '@react/ui/input';
import { Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ExcelUploaderProps {
  onWorkbookLoaded?: (workbook: XLSX.WorkBook) => void;
}

export function ExcelUploader({ onWorkbookLoaded }: ExcelUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');

  const validateFileType = (file: File): boolean => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    return validTypes.includes(file.type) || validExtensions.includes(fileExtension);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file)
      return;

    if (!validateFileType(file)) {
      toast.error('文件格式不正确，请上传 .xlsx 或 .xls 文件');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          toast.error('文件读取失败');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const sheetNames = workbook.SheetNames;

        if (sheetNames.length === 0) {
          toast.error('Excel 文件中没有找到工作表');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        setFileName(file.name);
        onWorkbookLoaded?.(workbook);
        toast.success(`成功加载文件：${file.name}`);
      }
      catch (err) {
        toast.error(`解析 Excel 文件失败: ${err instanceof Error ? err.message : '未知错误'}`);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      toast.error('文件读取失败，请重试');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleClearFile = () => {
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onWorkbookLoaded?.(undefined as any);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <Input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />
      {fileName
        ? (
            <div className="flex gap-2">
              <Button onClick={handleUploadClick} variant="outline" className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                <span className="truncate">{fileName}</span>
              </Button>
              <Button onClick={handleClearFile} variant="outline" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )
        : (
            <Button onClick={handleUploadClick} variant="outline" className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              选择文件
            </Button>
          )}
    </div>
  );
}
