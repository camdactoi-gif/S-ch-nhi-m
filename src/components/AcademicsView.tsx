import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Download, 
  Save, 
  Check, 
  AlertCircle, 
  TrendingUp, 
  Award,
  Filter
} from 'lucide-react';
import { Student, SubjectName } from '../types';
import { ALL_SUBJECTS, StorageService } from '../utils/storage';
import * as XLSX from 'xlsx';

interface AcademicsViewProps {
  students: Student[];
  onUpdateStudents: (updated: Student[]) => void;
}

export const AcademicsView: React.FC<AcademicsViewProps> = ({
  students,
  onUpdateStudents,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectName>('Toán');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('midterm1'); // regular, midterm1, final1, midterm2, final2
  const [scores, setScores] = useState<Record<string, Record<string, number>>>(() => StorageService.getAcademics());
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const periods: { id: string; label: string }[] = [
    { id: 'regular', label: 'Điểm kiểm tra thường xuyên' },
    { id: 'midterm1', label: 'Kiểm tra Giữa kỳ I' },
    { id: 'final1', label: 'Kiểm tra Cuối kỳ I' },
    { id: 'midterm2', label: 'Kiểm tra Giữa kỳ II' },
    { id: 'final2', label: 'Kiểm tra Cuối kỳ II' },
  ];

  // Key for student score in this subject & period
  const getScoreKey = (subject: SubjectName, period: string) => `${subject}_${period}`;

  const getScore = (studentId: string): number | '' => {
    const key = getScoreKey(selectedSubject, selectedPeriod);
    const val = scores[studentId]?.[key];
    return val !== undefined && val !== null ? val : '';
  };

  const handleScoreChange = (studentId: string, valStr: string) => {
    const key = getScoreKey(selectedSubject, selectedPeriod);
    const updated = { ...scores };
    if (!updated[studentId]) updated[studentId] = {};

    if (valStr.trim() === '') {
      delete updated[studentId][key];
    } else {
      const num = parseFloat(valStr);
      if (!isNaN(num) && num >= 0 && num <= 10) {
        updated[studentId][key] = num;
      }
    }

    setScores(updated);
    StorageService.saveAcademics(updated);
  };

  const handleSaveAll = () => {
    StorageService.saveAcademics(scores);
    setSaveToast('Đã lưu kết quả điểm kiểm tra thành công!');
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Export scores to Excel
  const handleExportAcademics = () => {
    const key = getScoreKey(selectedSubject, selectedPeriod);
    const periodLabel = periods.find(p => p.id === selectedPeriod)?.label || selectedPeriod;

    const data = students.map(s => ({
      'STT': s.stt,
      'Mã HS': s.studentCode,
      'Họ và Tên': s.fullName || `Học sinh STT ${s.stt}`,
      'Giới tính': s.gender,
      'Môn học': selectedSubject,
      'Đợt đánh giá': periodLabel,
      'Điểm số': scores[s.id]?.[key] ?? 'Chưa nhập',
      'Đánh giá kết quả': s.academicResult,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bang_Diem');
    XLSX.writeFile(wb, `Bang_Diem_${selectedSubject}_${selectedPeriod}_Lop_9_2.xlsx`);
  };

  // Quick statistics for current subject & period
  const key = getScoreKey(selectedSubject, selectedPeriod);
  const studentScoresList = students.map(s => scores[s.id]?.[key]).filter((v): v is number => typeof v === 'number');
  const countScored = studentScoresList.length;
  const avgScore = countScored > 0 ? (studentScoresList.reduce((a, b) => a + b, 0) / countScored).toFixed(1) : '—';
  const goodScoreCount = studentScoresList.filter(s => s >= 8.0).length;
  const passScoreCount = studentScoresList.filter(s => s >= 5.0 && s < 8.0).length;
  const lowScoreCount = studentScoresList.filter(s => s < 5.0).length;

  return (
    <div className="space-y-5 pb-16">
      
      {/* Subject and Period Selectors */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <span>Sổ theo dõi học tập và điểm kiểm tra Lớp 9/2</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi kết quả học tập theo từng môn học và đợt đánh giá theo Thông tư 22/BGDĐT.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAcademics}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất bảng điểm ra Excel</span>
            </button>
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu bảng điểm</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chọn môn học:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_SUBJECTS.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    selectedSubject === sub 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Đợt đánh giá:
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              {periods.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick statistics for this subject */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500">Đã nhập điểm:</span>
            <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
              {countScored} / 26 <span className="text-[11px] font-normal text-slate-400">em</span>
            </div>
          </div>
          <div className="p-2.5 bg-indigo-50/60 rounded-lg border border-indigo-100">
            <span className="text-indigo-800">Điểm trung bình môn:</span>
            <div className="text-base font-bold text-indigo-900 font-mono tabular-nums">
              {avgScore}
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100">
            <span className="text-emerald-800">Điểm Khá - Giỏi (≥ 8.0):</span>
            <div className="text-base font-bold text-emerald-900 font-mono tabular-nums">
              {goodScoreCount} <span className="text-[11px] font-normal text-emerald-700">em</span>
            </div>
          </div>
          <div className="p-2.5 bg-red-50/60 rounded-lg border border-red-100">
            <span className="text-red-800">Cần bồi dưỡng (&lt; 5.0):</span>
            <div className="text-base font-bold text-red-900 font-mono tabular-nums">
              {lowScoreCount} <span className="text-[11px] font-normal text-red-700">em</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Bảng điểm môn {selectedSubject} · {periods.find(p => p.id === selectedPeriod)?.label}
          </span>
          <span className="text-[11px] text-slate-500 italic">
            Nhập thang điểm từ 0.0 đến 10.0
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-3 w-12 text-center">STT</th>
                <th className="py-3 px-3 w-24">Mã HS</th>
                <th className="py-3 px-4 min-w-[200px]">Họ và Tên học sinh</th>
                <th className="py-3 px-3 w-16 text-center">Phái</th>
                <th className="py-3 px-4 w-36 text-center">Điểm số (0 - 10)</th>
                <th className="py-3 px-4 min-w-[150px] text-center">Xếp loại môn (TT22)</th>
                <th className="py-3 px-4 min-w-[200px]">Nhận xét & Tiến bộ của học sinh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((student) => {
                const curScore = getScore(student.id);
                const numScore = typeof curScore === 'number' ? curScore : null;
                const isUnder5 = numScore !== null && numScore < 5.0;

                return (
                  <tr 
                    key={student.id} 
                    className={`hover:bg-slate-50 transition-colors ${
                      isUnder5 ? 'bg-red-50/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-600">
                      {student.stt}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600">
                      {student.studentCode}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {student.fullName || `(Học sinh STT ${student.stt})`}
                    </td>

                    <td className="py-3 px-3 text-center font-semibold text-slate-600">
                      {student.gender}
                    </td>

                    {/* Score input */}
                    <td className="py-2 px-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={curScore}
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                        placeholder="—"
                        className={`w-20 px-2.5 py-1.5 text-center text-sm font-bold font-mono rounded-lg border focus:outline-hidden ${
                          numScore === null
                            ? 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:border-indigo-500'
                            : numScore >= 8.0
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : numScore >= 5.0
                            ? 'bg-blue-50 border-blue-300 text-blue-900'
                            : 'bg-red-50 border-red-300 text-red-900'
                        }`}
                      />
                    </td>

                    {/* Level display */}
                    <td className="py-3 px-4 text-center">
                      {numScore === null ? (
                        <span className="text-slate-400 italic">Chưa có điểm</span>
                      ) : numScore >= 8.0 ? (
                        <span className="text-emerald-700 font-semibold px-2 py-0.5 bg-emerald-50 rounded-md">Tốt / Giỏi</span>
                      ) : numScore >= 6.5 ? (
                        <span className="text-blue-700 font-semibold px-2 py-0.5 bg-blue-50 rounded-md">Khá</span>
                      ) : numScore >= 5.0 ? (
                        <span className="text-slate-700 font-medium px-2 py-0.5 bg-slate-100 rounded-md">Đạt</span>
                      ) : (
                        <span className="text-red-700 font-semibold px-2 py-0.5 bg-red-100 rounded-md">Cần hỗ trợ</span>
                      )}
                    </td>

                    {/* Teacher progress notes */}
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        defaultValue=""
                        placeholder="Ghi nhận nỗ lực, ưu điểm hoặc phần cần bổ trợ..."
                        className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Save Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

    </div>
  );
};
