import React, { useState } from 'react';
import { User } from '../types';
import { LogIn, Key, Mail, ShieldAlert, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState<string>('admin@labpulse.org');
  const [password, setPassword] = useState<string>('password123');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const data = await api.login(email, password);
      onLoginSuccess(data.token, data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setIsLoading(true);
    try {
      const data = await api.login(demoEmail, 'password123');
      onLoginSuccess(data.token, data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };
      onLoginSuccess(direct.token, direct.user);
      onClose();
    } catch (fsErr) {
      console.error(fsErr);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#F7F5F0] border-2 border-[#1A1A1A] rounded-md max-w-md w-full p-6 shadow-[8px_8px_0px_0px_#1A1A1A] space-y-5 animate-fade-in">
        <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-3">
          <div className="flex items-center gap-2 font-mono font-extrabold text-[#1A1A1A] text-lg uppercase">
            <LogIn className="w-5 h-5 text-[#1D4ED8]" />
            LAB PULSE SIGN IN
          </div>
          <button onClick={onClose} className="font-mono font-bold text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#FEE2E2] border border-[#991B1B] text-[#991B1B] text-xs font-mono font-bold rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block font-bold mb-1 text-[#1A1A1A]">EMAIL ADDRESS:</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border-2 border-[#1A1A1A] rounded p-2 pl-9 font-bold focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1 text-[#1A1A1A]">PASSWORD:</label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-2 border-[#1A1A1A] rounded p-2 pl-9 font-bold focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#1D4ED8] text-white border-2 border-[#1A1A1A] rounded font-mono font-extrabold text-sm shadow-[3px_3px_0px_0px_#1A1A1A] hover:bg-blue-800"
          >
            {isLoading ? 'SIGNING IN...' : 'SIGN IN TO DASHBOARD'}
          </button>
        </form>

        {/* Quick Demo Credentials List */}
        <div className="border-t-2 border-[#1A1A1A] pt-4 font-mono text-xs">
          <span className="font-bold text-gray-700 block mb-2 uppercase text-[10px]">
            ⚡ ONE-CLICK DEMO PROFILES:
          </span>
          <div className="space-y-2">
            <button
              onClick={() => handleQuickDemo('admin@labpulse.org')}
              className="w-full text-left p-2 bg-amber-50 border border-[#92400E] rounded hover:bg-amber-100 flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-[#92400E]">👑 Priya Sharma (Program Manager)</div>
                <div className="text-[10px] text-gray-600">admin@labpulse.org • Admin Role</div>
              </div>
              <span className="text-[10px] font-bold bg-[#92400E] text-white px-1.5 py-0.5 rounded">
                Select
              </span>
            </button>

            <button
              onClick={() => handleQuickDemo('oakridge.lab@school.edu')}
              className="w-full text-left p-2 bg-blue-50 border border-blue-800 rounded hover:bg-blue-100 flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-blue-900">📱 Marcus Vance (Oakridge Teacher)</div>
                <div className="text-[10px] text-gray-600">oakridge.lab@school.edu • Single School</div>
              </div>
              <span className="text-[10px] font-bold bg-blue-800 text-white px-1.5 py-0.5 rounded">
                Select
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
