import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Building2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth, type UserRole } from '../context/AuthContext';

export interface EnterpriseAuthPortalProps {
  onOpenOnboarding?: () => void;
}

export const EnterpriseAuthPortal: React.FC<EnterpriseAuthPortalProps> = ({
  onOpenOnboarding
}) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@yardsight.corp');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('corporate_admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const ROLE_PRESETS = [
    {
      role: 'corporate_admin' as UserRole,
      title: 'Facility Administrator',
      email: 'admin@yardsight.corp',
      scope: 'Full Admin & Compliance',
      badge: 'border-amber-500/40 bg-amber-500/10 text-amber-300'
    },
    {
      role: 'yard_master' as UserRole,
      title: 'Hub Yard Master',
      email: 'yardmaster@yardsight.corp',
      scope: 'Fleet, Docks & Leaks',
      badge: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
    },
    {
      role: 'security_guard' as UserRole,
      title: 'Gate Security Guard',
      email: 'guard@yardsight.corp',
      scope: 'Gate ANPR & Check-in',
      badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
    }
  ];

  const handleSelectRolePreset = (preset: typeof ROLE_PRESETS[0]) => {
    setSelectedRole(preset.role);
    setEmail(preset.email);
    setPassword('••••••••••••');
    setStatusMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatusMessage({ type: 'error', text: 'Please enter your corporate email address.' });
      return;
    }
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      let targetRole = selectedRole;
      if (email.includes('guard') || email.includes('security')) {
        targetRole = 'security_guard';
      } else if (email.includes('yard') || email.includes('dispatcher')) {
        targetRole = 'yard_master';
      }
      await login(email, targetRole);
    } catch {
      setStatusMessage({ type: 'error', text: 'Authentication failed. Please verify your credentials.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1d] text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background ambient gradients */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-blue-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white">
                YardSight<span className="text-cyan-400">.AI</span>
              </span>
              <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                GODOWNOS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Industrial Vision & Physical AI for Logistics Yards</p>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-lg rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl p-6 sm:p-8 space-y-6">

          {/* Card Title */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Enterprise Sign In
            </h1>
            <p className="text-xs text-slate-400">
              1 Login = 1 Role. Select your authorized operational role profile.
            </p>
          </div>

          {/* 1 Login = 1 Role Policy Badge */}
          <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-slate-300 font-semibold text-[11px]">Strict RBAC Enforcement:</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded">
              1 Role Per Account
            </span>
          </div>

          {/* Role Account Quick Selector */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Select Your Authorized Role Profile:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLE_PRESETS.map((p) => {
                const isSelected = selectedRole === p.role;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleSelectRolePreset(p)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/50 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-xs truncate text-white">{p.title.split(' ')[0]}</div>
                    <div className="text-[9px] text-cyan-400 truncate mt-0.5 font-medium">{p.scope}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Status Notice */}
          {statusMessage && (
            <div
              className={`rounded-xl p-3.5 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-red-500/15 border border-red-500/30 text-red-300'
                  : 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
              }`}
            >
              {statusMessage.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
              {statusMessage.type === 'error' && <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Corporate Account Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yardsight.corp"
                  required
                  className="w-full rounded-xl bg-slate-950/80 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl bg-slate-950/80 border border-slate-800 pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Signing In as {selectedRole.replace('_', ' ')}...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Sign In as {selectedRole === 'corporate_admin' ? 'Facility Admin' : selectedRole === 'yard_master' ? 'Yard Master' : 'Security Guard'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Setup New Facility Link */}
          {onOpenOnboarding && (
            <div className="pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={onOpenOnboarding}
                className="w-full text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-cyan-500/10 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>New Customer? Setup Your Facility</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-3 border-t border-slate-800/80 bg-slate-950/80 text-center text-[11px] text-slate-500 relative z-10">
        <div>© 2026 YardSight AI (GodownOS) • Industrial Vision & Physical AI for Logistics Hubs</div>
      </footer>
    </div>
  );
};

// Backwards compatibility re-exports
export const AmazonEnterpriseAuthPortal = EnterpriseAuthPortal;
export type AmazonEnterpriseAuthPortalProps = EnterpriseAuthPortalProps;
