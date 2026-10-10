import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  PieChart, 
  Users, 
  Calendar, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  School 
} from 'lucide-react';
import { Student, AttendanceRecord, IncidentRecord, DropoutRiskRecord, ClassMetadata } from '../types';
import { ExcelService } from '../utils/excel';

interface ReportsViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  incidents: IncidentRecord[];
  dropoutRisks: DropoutRiskRecord[];
  metadata: ClassMetadata;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  attendance,
  incidents,
  dropoutRisks,
  metadata,
}) => {
  const [reportType, setReportType] = useState<'demographics' | 'attendance' | 'conduct' | 'dropout'>('demographics');

  // Calculations
  const total = students.length;
  const maleCount = students.filter(s => s.gender === 'Nam').length;
  const femaleCount = students.filter(s => s.gender === 'Nữ').length;
  const boardingCount = students.filter(s => s.isBoarding).length;

  // Family status counts
  const poorCount = students.filter(s => s.familyStatus === 'Hộ nghèo').length;
  const nearPoorCount = students.filter(s => s.familyStatus === 'Hộ cận nghèo').length;
  const orphanCount = students.filter(s => s.familyStatus === 'Mồ côi').length;
  const parentsAwayCount = students.filter(s => s.familyStatus === 'Bố mẹ đi làm xa').length;

  // Ethnicity counts
  const ethnicityCounts = students.reduce((acc, s) => {
    const eth = s.ethnicity || 'Kinh';
    acc[eth] = (acc[eth] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Attendance stats
  const totalExcused = attendance.filter(a => a.status === 'excused').length;
  const totalUnexcused = attendance.filter(a => a.status === 'unexcused').length;
  const totalLate = attendance.filter(a => a.status === 'late').length;
  const totalTruant = attendance.filter(a => a.status === 'truant').length;
  const uniqueDatesCount = new Set(attendance.map(a => a.date)).size || 1;

  // Merits & Violations
  const merits = incidents.filter(i => i.type === 'Khen thưởng' || i.type === 'Tiến bộ');
  const violations = incidents.filter(i => i.type === 'Vi phạm nội quy');
  const needingSupport = incidents.filter(i => i.status === 'Cần phối hợp thêm');

  return (
    <div className="space-y-5 pb-16">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs no-print">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <span>Báo cáo & Tổng hợp Sổ chủ nhiệm Lớp 9/2</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp sĩ số, chuyên cần, nề nếp rèn luyện và xuất dữ liệu lưu trữ / in ấn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In báo cáo (A4)</span>
          </button>

          <button
            onClick={() => ExcelService.exportStudentsToExcel(students)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel hồ sơ lớp</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs (no-print) */}
      <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto no-print">
        {[
          { id: 'demographics', label: '1. Thống kê sĩ số & Cơ cấu lớp' },
          { id: 'attendance', label: '2. Báo cáo chuyên cần' },
          { id: 'conduct', label: '3. Nề nếp & Khen thưởng' },
          { id: 'dropout', label: '4. Phòng ngừa bỏ học' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as typeof reportType)}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              reportType === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        
        {/* Official Header */}
        <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900">
          <div className="flex justify-between items-start text-xs text-slate-600 pb-2">
            <div>
              <p className="font-bold uppercase text-slate-900">{metadata.schoolName.toUpperCase()}</p>
              <p className="font-medium">LỚP CHỦ NHIỆM: {metadata.className}</p>
            </div>
            <div className="text-right">
              <p className="font-bold uppercase text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="font-medium">Độc lập - Tự do - Hạnh phúc</p>
            </div>
          </div>
          <h1 className="text-lg sm:text-xl font-bold uppercase text-slate-900 pt-2 tracking-wide">
            BÁO CÁO CÔNG TÁC CHỦ NHIỆM LỚP {metadata.className}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-indigo-700">
            NĂM HỌC {metadata.schoolYear}
          </p>
          <p className="text-xs text-slate-500 italic">
            (Dữ liệu cập nhật tự động tính đến ngày {new Date().toLocaleDateString('vi-VN')})
          </p>
        </div>

        {/* SECTION 1: Thống kê sĩ số */}
        {(reportType === 'demographics' || true) && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-1">
              I. TỔNG HỢP SĨ SỐ VÀ CƠ CẤU HỌC SINH
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border rounded-lg">
                <span className="text-slate-500">Tổng số học sinh:</span>
                <div className="text-xl font-bold font-mono text-slate-900">{total} em</div>
                <span className="text-[11px] text-slate-500">100% chỉ tiêu</span>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg">
                <span className="text-blue-800 font-medium">Học sinh Nam:</span>
                <div className="text-xl font-bold font-mono text-blue-900">{maleCount} em</div>
                <span className="text-[11px] text-blue-700">{((maleCount / total) * 100).toFixed(1)}% sĩ số</span>
              </div>

              <div className="p-3 bg-pink-50/60 border border-pink-100 rounded-lg">
                <span className="text-pink-800 font-medium">Học sinh Nữ:</span>
                <div className="text-xl font-bold font-mono text-pink-900">{femaleCount} em</div>
                <span className="text-[11px] text-pink-700">{((femaleCount / total) * 100).toFixed(1)}% sĩ số</span>
              </div>

              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg">
                <span className="text-indigo-800 font-medium">Học sinh Bán trú:</span>
                <div className="text-xl font-bold font-mono text-indigo-900">{boardingCount} em</div>
                <span className="text-[11px] text-indigo-700">{((boardingCount / total) * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-3 bg-slate-50 rounded-lg border">
                <strong className="block text-slate-800 mb-1">Cơ cấu hoàn cảnh gia đình:</strong>
                <ul className="space-y-1 text-slate-600">
                  <li>• Hộ nghèo: <strong>{poorCount}</strong> em</li>
                  <li>• Hộ cận nghèo: <strong>{nearPoorCount}</strong> em</li>
                  <li>• Mồ côi / Khó khăn đặc biệt: <strong>{orphanCount}</strong> em</li>
                  <li>• Bố mẹ đi làm xa (ở với ông bà): <strong>{parentsAwayCount}</strong> em</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border">
                <strong className="block text-slate-800 mb-1">Thành phần dân tộc:</strong>
                <ul className="space-y-1 text-slate-600">
                  {Object.entries(ethnicityCounts).map(([eth, count]) => (
                    <li key={eth}>• Dân tộc {eth}: <strong>{count}</strong> em ({((count / total) * 100).toFixed(1)}%)</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Báo cáo chuyên cần */}
        {(reportType === 'attendance' || true) && (
          <div className="space-y-3 pt-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-1">
              II. TỔNG HỢP CHUYÊN CẦN VÀ NGHỈ HỌC
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-blue-50/50 border rounded-lg">
                <span className="text-slate-600">Tổng buổi nghỉ có phép:</span>
                <div className="text-lg font-bold font-mono text-blue-900">{totalExcused} buổi</div>
              </div>

              <div className="p-3 bg-red-50/50 border rounded-lg">
                <span className="text-slate-600">Nghỉ không phép (KP):</span>
                <div className="text-lg font-bold font-mono text-red-900">{totalUnexcused} buổi</div>
              </div>

              <div className="p-3 bg-amber-50/50 border rounded-lg">
                <span className="text-slate-600">Tổng lượt đi muộn:</span>
                <div className="text-lg font-bold font-mono text-amber-900">{totalLate} lượt</div>
              </div>

              <div className="p-3 bg-purple-50/50 border rounded-lg">
                <span className="text-slate-600">Tổng lượt bỏ tiết:</span>
                <div className="text-lg font-bold font-mono text-purple-900">{totalTruant} lượt</div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Nề nếp & Khen thưởng */}
        {(reportType === 'conduct' || true) && (
          <div className="space-y-3 pt-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-1">
              III. THÀNH TÍCH KHEN THƯỞNG VÀ XỬ LÝ SỰ VIỆC NỀ NẾP
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                <strong className="text-emerald-900 block mb-1">
                  Khen thưởng & Ghi nhận tiến bộ ({merits.length})
                </strong>
                {merits.length === 0 ? (
                  <p className="text-slate-400 italic">Chưa ghi nhận</p>
                ) : (
                  <ul className="space-y-1 text-slate-700">
                    {merits.map(m => {
                      const st = students.find(s => s.id === m.studentId);
                      return (
                        <li key={m.id}>
                          • <strong>{st?.fullName || `Học sinh ${st?.stt}`}:</strong> {m.title} ({m.date})
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="p-3 bg-slate-50 border rounded-lg">
                <strong className="text-slate-900 block mb-1">
                  Vi phạm nội quy & Tình huống đã can thiệp ({violations.length})
                </strong>
                {violations.length === 0 ? (
                  <p className="text-slate-400 italic">Lớp thực hiện tốt nề nếp</p>
                ) : (
                  <ul className="space-y-1 text-slate-700">
                    {violations.map(v => {
                      const st = students.find(s => s.id === v.studentId);
                      return (
                        <li key={v.id}>
                          • <strong>{st?.fullName || `Học sinh ${st?.stt}`}:</strong> {v.title} ({v.result || 'Đã giải quyết'})
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: Phòng ngừa bỏ học */}
        {(reportType === 'dropout' || true) && (
          <div className="space-y-3 pt-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-1">
              IV. CÔNG TÁC PHÒNG NGỪA BỎ HỌC & HỖ TRỢ HỌC SINH
            </h3>

            <p className="text-xs text-slate-600">
              Hiện lớp có <strong>{dropoutRisks.length}</strong> học sinh thuộc danh sách theo dõi và vận động. GVCN đã chủ động kết hợp cùng gia đình, Ban giám hiệu và chính quyền địa phương triển khai các giải pháp nhân văn để giúp các em duy trì việc học.
            </p>

            {dropoutRisks.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-800 font-semibold">
                    <tr>
                      <th className="p-2">Học sinh</th>
                      <th className="p-2">Nguyên nhân</th>
                      <th className="p-2">Biện pháp đã thực hiện</th>
                      <th className="p-2">Kết quả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dropoutRisks.map(r => {
                      const st = students.find(s => s.id === r.studentId);
                      return (
                        <tr key={r.id}>
                          <td className="p-2 font-semibold text-slate-900">{st?.fullName || `Học sinh ${st?.stt}`}</td>
                          <td className="p-2 text-slate-700">{r.primaryRiskReason}</td>
                          <td className="p-2 text-slate-700">{r.advocacyMeasures || 'Thăm nhà, động viên'}</td>
                          <td className="p-2 font-medium text-emerald-800">{r.status}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Signature Box */}
        <div className="pt-8 flex justify-between text-xs text-center border-t border-slate-200">
          <div>
            <p className="font-bold text-slate-800 uppercase">BAN GIÁM HIỆU PHÊ DUYỆT</p>
            <p className="text-[10px] text-slate-400 italic">(Ký và đóng dấu)</p>
          </div>

          <div>
            <p className="text-slate-500 italic">..., Ngày ... tháng ... năm 2026</p>
            <p className="font-bold text-slate-800 uppercase mt-1">GIÁO VIÊN CHỦ NHIỆM LỚP 9/2</p>
            <p className="text-[10px] text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
          </div>
        </div>

      </div>

    </div>
  );
};
