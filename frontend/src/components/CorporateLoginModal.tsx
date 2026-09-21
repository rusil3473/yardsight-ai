import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';

export const CorporateLoginModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, switchRole, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'demo' | 'credentials' | 'otp'>('demo');
  const [email, setEmail] = useState('admin@yardsight.corp');
  const [password, setPassword] = useState('password123');
  const [otp, setOtp] = useState('482910');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleDemoSelect = async (role: UserRole) => {
    setIsSubmitting(true);
    await switchRole(role);
    setIsSubmitting(false);
    setIsAuthModalOpen(false);
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(email);
    setIsSubmitting(false);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/30 mb-3">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            ENTERPRISE LOGISTICS SSO
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            YardSight Enterprise Sign-In
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Role-Based Access Control for ATS, Ekart & 3PL Logistics Networks
          </p>
        </div>

        {/* Tab switcher */}
        <div className="my-5 flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${
              activeTab === 'demo' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ 1-Click Demo Roles
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${
              activeTab === 'credentials' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔑 Credentials
          </button>
          <button
            onClick={() => setActiveTab('otp')}
            className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${
              activeTab === 'otp' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📱 SMS / OTP
          </button>
        </div>

        {/* Demo Tab Content */}
        {activeTab === 'demo' && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-400 font-semibold mb-2">
              Select a pre-configured corporate profile to test RBAC permissions:
            </div>

            <button
              onClick={() => handleDemoSelect('corporate_admin')}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between rounded-2xl bg-slate-950/80 border border-amber-500/40 p-3.5 text-left hover:bg-slate-800/80 hover:border-amber-400 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 font-bold">
                  👑
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    Corporate Operations VP & Admin
                  </div>
                  <div className="text-xs text-slate-400">admin@yardsight.corp • Full Access & E-Way Bills</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </button>

            <button
              onClick={() => handleDemoSelect('yard_master')}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between rounded-2xl bg-slate-950/80 border border-cyan-500/40 p-3.5 text-left hover:bg-slate-800/80 hover:border-cyan-400 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 font-bold">
                  🚚
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Hub Yard Master & Dispatcher
                  </div>
                  <div className="text-xs text-slate-400">yardmaster@yardsight.corp • Dock Turnaround & Alerts</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </button>

            <button
              onClick={() => handleDemoSelect('security_guard')}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between rounded-2xl bg-slate-950/80 border border-emerald-500/40 p-3.5 text-left hover:bg-slate-800/80 hover:border-emerald-400 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 font-bold">
                  🛡️
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Security Gate Specialist
                  </div>
                  <div className="text-xs text-slate-400">guard@yardsight.corp • ANPR Scanning & Barrier Pass</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </button>
          </div>
        )}

        {/* Credentials Tab */}
        {activeTab === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Corporate Email</label>
              <div className="mt-1 flex items-center rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs">
                <Mail className="h-4 w-4 text-slate-500 mr-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-white focus:outline-none"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="mt-1 flex items-center rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs">
                <Lock className="h-4 w-4 text-slate-500 mr-2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-white focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-bold text-slate-950 hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In with SSO'}
            </button>
          </form>
        )}

        {/* OTP Tab */}
        {activeTab === 'otp' && (
          <div className="space-y-4 text-center">
            <p className="text-xs text-slate-300">Enter the 6-digit verification code sent to +91 98450 •••••</p>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-48 text-center tracking-widest text-2xl font-mono rounded-xl bg-slate-950 border border-slate-700 py-3 text-cyan-400 focus:outline-none focus:border-cyan-400 mx-auto block"
            />
            <button
              onClick={() => handleDemoSelect('yard_master')}
              className="w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all"
            >
              Verify OTP & Enter GodownOS
            </button>
          </div>
        )}

        {/* Footer SSO Badges */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
            Enterprise Identity Providers Supported
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400 font-semibold">
            <span>🔵 Okta Verify</span>
            <span>•</span>
            <span>🔴 Google Workspace SSO</span>
            <span>•</span>
            <span>🟦 Azure Active Directory</span>
          </div>
        </div>
      </div>
    </div>
  );
};
