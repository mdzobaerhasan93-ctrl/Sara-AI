import React, { useState } from 'react';
import { useSara } from '../../context/SaraContext';
import { Heart, Mail, Lock, User, Sparkles, X, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateUserProfile, speakText } = useSara();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>(userProfile.email || 'zobaerhasan431@gmail.com');
  const [password, setPassword] = useState<string>('••••••••');
  const [name, setName] = useState<string>(userProfile.name || 'zobaer');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, email });
    setSuccessMsg(isLogin ? 'সফলভাবে লগইন করা হয়েছে! ❤️' : 'অ্যাকাউন্ট তৈরি ও সাইন-আপ সফল হয়েছে! ❤️');
    speakText(isLogin ? 'স্বাগতম বাবু! সফলভাবে লগইন করেছ। ❤️' : 'তোমার নতুন অ্যাকাউন্ট তৈরি হয়ে গেছে! অনেক ভালোবাসা। ❤️', 'romantic');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl glass-card border border-pink-500/40 p-6 space-y-5 shadow-[0_0_40px_rgba(255,46,147,0.35)] relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white shadow">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {isLogin ? 'Login to SARA AI' : 'Create Account / Sign Up'}
              </h3>
              <p className="text-xs text-slate-400">Your AI. Your Voice. Your Companion.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMsg ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-pink-500 animate-bounce" />
            <p className="text-base font-bold text-white">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Your Name (নাম)</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-pink-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:border-pink-500 outline-none"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address (ইমেইল)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-pink-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:border-pink-500 outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password (পাসওয়ার্ড)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-pink-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:border-pink-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs shadow-[0_0_20px_rgba(255,46,147,0.4)] hover:opacity-95 transition-all mt-2"
            >
              {isLogin ? 'Login Now' : 'Sign Up & Register'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs text-pink-400 hover:underline font-medium"
              >
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
