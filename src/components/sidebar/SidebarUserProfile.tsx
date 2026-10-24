import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, Check, LogOut } from 'lucide-react';
import { useAuth, type UserRole } from '../../context/AuthContext';

interface SidebarUserProfileProps {
  isCollapsed: boolean;
}

export const SidebarUserProfile: React.FC<SidebarUserProfileProps> = ({ isCollapsed }) => {
  const { user, switchRole, logout } = useAuth();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  return (
    <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 relative">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user.name}</div>
              <button
                type="button"
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>{user.role.replace('_', ' ').toUpperCase()}</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            type="button"
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Role Switcher Dropdown */}
      {isRoleMenuOpen && !isCollapsed && (
        <div className="absolute bottom-full left-3 right-3 mb-2 py-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 animate-in fade-in">
          <div className="px-3 py-1.5 text-[9px] font-bold uppercase text-slate-500 border-b border-slate-800 font-mono">
            SWITCH CASL RBAC ROLE:
          </div>
          {(['corporate_admin', 'yard_master', 'security_guard'] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                switchRole(r);
                setIsRoleMenuOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-800 cursor-pointer ${
                user.role === r ? 'text-cyan-400 font-bold' : 'text-slate-300'
              }`}
            >
              <span>{r === 'corporate_admin' ? 'Facility Admin' : r === 'yard_master' ? 'Yard Master' : 'Security Guard'}</span>
              {user.role === r && <Check className="w-3.5 h-3.5 text-cyan-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
