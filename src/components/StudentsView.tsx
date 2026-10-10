import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Edit3, 
  Eye, 
  Printer, 
  UserPlus, 
  Check, 
  FileSpreadsheet, 
  X, 
  Phone, 
  Home, 
  ShieldAlert, 
  Save, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { Student, Gender } from '../types';
import { ExcelService } from '../utils/excel';

interface StudentsViewProps {
  students: Student[];
  onUpdateStudents: (updated: Student[]) => void;
  onOpenImportModal: () => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  onUpdateStudents,
  onOpenImportModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | Gender>('all');
  const [filterFamily, setFilterFamily] = useState<string>('all');
  const [filterHamlet, setFilterHamlet] = useState<string>('all');
  const [filterBoarding, setFilterBoarding] = useState<string>('all');
  
  // Selected student for detail/editing modal
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Student | null>(null);
  
  // Print preview modal
  const [printStudent, setPrintStudent] = useState<Student | null>(null);

  // Success toast indicator
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Unique hamlets list
  const allHamlets = Array.from(new Set(students.map(s => s.hamlet).filter(Boolean)));

  // Filter logic
  const filteredStudents = students.filter((s) => {
    const matchSearch = 
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentPhone.includes(searchTerm) ||
      s.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.hamlet.toLowerCase().includes(searchTerm.toLowerCase());

    const matchGender = filterGender === 'all' || s.gender === filterGender;
    const matchFamily = filterFamily === 'all' || s.familyStatus === filterFamily;
    const matchHamlet = filterHamlet === 'all' || s.hamlet === filterHamlet;
    const matchBoarding = filterBoarding === 'all' || 
      (filterBoarding === 'yes' && s.isBoarding) || 
      (filterBoarding === 'no' && !s.isBoarding);

    return matchSearch && matchGender && matchFamily && matchHamlet && matchBoarding;
  });

  // Handle open edit modal
  const handleOpenEdit = (student: Student) => {
    setEditFormData({ ...student });
    setIsEditModalOpen(true);
  };

