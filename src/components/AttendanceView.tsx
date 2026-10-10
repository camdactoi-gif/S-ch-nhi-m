import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CheckCheck, 
  Check, 
  Download, 
  AlertTriangle, 
  History, 
  Clock, 
  Filter, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { Student, AttendanceRecord, AttendanceStatus } from '../types';
import { ExcelService } from '../utils/excel';

interface AttendanceViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  attendance,
  selectedDate,
  onSelectDate,
  onUpdateAttendance,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'summary'>('daily');
  const [filterOnlyAbsent, setFilterOnlyAbsent] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Status definition with pedagogical Vietnamese labels
  const statuses: { key: AttendanceStatus; label: string; short: string; color: string; activeColor: string }[] = [
    { key: 'present', label: 'Có mặt', short: 'CM', color: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100', activeColor: 'bg-emerald-600 text-white border-emerald-600' },
    { key: 'excused', label: 'Nghỉ có phép', short: 'CP', color: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100', activeColor: 'bg-blue-600 text-white border-blue-600' },
    { key: 'unexcused', label: 'Nghỉ không phép', short: 'KP', color: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100', activeColor: 'bg-red-600 text-white border-red-600' },
    { key: 'late', label: 'Đi muộn', short: 'DM', color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100', activeColor: 'bg-amber-600 text-white border-amber-600' },
    { key: 'truant', label: 'Bỏ tiết', short: 'BT', color: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100', activeColor: 'bg-purple-600 text-white border-purple-600' },
  ];

  // Shift date helper
  const shiftDate = (days: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    onSelectDate(cur.toISOString().slice(0, 10));
  };

  // Set today
  const setToday = () => {
    onSelectDate(new Date().toISOString().slice(0, 10));
  };

  // Get status of a student for current date
  const getStudentStatus = (studentId: string): AttendanceStatus => {
    const record = attendance.find(a => a.studentId === studentId && a.date === selectedDate);
    return record?.status || 'present'; // Default to present
  };

  const getStudentNote = (studentId: string): string => {
    const record = attendance.find(a => a.studentId === studentId && a.date === selectedDate);
    return record?.note || '';
  };

  // Mark status for one student
  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    const existingIndex = attendance.findIndex(a => a.studentId === studentId && a.date === selectedDate);
    let updated: AttendanceRecord[];

    if (existingIndex >= 0) {
      updated = [...attendance];
      updated[existingIndex] = {
        ...updated[existingIndex],
        status,
      };
    } else {
      updated = [
        ...attendance,
        {
          date: selectedDate,
          studentId,
          status,
          note: '',
        }
      ];
    }
    onUpdateAttendance(updated);
  };

  // Change note for student on current date
  const handleNoteChange = (studentId: string, note: string) => {
    const existingIndex = attendance.findIndex(a => a.studentId === studentId && a.date === selectedDate);
    let updated: AttendanceRecord[];

    if (existingIndex >= 0) {
      updated = [...attendance];
      updated[existingIndex] = {
        ...updated[existingIndex],
        note,
      };
    } else {
      updated = [
        ...attendance,
        {
          date: selectedDate,
          studentId,
          status: 'present',
          note,
        }
      ];
    }
    onUpdateAttendance(updated);
  };

  // Batch action: Mark all present
  const handleMarkAllPresent = () => {
    // Keep existing notes or create present records
    const otherDates = attendance.filter(a => a.date !== selectedDate);
    const todayRecords: AttendanceRecord[] = students.map(s => {
      const existing = attendance.find(a => a.studentId === s.id && a.date === selectedDate);
      return {
        date: selectedDate,
        studentId: s.id,
        status: 'present',
        note: existing?.note || '',
      };
    });

    onUpdateAttendance([...otherDates, ...todayRecords]);
    setSaveSuccessMsg(`Đã đánh dấu tất cả 26 học sinh có mặt ngày ${selectedDate}`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Counts for current date
  const counts = {
    present: students.filter(s => getStudentStatus(s.id) === 'present').length,
    excused: students.filter(s => getStudentStatus(s.id) === 'excused').length,
    unexcused: students.filter(s => getStudentStatus(s.id) === 'unexcused').length,
    late: students.filter(s => getStudentStatus(s.id) === 'late').length,
    truant: students.filter(s => getStudentStatus(s.id) === 'truant').length,
  };

  // Format date display
  const dateObj = new Date(selectedDate);
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = isNaN(dateObj.getTime()) ? '' : daysOfWeek[dateObj.getDay()];

  // Monthly & Semester summary per student
  const studentStats = students.map(student => {
    const studentRecords = attendance.filter(a => a.studentId === student.id);
    
    // This month records
    const currentMonthPrefix = selectedDate.slice(0, 7); // YYYY-MM
    const monthRecords = studentRecords.filter(a => a.date.startsWith(currentMonthPrefix));

    const totalExcused = studentRecords.filter(a => a.status === 'excused').length;
    const totalUnexcused = studentRecords.filter(a => a.status === 'unexcused').length;
    const totalLate = studentRecords.filter(a => a.status === 'late').length;
    const totalTruant = studentRecords.filter(a => a.status === 'truant').length;

    const monthExcused = monthRecords.filter(a => a.status === 'excused').length;
    const monthUnexcused = monthRecords.filter(a => a.status === 'unexcused').length;
    const monthLate = monthRecords.filter(a => a.status === 'late').length;

    return {
      student,
      monthExcused,
      monthUnexcused,
      monthLate,
      totalExcused,
      totalUnexcused,
      totalLate,
      totalTruant,
      totalAbsences: totalExcused + totalUnexcused,
      isHighRisk: totalUnexcused >= 3 || (totalExcused + totalUnexcused) >= 7,
    };
  });

  return (
    <div className="space-y-5 pb-16">
      
      {/* Subtab Navigation: Daily vs Summary */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveSubTab('daily')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${
              activeSubTab === 'daily' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Điểm danh theo ngày
          </button>
          <button
            onClick={() => setActiveSubTab('summary')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${
              activeSubTab === 'summary' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tổng hợp chuyên cần (Tuần / Tháng / Kỳ)
          </button>
        </div>

        <button
          onClick={() => ExcelService.exportAttendanceToExcel(students, attendance)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Xuất sổ điểm danh ra Excel</span>
        </button>
      </div>

      {activeSubTab === 'daily' ? (
        <>
          {/* Date Picker Bar & Quick Batch Button */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              
              {/* Date controller */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => shiftDate(-1)}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                  title="Ngày trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => onSelectDate(e.target.value)}
                    className="font-medium text-xs sm:text-sm bg-transparent border-none focus:outline-hidden text-slate-900"
                  />
                  <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                    ({dayName})
                  </span>
                </div>

                <button
                  onClick={() => shiftDate(1)}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                  title="Ngày sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={setToday}
                  className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  Hôm nay
                </button>
              </div>

              {/* Fast "All Present" Batch Action */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllPresent}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Tất cả có mặt (26/26)</span>
                </button>

                <button
                  onClick={() => setFilterOnlyAbsent(!filterOnlyAbsent)}
                  className={`px-3 py-2.5 text-xs font-semibold rounded-xl border transition-colors ${
                    filterOnlyAbsent 
                      ? 'bg-amber-100 text-amber-900 border-amber-300' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {filterOnlyAbsent ? 'Hiển thị tất cả' : 'Lọc học sinh vắng/muộn'}
                </button>
              </div>

            </div>

            {/* Instruction banner */}
            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              * Hướng dẫn: Bấm nút <strong>"Tất cả có mặt"</strong> để đánh dấu nhanh toàn bộ 26 em, sau đó Thầy/Cô chỉ cần bấm đổi trạng thái đối với các học sinh nghỉ phép, không phép hoặc đi muộn.
            </p>

            {/* Daily summary badges */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-slate-100 text-xs">
              <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                <span className="text-emerald-800">Có mặt:</span>{' '}
                <strong className="text-emerald-900 font-mono tabular-nums text-sm">{counts.present}</strong>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100 text-center">
                <span className="text-blue-800">Có phép:</span>{' '}
                <strong className="text-blue-900 font-mono tabular-nums text-sm">{counts.excused}</strong>
              </div>
              <div className="p-2 bg-red-50 rounded-lg border border-red-100 text-center">
                <span className="text-red-800">Không phép:</span>{' '}
                <strong className="text-red-900 font-mono tabular-nums text-sm">{counts.unexcused}</strong>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 text-center">
                <span className="text-amber-800">Đi muộn:</span>{' '}
                <strong className="text-amber-900 font-mono tabular-nums text-sm">{counts.late}</strong>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg border border-purple-100 text-center">
                <span className="text-purple-800">Bỏ tiết:</span>{' '}
                <strong className="text-purple-900 font-mono tabular-nums text-sm">{counts.truant}</strong>
              </div>
            </div>
          </div>

          {/* Daily Table with Big Touch Buttons */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-3 w-12 text-center">STT</th>
                    <th className="py-3 px-4 min-w-[180px]">Họ và Tên học sinh</th>
                    <th className="py-3 px-3 w-16 text-center">Phái</th>
                    <th className="py-3 px-4 min-w-[360px] text-center">Trạng thái điểm danh (Chọn một chạm)</th>
                    <th className="py-3 px-4 min-w-[200px]">Lý do / Ghi chú buổi học</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students
                    .filter(s => {
                      if (!filterOnlyAbsent) return true;
                      const st = getStudentStatus(s.id);
                      return st !== 'present';
                    })
                    .map((student) => {
                      const currentStatus = getStudentStatus(student.id);
                      const currentNote = getStudentNote(student.id);
                      const isUnexcused = currentStatus === 'unexcused';

                      return (
                        <tr 
                          key={student.id} 
                          className={`hover:bg-slate-50 transition-colors ${
                            isUnexcused ? 'bg-red-50/40' : currentStatus !== 'present' ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-center font-mono font-medium text-slate-600 tabular-nums">
                            {student.stt}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                              {student.fullName || `(Học sinh STT ${student.stt})`}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              Mã: {student.studentCode}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className={`text-[11px] font-semibold ${
                              student.gender === 'Nữ' ? 'text-pink-700' : 'text-blue-700'
                            }`}>
                              {student.gender}
                            </span>
                          </td>

                          {/* Large touch-friendly status buttons */}
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
                              {statuses.map((st) => {
                                const isSelected = currentStatus === st.key;
                                return (
                                  <button
                                    key={st.key}
                                    type="button"
                                    onClick={() => handleSetStatus(student.id, st.key)}
                                    className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer min-h-[36px] sm:min-h-[40px] flex items-center gap-1 ${
                                      isSelected ? st.activeColor + ' shadow-xs' : st.color
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3 h-3 shrink-0" />}
                                    <span>{st.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </td>

                          {/* Note input */}
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={currentNote}
                              onChange={(e) => handleNoteChange(student.id, e.target.value)}
                              placeholder="Lý do vắng, đi muộn, phụ huynh xin..."
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                            />
                          </td>

                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Summary Table across week, month, semester */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Bảng tổng hợp chuyên cần Lớp 9/2
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Thống kê số buổi nghỉ có phép, không phép, đi muộn và cảnh báo học sinh có nguy cơ gián đoạn học tập.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-3 px-3 text-center w-12">STT</th>
                  <th className="py-3 px-4 min-w-[180px]">Họ và Tên</th>
                  <th className="py-3 px-2 text-center">Giới tính</th>
                  <th className="py-3 px-3 text-center bg-blue-50/50">Phép (Tháng này)</th>
                  <th className="py-3 px-3 text-center bg-red-50/50">KP (Tháng này)</th>
                  <th className="py-3 px-3 text-center bg-amber-50/50">Muộn (Tháng này)</th>
                  <th className="py-3 px-3 text-center font-bold text-slate-900">Tổng nghỉ (HK)</th>
                  <th className="py-3 px-3 text-center text-red-700 font-bold">Tổng KP (HK)</th>
                  <th className="py-3 px-3 text-center text-amber-700">Tổng muộn (HK)</th>
                  <th className="py-3 px-3 text-center">Tình trạng chuyên cần</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentStats.map((item) => (
                  <tr 
                    key={item.student.id} 
                    className={`hover:bg-slate-50 transition-colors ${
                      item.isHighRisk ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-600">
                      {item.student.stt}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {item.student.fullName || `Học sinh STT ${item.student.stt}`}
                    </td>
                    <td className="py-3 px-2 text-center text-slate-600 font-medium">
                      {item.student.gender}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-blue-700">
                      {item.monthExcused}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-red-700 font-semibold">
                      {item.monthUnexcused}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-amber-700">
                      {item.monthLate}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-slate-900">
                      {item.totalAbsences}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-red-700">
                      {item.totalUnexcused}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-amber-700">
                      {item.totalLate}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.totalUnexcused >= 3 ? (
                        <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> KP ≥ 3 (Nguy cơ)
                        </span>
                      ) : item.totalAbsences >= 5 ? (
                        <span className="text-[11px] font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                          Nghỉ nhiều
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium">
                          Bình thường
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating Save Notification */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

    </div>
  );
};
