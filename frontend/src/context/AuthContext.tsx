import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'corporate_admin' | 'yard_master' | 'security_guard' | 'guest';

export interface EnterpriseUser {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  role_label: string;
  tenant_id: string;
  permissions: string[];
  avatar: string;
}

export interface TenantInfo {
  tenant_id: string;
  name: string;
  organization: string;
  location: string;
  country: string;
  currency: string;
  currency_symbol: string;
  active_docks: number;
  free_time_hours: number;
  detention_rate_per_hour: number;
  cameras_online: number;
  default_market: string;
  sla_target_turnaround_mins: number;
}

interface AuthContextType {
  user: EnterpriseUser;
  token: string | null;
  tenant: TenantInfo;
  availableTenants: TenantInfo[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  switchRole: (role: UserRole) => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
  login: (email: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const DEFAULT_USER: EnterpriseUser = {
  user_id: 'usr_corp_admin_01',
  name: 'Vikramaditya Singhania',
  email: 'admin@yardsight.corp',
  role: 'corporate_admin',
  role_label: 'Corporate Operations VP & Admin',
  tenant_id: 'TENANT-AMZN-BLR1',
  permissions: ['all', 'read:video', 'read:track', 'write:dock', 'write:eway_bill', 'write:scale', 'admin:mcp'],
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
};

const DEFAULT_TENANT: TenantInfo = {
  tenant_id: 'TENANT-AMZN-BLR1',
  name: 'Amazon BLR1 Fulfillment Center',
  organization: 'Amazon Transportation Services (ATS)',
  location: 'Hoskote Logistics Corridor, Bengaluru, Karnataka',
  country: 'India',
  currency: 'INR',
  currency_symbol: '₹',
  active_docks: 12,
  free_time_hours: 2.0,
  detention_rate_per_hour: 1200.0,
  cameras_online: 16,
  default_market: 'IN_GST',
  sla_target_turnaround_mins: 45
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<EnterpriseUser>(DEFAULT_USER);
  const [token, setToken] = useState<string | null>(null);
  const [tenant, setTenant] = useState<TenantInfo>(DEFAULT_TENANT);
  const [availableTenants, setAvailableTenants] = useState<TenantInfo[]>([DEFAULT_TENANT]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Initial load: Fetch token & tenants
  useEffect(() => {
    const initAuth = async () => {
      try {
        const loginRes = await fetch('http://127.0.0.1:8001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@yardsight.corp' })
        });
        if (loginRes.ok) {
          const data = await loginRes.json();
          setUser(data.user);
          setToken(data.access_token);
        }

        const tenantsRes = await fetch('http://127.0.0.1:8001/api/tenants');
        if (tenantsRes.ok) {
          const tData = await tenantsRes.json();
          setAvailableTenants(tData.tenants);
          const active = tData.tenants.find((t: TenantInfo) => t.tenant_id === tData.active_tenant_id);
          if (active) setTenant(active);
        }
      } catch (e) {
        console.warn('Backend offline, using mock enterprise auth context', e);
      }
    };
    initAuth();
  }, []);

  const switchRole = async (newRole: UserRole) => {
    try {
      const res = await fetch('http://127.0.0.1:8001/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.access_token);
      }
    } catch {
      // Fallback
      if (newRole === 'security_guard') {
        setUser({
          user_id: 'usr_gate_guard_03',
          name: 'Ramesh Patil',
          email: 'guard@yardsight.corp',
          role: 'security_guard',
          role_label: 'Security Gate Specialist',
          tenant_id: tenant.tenant_id,
          permissions: ['read:video', 'write:gate_checkin', 'write:barrier'],
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
        });
      } else if (newRole === 'yard_master') {
        setUser({
          user_id: 'usr_yard_master_02',
          name: 'Priya Sundaram',
          email: 'yardmaster@yardsight.corp',
          role: 'yard_master',
          role_label: 'Hub Yard Master & Dispatcher',
          tenant_id: tenant.tenant_id,
          permissions: ['read:video', 'read:track', 'write:dock', 'write:dispatch', 'read:eway_bill', 'write:leak'],
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80'
        });
      } else {
        setUser(DEFAULT_USER);
      }
    }
  };

  const switchTenant = async (tenantId: string) => {
    try {
      const res = await fetch('http://127.0.0.1:8001/api/tenants/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId })
      });
      if (res.ok) {
        const data = await res.json();
        setTenant(data.active_tenant);
      }
    } catch {
      const found = availableTenants.find((t) => t.tenant_id === tenantId);
      if (found) setTenant(found);
    }
  };

  const login = async (email: string, role?: UserRole) => {
    try {
      const res = await fetch('http://127.0.0.1:8001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.access_token);
        setIsAuthModalOpen(false);
      }
    } catch {
      setIsAuthModalOpen(false);
    }
  };

  const logout = () => {
    setUser({
      user_id: 'usr_guest',
      name: 'Guest Observer',
      email: 'guest@logistics.corp',
      role: 'guest',
      role_label: 'Guest / Evaluator',
      tenant_id: tenant.tenant_id,
      permissions: ['read:video'],
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
    });
    setToken(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (user.permissions.includes('all')) return true;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        tenant,
        availableTenants,
        isAuthModalOpen,
        setIsAuthModalOpen,
        switchRole,
        switchTenant,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