  // Handle save edit modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    const updated = students.map(s => s.id === editFormData.id ? editFormData : s);
    onUpdateStudents(updated);
    setIsEditModalOpen(false);
    setSelectedStudent(null);
    showToast(`Đã lưu hồ sơ học sinh ${editFormData.fullName || `STT ${editFormData.stt}`}`);
  };

  // Fast inline update
  const handleInlineNameChange = (id: string, newName: string) => {
    const updated = students.map(s => s.id === id ? { ...s, fullName: newName } : s);
    onUpdateStudents(updated);
  };

  const handleInlineGenderToggle = (id: string) => {
    const updated = students.map(s => {
      if (s.id === id) {
        const nextGender: Gender = s.gender === 'Nam' ? 'Nữ' : 'Nam';
        return { ...s, gender: nextGender };
      }
      return s;
    });
    onUpdateStudents(updated);
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Hồ sơ học sinh Lớp 9/2 (Sĩ số: {students.length} em)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gồm 20 Nam và 6 Nữ theo phân bổ ban đầu. Có thể chỉnh sửa trực tiếp hoặc nhập hàng loạt từ Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Excel / Dán bảng</span>
          </button>

          <button
            onClick={() => ExcelService.exportStudentsToExcel(students)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất file Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          
          {/* Search text */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, mã HS, phụ huynh, SĐT, thôn..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Gender */}
          <div>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value as 'all' | Gender)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="all">Giới tính: Tất cả (26)</option>
              <option value="Nam">Chỉ xem Nam (20)</option>
              <option value="Nữ">Chỉ xem Nữ (6)</option>
            </select>
          </div>

          {/* Filter Family Status */}
          <div>
            <select
              value={filterFamily}
              onChange={(e) => setFilterFamily(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="all">Hoàn cảnh gia đình: Tất cả</option>
              <option value="Bình thường">Bình thường</option>
              <option value="Hộ nghèo">Hộ nghèo</option>
              <option value="Hộ cận nghèo">Hộ cận nghèo</option>
              <option value="Mồ côi">Mồ côi</option>
              <option value="Khó khăn đặc biệt">Khó khăn đặc biệt</option>
              <option value="Bố mẹ đi làm xa">Bố mẹ đi làm xa</option>
            </select>
          </div>

          {/* Filter Boarding */}
          <div>
            <select
              value={filterBoarding}
              onChange={(e) => setFilterBoarding(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="all">Bán trú: Tất cả</option>
              <option value="yes">Có ở bán trú</option>
              <option value="no">Không bán trú</option>
            </select>
          </div>

        </div>

        {/* Filter Summary Tags & Clear Filter */}
        {(searchTerm || filterGender !== 'all' || filterFamily !== 'all' || filterBoarding !== 'all') && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Tìm thấy <strong className="text-slate-900 font-mono tabular-nums">{filteredStudents.length}</strong> / 26 học sinh
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterGender('all');
                setFilterFamily('all');
                setFilterHamlet('all');
                setFilterBoarding('all');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Main Student Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 w-12 text-center">STT</th>
                <th className="py-3 px-3 w-24">Mã HS</th>
                <th className="py-3 px-4 min-w-[200px]">Họ và Tên (Nhập trực tiếp)</th>
                <th className="py-3 px-3 w-20 text-center">Giới tính</th>
                <th className="py-3 px-3 min-w-[100px]">Ngày sinh</th>
                <th className="py-3 px-3 min-w-[120px]">Thôn/Tổ</th>
                <th className="py-3 px-3 min-w-[130px]">Hoàn cảnh</th>
                <th className="py-3 px-4 min-w-[170px]">Phụ huynh / SĐT</th>
                <th className="py-3 px-3 w-20 text-center">Bán trú</th>
                <th className="py-3 px-3 min-w-[100px] text-center">Học tập / Rèn luyện</th>
                <th className="py-3 px-3 w-28 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    Không tìm thấy học sinh nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isBlank = !student.fullName || student.fullName.trim() === '';
                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isBlank ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* STT */}
                      <td className="py-3 px-3 text-center font-mono tabular-nums font-medium text-slate-600">
                        {student.stt}
                      </td>

                      {/* Mã HS */}
                      <td className="py-3 px-3 font-mono text-slate-700 font-medium">
                        {student.studentCode}
                      </td>

                      {/* Họ và Tên (Editable directly) */}
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={student.fullName}
                            onChange={(e) => handleInlineNameChange(student.id, e.target.value)}
                            placeholder={`(Trống - Nhập tên học sinh ${student.stt})`}
                            className={`w-full px-2.5 py-1.5 rounded-md border text-xs sm:text-sm font-medium transition-colors ${
                              isBlank 
                                ? 'border-amber-300 bg-amber-50/60 text-amber-900 placeholder-amber-400 focus:border-indigo-500 focus:bg-white'
                                : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                            }`}
                          />
                        </div>
                      </td>

                      {/* Giới tính toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleInlineGenderToggle(student.id)}
                          title="Bấm để đổi Nam / Nữ"
                          className={`px-2 py-1 rounded-md font-semibold text-[11px] transition-colors cursor-pointer ${
                            student.gender === 'Nữ'
                              ? 'bg-pink-100 text-pink-800 hover:bg-pink-200'
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                        >
                          {student.gender}
                        </button>
                      </td>

                      {/* Ngày sinh */}
                      <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                        {student.birthDate || '2012-01-01'}
                      </td>

                      {/* Thôn/Tổ */}
                      <td className="py-3 px-3 text-slate-700">
                        {student.hamlet || <span className="text-slate-300 italic">Chưa nhập</span>}
                      </td>

                      {/* Hoàn cảnh gia đình */}
                      <td className="py-3 px-3">
                        <span className={`text-[11px] font-medium ${
                          student.familyStatus === 'Bình thường' 
                            ? 'text-slate-600' 
                            : 'text-amber-800 font-semibold'
                        }`}>
                          {student.familyStatus}
                        </span>
                      </td>

                      {/* Phụ huynh / SĐT */}
                      <td className="py-3 px-4 text-slate-700">
                        {student.parentName || student.parentPhone ? (
                          <div>
                            <div className="font-medium text-slate-900">{student.parentName || 'Chưa tên PH'}</div>
                            {student.parentPhone && (
                              <a 
                                href={`tel:${student.parentPhone}`} 
                                className="font-mono text-indigo-600 hover:underline text-[11px] flex items-center gap-1 mt-0.5"
                              >
                                <Phone className="w-2.5 h-2.5" /> {student.parentPhone}
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 italic">Chưa thông tin</span>
                        )}
                      </td>

                      {/* Bán trú */}
                      <td className="py-3 px-3 text-center">
                        <span className={`text-[11px] font-medium ${student.isBoarding ? 'text-indigo-700 font-semibold' : 'text-slate-400'}`}>
                          {student.isBoarding ? 'Có' : 'Không'}
                        </span>
                      </td>

                      {/* Đánh giá HT / RL */}
                      <td className="py-3 px-3 text-center text-[11px]">
                        <span className="text-slate-700 font-medium">{student.academicResult}</span>
                        <span className="text-slate-300 mx-1">/</span>
                        <span className="text-slate-700 font-medium">{student.conductResult}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Sửa hồ sơ chi tiết"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPrintStudent(student)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="In sơ yếu lý lịch cá nhân"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
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

      {/* MODAL: Full Student Record Edit */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Hồ sơ học sinh: {editFormData.fullName || `STT ${editFormData.stt}`}
                </h3>
                <p className="text-xs text-slate-500">
                  Mã học sinh: {editFormData.studentCode} · STT {editFormData.stt}/26 · Lớp 9/2
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và tên học sinh *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    placeholder="Ví dụ: Nguyễn Văn Hoàng"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã học sinh
                  </label>
                  <input
                    type="text"
                    value={editFormData.studentCode}
                    onChange={(e) => setEditFormData({ ...editFormData, studentCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày sinh (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    value={editFormData.birthDate}
                    onChange={(e) => setEditFormData({ ...editFormData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dân tộc
                  </label>
                  <input
                    type="text"
                    value={editFormData.ethnicity}
                    onChange={(e) => setEditFormData({ ...editFormData, ethnicity: e.target.value })}
                    placeholder="Kinh, Cơ-tu, Tày,..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thôn / Tổ / Thôn bản
                  </label>
                  <input
                    type="text"
                    value={editFormData.hamlet}
                    onChange={(e) => setEditFormData({ ...editFormData, hamlet: e.target.value })}
                    placeholder="Ví dụ: Thôn 2, Tổ 5"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ thường trú chi tiết
                </label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  placeholder="Xã/Phường, Huyện/Quận..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hoàn cảnh gia đình
                  </label>
                  <select
                    value={editFormData.familyStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, familyStatus: e.target.value as Student['familyStatus'] })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="Bình thường">Bình thường</option>
                    <option value="Hộ nghèo">Hộ nghèo</option>
                    <option value="Hộ cận nghèo">Hộ cận nghèo</option>
                    <option value="Mồ côi">Mồ côi</option>
                    <option value="Khó khăn đặc biệt">Khó khăn đặc biệt</option>
                    <option value="Bố mẹ đi làm xa">Bố mẹ đi làm xa</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={editFormData.isBoarding}
                      onChange={(e) => setEditFormData({ ...editFormData, isBoarding: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300"
                    />
                    <span>Học sinh ở bán trú tại trường</span>
                  </label>
                </div>
              </div>

              {/* Thông tin phụ huynh */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Thông tin phụ huynh / Người giám hộ
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Họ tên phụ huynh</label>
                    <input
                      type="text"
                      value={editFormData.parentName}
                      onChange={(e) => setEditFormData({ ...editFormData, parentName: e.target.value })}
                      placeholder="Họ tên cha / mẹ"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Số điện thoại liên hệ</label>
                    <input
                      type="tel"
                      value={editFormData.parentPhone}
                      onChange={(e) => setEditFormData({ ...editFormData, parentPhone: e.target.value })}
                      placeholder="09xx..."
                      className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Nghề nghiệp / Nơi làm</label>
                    <input
                      type="text"
                      value={editFormData.parentJob || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, parentJob: e.target.value })}
                      placeholder="Làm nông, công nhân..."
                      className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Đánh giá học tập & rèn luyện */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Đánh giá học tập (Theo TT 22)
                  </label>
                  <select
                    value={editFormData.academicResult}
                    onChange={(e) => setEditFormData({ ...editFormData, academicResult: e.target.value as Student['academicResult'] })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  >
                    <option value="Chưa đánh giá">Chưa đánh giá</option>
                    <option value="Tốt">Tốt</option>
                    <option value="Khá">Khá</option>
                    <option value="Đạt">Đạt</option>
                    <option value="Chưa đạt">Chưa đạt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Đánh giá kết quả rèn luyện (Theo TT 22)
                  </label>
                  <select
                    value={editFormData.conductResult}
                    onChange={(e) => setEditFormData({ ...editFormData, conductResult: e.target.value as Student['conductResult'] })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  >
                    <option value="Chưa đánh giá">Chưa đánh giá</option>
                    <option value="Tốt">Tốt</option>
                    <option value="Khá">Khá</option>
                    <option value="Đạt">Đạt</option>
                    <option value="Chưa đạt">Chưa đạt</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes theo dõi đặc biệt */}
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-amber-950">
                  <input
                    type="checkbox"
                    checked={editFormData.specialNeeds}
                    onChange={(e) => setEditFormData({ ...editFormData, specialNeeds: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded-sm border-amber-300"
                  />
                  <span>Cần theo dõi đặc biệt (sức khỏe, tâm lý, hoàn cảnh neo đơn)</span>
                </label>
                {editFormData.specialNeeds && (
                  <input
                    type="text"
                    value={editFormData.specialNeedsReason || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, specialNeedsReason: e.target.value })}
                    placeholder="Lý do cần theo dõi đặc biệt..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg mt-1"
                  />
                )}

                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-red-950 pt-2">
                  <input
                    type="checkbox"
                    checked={editFormData.hasDropoutRisk}
                    onChange={(e) => setEditFormData({ ...editFormData, hasDropoutRisk: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded-sm border-red-300"
                  />
                  <span>Đưa vào danh sách theo dõi nguy cơ bỏ học</span>
                </label>
              </div>

              {/* Ghi chú riêng của GVCN (Bảo mật) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú riêng của Giáo viên chủ nhiệm (Bảo mật sư phạm)
                </label>
                <textarea
                  rows={2}
                  value={editFormData.teacherNotes}
                  onChange={(e) => setEditFormData({ ...editFormData, teacherNotes: e.target.value })}
                  placeholder="Ghi chú tính cách, năng khiếu, biểu hiện tâm lý, lưu ý riêng..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu hồ sơ học sinh</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: Sơ yếu lý lịch chuẩn in ấn */}
      {printStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 no-print">
              <h3 className="font-bold text-slate-900">Sơ yếu lý lịch học sinh THCS</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> In ngay (A4)
                </button>
                <button
                  onClick={() => setPrintStudent(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Sheet */}
            <div className="border border-slate-300 p-6 rounded-lg text-slate-800 text-sm space-y-4 bg-white">
              <div className="text-center space-y-1 border-b border-slate-300 pb-4">
                <p className="text-xs font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p className="text-[11px] font-medium">Độc lập - Tự do - Hạnh phúc</p>
                <div className="w-24 h-0.5 bg-slate-400 mx-auto mt-1 mb-2"></div>
                <h4 className="text-base font-bold uppercase text-slate-900">
                  PHIẾU THÔNG TIN HỌC SINH
                </h4>
                <p className="text-xs text-slate-600">LỚP 9/2 – NĂM HỌC 2026–2027</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs leading-relaxed">
                <div><strong>Họ và tên:</strong> {printStudent.fullName || '(Chưa nhập tên)'}</div>
                <div><strong>Mã học sinh:</strong> {printStudent.studentCode}</div>
                <div><strong>STT sổ điểm:</strong> {printStudent.stt}/26</div>
                <div><strong>Giới tính:</strong> {printStudent.gender}</div>
                <div><strong>Ngày sinh:</strong> {printStudent.birthDate}</div>
                <div><strong>Dân tộc:</strong> {printStudent.ethnicity}</div>
                <div><strong>Thôn / Tổ:</strong> {printStudent.hamlet || 'Chưa cập nhật'}</div>
                <div><strong>Bán trú:</strong> {printStudent.isBoarding ? 'Có bán trú' : 'Không'}</div>
                <div className="col-span-2"><strong>Địa chỉ:</strong> {printStudent.address || 'Chưa cập nhật'}</div>
                <div className="col-span-2"><strong>Hoàn cảnh gia đình:</strong> {printStudent.familyStatus}</div>
                <div><strong>Họ tên phụ huynh:</strong> {printStudent.parentName || 'Chưa cập nhật'}</div>
                <div><strong>Số điện thoại:</strong> {printStudent.parentPhone || 'Chưa cập nhật'}</div>
                <div className="col-span-2"><strong>Nghề nghiệp phụ huynh:</strong> {printStudent.parentJob || 'Chưa cập nhật'}</div>
                <div><strong>Kết quả học tập:</strong> {printStudent.academicResult}</div>
                <div><strong>Kết quả rèn luyện:</strong> {printStudent.conductResult}</div>
              </div>

              {printStudent.teacherNotes && (
                <div className="border-t border-slate-200 pt-3 text-xs">
                  <strong>Ghi chú sư phạm của GVCN:</strong>
                  <p className="italic text-slate-600 mt-0.5">{printStudent.teacherNotes}</p>
                </div>
              )}

              <div className="pt-6 flex justify-between text-xs text-center">
                <div>
                  <p className="font-semibold">Học sinh / Phụ huynh</p>
                  <p className="text-[10px] text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 italic">..., Ngày ... tháng ... năm 2026</p>
                  <p className="font-semibold mt-1">Giáo viên chủ nhiệm Lớp 9/2</p>
                  <p className="text-[10px] text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
