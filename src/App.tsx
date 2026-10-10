/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Student, 
  AttendanceRecord, 
  IncidentRecord, 
  DropoutRiskRecord, 
  ParentContactLog, 
  ClassMetadata 
} from './types';
import { StorageService } from './utils/storage';
import { Header } from './components/Header';
import { Navigation, NavTabId } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { StudentsView } from './components/StudentsView';
import { AttendanceView } from './components/AttendanceView';
import { AcademicsView } from './components/AcademicsView';
import { ConductView } from './components/ConductView';
import { DropoutRiskView } from './components/DropoutRiskView';
import { ParentsView } from './components/ParentsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { ExcelImportModal } from './components/ExcelImportModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Load persistent state
  const [students, setStudents] = useState<Student[]>(() => StorageService.getStudents());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => StorageService.getAttendance());
  const [incidents, setIncidents] = useState<IncidentRecord[]>(() => StorageService.getIncidents());
  const [dropoutRisks, setDropoutRisks] = useState<DropoutRiskRecord[]>(() => StorageService.getDropoutRisks());
  const [parentContacts, setParentContacts] = useState<ParentContactLog[]>(() => StorageService.getParentContacts());
  const [metadata, setMetadata] = useState<ClassMetadata>(() => StorageService.getMetadata());

  // Active view navigation
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');

  // Today date (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync state to LocalStorage
  const handleUpdateStudents = (updated: Student[]) => {
    setStudents(updated);
    StorageService.saveStudents(updated);
  };

  const handleUpdateAttendance = (updated: AttendanceRecord[]) => {
    setAttendance(updated);
    StorageService.saveAttendance(updated);
  };

  const handleUpdateIncidents = (updated: IncidentRecord[]) => {
    setIncidents(updated);
    StorageService.saveIncidents(updated);
  };

  const handleUpdateDropoutRisks = (updated: DropoutRiskRecord[]) => {
    setDropoutRisks(updated);
    StorageService.saveDropoutRisks(updated);
  };

  const handleUpdateParentContacts = (updated: ParentContactLog[]) => {
    setParentContacts(updated);
    StorageService.saveParentContacts(updated);
  };

  const handleUpdateMetadata = (updated: ClassMetadata) => {
    setMetadata(updated);
    StorageService.saveMetadata(updated);
  };

  // Restore success handler
  const handleRestoreSuccess = () => {
    setStudents(StorageService.getStudents());
    setAttendance(StorageService.getAttendance());
    setIncidents(StorageService.getIncidents());
    setDropoutRisks(StorageService.getDropoutRisks());
    setParentContacts(StorageService.getParentContacts());
    setMetadata(StorageService.getMetadata());
  };

  // Reset to default
  const handleResetToDefault = () => {
    StorageService.resetToDefault();
    handleRestoreSuccess();
  };

  // Lock / Unlock toggle
  const handleToggleLock = () => {
    if (metadata.isLocked) {
      // Prompt to unlock
      setIsAuthModalOpen(true);
    } else {
      // Lock now
      const updated = { ...metadata, isLocked: true };
      handleUpdateMetadata(updated);
    }
  };

  const handleUnlockSuccess = () => {
    const updated = { ...metadata, isLocked: false };
    handleUpdateMetadata(updated);
    setIsAuthModalOpen(false);
  };

  // Quick backup download
  const handleQuickBackup = () => {
    const jsonStr = StorageService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sao_Luu_Lop_9_2_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Summary counts
  const totalStudents = students.length;
  const maleCount = students.filter(s => s.gender === 'Nam').length;
  const femaleCount = students.filter(s => s.gender === 'Nữ').length;
  const namedStudentsCount = students.filter(s => s.fullName.trim() !== '').length;

  const todayAbsences = attendance.filter(a => a.date === selectedDate && (a.status === 'unexcused' || a.status === 'excused')).length;
  const activeDropoutCount = dropoutRisks.filter(r => r.status !== 'Đã ổn định đi học lại').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Top Header */}
      <Header
        metadata={metadata}
        activeTab={activeTab}
        onLockClick={handleToggleLock}
        onBackupClick={handleQuickBackup}
        maleCount={maleCount}
        femaleCount={femaleCount}
        totalStudents={totalStudents}
        namedStudentsCount={namedStudentsCount}
      />

      {/* Main Tab Bar Navigation */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        dropoutWarningCount={activeDropoutCount}
        todayAbsenceCount={todayAbsences}
      />

      {/* Primary Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {metadata.isLocked ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
            <div className="w-16 h-16 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Hồ sơ Lớp 9/2 đang ở chế độ bảo mật
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dữ liệu học sinh, điểm số và số điện thoại phụ huynh được bảo vệ riêng tư. Vui lòng mở khóa bằng mã PIN để tiếp tục làm việc.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
            >
              Mở khóa bằng mã PIN
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                students={students}
                attendance={attendance}
                incidents={incidents}
                dropoutRisks={dropoutRisks}
                selectedDate={selectedDate}
                onNavigate={setActiveTab}
                onOpenImport={() => setIsImportModalOpen(true)}
              />
            )}

            {activeTab === 'students' && (
              <StudentsView
                students={students}
                onUpdateStudents={handleUpdateStudents}
                onOpenImportModal={() => setIsImportModalOpen(true)}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceView
                students={students}
                attendance={attendance}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onUpdateAttendance={handleUpdateAttendance}
              />
            )}

            {activeTab === 'academics' && (
              <AcademicsView
                students={students}
                onUpdateStudents={handleUpdateStudents}
              />
            )}

            {activeTab === 'conduct' && (
              <ConductView
                students={students}
                incidents={incidents}
                onUpdateIncidents={handleUpdateIncidents}
              />
            )}

            {activeTab === 'dropout' && (
              <DropoutRiskView
                students={students}
                dropoutRisks={dropoutRisks}
                attendance={attendance}
                onUpdateDropoutRisks={handleUpdateDropoutRisks}
                onNavigateToParents={() => setActiveTab('parents')}
              />
            )}

            {activeTab === 'parents' && (
              <ParentsView
                students={students}
                contacts={parentContacts}
                onUpdateContacts={handleUpdateParentContacts}
                selectedDate={selectedDate}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                students={students}
                attendance={attendance}
                incidents={incidents}
                dropoutRisks={dropoutRisks}
                metadata={metadata}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                metadata={metadata}
                onUpdateMetadata={handleUpdateMetadata}
                onRestoreSuccess={handleRestoreSuccess}
                onResetToDefault={handleResetToDefault}
              />
            )}
          </>
        )}
      </main>

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onApplyStudents={handleUpdateStudents}
        currentStudents={students}
      />

      {/* Teacher PIN Passcode Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        correctPasscode={metadata.passcode}
        onSuccess={handleUnlockSuccess}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>QUẢN LÝ LỚP CHỦ NHIỆM 9/2 – NĂM HỌC 2026–2027</span>
          <span className="text-slate-400">Ứng dụng dành cho Giáo viên chủ nhiệm THCS</span>
        </div>
      </footer>

    </div>
  );
}
