import React, { useEffect, useState } from 'react';
import { CheckCircle2, Github, Loader2, LogOut, ShieldCheck, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GitHubSessionResponse {
  configured: boolean;
  authenticated: boolean;
  login?: string;
  expiresAt?: number;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [session, setSession] = useState<GitHubSessionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    setIsLoading(true);
    setErrorMessage(null);

    fetch('/api/auth/session', { credentials: 'same-origin' })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok && response.status !== 503) {
          throw new Error('GitHub session status could not be loaded.');
        }
        return data as GitHubSessionResponse | null;
      })
      .then((data) => {
        if (active) setSession(data);
      })
      .catch(() => {
        if (active) {
          setSession({ configured: false, authenticated: false });
          setErrorMessage('সার্ভার থেকে sign-in status যাচাই করা যায়নি।');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const startGitHubSignIn = () => {
    window.location.assign('/api/auth/github');
  };

  const signOut = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      if (!response.ok && response.status !== 204) {
        throw new Error('Sign out failed.');
      }
      setSession((current) => ({
        configured: current?.configured ?? true,
        authenticated: false,
      }));
    } catch {
      setErrorMessage('Sign out করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl glass-card border border-pink-500/40 p-6 space-y-5 shadow-[0_0_40px_rgba(255,46,147,0.35)] relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white shadow">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Secure sign-in to SARA AI</h3>
              <p className="text-xs text-slate-400">GitHub OAuth · server-verified session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sign-in dialog"
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-10 flex flex-col items-center justify-center gap-3 text-slate-300">
            <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
            <p className="text-sm">GitHub session যাচাই হচ্ছে...</p>
          </div>
        ) : session?.authenticated && session.login ? (
          <div className="space-y-4">
            <div className="py-6 flex flex-col items-center text-center gap-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              <p className="text-base font-bold text-white">GitHub-এ sign in করা আছে</p>
              <p className="text-sm text-pink-300 font-mono">@{session.login}</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                GitHub Actions approval শুধু server allowlist-এ থাকা account-গুলোর জন্য চালু হয়।
              </p>
            </div>
            <button
              onClick={signOut}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        ) : !session?.configured ? (
          <div className="space-y-3 py-4">
            <div className="rounded-2xl bg-amber-950/50 border border-amber-500/40 p-4 text-sm text-amber-100">
              <p className="font-bold mb-1">GitHub sign-in is not configured</p>
              <p className="text-xs leading-relaxed text-amber-200/90">
                Server environment-এ OAuth client, callback URL, 32+ character session secret, app URL এবং allowed GitHub users configure করতে হবে। Configuration না থাকলে workflow dispatch বন্ধ থাকবে।
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <p className="text-sm leading-relaxed text-slate-300">
              সাইন-ইন করতে GitHub ব্যবহার করা হবে। Password Sara-কে দেওয়া হবে না; OAuth callback server-side যাচাই হবে এবং allowlisted account ছাড়া workflow approval করা যাবে না।
            </p>
            <button
              onClick={startGitHubSignIn}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,46,147,0.4)]"
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </button>
            <p className="text-[11px] text-slate-500 leading-relaxed text-center">
              Access is limited by the server-side GitHub username allowlist.
            </p>
          </div>
        )}

        {errorMessage && (
          <p role="alert" className="text-xs text-red-300 bg-red-950/50 border border-red-500/30 rounded-xl p-3">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};
