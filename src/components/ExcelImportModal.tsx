import React, { useState } from 'react';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Clipboard, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight 
} from 'lucide-react';
import { Student } from '../types';
import { ExcelService } from '../utils/excel';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStudents: (students: Student[]) => void;
  currentStudents: Student[];
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onApplyStudents,
  currentStudents,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<Partial<Student>[] | null>(null);
  const [pastedText, setPastedText] = useState('');

  if (!isOpen) return null;

  // Handle file select
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsProcessing(true);
    try {
      const parsed = await ExcelService.parseExcelFile(file);
      if (parsed.length === 0) {
        setErrorMessage('Không tìm thấy dòng dữ liệu nào trong file Excel.');
      } else {
        setParsedPreview(parsed);
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage('Không thể đọc file Excel. Vui lòng kiểm tra định dạng .xlsx hoặc .csv.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle paste parse
  const handleParsePasted = () => {
    if (!pastedText.trim()) {
      setErrorMessage('Vui lòng dán danh sách học sinh từ bảng tính.');
      return;
    }
    setErrorMessage(null);
    try {
      const parsed = ExcelService.parsePastedText(pastedText);
      if (parsed.length === 0) {
        setErrorMessage('Không nhận diện được dòng dữ liệu nào.');
      } else {
        setParsedPreview(parsed);
      }
    } catch (err) {
      setErrorMessage('Lỗi khi phân tích dữ liệu dán.');
    }
  };

  // Merge parsed into current 26 student slots
  const handleApply = () => {
    if (!parsedPreview) return;

    // Merge into exactly 26 student objects
    const updated: Student[] = currentStudents.map((existing, idx) => {
      const incoming = parsedPreview[idx];
      if (!incoming) return existing;

      return {
        ...existing,
        fullName: incoming.fullName?.trim() || existing.fullName,
        studentCode: incoming.studentCode?.trim() || existing.studentCode,
        gender: incoming.gender || existing.gender,
        birthDate: incoming.birthDate || existing.birthDate,
        ethnicity: incoming.ethnicity || existing.ethnicity,
        hamlet: incoming.hamlet || existing.hamlet,
        address: incoming.address || existing.address,
        familyStatus: incoming.familyStatus || existing.familyStatus,
        parentName: incoming.parentName || existing.parentName,
        parentPhone: incoming.parentPhone || existing.parentPhone,
        isBoarding: incoming.isBoarding !== undefined ? incoming.isBoarding : existing.isBoarding,
        teacherNotes: incoming.teacherNotes || existing.teacherNotes,
      };
    });

    onApplyStudents(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <span>Nhập danh sách học sinh Lớp 9/2</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tải file Excel (.xlsx, .csv) hoặc sao chép và dán trực tiếp từ bảng tính.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: File upload vs Paste */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => { setActiveTab('file'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'file' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tải lên file Excel (.xlsx / .csv)
          </button>
          <button
            onClick={() => { setActiveTab('paste'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'paste' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dán bảng sao chép (Copy & Paste)
          </button>
        </div>

        {/* File upload zone */}
        {activeTab === 'file' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-6 text-center bg-slate-50/50 transition-colors">
              <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-xs sm:text-sm font-semibold text-indigo-600 hover:underline">
                  Chọn file Excel từ máy tính hoặc điện thoại
                </span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-500 mt-1">
                Hỗ trợ file .xlsx, .xls hoặc .csv (tự động nhận diện các cột Họ tên, Giới tính, Ngày sinh, SĐT...)
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 bg-indigo-50/60 p-3 rounded-lg border border-indigo-100">
              <span>Chưa có mẫu Excel chuẩn?</span>
              <button
                onClick={() => ExcelService.downloadTemplateExcel()}
                className="font-semibold text-indigo-700 hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Tải file mẫu 26 dòng (.xlsx)
              </button>
            </div>
          </div>
        )}

        {/* Paste tab */}
        {activeTab === 'paste' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Chọn các cột trong Excel / Google Sheets rồi nhấn <strong>Ctrl + C</strong> và dán vào ô bên dưới:
            </p>
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Ví dụ dán:&#10;1	Nguyễn Văn A	Nam	2012-05-10	0905123456&#10;2	Trần Thị B	Nữ	2012-08-22	0912345678"
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
            <button
              onClick={handleParsePasted}
              className="w-full py-2 bg-indigo-600 text-white font-semibold text-xs rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Phân tích dữ liệu vừa dán
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Preview parsed data */}
        {parsedPreview && (
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Đã nhận diện {parsedPreview.length} học sinh
              </span>
              <span className="text-[11px] text-slate-500">
                Sẽ điền vào 26 vị trí của lớp 9/2
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 sticky top-0">
                  <tr>
                    <th className="py-1.5 px-2">STT</th>
                    <th className="py-1.5 px-2">Họ và Tên</th>
                    <th className="py-1.5 px-2">Giới tính</th>
                    <th className="py-1.5 px-2">SĐT Phụ huynh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedPreview.slice(0, 26).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-1.5 px-2 font-medium text-slate-900">{item.fullName || '(Chưa nhập tên)'}</td>
                      <td className="py-1.5 px-2 text-slate-600">{item.gender}</td>
                      <td className="py-1.5 px-2 font-mono text-slate-600">{item.parentPhone || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setParsedPreview(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Hủy xem trước
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Cập nhật vào danh sách lớp</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
