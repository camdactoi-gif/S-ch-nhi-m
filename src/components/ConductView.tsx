import React, { useState } from 'react';
import { 
  Award, 
  AlertCircle, 
  Plus, 
  CheckCircle2, 
  HeartHandshake, 
  Filter, 
  Clock, 
  FileText, 
  X, 
  Trash2,
  Check,
  Save,
  ShieldCheck
} from 'lucide-react';
import { Student, IncidentRecord } from '../types';

interface ConductViewProps {
  students: Student[];
  incidents: IncidentRecord[];
  onUpdateIncidents: (records: IncidentRecord[]) => void;
}

export const ConductView: React.FC<ConductViewProps> = ({
  students,
  incidents,
  onUpdateIncidents,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStudentId, setFilterStudentId] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New incident form state
  const [newIncident, setNewIncident] = useState<Partial<IncidentRecord>>({
    date: new Date().toISOString().slice(0, 10),
    studentId: students[0]?.id || '',
    type: 'Tiến bộ',
    title: '',
    description: '',
    supportAction: '',
    result: '',
    personInCharge: 'Giáo viên chủ nhiệm 9/2',
    status: 'Đang theo dõi',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncident.title?.trim() || !newIncident.studentId) return;

    const record: IncidentRecord = {
      id: `inc_${Date.now()}`,
      date: newIncident.date || new Date().toISOString().slice(0, 10),
      studentId: newIncident.studentId,
      title: newIncident.title.trim(),
      type: newIncident.type as IncidentRecord['type'],
      description: newIncident.description?.trim() || '',
      supportAction: newIncident.supportAction?.trim() || '',
      result: newIncident.result?.trim() || 'Đang theo dõi tiến triển',
      personInCharge: newIncident.personInCharge?.trim() || 'Giáo viên chủ nhiệm',
      status: newIncident.status as IncidentRecord['status'],
    };

    onUpdateIncidents([record, ...incidents]);
    setIsAddModalOpen(false);
    setNewIncident({
      date: new Date().toISOString().slice(0, 10),
      studentId: students[0]?.id || '',
      type: 'Tiến bộ',
      title: '',
      description: '',
      supportAction: '',
      result: '',
      personInCharge: 'Giáo viên chủ nhiệm 9/2',
      status: 'Đang theo dõi',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Thầy/Cô có chắc chắn muốn xóa bản ghi sự việc này?')) {
      onUpdateIncidents(incidents.filter(i => i.id !== id));
    }
  };

  const handleStatusChange = (id: string, newStatus: IncidentRecord['status']) => {
    const updated = incidents.map(i => i.id === id ? { ...i, status: newStatus } : i);
    onUpdateIncidents(updated);
  };

  // Filtered incidents
  const filtered = incidents.filter(i => {
    const matchType = filterType === 'all' || i.type === filterType;
    const matchStudent = filterStudentId === 'all' || i.studentId === filterStudentId;
    return matchType && matchStudent;
  });

  // Students with incidents requiring support
  const supportStudents = students.filter(s => {
    return incidents.some(i => i.studentId === s.id && i.status === 'Cần phối hợp thêm');
  });

  return (
    <div className="space-y-5 pb-16">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <span>Sổ theo dõi rèn luyện & Tình huống sư phạm Lớp 9/2</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghi nhận ưu điểm, tiến bộ, vi phạm nội quy, biện pháp hỗ trợ và kết quả theo dõi.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi nhận sự việc mới</span>
        </button>
      </div>

      {/* Filter and stats bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phân loại sự việc:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả ({incidents.length})</option>
              <option value="Khen thưởng">Khen thưởng / Biểu dương</option>
              <option value="Tiến bộ">Ghi nhận tiến bộ</option>
              <option value="Vi phạm nội quy">Vi phạm nội quy</option>
              <option value="Sự việc cần can thiệp">Sự việc cần can thiệp sư phạm</option>
              <option value="Gặp khó khăn">Học sinh gặp khó khăn đột xuất</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Học sinh liên quan:
            </label>
            <select
              value={filterStudentId}
              onChange={(e) => setFilterStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả 26 học sinh</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  STT {s.stt}: {s.fullName || `(Học sinh ${s.stt})`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-700">Chưa có bản ghi sự việc nào</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Khi có học sinh được khen thưởng, có tiến bộ vượt bậc hoặc có sự việc nề nếp cần hỗ trợ, Thầy/Cô hãy bấm nút "Ghi nhận sự việc mới" ở trên để lưu vào sổ chủ nhiệm.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const st = students.find(s => s.id === item.studentId);
            const isGood = item.type === 'Khen thưởng' || item.type === 'Tiến bộ';
            const isViolation = item.type === 'Vi phạm nội quy';

            return (
              <div 
                key={item.id} 
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                      isGood 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : isViolation 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.type}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-xs text-slate-500 font-mono tabular-nums">
                      {item.date}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      title="Xóa sự việc"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Học sinh liên quan:</span>{' '}
                  <span className="text-indigo-700 font-medium">
                    {st?.fullName || `Học sinh STT ${st?.stt || '?'}`} (STT {st?.stt}/26 - {st?.gender})
                  </span>
                </div>

                {item.description && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <strong>Nội dung sự việc:</strong> {item.description}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-100">
                    <span className="font-semibold text-blue-900 block mb-0.5">
                      Biện pháp hỗ trợ / Can thiệp của GVCN:
                    </span>
                    <p className="text-slate-700">{item.supportAction || 'Trao đổi riêng, động viên'}</p>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800 block mb-0.5">
                      Kết quả theo dõi sau xử lý:
                    </span>
                    <p className="text-slate-700">{item.result || 'Đang theo dõi tiến bộ'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="text-slate-500">
                    Người phụ trách: <strong>{item.personInCharge}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Trạng thái:</span>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as IncidentRecord['status'])}
                      className={`text-xs font-semibold px-2 py-1 rounded-md border ${
                        item.status === 'Đã giải quyết'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : item.status === 'Cần phối hợp thêm'
                          ? 'bg-red-50 text-red-800 border-red-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      <option value="Đang theo dõi">Đang theo dõi</option>
                      <option value="Đã giải quyết">Đã giải quyết</option>
                      <option value="Cần phối hợp thêm">Cần phối hợp thêm</option>
                    </select>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal: Ghi nhận sự việc mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Ghi nhận tình huống sư phạm & Rèn luyện</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Học sinh *</label>
                  <select
                    required
                    value={newIncident.studentId}
                    onChange={(e) => setNewIncident({ ...newIncident, studentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        STT {s.stt}: {s.fullName || `Học sinh ${s.stt}`} ({s.gender})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày diễn ra *</label>
                  <input
                    type="date"
                    required
                    value={newIncident.date}
                    onChange={(e) => setNewIncident({ ...newIncident, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phân loại sự việc *</label>
                  <select
                    value={newIncident.type}
                    onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value as IncidentRecord['type'] })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Khen thưởng">Khen thưởng / Biểu dương</option>
                    <option value="Tiến bộ">Ghi nhận tiến bộ</option>
                    <option value="Vi phạm nội quy">Vi phạm nội quy</option>
                    <option value="Sự việc cần can thiệp">Sự việc cần can thiệp sư phạm</option>
                    <option value="Gặp khó khăn">Học sinh gặp khó khăn đột xuất</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tiêu đề vắn tắt *</label>
                  <input
                    type="text"
                    required
                    value={newIncident.title}
                    onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                    placeholder="Ví dụ: Giúp đỡ bạn cùng lớp, Đi học muộn 2 buổi..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung chi tiết</label>
                <textarea
                  rows={2}
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  placeholder="Mô tả diễn biến cụ thể sự việc..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Biện pháp hỗ trợ / Xử lý của GVCN
                </label>
                <textarea
                  rows={2}
                  value={newIncident.supportAction}
                  onChange={(e) => setNewIncident({ ...newIncident, supportAction: e.target.value })}
                  placeholder="Ví dụ: Gặp riêng trao đổi, phối hợp phụ huynh, cử bạn học tốt kèm cặp..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kết quả theo dõi sau xử lý
                </label>
                <input
                  type="text"
                  value={newIncident.result}
                  onChange={(e) => setNewIncident({ ...newIncident, result: e.target.value })}
                  placeholder="Ví dụ: Đã nhận lỗi và có chuyển biến tích cực..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Người phối hợp / Phụ trách</label>
                  <input
                    type="text"
                    value={newIncident.personInCharge}
                    onChange={(e) => setNewIncident({ ...newIncident, personInCharge: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trạng thái xử lý</label>
                  <select
                    value={newIncident.status}
                    onChange={(e) => setNewIncident({ ...newIncident, status: e.target.value as IncidentRecord['status'] })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Đang theo dõi">Đang theo dõi</option>
                    <option value="Đã giải quyết">Đã giải quyết</option>
                    <option value="Cần phối hợp thêm">Cần phối hợp thêm</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Lưu vào sổ theo dõi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
