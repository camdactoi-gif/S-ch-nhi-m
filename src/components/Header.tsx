import React from 'react';
import { Shield, Lock, Unlock, Download, Users, School } from 'lucide-react';
import { ClassMetadata } from '../types';

interface HeaderProps {
  metadata: ClassMetadata;
  activeTab: string;
  onLockClick: () => void;
  onBackupClick: () => void;
  maleCount: number;
  femaleCount: number;
  totalStudents: number;
  namedStudentsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  metadata,
  onLockClick,
  onBackupClick,
  maleCount,
  femaleCount,
  totalStudents,
  namedStudentsCount,
}) => {
  // Format current date in Vietnamese
  const today = new Date();
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysOfWeek[today.getDay()];
  const formattedDate = `${dayName}, ${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Zone 1, 2, 3 clean contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand & Class Lockup */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            9/2
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Lớp Chủ Nhiệm 9/2
              </h1>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                Năm học {metadata.schoolYear}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              {metadata.homeroomTeacher} · {metadata.schoolName}
            </p>
          </div>
        </div>

        {/* Zone 2: Informational Live Indicators */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
            <School className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-slate-700">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Sĩ số: <strong className="text-slate-900 font-mono tabular-nums">{totalStudents}</strong></span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-700">Nam: <strong className="font-mono tabular-nums">{maleCount}</strong></span>
            <span className="text-slate-300">|</span>
            <span className="text-pink-700">Nữ: <strong className="font-mono tabular-nums">{femaleCount}</strong></span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700">Đã nhập tên: <strong className="font-mono tabular-nums">{namedStudentsCount}/{totalStudents}</strong></span>
          </div>
        </div>

        {/* Zone 3: Security & Quick Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onBackupClick}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Sao lưu dữ liệu nhanh"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Sao lưu</span>
          </button>

          <button
            onClick={onLockClick}
            className={`flex items-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-medium rounded-lg transition-colors ${
              metadata.isLocked 
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300' 
                : 'bg-slate-800 text-white hover:bg-slate-900'
            }`}
            title={metadata.isLocked ? "Bảo vệ bảo mật đang BẬT" : "Khóa bảo vệ bảo mật"}
          >
            {metadata.isLocked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5 text-slate-300" />}
            <span className="hidden xs:inline">{metadata.isLocked ? 'Đang Khóa' : 'Khóa Riêng Tư'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
