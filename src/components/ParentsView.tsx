import React, { useState } from 'react';
import { 
  PhoneCall, 
  MessageSquare, 
  Plus, 
  Copy, 
  Check, 
  Send, 
  Calendar, 
  User, 
  Home, 
  History, 
  FileText, 
  X, 
  ExternalLink,
  ShieldCheck,
  Search
} from 'lucide-react';
import { Student, ParentContactLog } from '../types';

interface ParentsViewProps {
  students: Student[];
  contacts: ParentContactLog[];
  onUpdateContacts: (updated: ParentContactLog[]) => void;
  selectedDate: string;
}

export const ParentsView: React.FC<ParentsViewProps> = ({
  students,
  contacts,
  onUpdateContacts,
  selectedDate,
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'logs' | 'composer'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // New log form state
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false);
  const [newLog, setNewLog] = useState<Partial<ParentContactLog>>({
    studentId: students[0]?.id || '',
    date: new Date().toISOString().slice(0, 10),
    reason: 'Thông báo vắng học',
    method: 'Điện thoại',
    content: '',
    parentResponse: '',
    followUpRequired: false,
    teacher: 'Giáo viên chủ nhiệm 9/2',
  });

  // Message composer state
  const [composerStudentId, setComposerStudentId] = useState<string>(students[0]?.id || '');
  const [composerTemplate, setComposerTemplate] = useState<string>('absent');
  const [customNote, setCustomNote] = useState<string>('');

  const selectedStudent = students.find(s => s.id === composerStudentId) || students[0];

  // Message templates generator
  const generateMessageText = () => {
    const studentName = selectedStudent?.fullName || `học sinh STT ${selectedStudent?.stt}`;
    const parentName = selectedStudent?.parentName || 'Quý Phụ huynh';
    const dateFormatted = new Date().toLocaleDateString('vi-VN');

    switch (composerTemplate) {
      case 'absent':
        return `Kính gửi ${parentName}, Giáo viên chủ nhiệm Lớp 9/2 xin thông báo: Hôm nay (${dateFormatted}), em ${studentName} vắng mặt tại lớp không có giấy phép/chưa liên hệ với thầy cô. Kính đề nghị Quý Phụ huynh xác nhận tình hình của em và phản hồi lại cho GVCN qua SĐT hoặc Zalo. Trân trọng!`;
      
      case 'late':
        return `Kính gửi ${parentName}, GVCN Lớp 9/2 xin thông báo em ${studentName} đi học muộn vào buổi học ngày ${dateFormatted}. Kính mong gia đình nhắc nhở em sắp xếp thời gian đến lớp đúng giờ (trước 7h00 sáng) để đảm bảo nề nếp và tiếp thu trọn vẹn bài học. Cảm ơn Quý Phụ huynh!`;
      
      case 'meeting':
        return `TRƯỜNG THCS - LỚP 9/2: Kính mời Quý Phụ huynh em ${studentName} đến tham dự Buổi họp phụ huynh học sinh vào lúc 08h00 ngày Chủ Nhật tới tại phòng học Lớp 9/2. Nội dung: Đánh giá tình hình học tập và định hướng ôn thi tuyển sinh vào Lớp 10 năm học 2026-2027. Kính mong Phụ huynh có mặt đúng giờ!`;
      
      case 'academic':
        return `Kính gửi Quý Phụ huynh em ${studentName}, GVCN Lớp 9/2 gửi thông tin kết quả học tập và rèn luyện đợt vừa qua của em: Học tập: ${selectedStudent?.academicResult || 'Đang theo dõi'}, Rèn luyện: ${selectedStudent?.conductResult || 'Đang theo dõi'}. ${customNote ? `Lưu ý thêm: ${customNote}. ` : ''}Kính chúc gia đình sức khỏe và tiếp tục đồng hành cùng nhà trường!`;
      
      case 'insurance':
        return `THÔNG BÁO NHÀ TRƯỜNG: Kính gửi Phụ huynh em ${studentName} (Lớp 9/2), nhà trường đang triển khai rà soát thẻ Bảo hiểm Y tế học sinh năm học 2026-2027. Kính đề nghị Phụ huynh kiểm tra hạn thẻ hoặc hoàn tất thủ tục đăng ký gia hạn cho em trong tuần này. Trân trọng!`;

      case 'merit':
        return `Kính gửi Quý Phụ huynh em ${studentName}, GVCN Lớp 9/2 rất vui mừng thông báo: Tuần này em ${studentName} đã có sự nỗ lực vượt bậc, đạt điểm tốt và tích cực tham gia xây dựng bài. Nhà trường và GVCN xin biểu dương em trước lớp và gửi lời cảm ơn sự quan tâm chu đáo của gia đình!`;

      default:
        return '';
    }
  };

  const messageText = generateMessageText();

  // Copy to clipboard
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Open SMS
  const handleOpenSMS = () => {
    if (!selectedStudent?.parentPhone) {
      alert('Học sinh này chưa có số điện thoại phụ huynh.');
      return;
    }
    const phone = selectedStudent.parentPhone.replace(/\D/g, '');
    window.location.href = `sms:${phone}?body=${encodeURIComponent(messageText)}`;
  };

  // Save contact log submit
  const handleAddLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.studentId) return;

    const record: ParentContactLog = {
      id: `cont_${Date.now()}`,
      studentId: newLog.studentId,
      date: newLog.date || new Date().toISOString().slice(0, 10),
      reason: newLog.reason as ParentContactLog['reason'],
      method: newLog.method as ParentContactLog['method'],
      content: newLog.content?.trim() || '',
      parentResponse: newLog.parentResponse?.trim() || '',
      followUpRequired: !!newLog.followUpRequired,
      teacher: newLog.teacher || 'GVCN Lớp 9/2',
    };

    onUpdateContacts([record, ...contacts]);
    setIsAddLogModalOpen(false);
  };

  // Directory filter
  const filteredStudents = students.filter(s => {
    return (
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentPhone.includes(searchTerm) ||
      s.hamlet.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-5 pb-16">
      
      {/* Tab bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${
              activeTab === 'directory' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Danh bạ phụ huynh (26 em)
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${
              activeTab === 'logs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nhật ký liên lạc ({contacts.length})
          </button>
          <button
            onClick={() => setActiveTab('composer')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${
              activeTab === 'composer' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Soạn mẫu tin nhắn SMS / Zalo
          </button>
        </div>

        <button
          onClick={() => setIsAddLogModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi nhật ký liên lạc mới</span>
        </button>
      </div>

      {/* TAB 1: Danh bạ phụ huynh */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên học sinh, tên phụ huynh, số điện thoại, thôn/tổ..."
              className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-hidden"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-3 w-12 text-center">STT</th>
                    <th className="py-3 px-4 min-w-[180px]">Họ và Tên học sinh</th>
                    <th className="py-3 px-4 min-w-[170px]">Họ tên phụ huynh / Giám hộ</th>
                    <th className="py-3 px-4 min-w-[150px]">Số điện thoại</th>
                    <th className="py-3 px-3 min-w-[120px]">Nghề nghiệp</th>
                    <th className="py-3 px-3 min-w-[120px]">Thôn / Tổ</th>
                    <th className="py-3 px-4 min-w-[150px] text-center">Liên hệ nhanh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStudents.map((student) => {
                    const hasPhone = !!student.parentPhone;
                    return (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-600">
                          {student.stt}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {student.fullName || `Học sinh STT ${student.stt}`}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {student.studentCode} ({student.gender})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          {student.parentName || <span className="text-slate-300 italic">Chưa cập nhật</span>}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-800">
                          {student.parentPhone || <span className="text-slate-300 italic">Chưa có SĐT</span>}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {student.parentJob || '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {student.hamlet || '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {hasPhone ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <a
                                href={`tel:${student.parentPhone}`}
                                className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded-md flex items-center gap-1 text-[11px]"
                                title="Gọi điện thoại"
                              >
                                <PhoneCall className="w-3 h-3" /> Gọi
                              </a>
                              <button
                                onClick={() => {
                                  setComposerStudentId(student.id);
                                  setActiveTab('composer');
                                }}
                                className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-md flex items-center gap-1 text-[11px]"
                                title="Soạn tin nhắn"
                              >
                                <MessageSquare className="w-3 h-3" /> Nhắn
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-[11px] italic">Chưa có SĐT</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Nhật ký liên lạc */}
      {activeTab === 'logs' && (
        <div className="space-y-3">
          {contacts.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-2">
              <History className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-800">Chưa có nhật ký trao đổi nào với phụ huynh</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Mỗi khi gọi điện, gặp tại trường hoặc đến thăm gia đình học sinh, Thầy/Cô hãy ghi chép lại nội dung và phản hồi của phụ huynh để theo dõi tiến trình giáo dục.
              </p>
            </div>
          ) : (
            contacts.map((log) => {
              const st = students.find(s => s.id === log.studentId);
              return (
                <div key={log.id} className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md">
                        {log.method}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {log.reason} – {st?.fullName || `Học sinh STT ${st?.stt}`}
                      </h4>
                    </div>
                    <span className="text-xs text-slate-500 font-mono tabular-nums">
                      {log.date}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-800 block mb-1">Nội dung trao đổi của GVCN:</span>
                      <p className="text-slate-700 leading-relaxed">{log.content || 'Đã trao đổi tình hình học tập và nề nếp của em.'}</p>
                    </div>

                    <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                      <span className="font-semibold text-emerald-950 block mb-1">Phản hồi của phụ huynh:</span>
                      <p className="text-slate-700 leading-relaxed">{log.parentResponse || 'Phụ huynh tiếp thu và cam kết phối hợp nhắc nhở con em.'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Người liên hệ: <strong>{log.teacher}</strong></span>
                    {log.followUpRequired && (
                      <span className="text-red-700 font-semibold px-2 py-0.5 bg-red-50 rounded-md">
                        Cần liên hệ theo dõi lại trong tuần
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: Soạn mẫu tin nhắn thông báo */}
      {activeTab === 'composer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Template & Student Picker */}
          <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">1. Cấu hình tin nhắn</h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chọn học sinh cần gửi:</label>
              <select
                value={composerStudentId}
                onChange={(e) => setComposerStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    STT {s.stt}: {s.fullName || `Học sinh ${s.stt}`} {s.parentPhone ? `(${s.parentPhone})` : '(Chưa có SĐT)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chọn mẫu tin nhắn:</label>
              <div className="space-y-1.5">
                {[
                  { id: 'absent', label: 'Thông báo vắng học không phép' },
                  { id: 'late', label: 'Thông báo học sinh đi muộn' },
                  { id: 'meeting', label: 'Mời họp phụ huynh Lớp 9/2' },
                  { id: 'academic', label: 'Thông báo kết quả học tập & rèn luyện' },
                  { id: 'merit', label: 'Biểu dương / Khen ngợi học sinh tiến bộ' },
                  { id: 'insurance', label: 'Nhắc rà soát Bảo hiểm Y tế' },
                ].map(tpl => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setComposerTemplate(tpl.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                      composerTemplate === tpl.id 
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-semibold' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {composerTemplate === 'academic' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú bổ sung (tùy chọn):</label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Ví dụ: Cần chú ý làm bài tập Toán..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Right: Message Preview & Actions */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                2. Xem trước nội dung tin nhắn gửi Phụ huynh
              </h3>
              <span className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-medium">
                * Chỉ gửi khi Thầy/Cô trực tiếp xác nhận
              </span>
            </div>

            {/* Recipient info */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <strong>Người nhận:</strong> {selectedStudent?.parentName || 'Phụ huynh em ' + (selectedStudent?.fullName || 'học sinh')}
              </div>
              <div className="font-mono text-indigo-700 font-semibold">
                SĐT: {selectedStudent?.parentPhone || 'Chưa cập nhật'}
              </div>
            </div>

            {/* Preview Box */}
            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-inner">
              {messageText}
            </div>

            {/* Confirmation & Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <p className="text-[11px] text-slate-500 italic">
                * Quy định bảo mật: Hệ thống không tự động gửi ngầm mà tạo tin nhắn để Thầy/Cô bấm xác nhận gửi qua Zalo hoặc ứng dụng Tin nhắn điện thoại.
              </p>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  {copySuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copySuccess ? 'Đã sao chép' : 'Sao chép tin nhắn'}</span>
                </button>

                <button
                  onClick={handleOpenSMS}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Xác nhận gửi qua SMS / Zalo</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Modal: Ghi nhật ký liên lạc mới */}
      {isAddLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Ghi nhật ký liên hệ phụ huynh học sinh
              </h3>
              <button
                onClick={() => setIsAddLogModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLogSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Học sinh *</label>
                  <select
                    required
                    value={newLog.studentId}
                    onChange={(e) => setNewLog({ ...newLog, studentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        STT {s.stt}: {s.fullName || `Học sinh ${s.stt}`} ({s.parentPhone || 'Chưa SĐT'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày liên hệ *</label>
                  <input
                    type="date"
                    required
                    value={newLog.date}
                    onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hình thức liên lạc *</label>
                  <select
                    value={newLog.method}
                    onChange={(e) => setNewLog({ ...newLog, method: e.target.value as ParentContactLog['method'] })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Điện thoại">Gọi điện thoại</option>
                    <option value="Zalo / Tin nhắn">Nhắn tin Zalo / SMS</option>
                    <option value="Gặp trực tiếp tại trường">Gặp trực tiếp tại trường</option>
                    <option value="Đến thăm nhà">Đến thăm nhà gia đình</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lý do liên hệ *</label>
                  <select
                    value={newLog.reason}
                    onChange={(e) => setNewLog({ ...newLog, reason: e.target.value as ParentContactLog['reason'] })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Thông báo vắng học">Thông báo vắng học</option>
                    <option value="Thông báo đi muộn">Thông báo đi muộn</option>
                    <option value="Trao đổi học tập">Trao đổi kết quả học tập</option>
                    <option value="Trao đổi rèn luyện">Trao đổi nề nếp / rèn luyện</option>
                    <option value="Mời họp phụ huynh">Mời họp phụ huynh</option>
                    <option value="Thăm gia đình">Thăm hỏi hoàn cảnh gia đình</option>
                    <option value="Vận động đi học">Vận động học sinh trở lại trường</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung đã trao đổi</label>
                <textarea
                  rows={2}
                  value={newLog.content}
                  onChange={(e) => setNewLog({ ...newLog, content: e.target.value })}
                  placeholder="Ghi vắn tắt nội dung giáo viên đã trao đổi..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phản hồi của phụ huynh</label>
                <textarea
                  rows={2}
                  value={newLog.parentResponse}
                  onChange={(e) => setNewLog({ ...newLog, parentResponse: e.target.value })}
                  placeholder="Ghi ý kiến hoặc cam kết của phụ huynh..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="followUpCheck"
                  checked={newLog.followUpRequired}
                  onChange={(e) => setNewLog({ ...newLog, followUpRequired: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded-sm"
                />
                <label htmlFor="followUpCheck" className="text-slate-700 font-medium">
                  Cần theo dõi và liên hệ lại trong thời gian tới
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddLogModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Lưu vào nhật ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
