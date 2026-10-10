import { 
  Student, 
  AttendanceRecord, 
  SubjectName, 
  IncidentRecord, 
  DropoutRiskRecord, 
  ParentContactLog, 
  ClassMetadata 
} from '../types';

const STORAGE_KEY_STUDENTS = 'gvcn_9_2_students_v1';
const STORAGE_KEY_ATTENDANCE = 'gvcn_9_2_attendance_v1';
const STORAGE_KEY_INCIDENTS = 'gvcn_9_2_incidents_v1';
const STORAGE_KEY_DROPOUT = 'gvcn_9_2_dropout_v1';
const STORAGE_KEY_CONTACTS = 'gvcn_9_2_contacts_v1';
const STORAGE_KEY_META = 'gvcn_9_2_meta_v1';
const STORAGE_KEY_ACADEMICS = 'gvcn_9_2_academics_v1';

export const ALL_SUBJECTS: SubjectName[] = [
  'Toán',
  'Ngữ văn',
  'Tiếng Anh',
  'KHTN',
  'Lịch sử & Địa lí',
  'GDCD',
  'Tin học',
  'Công nghệ',
  'GDTC',
  'Nghệ thuật'
];

/**
 * Khởi tạo đúng 26 dòng học sinh trống theo yêu cầu:
 * - Tổng số: 26 em
 * - Nam: 20 em (STT 1 -> 20)
 * - Nữ: 6 em (STT 21 -> 26)
 * - Tuyệt đối không tạo tên giả mạo. Để trống họ tên để GVCN tự nhập hoặc import từ Excel.
 */
export function createInitialBlankStudents(): Student[] {
  const students: Student[] = [];
  
  for (let i = 1; i <= 26; i++) {
    const isFemale = i > 20; // 20 Nam, 6 Nữ
    const formattedCode = `902${i < 10 ? '0' + i : i}`;
    
    students.push({
      id: `hs_${i}`,
      stt: i,
      studentCode: formattedCode,
      fullName: '', // Trống để GV tự nhập
      birthDate: '2012-01-01',
      gender: isFemale ? 'Nữ' : 'Nam',
      ethnicity: 'Kinh',
      address: '',
      hamlet: '',
      familyStatus: 'Bình thường',
      parentName: '',
      parentPhone: '',
      parentJob: '',
      isBoarding: false,
      academicResult: 'Chưa đánh giá',
      conductResult: 'Chưa đánh giá',
      teacherNotes: '',
      specialNeeds: false,
      specialNeedsReason: '',
      hasDropoutRisk: false,
    });
  }

  return students;
}

export const defaultClassMetadata: ClassMetadata = {
  className: '9/2',
  schoolYear: '2026–2027',
  schoolName: 'Trường THCS',
  homeroomTeacher: 'Giáo viên chủ nhiệm Lớp 9/2',
  totalStudents: 26,
  maleCount: 20,
  femaleCount: 6,
  isLocked: false,
  passcode: '1234', // Mã PIN bảo vệ hồ sơ
  lastBackupDate: new Date().toISOString(),
};

export const StorageService = {
  getStudents(): Student[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (!data) {
        const initial = createInitialBlankStudents();
        this.saveStudents(initial);
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return createInitialBlankStudents();
    }
  },

  saveStudents(students: Student[]) {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  },

  getAttendance(): AttendanceRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveAttendance(attendance: AttendanceRecord[]) {
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(attendance));
  },

  getIncidents(): IncidentRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_INCIDENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveIncidents(incidents: IncidentRecord[]) {
    localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(incidents));
  },

  getDropoutRisks(): DropoutRiskRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_DROPOUT);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveDropoutRisks(records: DropoutRiskRecord[]) {
    localStorage.setItem(STORAGE_KEY_DROPOUT, JSON.stringify(records));
  },

  getParentContacts(): ParentContactLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CONTACTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveParentContacts(contacts: ParentContactLog[]) {
    localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(contacts));
  },

  getMetadata(): ClassMetadata {
    try {
      const data = localStorage.getItem(STORAGE_KEY_META);
      return data ? { ...defaultClassMetadata, ...JSON.parse(data) } : defaultClassMetadata;
    } catch {
      return defaultClassMetadata;
    }
  },

  saveMetadata(meta: ClassMetadata) {
    localStorage.setItem(STORAGE_KEY_META, JSON.stringify(meta));
  },

  getAcademics(): Record<string, Record<string, number>> {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ACADEMICS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveAcademics(academics: Record<string, Record<string, number>>) {
    localStorage.setItem(STORAGE_KEY_ACADEMICS, JSON.stringify(academics));
  },

  // Export full backup as JSON
  exportFullBackup(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      metadata: this.getMetadata(),
      students: this.getStudents(),
      attendance: this.getAttendance(),
      incidents: this.getIncidents(),
      dropoutRisks: this.getDropoutRisks(),
      parentContacts: this.getParentContacts(),
      academics: this.getAcademics(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Restore full backup from JSON
  restoreFullBackup(jsonString: string): boolean {
    try {
      const backup = JSON.parse(jsonString);
      if (backup.students && Array.isArray(backup.students)) {
        this.saveStudents(backup.students);
      }
      if (backup.attendance && Array.isArray(backup.attendance)) {
        this.saveAttendance(backup.attendance);
      }
      if (backup.incidents && Array.isArray(backup.incidents)) {
        this.saveIncidents(backup.incidents);
      }
      if (backup.dropoutRisks && Array.isArray(backup.dropoutRisks)) {
        this.saveDropoutRisks(backup.dropoutRisks);
      }
      if (backup.parentContacts && Array.isArray(backup.parentContacts)) {
        this.saveParentContacts(backup.parentContacts);
      }
      if (backup.metadata) {
        this.saveMetadata(backup.metadata);
      }
      if (backup.academics) {
        this.saveAcademics(backup.academics);
      }
      return true;
    } catch (err) {
      console.error('Failed to restore backup:', err);
      return false;
    }
  },

  // Reset to original 26 blank slots
  resetToDefault() {
    this.saveStudents(createInitialBlankStudents());
    this.saveAttendance([]);
    this.saveIncidents([]);
    this.saveDropoutRisks([]);
    this.saveParentContacts([]);
    this.saveAcademics({});
    this.saveMetadata(defaultClassMetadata);
  }
};
