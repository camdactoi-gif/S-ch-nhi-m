import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  Lock, 
  Key, 
  FileCode, 
  Copy, 
  Save, 
  Database,
  Info
} from 'lucide-react';
import { ClassMetadata } from '../types';
import { StorageService } from '../utils/storage';
import { ExcelService } from '../utils/excel';

interface SettingsViewProps {
  metadata: ClassMetadata;
  onUpdateMetadata: (meta: ClassMetadata) => void;
  onRestoreSuccess: () => void;
  onResetToDefault: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  metadata,
  onUpdateMetadata,
  onRestoreSuccess,
  onResetToDefault,
}) => {
  const [formData, setFormData] = useState<ClassMetadata>({ ...metadata });
  const [newPin, setNewPin] = useState(metadata.passcode || '1234');
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3500);
  };

  // Save metadata
  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...formData,
      passcode: newPin.trim() || '1234',
    };
    onUpdateMetadata(updated);
    showToast('Đã lưu cấu hình lớp và mã PIN bảo vệ thành công!');
  };

  // Download full JSON backup
  const handleDownloadBackup = () => {
    const jsonStr = StorageService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sao_Luu_Lop_9_2_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống file sao lưu toàn bộ dữ liệu (.json)!');
  };

  // Restore JSON backup
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = StorageService.restoreFullBackup(content);
        if (success) {
          onRestoreSuccess();
          showToast('Khôi phục dữ liệu từ bản sao lưu thành công!');
        } else {
          alert('File sao lưu không đúng định dạng hoặc bị lỗi.');
        }
      } catch (err) {
        alert('Lỗi đọc file sao lưu.');
      }
    };
    reader.readAsText(file);
  };

  // Google Apps Script sample code
  const appsScriptCode = `// GOOGLE APPS SCRIPT CHO HỆ THỐNG QUẢN LÝ LỚP CHỦ NHIỆM 9/2
// Hướng dẫn triển khai bảo mật:
// 1. Tạo Google Sheets tại Drive của Thầy/Cô (đặt chế độ CHỈ CHIA SẺ RIÊNG TƯ, không công khai).
// 2. Mở Extensions -> Apps Script, dán mã bên dưới và Deploy as Web App (Execute as me, Only myself).

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("HocSinh");
  var data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var body = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DiemDanh");
  sheet.appendRow([new Date(), body.studentId, body.status, body.note]);
  return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          <span>Cài đặt hệ thống, Lưu trữ & Bảo mật thông tin</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Quản lý mã PIN bảo vệ, sao lưu phục hồi dữ liệu, cài đặt thông tin lớp 9/2 và kết nối Google Drive / Google Sheets.
        </p>
      </div>

      {/* Row 1: Backup & Restore (Crucial for teacher persistent data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Backup Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-700">
            <Download className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-900">Sao lưu dữ liệu lớp học</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dữ liệu được lưu bền vững trên thiết bị của Thầy/Cô. Để lưu trữ an toàn định kỳ hoặc chuyển sang máy tính/điện thoại khác, hãy tải bản sao lưu về máy.
          </p>
          <button
            onClick={handleDownloadBackup}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Tải về file sao lưu (.json)</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <Upload className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-900">Khôi phục dữ liệu từ bản sao lưu</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Khôi phục toàn bộ hồ sơ 26 học sinh, lịch sử điểm danh, điểm số và nhật ký phụ huynh từ file sao lưu (.json) đã lưu trước đó.
          </p>
          <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-emerald-700" />
            <span>Chọn file sao lưu (.json) để khôi phục</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </label>
        </div>

      </div>

      {/* Row 2: PIN Lock & Security Configuration */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Shield className="w-5 h-5 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Bảo mật thông tin học sinh & Mã PIN Giáo viên
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Theo Điều 10 của quy chế quản lý lớp học: Không công khai danh sách học sinh, số điện thoại phụ huynh hay ghi chú riêng của GVCN. Thầy/Cô có thể đặt mã PIN (4 chữ số) để khóa màn hình khi rời máy tính hoặc cho người khác mượn điện thoại.
        </p>

        <form onSubmit={handleSaveMeta} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mã PIN bảo vệ riêng tư (4 số):</label>
              <input
                type="password"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="1234"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Mã PIN mặc định: 1234</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tên lớp:</label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Năm học:</label>
              <input
                type="text"
                value={formData.schoolYear}
                onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Giáo viên chủ nhiệm:</label>
              <input
                type="text"
                value={formData.homeroomTeacher}
                onChange={(e) => setFormData({ ...formData, homeroomTeacher: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Lưu thông tin cấu hình</span>
            </button>
          </div>
        </form>
      </div>

      {/* Row 3: Google Drive & Google Sheets Integration Guide */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Hướng dẫn kết nối Google Sheets & Google Apps Script
            </h3>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(appsScriptCode);
              setCopiedCode(true);
              setTimeout(() => setCopiedCode(false), 2500);
            }}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Đã chép mã' : 'Sao chép mã Apps Script'}</span>
          </button>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-1.5">
          <p>
            <strong>Lưu ý bảo mật dữ liệu học sinh THCS:</strong> Khi triển khai liên kết với Google Sheets / Google Drive, Thầy/Cô cần thiết lập quyền truy cập bảng tính ở chế độ <em>"Riêng tư (Chỉ chia sẻ cho tài khoản của giáo viên)"</em>, không đặt ở chế độ <em>"Bất kỳ ai có đường liên kết"</em> nhằm bảo vệ số điện thoại và thông tin đời sống riêng của học sinh theo Luật Trẻ em và quy định Bộ GD&ĐT.
          </p>
        </div>

        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-48">
          <pre>{appsScriptCode}</pre>
        </div>
      </div>

      {/* Row 4: Danger Zone - Reset to Initial 26 Blank Rows */}
      <div className="bg-red-50/60 border border-red-200 p-5 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span>Vùng nguy hiểm: Khởi tạo lại dữ liệu về ban đầu</span>
        </div>
        <p className="text-xs text-red-800 leading-relaxed">
          Hành động này sẽ xóa toàn bộ họ tên, điểm danh, điểm số đã nhập và đưa lớp 9/2 về trạng thái <strong>26 dòng trống ban đầu</strong> (gồm 20 vị trí Nam và 6 vị trí Nữ). Vui lòng sao lưu dữ liệu trước khi thực hiện!
        </p>
        <button
          onClick={() => {
            if (confirm('CẢNH BÁO: Thầy/Cô có chắc chắn muốn đặt lại toàn bộ hệ thống về 26 dòng trống ban đầu?')) {
              onResetToDefault();
              showToast('Đã khởi tạo lại hệ thống về 26 dòng trống.');
            }
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
        >
          Đặt lại về 26 dòng trống ban đầu
        </button>
      </div>

      {/* Toast Notification */}
      {statusToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{statusToast}</span>
        </div>
      )}

    </div>
  );
};
