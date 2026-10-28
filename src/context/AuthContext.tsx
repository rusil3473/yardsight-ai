import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/env';

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
  phone?: string;
  department?: string;
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
  isAuthenticated: boolean;
  tenant: TenantInfo;
  availableTenants: TenantInfo[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  switchRole: (role: UserRole) => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
  login: (email: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  purgeAllData: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  updateProfile: (name: string, email: string, phone?: string, department?: string) => Promise<{ success: boolean; message: string }>;
  updateTenantSettings: (settings: Partial<TenantInfo>) => Promise<{ success: boolean; message: string }>;
  createCustomFacility: (facilityData: Partial<TenantInfo>) => Promise<TenantInfo>;
  refreshData: () => Promise<void>;
}

const DEFAULT_USER: EnterpriseUser = {
  user_id: 'usr_admin_01',
  name: 'Operations Administrator',
  email: 'admin@logistics.corp',
  role: 'corporate_admin',
  role_label: 'Facility Administrator',
  tenant_id: 'TENANT-MY-HUB',
  permissions: ['all', 'read:video', 'read:track', 'write:dock', 'write:eway_bill', 'write:scale', 'admin:mcp'],
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
  phone: '+91-98000-00000',
  department: 'Supply Chain Operations'
};

const DEFAULT_TENANT: TenantInfo = {
  tenant_id: 'TENANT-MY-HUB',
  name: 'My Logistics Godown Hub',
  organization: 'Apex Supply Chain Logistics',
  location: 'Bengaluru Logistics Corridor, Karnataka (IN)',
  country: 'India',
  currency: 'INR',
  currency_symbol: '₹',
  active_docks: 8,
  free_time_hours: 2.0,
  detention_rate_per_hour: 1200.0,
  cameras_online: 4,
  default_market: 'IN_GST',
  sla_target_turnaround_mins: 60
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<EnterpriseUser>(() => {
    try {
      const saved = localStorage.getItem('yardsight_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('yardsight_token') || null;
  });

  const isAuthenticated = !!token;
  const [tenant, setTenant] = useState<TenantInfo>(DEFAULT_TENANT);
  const [availableTenants, setAvailableTenants] = useState<TenantInfo[]>([DEFAULT_TENANT]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    refreshData();
  }, []);

  const login = async (email: string, role?: UserRole) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: role || 'corporate_admin' })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.access_token);
        localStorage.setItem('yardsight_token', data.access_token);
        localStorage.setItem('yardsight_user', JSON.stringify(data.user));
        setIsAuthModalOpen(false);
      } else {
        throw new Error('Login failed');
      }
    } catch {
      const fallbackUser: EnterpriseUser = {
        ...DEFAULT_USER,
        email: email || DEFAULT_USER.email,
        role: role || 'corporate_admin',
        role_label:
          role === 'yard_master'
            ? 'Hub Yard Master & Dispatcher'
            : role === 'security_guard'
            ? 'Security Gate Specialist'
            : 'Facility Administrator'
      };
      setUser(fallbackUser);
      const fallbackToken = 'token_' + Date.now();
      setToken(fallbackToken);
      localStorage.setItem('yardsight_token', fallbackToken);
      localStorage.setItem('yardsight_user', JSON.stringify(fallbackUser));
      setIsAuthModalOpen(false);
    }
  };

  const logout = () => {
    try {
      fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST' }).catch(() => {});
    } catch {}
    localStorage.removeItem('yardsight_token');
    localStorage.removeItem('yardsight_user');
    setUser(DEFAULT_USER);
    setToken(null);
  };

  const switchRole = async (role: UserRole) => {
    const updatedUser: EnterpriseUser = {
      ...user,
      role,
      role_label:
        role === 'yard_master'
          ? 'Hub Yard Master & Dispatcher'
          : role === 'security_guard'
          ? 'Security Gate Specialist'
          : 'Facility Administrator',
      permissions:
        role === 'corporate_admin'
          ? ['all', 'read:video', 'read:track', 'write:dock', 'write:eway_bill', 'write:scale', 'admin:mcp']
          : role === 'yard_master'
          ? ['read:video', 'read:track', 'write:dock', 'write:eway_bill']
          : ['read:video', 'write:dock']
    };
    setUser(updatedUser);
    localStorage.setItem('yardsight_user', JSON.stringify(updatedUser));
  };

  const switchTenant = async (tenantId: string) => {
    const found = availableTenants.find((t) => t.tenant_id === tenantId);
    if (found) {
      setTenant(found);
      const updatedUser = { ...user, tenant_id: tenantId };
      setUser(updatedUser);
      localStorage.setItem('yardsight_user', JSON.stringify(updatedUser));
    }
  };

  const purgeAllData = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/purge-data`, { method: 'POST' });
    } catch (e) {
      console.warn('Purge failed on backend', e);
    }
    localStorage.clear();
    setTenant(DEFAULT_TENANT);
    setUser(DEFAULT_USER);
    setToken(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('all')) return true;
    return user.permissions.includes(permission);
  };

  const updateProfile = async (
    name: string,
    email: string,
    phone?: string,
    department?: string
  ): Promise<{ success: boolean; message: string }> => {
    const updatedUser = { ...user, name, email, phone, department };
    setUser(updatedUser);
    localStorage.setItem('yardsight_user', JSON.stringify(updatedUser));
    return { success: true, message: 'Profile updated successfully' };
  };

  const updateTenantSettings = async (
    settings: Partial<TenantInfo>
  ): Promise<{ success: boolean; message: string }> => {
    const updatedTenant = { ...tenant, ...settings };
    setTenant(updatedTenant);
    setAvailableTenants((prev) =>
      prev.map((t) => (t.tenant_id === updatedTenant.tenant_id ? updatedTenant : t))
    );
    return { success: true, message: 'Facility settings saved' };
  };

  const createCustomFacility = async (facilityData: Partial<TenantInfo>): Promise<TenantInfo> => {
    const newFacility: TenantInfo = {
      ...DEFAULT_TENANT,
      tenant_id: 'FACILITY-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      ...facilityData
    };
    setAvailableTenants((prev) => [...prev, newFacility]);
    setTenant(newFacility);
    return newFacility;
  };

  const refreshData = async () => {
    try {
      const tenantsRes = await fetch(`${API_BASE_URL}/api/tenants`);
      if (tenantsRes.ok) {
        const tData = await tenantsRes.json();
        const tenantList = Array.isArray(tData)
          ? tData
          : (tData?.tenants && Array.isArray(tData.tenants) ? tData.tenants : []);
        if (tenantList.length > 0) {
          setAvailableTenants(tenantList);
          const current = tenantList.find((t: any) => (t.tenant_id || t.id) === user.tenant_id) || tenantList[0];
          setTenant(current);
        }
      }
    } catch {
      // Use defaults
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        tenant,
        availableTenants,
        isAuthModalOpen,
        setIsAuthModalOpen,
        switchRole,
        switchTenant,
        login,
        logout,
        purgeAllData,
        hasPermission,
        updateProfile,
        updateTenantSettings,
        createCustomFacility,
        refreshData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
