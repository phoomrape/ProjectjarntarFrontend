import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { importApi } from '../services/api';

interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  validationErrors: { row: number; student_id: string; errors: string[] }[];
  skippedDetails: { row: number; student_id: string; reason: string }[];
}

interface PreviewRow {
  [key: string]: string | number;
}

export default function ImportStudentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSVPreview = (text: string): { headers: string[]; rows: PreviewRow[] } => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    const hdrs = lines[0].split(',').map((h) => h.trim().replace(/^\uFEFF/, ''));
    const rows: PreviewRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: PreviewRow = {};
      hdrs.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      rows.push(row);
    }

    return { headers: hdrs, rows };
  };

  const handleFile = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);

    if (selectedFile.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const { headers: hdrs, rows } = parseCSVPreview(text);
        setHeaders(hdrs);
        setPreview(rows);
      };
      reader.readAsText(selectedFile, 'utf-8');
    } else {
      // For Excel files, just show file info
      setHeaders([]);
      setPreview([]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const response = await importApi.importStudents(file);
      setResult(response.data);
      if (response.data.imported > 0) {
        toast.success(`นำเข้าข้อมูลสำเร็จ ${response.data.imported} รายการ`);
      }
      if (response.data.skipped > 0) {
        toast.warning(`ข้ามข้อมูล ${response.data.skipped} รายการ (ซ้ำหรือมีข้อผิดพลาด)`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    } finally {
      setImporting(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview([]);
    setHeaders([]);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = () => {
    const csvContent =
      'รหัสนักศึกษา,ชื่อ,นามสกุล,คณะ,สาขา,ชั้นปี,อีเมล,เบอร์โทร,สถานะ,รหัสผ่าน\n' +
      '66100001,สมชาย,ใจดี,คณะวิทยาศาสตร์,สาขาวิทยาการคอมพิวเตอร์,1,somchai@sskru.ac.th,0812345678,Active,123456';

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_students.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Column name mapping for display
  const thaiHeaders: Record<string, string> = {
    'รหัสนักศึกษา': 'รหัสนักศึกษา',
    'ชื่อ': 'ชื่อ',
    'นามสกุล': 'นามสกุล',
    'คณะ': 'คณะ',
    'สาขา': 'สาขา',
    'ชั้นปี': 'ชั้นปี',
    'อีเมล': 'อีเมล',
    'เบอร์โทร': 'เบอร์โทร',
    'สถานะ': 'สถานะ',
    'รหัสผ่าน': 'รหัสผ่าน',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">นำเข้าข้อมูลนักศึกษา</h1>
        <p className="text-gray-500 mt-1">อัปโหลดไฟล์ Excel/CSV เพื่อเพิ่มนักศึกษาหลายรายการพร้อมกัน</p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">รูปแบบคอลัมน์ที่รองรับ</p>
            <p>รหัสนักศึกษา, ชื่อ, นามสกุล, คณะ, สาขา, ชั้นปี, อีเมล, เบอร์โทร, สถานะ, รหัสผ่าน</p>
            <p className="mt-1 text-blue-600">
              • ถ้าไม่ระบุรหัสผ่าน ระบบจะใช้รหัสนักศึกษาเป็นรหัสผ่านเริ่มต้น<br />
              • ถ้าไม่ระบุอีเมล ระบบจะสร้างจากรหัสนักศึกษา@sskru.ac.th<br />
              • รองรับไฟล์ .csv, .xls, .xlsx (ขนาดไม่เกิน 10MB)
            </p>
          </div>
        </div>
      </div>

      {/* Download template button */}
      <div>
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
        >
          <Download className="w-4 h-4" />
          ดาวน์โหลดไฟล์ตัวอย่าง (CSV)
        </button>
      </div>

      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : file
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex items-center justify-center gap-4">
            <FileSpreadsheet className="w-10 h-10 text-green-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
                {preview.length > 0 && ` • ${preview.length} แถว`}
              </p>
            </div>
            <button
              onClick={clearFile}
              className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-1">ลากไฟล์มาวางที่นี่ หรือ</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              เลือกไฟล์
            </button>
            <p className="text-sm text-gray-400 mt-2">รองรับ .csv, .xls, .xlsx</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Preview table */}
      {preview.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">
              ตัวอย่างข้อมูล ({preview.length} แถว)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-gray-600 font-medium">#</th>
                  {headers.map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-gray-600 font-medium whitespace-nowrap">
                      {thaiHeaders[h] || h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.slice(0, 20).map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-400">{idx + 1}</td>
                    {headers.map((h) => (
                      <td key={h} className="px-4 py-2 text-gray-700 whitespace-nowrap">
                        {h === 'รหัสผ่าน' ? '••••••' : String(row[h] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
                {preview.length > 20 && (
                  <tr>
                    <td colSpan={headers.length + 1} className="px-4 py-3 text-center text-gray-500 italic">
                      ... แสดง 20 จาก {preview.length} แถว
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import button */}
      {file && (
        <div className="flex justify-end">
          <button
            onClick={handleImport}
            disabled={importing}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                กำลังนำเข้า...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                นำเข้าข้อมูล
              </>
            )}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-500">ข้อมูลทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{result.total}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <p className="text-sm text-green-700">นำเข้าสำเร็จ</p>
              </div>
              <p className="text-2xl font-bold text-green-700">{result.imported}</p>
            </div>
            <div className={`rounded-xl p-4 border ${result.skipped > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className={`w-4 h-4 ${result.skipped > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
                <p className={`text-sm ${result.skipped > 0 ? 'text-yellow-700' : 'text-gray-500'}`}>ข้าม/ข้อผิดพลาด</p>
              </div>
              <p className={`text-2xl font-bold ${result.skipped > 0 ? 'text-yellow-700' : 'text-gray-900'}`}>{result.skipped + result.validationErrors.length}</p>
            </div>
          </div>

          {/* Validation errors */}
          {result.validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h4 className="font-medium text-red-700 mb-2">ข้อมูลไม่ครบ ({result.validationErrors.length} แถว)</h4>
              <div className="space-y-1 text-sm">
                {result.validationErrors.map((err, idx) => (
                  <p key={idx} className="text-red-600">
                    แถว {err.row} (รหัส: {err.student_id}): {err.errors.join(', ')}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Skipped details */}
          {result.skippedDetails.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="font-medium text-yellow-700 mb-2">ข้อมูลที่ถูกข้าม ({result.skippedDetails.length} รายการ)</h4>
              <div className="space-y-1 text-sm">
                {result.skippedDetails.map((item, idx) => (
                  <p key={idx} className="text-yellow-600">
                    แถว {item.row} (รหัส: {item.student_id}): {item.reason}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
