export type Gender = 'Nam' | 'Nữ';

export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late' | 'truant';

export interface Student {
  id: string; // STT or unique code
  stt: number; // 1 to 26
  studentCode: string; // Mã học sinh (e.g., 90201)
  fullName: string; // Họ và tên (blank initially, teacher enters)
  birthDate: string; // YYYY-MM-DD
  gender: Gender; // Nam: 20, Nữ: 6 default
  ethnicity: string; // Dân tộc (Kinh, Cơ-tu, Tày, etc.)
  address: string; // Địa chỉ thường trú
  hamlet: string; // Thôn / Tổ / Thôn bản
  familyStatus: 'Bình thường' | 'Hộ nghèo' | 'Hộ cận nghèo' | 'Mồ côi' | 'Khó khăn đặc biệt' | 'Bố mẹ đi làm xa';
  parentName: string; // Họ tên cha mẹ / người giám hộ
  parentPhone: string; // SĐT liên hệ
  parentJob?: string; // Nghề nghiệp phụ huynh
  isBoarding: boolean; // Tình trạng bán trú
  academicResult: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt' | 'Chưa đánh giá'; // Theo TT 22
  conductResult: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt' | 'Chưa đánh giá'; // Rèn luyện TT 22
  teacherNotes: string; // Ghi chú riêng của GVCN (Bảo mật)
  specialNeeds: boolean; // Cần theo dõi đặc biệt (sức khỏe, tâm lý,...)
  specialNeedsReason?: string;
  hasDropoutRisk: boolean; // Thuộc danh sách nguy cơ bỏ học
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export type SubjectName = 
  | 'Toán' 
  | 'Ngữ văn' 
  | 'Tiếng Anh' 
  | 'KHTN' 
  | 'Lịch sử & Địa lí' 
  | 'GDCD' 
  | 'Tin học' 
  | 'Công nghệ' 
  | 'GDTC' 
  | 'Nghệ thuật';

export interface SubjectScore {
  subject: SubjectName;
  regularScore?: number; // Điểm kiểm tra thường xuyên
  midtermScore?: number; // Điểm giữa kỳ
  finalScore?: number; // Điểm cuối kỳ
  semesterScore?: number; // Trung bình môn
  evaluationNote?: string;
}

export interface StudentAcademicRecord {
  studentId: string;
  semester: 'HK1' | 'HK2';
  scores: Record<SubjectName, SubjectScore>;
  gpa?: number;
  overallLevel: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt' | 'Chưa xếp loại';
  notes: string;
}

export interface IncidentRecord {
  id: string;
  date: string;
  studentId: string;
  title: string;
  type: 'Khen thưởng' | 'Tiến bộ' | 'Vi phạm nội quy' | 'Sự việc cần can thiệp' | 'Gặp khó khăn';
  description: string;
  supportAction: string; // Biện pháp hỗ trợ / xử lý
  result: string; // Kết quả sau xử lý
  personInCharge: string; // Người phụ trách (GVCN, BGH, v.v.)
  status: 'Đã giải quyết' | 'Đang theo dõi' | 'Cần phối hợp thêm';
}

export interface DropoutRiskRecord {
  id: string;
  studentId: string;
  primaryRiskReason: 
    | 'Nghỉ học nhiều ngày'
    | 'Hoàn cảnh kinh tế đặc biệt khó khăn'
    | 'Có nguy cơ theo cha mẹ đi làm xa'
    | 'Sa sút học tập nghiêm trọng'
    | 'Gia đình thiếu sự phối hợp'
    | 'Tâm lý chán học / bạn bè lôi kéo';
  verifiedDetails: string; // Chi tiết nguyên nhân đã xác minh
  warningLevel: 'Mức 1 (Theo dõi)' | 'Mức 2 (Nguy cơ cao)' | 'Mức 3 (Khẩn cấp)';
  contactsCount: number; // Số lần đã liên hệ
  advocacyMeasures: string; // Biện pháp vận động (thăm nhà, hỗ trợ kinh phí, trao học bổng,...)
  coordinatedPartners: string; // Bên phối hợp (BGH, Đoàn Đội, Trưởng thôn, Hội Khuyến học)
  latestOutcome: string; // Kết quả mới nhất
  status: 'Đang vận động' | 'Đã ổn định đi học lại' | 'Chuyển trường' | 'Nguy cơ tiếp diễn';
  updatedAt: string;
}

export interface ParentContactLog {
  id: string;
  studentId: string;
  date: string;
  reason: 'Thông báo vắng học' | 'Thông báo đi muộn' | 'Trao đổi học tập' | 'Trao đổi rèn luyện' | 'Mời họp phụ huynh' | 'Thăm gia đình' | 'Vận động đi học';
  method: 'Điện thoại' | 'Zalo / Tin nhắn' | 'Gặp trực tiếp tại trường' | 'Đến thăm nhà';
  content: string;
  parentResponse: string;
  followUpRequired: boolean;
  teacher: string;
}

export interface ClassMetadata {
  className: string; // "9/2"
  schoolYear: string; // "2026–2027"
  schoolName: string; // "Trường THCS"
  homeroomTeacher: string; // "Giáo viên chủ nhiệm"
  totalStudents: number; // 26
  maleCount: number; // 20
  femaleCount: number; // 6
  lastBackupDate?: string;
  isLocked: boolean;
  passcode: string; // 4-digit PIN (default "1234")
}
