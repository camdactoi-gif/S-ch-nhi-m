import React from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertTriangle, 
  HeartHandshake, 
  Award, 
  FileSpreadsheet, 
  Calendar, 
  ArrowRight, 
  Upload, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Student, AttendanceRecord, IncidentRecord, DropoutRiskRecord } from '../types';
import { NavTabId } from './Navigation';

interface DashboardProps {
  students: Student[];
  attendance: AttendanceRecord[];
  incidents: IncidentRecord[];
  dropoutRisks: DropoutRiskRecord[];
  selectedDate: string;
  onNavigate: (tab: NavTabId) => void;
  onOpenImport: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  attendance,
  incidents,
  dropoutRisks,
  selectedDate,
  onNavigate,
  onOpenImport,
}) => {
  // Statistics calculations
  const total = students.length;
  const maleCount = students.filter(s => s.gender === 'Nam').length;
  const femaleCount = students.filter(s => s.gender === 'Nữ').length;
  const namedCount = students.filter(s => s.fullName.trim() !== '').length;

  // Attendance for selected date
  const todayAttendance = attendance.filter(a => a.date === selectedDate);
  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const excusedCount = todayAttendance.filter(a => a.status === 'excused').length;
  const unexcusedCount = todayAttendance.filter(a => a.status === 'unexcused').length;
  const lateCount = todayAttendance.filter(a => a.status === 'late').length;
  const truantCount = todayAttendance.filter(a => a.status === 'truant').length;
  
  // Unrecorded count for today
  const recordedStudentIds = new Set(todayAttendance.map(a => a.studentId));
  const unrecordedCount = total - recordedStudentIds.size;

  // Special needs & Dropout risk
  const specialNeedsStudents = students.filter(s => s.specialNeeds);
  const activeDropoutRisks = dropoutRisks.filter(r => r.status !== 'Đã ổn định đi học lại');

  // Weekly incidents & merits (within last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoStr = oneWeekAgo.toISOString().slice(0, 10);

  const weeklyMerits = incidents.filter(i => 
    (i.type === 'Khen thưởng' || i.type === 'Tiến bộ') && i.date >= oneWeekAgoStr
  );
  const weeklyViolations = incidents.filter(i => 
    (i.type === 'Vi phạm nội quy' || i.type === 'Sự việc cần can thiệp') && i.date >= oneWeekAgoStr
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Notice banner if names are not yet entered */}
      {namedCount < total && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0 mt-0.5">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-amber-950">
                Lớp có {total - namedCount} dòng học sinh trống chưa nhập thông tin
              </h2>
              <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                Đã khởi tạo đúng 26 vị trí (20 Nam, 6 Nữ). Thầy/Cô có thể nhập trực tiếp từng em hoặc nhập hàng loạt nhanh từ file Excel.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={onOpenImport}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-amber-900 bg-white border border-amber-300 hover:bg-amber-100 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              Nhập từ Excel
            </button>
            <button
              onClick={() => onNavigate('students')}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              Điền danh sách
            </button>
          </div>
        </div>
      )}

      {/* Row 1: Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Sĩ số lớp */}
        <div 
          onClick={() => onNavigate('students')}
          className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-4 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Sĩ số lớp 9/2</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {total} <span className="text-xs font-normal text-slate-500">học sinh</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
            <span className="text-blue-700 font-medium">Nam: <strong className="font-mono tabular-nums">{maleCount}</strong></span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-pink-700 font-medium">Nữ: <strong className="font-mono tabular-nums">{femaleCount}</strong></span>
          </div>
        </div>

        {/* Card 2: Chuyên cần hôm nay */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="bg-white border border-slate-200 hover:border-emerald-300 rounded-xl p-4 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Có mặt hôm nay</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono tabular-nums">
            {presentCount} <span className="text-xs font-normal text-slate-500">/ {total}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
            {excusedCount > 0 && <span className="text-amber-700 font-medium">Phép: <strong className="font-mono tabular-nums">{excusedCount}</strong></span>}
            {unexcusedCount > 0 && <span className="text-red-700 font-medium">Không phép: <strong className="font-mono tabular-nums">{unexcusedCount}</strong></span>}
            {lateCount > 0 && <span className="text-orange-700 font-medium">Muộn: <strong className="font-mono tabular-nums">{lateCount}</strong></span>}
            {excusedCount === 0 && unexcusedCount === 0 && lateCount === 0 && (
              <span className="text-slate-500">{unrecordedCount > 0 ? `Chưa điểm danh: ${unrecordedCount}` : 'Chuyên cần đầy đủ'}</span>
            )}
          </div>
        </div>

        {/* Card 3: Cần theo dõi đặc biệt */}
        <div 
          onClick={() => onNavigate('students')}
          className="bg-white border border-slate-200 hover:border-sky-300 rounded-xl p-4 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Theo dõi đặc biệt</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-sky-800 font-mono tabular-nums">
            {specialNeedsStudents.length} <span className="text-xs font-normal text-slate-500">học sinh</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 truncate">
            Sức khỏe, tâm lý, hoàn cảnh đặc biệt
          </p>
        </div>

        {/* Card 4: Nguy cơ bỏ học */}
        <div 
          onClick={() => onNavigate('dropout')}
          className="bg-white border border-slate-200 hover:border-amber-300 rounded-xl p-4 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Nguy cơ bỏ học</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-700 font-mono tabular-nums">
            {activeDropoutRisks.length} <span className="text-xs font-normal text-slate-500">trường hợp</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 truncate">
            {activeDropoutRisks.length > 0 ? 'Đang được GVCN & Nhà trường vận động' : 'Chưa phát hiện nguy cơ'}
          </p>
        </div>

      </div>

      {/* Row 2: Today's Attendance Overview Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Điểm danh ngày {selectedDate}</h2>
              {unrecordedCount > 0 ? (
                <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                  Còn {unrecordedCount} em chưa chốt
                </span>
              ) : (
                <span className="text-xs font-medium px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Đã hoàn thành
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Thống kê tình hình hiện diện, nghỉ phép và đi muộn của 26 học sinh
            </p>
          </div>
          
          <button
            onClick={() => onNavigate('attendance')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <span>Vào sổ điểm danh chi tiết</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Detailed Breakdown Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
          <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg">
            <span className="text-xs text-emerald-800 font-medium">Có mặt</span>
            <div className="text-xl font-bold text-emerald-900 font-mono tabular-nums mt-0.5">
              {presentCount}
            </div>
            <span className="text-[11px] text-emerald-700">Đúng giờ tại lớp</span>
          </div>

          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg">
            <span className="text-xs text-blue-800 font-medium">Nghỉ có phép</span>
            <div className="text-xl font-bold text-blue-900 font-mono tabular-nums mt-0.5">
              {excusedCount}
            </div>
            <span className="text-[11px] text-blue-700">Phụ huynh đã xin phép</span>
          </div>

          <div className="p-3 bg-red-50/60 border border-red-100 rounded-lg">
            <span className="text-xs text-red-800 font-medium">Nghỉ không phép</span>
            <div className="text-xl font-bold text-red-900 font-mono tabular-nums mt-0.5">
              {unexcusedCount}
            </div>
            <span className="text-[11px] text-red-700">Cần liên hệ gia đình ngay</span>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg">
            <span className="text-xs text-amber-800 font-medium">Đi muộn</span>
            <div className="text-xl font-bold text-amber-900 font-mono tabular-nums mt-0.5">
              {lateCount}
            </div>
            <span className="text-[11px] text-amber-700">Đến sau giờ vào lớp</span>
          </div>

          <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-lg">
            <span className="text-xs text-purple-800 font-medium">Bỏ tiết</span>
            <div className="text-xl font-bold text-purple-900 font-mono tabular-nums mt-0.5">
              {truantCount}
            </div>
            <span className="text-[11px] text-purple-700">Vắng tiết không lý do</span>
          </div>
        </div>
      </div>

      {/* Row 3: Dual Column - Weekly Highlights & Attention List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Tình hình nề nếp & Thành tích trong tuần */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Thành tích & Vi phạm trong tuần
                </h3>
              </div>
              <button
                onClick={() => onNavigate('conduct')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Sổ rèn luyện →
              </button>
            </div>

            <div className="space-y-4 pt-3">
              {/* Thành tích / khen thưởng */}
              <div>
                <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Khen thưởng & Biểu dương ({weeklyMerits.length})
                </span>
                {weeklyMerits.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    Chưa có ghi nhận thành tích hoặc điểm cộng mới trong 7 ngày qua.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {weeklyMerits.slice(0, 3).map((item) => {
                      const st = students.find(s => s.id === item.studentId);
                      return (
                        <div key={item.id} className="text-xs p-2 bg-emerald-50/50 border border-emerald-100 rounded-lg flex items-start justify-between">
                          <div>
                            <span className="font-semibold text-emerald-950">
                              {st?.fullName || `Học sinh STT ${st?.stt || '?'}`}:
                            </span>{' '}
                            <span className="text-slate-700">{item.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0 font-mono">{item.date}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Vi phạm cần nhắc nhở */}
              <div>
                <span className="text-xs font-semibold text-red-800 flex items-center gap-1 mb-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  Vi phạm nội quy cần phối hợp ({weeklyViolations.length})
                </span>
                {weeklyViolations.length === 0 ? (
                  <p className="text-xs text-emerald-700 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                    Nề nếp tuần này rất tốt, chưa có sự việc vi phạm nội quy.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {weeklyViolations.slice(0, 3).map((item) => {
                      const st = students.find(s => s.id === item.studentId);
                      return (
                        <div key={item.id} className="text-xs p-2 bg-red-50/50 border border-red-100 rounded-lg flex items-start justify-between">
                          <div>
                            <span className="font-semibold text-red-950">
                              {st?.fullName || `Học sinh STT ${st?.stt || '?'}`}:
                            </span>{' '}
                            <span className="text-slate-700">{item.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0 font-mono">{item.date}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => onNavigate('conduct')}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              + Ghi sự việc mới vào sổ theo dõi
            </button>
          </div>
        </div>

        {/* Right: Học sinh cần quan tâm & Phòng ngừa bỏ học */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Học sinh cần hỗ trợ & Nguy cơ bỏ học
                </h3>
              </div>
              <button
                onClick={() => onNavigate('dropout')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Hồ sơ vận động →
              </button>
            </div>

            <div className="space-y-3 pt-3">
              {activeDropoutRisks.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                  <p className="text-xs text-slate-600 font-medium">
                    Hiện tại chưa có học sinh nào nằm trong danh sách nguy cơ bỏ học.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Hệ thống sẽ hỗ trợ cảnh báo khi học sinh nghỉ học nhiều ngày (không phép ≥ 3 buổi) hoặc hoàn cảnh gia đình khó khăn.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeDropoutRisks.slice(0, 3).map((item) => {
                    const st = students.find(s => s.id === item.studentId);
                    return (
                      <div key={item.id} className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-amber-950">
                            {st?.fullName || `Học sinh STT ${st?.stt || '?'}`} ({st?.gender})
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md">
                            {item.warningLevel}
                          </span>
                        </div>
                        <p className="text-slate-700">
                          <strong className="text-slate-900">Nguyên nhân:</strong> {item.primaryRiskReason}
                        </p>
                        <p className="text-slate-600 mt-1">
                          <strong className="text-slate-800">Biện pháp:</strong> {item.advocacyMeasures || 'Đang xác minh gia đình'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Tiêu chuẩn đánh giá bảo mật, nhân văn
            </span>
            <button
              onClick={() => onNavigate('parents')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Xem sổ liên lạc phụ huynh →
            </button>
          </div>
        </div>

      </div>

      {/* Row 4: Quick Action Hub */}
      <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Thao tác nhanh dành cho Giáo viên chủ nhiệm 9/2
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Tất cả các chức năng được thiết kế nút bấm lớn, thuận tiện bấm ngoài sân trường, trên điện thoại hay máy tính.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('attendance')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors shadow-xs"
            >
              Điểm danh một chạm
            </button>
            <button
              onClick={() => onNavigate('parents')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
            >
              Nhắn tin phụ huynh
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              In / Xuất Excel
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
