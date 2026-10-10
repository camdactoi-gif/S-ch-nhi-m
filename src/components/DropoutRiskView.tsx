import React, { useState } from 'react';
import { 
  AlertTriangle, 
  HeartHandshake, 
  Plus, 
  PhoneCall, 
  Home, 
  UserCheck, 
  ShieldAlert, 
  Check, 
  X, 
  FileText, 
  Edit3, 
  Clock, 
  Trash2,
  Users
} from 'lucide-react';
import { Student, DropoutRiskRecord, AttendanceRecord } from '../types';

interface DropoutRiskViewProps {
  students: Student[];
  dropoutRisks: DropoutRiskRecord[];
  attendance: AttendanceRecord[];
  onUpdateDropoutRisks: (records: DropoutRiskRecord[]) => void;
  onNavigateToParents: () => void;
}

export const DropoutRiskView: React.FC<DropoutRiskViewProps> = ({
  students,
  dropoutRisks,
  attendance,
  onUpdateDropoutRisks,
  onNavigateToParents,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DropoutRiskRecord | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<DropoutRiskRecord>>({
    studentId: students[0]?.id || '',
    primaryRiskReason: 'Nghỉ học nhiều ngày',
    verifiedDetails: '',
    warningLevel: 'Mức 1 (Theo dõi)',
    contactsCount: 1,
    advocacyMeasures: '',
    coordinatedPartners: 'GVCN, Trưởng thôn, Hội Khuyến học',
    latestOutcome: '',
    status: 'Đang vận động',
  });

  // Calculate unexcused absences from real attendance data for each student
  const studentAbsenceMap = new Map<string, { unexcused: number; total: number }>();
  students.forEach(s => {
    const studentRecords = attendance.filter(a => a.studentId === s.id);
    const unexcused = studentRecords.filter(a => a.status === 'unexcused').length;
    const total = studentRecords.filter(a => a.status === 'unexcused' || a.status === 'excused').length;
    studentAbsenceMap.set(s.id, { unexcused, total });
  });

  // Automatically detected students needing review based on absences (>= 3 unexcused or >= 5 total)
  const systemDetectedStudents = students.filter(s => {
    const data = studentAbsenceMap.get(s.id);
    return data && (data.unexcused >= 3 || data.total >= 5);
  });

  const handleOpenAdd = (presetStudentId?: string) => {
    setEditingRecord(null);
    setFormData({
      studentId: presetStudentId || students[0]?.id || '',
      primaryRiskReason: 'Nghỉ học nhiều ngày',
      verifiedDetails: '',
      warningLevel: 'Mức 1 (Theo dõi)',
      contactsCount: 1,
      advocacyMeasures: 'GVCN gọi điện hỏi thăm, phối hợp phụ huynh',
      coordinatedPartners: 'GVCN, Ban Giám hiệu, Trưởng thôn',
      latestOutcome: 'Đang phối hợp theo dõi',
      status: 'Đang vận động',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: DropoutRiskRecord) => {
    setEditingRecord(rec);
    setFormData({ ...rec });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) return;

    if (editingRecord) {
      const updated = dropoutRisks.map(r => r.id === editingRecord.id ? {
        ...r,
        ...formData,
        updatedAt: new Date().toISOString().slice(0, 10),
      } as DropoutRiskRecord : r);
      onUpdateDropoutRisks(updated);
    } else {
      const newRec: DropoutRiskRecord = {
        id: `drop_${Date.now()}`,
        studentId: formData.studentId,
        primaryRiskReason: formData.primaryRiskReason as DropoutRiskRecord['primaryRiskReason'],
        verifiedDetails: formData.verifiedDetails?.trim() || '',
        warningLevel: formData.warningLevel as DropoutRiskRecord['warningLevel'],
        contactsCount: Number(formData.contactsCount) || 1,
        advocacyMeasures: formData.advocacyMeasures?.trim() || '',
        coordinatedPartners: formData.coordinatedPartners?.trim() || '',
        latestOutcome: formData.latestOutcome?.trim() || 'Đang vận động',
        status: formData.status as DropoutRiskRecord['status'],
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      onUpdateDropoutRisks([newRec, ...dropoutRisks]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Thầy/Cô có chắc chắn muốn xóa hồ sơ theo dõi này?')) {
      onUpdateDropoutRisks(dropoutRisks.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* Policy and Principles Notice */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-2">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-amber-950">
              Chuyên đề: Phòng ngừa bỏ học & Đồng hành cùng học sinh Lớp 9/2
            </h2>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              Theo quy định ngành giáo dục: <em>Chỉ cảnh báo theo tiêu chí giáo viên thiết lập, tuyệt đối không tự kết luận hoặc dán nhãn tiêu cực rằng học sinh sẽ bỏ học</em>. Mục tiêu là phát hiện sớm khó khăn để kịp thời vận động, phối hợp gia đình và xã hội hỗ trợ các em tiếp tục đến trường.
            </p>
          </div>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Danh sách theo dõi & Vận động ({dropoutRisks.length} trường hợp)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Gồm học sinh nghỉ nhiều buổi, hoàn cảnh khó khăn hoặc nguy cơ theo cha mẹ đi làm xa.
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd()}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm học sinh cần vận động</span>
        </button>
      </div>

      {/* Automated Attendance Alert Strip */}
      {systemDetectedStudents.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-red-900">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Cảnh báo chuyên cần tự động từ sổ điểm danh:</span>
          </div>
          <p className="text-red-800">
            Phát hiện <strong>{systemDetectedStudents.length}</strong> học sinh có số buổi nghỉ không phép ≥ 3 hoặc tổng nghỉ ≥ 5 buổi:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {systemDetectedStudents.map(s => {
              const abs = studentAbsenceMap.get(s.id);
              const alreadyTracked = dropoutRisks.some(r => r.studentId === s.id);
              return (
                <div key={s.id} className="bg-white border border-red-300 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{s.fullName || `Học sinh ${s.stt}`}</span>
                  <span className="text-red-700 font-mono">({abs?.unexcused} buổi KP / {abs?.total} tổng)</span>
                  {!alreadyTracked && (
                    <button
                      onClick={() => handleOpenAdd(s.id)}
                      className="text-[11px] font-bold text-indigo-600 hover:underline"
                    >
                      + Đưa vào theo dõi
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dropout Tracking Records List */}
      <div className="space-y-4">
        {dropoutRisks.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-2">
            <UserCheck className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-800">Hiện không có học sinh nào trong diện nguy cơ bỏ học</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Sĩ số lớp 9/2 hiện duy trì ổn định. Nếu phát hiện học sinh có biểu hiện sa sút, nghỉ học không phép kéo dài hoặc hoàn cảnh khó khăn đột xuất, Thầy/Cô hãy thêm vào sổ theo dõi để có phương án hỗ trợ.
            </p>
          </div>
        ) : (
          dropoutRisks.map((record) => {
            const st = students.find(s => s.id === record.studentId);
            const abs = studentAbsenceMap.get(record.studentId);

            return (
              <div 
                key={record.id} 
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-amber-300 transition-all space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-900 rounded-md">
                      {record.warningLevel}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {st?.fullName || `Học sinh STT ${st?.stt || '?'}`} ({st?.gender})
                    </h3>
                    <span className="text-xs text-slate-500">
                      STT: {st?.stt}/26 · Thôn: {st?.hamlet || 'Chưa cập nhật'} · Gia cảnh: {st?.familyStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleOpenEdit(record)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-slate-100"
                      title="Chỉnh sửa cập nhật"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100"
                      title="Xóa bản ghi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold text-slate-700">Nguyên nhân chính xác minh:</span>
                      <p className="text-red-800 font-medium mt-0.5">{record.primaryRiskReason}</p>
                    </div>

                    {record.verifiedDetails && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-700">Chi tiết thực tế qua xác minh:</span>
                        <p className="text-slate-600 mt-0.5">{record.verifiedDetails}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-slate-600">
                      <span>Số lần đã liên hệ/vận động: <strong className="font-mono text-slate-900">{record.contactsCount} lần</strong></span>
                      <span>|</span>
                      <span>Chuyên cần: <strong className="font-mono text-red-700">{abs?.unexcused || 0} KP</strong> / {abs?.total || 0} tổng</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                      <span className="font-semibold text-blue-900">Biện pháp vận động & Hỗ trợ đã thực hiện:</span>
                      <p className="text-slate-700 mt-0.5">{record.advocacyMeasures || 'Thăm nhà, động viên gia đình'}</p>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-800">Lực lượng phối hợp:</span>
                      <p className="text-slate-600 mt-0.5">{record.coordinatedPartners || 'GVCN, Ban giám hiệu'}</p>
                    </div>
                  </div>
                </div>

                {/* Footer status row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Kết quả mới nhất:</span>
                    <strong className="text-slate-900">{record.latestOutcome || 'Đang tiếp tục theo dõi'}</strong>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-md font-semibold ${
                      record.status === 'Đã ổn định đi học lại'
                        ? 'bg-emerald-100 text-emerald-800'
                        : record.status === 'Chuyển trường'
                        ? 'bg-slate-100 text-slate-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {record.status}
                    </span>

                    {st?.parentPhone && (
                      <a
                        href={`tel:${st.parentPhone}`}
                        className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-md flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" /> Gọi PH: {st.parentPhone}
                      </a>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal: Thêm / Sửa hồ sơ vận động */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 text-xs">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingRecord ? 'Cập nhật hồ sơ vận động học sinh' : 'Lập hồ sơ theo dõi nguy cơ bỏ học'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chọn học sinh *</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      STT {s.stt}: {s.fullName || `Học sinh ${s.stt}`} ({s.gender} - {s.familyStatus})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tiêu chí nguy cơ chính *</label>
                  <select
                    value={formData.primaryRiskReason}
                    onChange={(e) => setFormData({ ...formData, primaryRiskReason: e.target.value as DropoutRiskRecord['primaryRiskReason'] })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Nghỉ học nhiều ngày">Nghỉ học nhiều ngày</option>
                    <option value="Hoàn cảnh kinh tế đặc biệt khó khăn">Hoàn cảnh kinh tế đặc biệt khó khăn</option>
                    <option value="Có nguy cơ theo cha mẹ đi làm xa">Có nguy cơ theo cha mẹ đi làm xa</option>
                    <option value="Sa sút học tập nghiêm trọng">Sa sút học tập nghiêm trọng</option>
                    <option value="Gia đình thiếu sự phối hợp">Gia đình thiếu sự phối hợp</option>
                    <option value="Tâm lý chán học / bạn bè lôi kéo">Tâm lý chán học / bạn bè lôi kéo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mức độ cảnh báo</label>
                  <select
                    value={formData.warningLevel}
                    onChange={(e) => setFormData({ ...formData, warningLevel: e.target.value as DropoutRiskRecord['warningLevel'] })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Mức 1 (Theo dõi)">Mức 1 (Theo dõi nề nếp)</option>
                    <option value="Mức 2 (Nguy cơ cao)">Mức 2 (Nguy cơ cao)</option>
                    <option value="Mức 3 (Khẩn cấp)">Mức 3 (Khẩn cấp - Cần can thiệp ngay)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nguyên nhân thực tế đã xác minh
                </label>
                <textarea
                  rows={2}
                  value={formData.verifiedDetails}
                  onChange={(e) => setFormData({ ...formData, verifiedDetails: e.target.value })}
                  placeholder="Ghi rõ thông tin qua tiếp xúc gia đình, hàng xóm hoặc ban thôn..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Biện pháp vận động & Hỗ trợ cụ thể
                </label>
                <textarea
                  rows={2}
                  value={formData.advocacyMeasures}
                  onChange={(e) => setFormData({ ...formData, advocacyMeasures: e.target.value })}
                  placeholder="Ví dụ: Đến nhà thăm hỏi, hỗ trợ bộ sách giáo khoa, miễn giảm tiền học, nhờ bạn cùng thôn chở đi học..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lực lượng phối hợp
                  </label>
                  <input
                    type="text"
                    value={formData.coordinatedPartners}
                    onChange={(e) => setFormData({ ...formData, coordinatedPartners: e.target.value })}
                    placeholder="BGH, Trưởng thôn, Hội Khuyến học..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số lần đã liên hệ / vận động
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.contactsCount}
                    onChange={(e) => setFormData({ ...formData, contactsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kết quả mới nhất
                  </label>
                  <input
                    type="text"
                    value={formData.latestOutcome}
                    onChange={(e) => setFormData({ ...formData, latestOutcome: e.target.value })}
                    placeholder="Ví dụ: Phụ huynh hứa cho đi học lại từ thứ 2..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trạng thái vận động</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as DropoutRiskRecord['status'] })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Đang vận động">Đang vận động</option>
                    <option value="Đã ổn định đi học lại">Đã ổn định đi học lại</option>
                    <option value="Chuyển trường">Chuyển trường</option>
                    <option value="Nguy cơ tiếp diễn">Nguy cơ tiếp diễn</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs"
                >
                  Lưu hồ sơ theo dõi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
