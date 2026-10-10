import * as XLSX from 'xlsx';
import { Student, AttendanceRecord, Gender } from '../types';

export const ExcelService = {
  /**
   * Xuất danh sách 26 học sinh ra file Excel (.xlsx)
   */
  exportStudentsToExcel(students: Student[], fileName = 'Danh_Sach_Lop_9_2_Nam_Hoc_2026_2027.xlsx') {
    const data = students.map((s) => ({
      'STT': s.stt,
      'Mã Học Sinh': s.studentCode,
      'Họ và Tên': s.fullName || '(Chưa nhập họ tên)',
      'Giới tính': s.gender,
      'Ngày sinh': s.birthDate,
      'Dân tộc': s.ethnicity,
      'Thôn/Tổ': s.hamlet,
      'Địa chỉ thường trú': s.address,
      'Hoàn cảnh gia đình': s.familyStatus,
      'Họ tên phụ huynh': s.parentName,
      'Số điện thoại phụ huynh': s.parentPhone,
      'Nghề nghiệp phụ huynh': s.parentJob || '',
      'Bán trú': s.isBoarding ? 'Có' : 'Không',
      'Đánh giá học tập': s.academicResult,
      'Đánh giá rèn luyện': s.conductResult,
      'Theo dõi đặc biệt': s.specialNeeds ? 'Có' : 'Không',
      'Nguy cơ bỏ học': s.hasDropoutRisk ? 'Có' : 'Không',
      'Ghi chú GVCN': s.teacherNotes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Set auto column widths
    const columnWidths = [
      { wch: 6 },  // STT
      { wch: 14 }, // Mã HS
      { wch: 25 }, // Họ tên
      { wch: 10 }, // Giới tính
      { wch: 14 }, // Ngày sinh
      { wch: 10 }, // Dân tộc
      { wch: 15 }, // Thôn/Tổ
      { wch: 30 }, // Địa chỉ
      { wch: 18 }, // Hoàn cảnh
      { wch: 22 }, // Phụ huynh
      { wch: 15 }, // SĐT
      { wch: 20 }, // Nghề nghiệp
      { wch: 10 }, // Bán trú
      { wch: 16 }, // Học tập
      { wch: 16 }, // Rèn luyện
      { wch: 16 }, // Theo dõi
      { wch: 15 }, // Nguy cơ
      { wch: 30 }, // Ghi chú
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lớp 9-2');
    XLSX.writeFile(workbook, fileName);
  },

  /**
   * Xuất file mẫu Excel trống cho giáo viên điền
   */
  downloadTemplateExcel() {
    const templateData = Array.from({ length: 26 }, (_, idx) => {
      const stt = idx + 1;
      const isFemale = stt > 20;
      return {
        'STT': stt,
        'Mã Học Sinh': `902${stt < 10 ? '0' + stt : stt}`,
        'Họ và Tên': '',
        'Giới tính': isFemale ? 'Nữ' : 'Nam',
        'Ngày sinh': '2012-01-01',
        'Dân tộc': 'Kinh',
        'Thôn/Tổ': '',
        'Địa chỉ': '',
        'Hoàn cảnh gia đình': 'Bình thường',
        'Họ tên phụ huynh': '',
        'Số điện thoại phụ huynh': '',
        'Bán trú (Có/Không)': 'Không',
        'Ghi chú': '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mau_Nhap_Lop_9_2');
    XLSX.writeFile(workbook, 'Mau_Nhap_Danh_Sach_Lop_9_2.xlsx');
  },

  /**
   * Đọc file Excel do giáo viên tải lên và ánh xạ vào danh sách 26 học sinh
   */
  async parseExcelFile(file: File): Promise<Partial<Student>[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          const workbook = XLSX.read(buffer, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          const parsedStudents: Partial<Student>[] = rawRows.map((row, index) => {
            // Find keys regardless of exact casing or accents
            const getVal = (possibleKeys: string[]): string => {
              for (const k of Object.keys(row)) {
                const normalized = k.toLowerCase().trim();
                for (const target of possibleKeys) {
                  if (normalized.includes(target.toLowerCase())) {
                    return String(row[k] || '').trim();
                  }
                }
              }
              return '';
            };

            const fullName = getVal(['họ và tên', 'họ tên', 'tên', 'fullname', 'name']);
            const genderStr = getVal(['giới tính', 'phái', 'gender', 'nam/nữ']);
            const gender: Gender = genderStr.toLowerCase().includes('nữ') || genderStr.toLowerCase() === 'f' ? 'Nữ' : 'Nam';
            const studentCode = getVal(['mã', 'mã hs', 'mahocsinh', 'code']) || `902${(index + 1) < 10 ? '0' + (index + 1) : (index + 1)}`;
            const birthDate = getVal(['ngày sinh', 'ngaysinh', 'dob', 'sinh']);
            const ethnicity = getVal(['dân tộc', 'dantoc']) || 'Kinh';
            const hamlet = getVal(['thôn', 'tổ', 'thôn/tổ', 'xóm', 'khu phố']);
            const address = getVal(['địa chỉ', 'diachi', 'nơi ở']);
            const familyStatus = getVal(['hoàn cảnh', 'gia cảnh', 'hộ']) || 'Bình thường';
            const parentName = getVal(['phụ huynh', 'cha mẹ', 'giám hộ', 'bố mẹ']);
            const parentPhone = getVal(['sđt', 'điện thoại', 'số điện thoại', 'phone', 'tel']);
            const isBoardingStr = getVal(['bán trú', 'bantru']);
            const notes = getVal(['ghi chú', 'ghichu', 'note']);

            return {
              stt: index + 1,
              studentCode,
              fullName,
              gender,
              birthDate: birthDate || '2012-01-01',
              ethnicity,
              hamlet,
              address,
              familyStatus: (familyStatus.includes('nghèo') ? 'Hộ nghèo' : 
                             familyStatus.includes('cận') ? 'Hộ cận nghèo' : 
                             familyStatus.includes('mồ côi') ? 'Mồ côi' : 
                             familyStatus.includes('xa') ? 'Bố mẹ đi làm xa' : 'Bình thường') as Student['familyStatus'],
              parentName,
              parentPhone,
              isBoarding: isBoardingStr.toLowerCase().includes('có') || isBoardingStr.toLowerCase() === 'x',
              teacherNotes: notes,
            };
          });

          resolve(parsedStudents);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsBinaryString(file);
    });
  },

  /**
   * Nhập nhanh bằng cách dán văn bản phân cách Tab từ Excel/Google Sheets
   */
  parsePastedText(text: string): Partial<Student>[] {
    const lines = text.trim().split(/\r?\n/);
    return lines.map((line, idx) => {
      const parts = line.split('\t').map(p => p.trim());
      // Pattern: [STT]? [Mã]? Họ và tên [Giới tính]? [Ngày sinh]? [SĐT phụ huynh]?
      let fullName = '';
      let gender: Gender = (idx + 1) > 20 ? 'Nữ' : 'Nam';
      let phone = '';
      let studentCode = `902${(idx + 1) < 10 ? '0' + (idx + 1) : (idx + 1)}`;

      if (parts.length === 1) {
        fullName = parts[0];
      } else if (parts.length >= 2) {
        // If first part is a number (STT), name is part 1
        if (!isNaN(Number(parts[0])) && parts[0].length <= 3) {
          fullName = parts[1] || '';
          if (parts.length >= 3) {
            const part2 = parts[2].toLowerCase();
            if (part2.includes('nữ')) gender = 'Nữ';
            else if (part2.includes('nam')) gender = 'Nam';
          }
          if (parts.length >= 4 && parts[3].match(/\d{9,11}/)) {
            phone = parts[3];
          }
        } else {
          fullName = parts[0];
          const part1 = parts[1].toLowerCase();
          if (part1.includes('nữ')) gender = 'Nữ';
          else if (part1.includes('nam')) gender = 'Nam';
        }
      }

      return {
        stt: idx + 1,
        studentCode,
        fullName,
        gender,
        parentPhone: phone,
      };
    });
  },

  /**
   * Xuất báo cáo điểm danh ra Excel
   */
  exportAttendanceToExcel(
    students: Student[], 
    attendance: AttendanceRecord[], 
    dateFrom?: string, 
    dateTo?: string
  ) {
    // Unique dates
    const dates = Array.from(new Set(attendance.map(a => a.date))).sort();
    const filteredDates = dates.filter(d => (!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo));

    const statusMap: Record<string, string> = {
      present: 'Đ', // Đi học
      excused: 'P', // Phép
      unexcused: 'K', // Không phép
      late: 'M', // Muộn
      truant: 'B', // Bỏ tiết
    };

    const rows = students.map((s) => {
      const row: Record<string, string | number> = {
        'STT': s.stt,
        'Họ và Tên': s.fullName || `Học sinh ${s.stt}`,
        'Giới tính': s.gender,
      };

      let excusedCount = 0;
      let unexcusedCount = 0;
      let lateCount = 0;
      let truantCount = 0;

      filteredDates.forEach((date) => {
        const record = attendance.find(a => a.studentId === s.id && a.date === date);
        const status = record?.status || 'present';
        row[date] = statusMap[status] || 'Đ';

        if (status === 'excused') excusedCount++;
        else if (status === 'unexcused') unexcusedCount++;
        else if (status === 'late') lateCount++;
        else if (status === 'truant') truantCount++;
      });

      row['Tổng nghỉ (P)'] = excusedCount;
      row['Tổng nghỉ (KP)'] = unexcusedCount;
      row['Tổng đi muộn'] = lateCount;
      row['Tổng bỏ tiết'] = truantCount;

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Diem_Danh_Lop_9_2');
    XLSX.writeFile(workbook, `So_Diem_Danh_Lop_9_2_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
};
