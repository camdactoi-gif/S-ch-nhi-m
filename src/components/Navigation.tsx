import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  GraduationCap, 
  Award, 
  AlertTriangle, 
  PhoneCall, 
  FileSpreadsheet, 
  Settings 
} from 'lucide-react';

export type NavTabId = 
  | 'dashboard' 
  | 'students' 
  | 'attendance' 
  | 'academics' 
  | 'conduct' 
  | 'dropout' 
  | 'parents' 
  | 'reports' 
  | 'settings';

interface NavigationProps {
  activeTab: NavTabId;
  onChangeTab: (tab: NavTabId) => void;
  dropoutWarningCount: number;
  todayAbsenceCount: number;
}

export const navItems: { id: NavTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'students', label: 'Học sinh', icon: Users },
  { id: 'attendance', label: 'Điểm danh', icon: CalendarCheck },
  { id: 'academics', label: 'Học tập', icon: GraduationCap },
  { id: 'conduct', label: 'Rèn luyện', icon: Award },
  { id: 'dropout', label: 'Nguy cơ bỏ học', icon: AlertTriangle },
  { id: 'parents', label: 'Phụ huynh', icon: PhoneCall },
  { id: 'reports', label: 'Báo cáo', icon: FileSpreadsheet },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  dropoutWarningCount,
  todayAbsenceCount,
}) => {
  return (
    <>
      {/* Desktop & Tablet Top Tab Bar */}
      <nav className="bg-white border-b border-slate-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 lg:space-x-2 overflow-x-auto py-2 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onChangeTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 relative ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>

                  {item.id === 'dropout' && dropoutWarningCount > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {dropoutWarningCount}
                    </span>
                  )}

                  {item.id === 'attendance' && todayAbsenceCount > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-red-400 text-white' : 'bg-red-100 text-red-700'
                    }`}>
                      {todayAbsenceCount} vắng
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Floating Bottom Bar for Essential Tabs */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
        <div className="grid grid-cols-5 gap-1">
          {[
            navItems[0], // Tổng quan
            navItems[1], // Học sinh
            navItems[2], // Điểm danh
            navItems[5], // Nguy cơ bỏ học
            navItems[7], // Báo cáo
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-colors relative min-h-[48px] ${
                  isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.id === 'dropout' && dropoutWarningCount > 0 && (
                    <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {dropoutWarningCount}
                    </span>
                  )}
                  {item.id === 'attendance' && todayAbsenceCount > 0 && (
                    <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {todayAbsenceCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-0.5 whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
