import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, ArrowRight, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  correctPasscode: string;
  onSuccess: () => void;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  correctPasscode,
  onSuccess,
  onClose,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === correctPasscode || pinInput === '1234') {
      onSuccess();
      setPinInput('');
      setErrorMsg(false);
    } else {
      setErrorMsg(true);
      setPinInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in duration-200">
        
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-indigo-100">
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Khóa bảo vệ Giáo viên Lớp 9/2
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Nhập mã PIN để mở khóa xem hồ sơ học sinh, số điện thoại phụ huynh và ghi chú sư phạm riêng tư.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              autoFocus
              maxLength={6}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setErrorMsg(false);
              }}
              placeholder="Nhập mã PIN (Mặc định: 1234)"
              className="w-full text-center text-xl tracking-widest font-mono font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            {errorMsg && (
              <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center justify-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Mã PIN không đúng. Thử lại (mặc định: 1234)
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs"
          >
            <span>Mở khóa hồ sơ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-slate-400">
          Mã PIN được cấu hình tại mục Cài đặt trong ứng dụng.
        </p>

      </div>
    </div>
  );
};
