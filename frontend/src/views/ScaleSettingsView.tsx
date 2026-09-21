import React, { useState } from 'react';
import {
  Settings,
  User,
  Building2,
  Bell,
  Shield,
  Link2,
  ChevronRight,
  Check,
  Globe,
  Clock,
  Palette,
  Key,
  FileText,
  Camera,
  Truck,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ScaleSettingsView: React.FC = () => {
  const { user, tenant } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('account');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  const SECTIONS = [
    { id: 'account', label: 'Account & Profile', icon: User, description: 'Personal details, avatar, and credentials' },
    { id: 'facility', label: 'Facility Configuration', icon: Building2, description: 'Docks, cameras, SLA thresholds' },
    { id: 'notifications', label: 'Notification Preferences', icon: Bell, description: 'Alerts, channels, and escalation' },
    { id: 'compliance', label: 'Compliance & Audit Log', icon: Shield, description: 'Activity history and export' },
    { id: 'integrations', label: 'API & Integrations', icon: Link2, description: 'External services and webhooks' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 rounded-lg bg-slate-800/60 px-2.5 py-1 text-[11px] font-semibold text-slate-300 border border-slate-700/50">
              <Settings className="h-3 w-3 text-slate-400" />
              Platform Settings
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Settings & Preferences
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your account, facility configuration, notification preferences, and integrations.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="group inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-300 shadow-lg"
          style={{
            background: saved
              ? 'linear-gradient(135deg, hsl(158,64%,48%), hsl(165,75%,40%))'
              : 'linear-gradient(135deg, hsl(199,89%,48%), hsl(217,91%,60%))',
            color: '#fff',
            boxShadow: saved
              ? '0 4px 20px hsla(158,64%,52%,0.3)'
              : '0 4px 20px hsla(199,89%,48%,0.25)'
          }}
        >
          {saved ? <Check className="h-4 w-4" /> : <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />}
          <span>{saved ? 'Changes Saved' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Two-Column Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-1.5">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/5 border border-cyan-500/25 shadow-sm'
                    : 'hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {section.label}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{section.description}</div>
                </div>
                <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-all ${
                  isActive ? 'text-cyan-400 translate-x-0' : 'text-slate-600 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                }`} />
              </button>
            );
          })}
        </div>

        {/* Right: Content Panel */}
        <div className="lg:col-span-9">
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800/60 p-6 shadow-lg backdrop-blur-sm min-h-[460px]">

            {/* ACCOUNT SECTION */}
            {activeSection === 'account' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <SectionHeader icon={User} title="Account & Profile" subtitle="Manage your personal information and security credentials" />

                {/* Profile Card */}
                <div className="rounded-xl bg-slate-950/50 border border-slate-800/50 p-5">
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-16 w-16 rounded-xl object-cover border-2 border-slate-700 shadow-md group-hover:border-cyan-500/40 transition-colors"
                      />
                      <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Camera className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-white">{user.name}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                          <Shield className="h-2.5 w-2.5" />
                          {user.role_label}
                        </span>
                        <span className="text-[10px] text-slate-500">Member since Aug 2024</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SettingsField label="Full Name" value={user.name} />
                  <SettingsField label="Email Address" value={user.email} />
                  <SettingsField label="Phone Number" value="+91-98765-43210" />
                  <SettingsField label="Department" value="Logistics Operations" />
                </div>

                {/* Security */}
                <div className="pt-4 border-t border-slate-800/50">
                  <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    Security & Authentication
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-slate-950/40 border border-slate-800/50 p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Password</div>
                        <div className="text-[10px] text-slate-400">Last changed 14 days ago</div>
                      </div>
                      <button className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors">Change</button>
                    </div>
                    <div className="rounded-xl bg-slate-950/40 border border-slate-800/50 p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Two-Factor Auth</div>
                        <div className="text-[10px] text-emerald-400 font-semibold">Enabled (Authenticator App)</div>
                      </div>
                      <button className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors">Manage</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FACILITY SECTION */}
            {activeSection === 'facility' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <SectionHeader icon={Building2} title="Facility Configuration" subtitle={`Configure docks, cameras, and SLA rules for ${tenant.name}`} />

                {/* Facility Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MetricCard label="Active Docks" value={String(tenant.active_docks)} icon={Truck} color="cyan" />
                  <MetricCard label="Cameras Online" value={String(tenant.cameras_online)} icon={Camera} color="emerald" />
                  <MetricCard label="Free Time (hrs)" value={String(tenant.free_time_hours)} icon={Clock} color="amber" />
                  <MetricCard label="SLA Target (min)" value={String(tenant.sla_target_turnaround_mins)} icon={Clock} color="indigo" />
                </div>

                {/* Configuration Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SettingsField label="Facility Name" value={tenant.name} />
                  <SettingsField label="Location" value={tenant.location} />
                  <SettingsField label="Organization" value={tenant.organization} />
                  <SettingsField label="Default Market" value={tenant.default_market === 'IN_GST' ? 'India (GST)' : 'US Freight'} />
                  <SettingsField label="Detention Rate" value={`${tenant.currency_symbol}${tenant.detention_rate_per_hour}/hr`} />
                  <SettingsField label="Currency" value={`${tenant.currency} (${tenant.currency_symbol})`} />
                </div>

                {/* Dock Bay Configuration */}
                <div className="pt-4 border-t border-slate-800/50">
                  <h4 className="text-xs font-bold text-slate-300 mb-3">Dock Bay Assignments</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Array.from({ length: tenant.active_docks }, (_, i) => (
                      <div key={i} className="rounded-lg bg-slate-950/40 border border-slate-800/50 p-3 text-center group hover:border-cyan-500/30 transition-colors cursor-pointer">
                        <div className="text-xs font-bold text-white">Bay {String(i + 1).padStart(2, '0')}</div>
                        <div className={`text-[10px] font-semibold mt-0.5 ${i < 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {i < 3 ? '● Occupied' : '○ Available'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS SECTION */}
            {activeSection === 'notifications' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <SectionHeader icon={Bell} title="Notification Preferences" subtitle="Configure when and how you receive alerts" />

                <div className="space-y-3">
                  <NotifToggle label="Detention Alerts" description="When a truck exceeds free time at any dock bay" defaultOn={true} />
                  <NotifToggle label="Gate ANPR Events" description="License plate scan results and barrier actuations" defaultOn={true} />
                  <NotifToggle label="Roof Leak Warnings" description="Specular anomaly detection from warehouse cameras" defaultOn={true} />
                  <NotifToggle label="E-Way Bill Expiry" description="Documents expiring within 24 hours" defaultOn={false} />
                  <NotifToggle label="Daily Summary Report" description="Morning digest of overnight yard activity" defaultOn={true} />
                  <NotifToggle label="System Maintenance" description="Scheduled downtimes and firmware updates" defaultOn={false} />
                </div>

                {/* Channels */}
                <div className="pt-4 border-t border-slate-800/50">
                  <h4 className="text-xs font-bold text-slate-300 mb-3">Delivery Channels</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <ChannelCard name="Email" status="Active" detail={user.email} />
                    <ChannelCard name="WhatsApp" status="Active" detail="+91 98765-43210" />
                    <ChannelCard name="Slack Webhook" status="Not configured" detail="Connect workspace →" />
                  </div>
                </div>
              </div>
            )}

            {/* COMPLIANCE SECTION */}
            {activeSection === 'compliance' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <SectionHeader icon={Shield} title="Compliance & Audit Log" subtitle="Activity history, access logs, and data export" />

                {/* Audit Log Table */}
                <div className="rounded-xl bg-slate-950/40 border border-slate-800/50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Recent Activity</span>
                    <button className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Export CSV
                    </button>
                  </div>
                  <div className="divide-y divide-slate-800/40">
                    <AuditRow time="10:42 AM" action="Gate ANPR Cleared" user={user.name} detail="Truck MH-12-RN-4819 verified" badge="SUCCESS" />
                    <AuditRow time="10:35 AM" action="Detention Alert Triggered" user="System" detail="TRK-9041 exceeded 120min SLA" badge="WARNING" />
                    <AuditRow time="10:20 AM" action="Leak Detection Alert" user="Physical AI" detail="Bay C-4 specular anomaly (4.8 m²)" badge="ALERT" />
                    <AuditRow time="10:05 AM" action="E-Way Bill Generated" user={user.name} detail="GSTIN-SIG-8F91A0C2 signed" badge="SUCCESS" />
                    <AuditRow time="09:48 AM" action="Role Switched" user={user.name} detail="corporate_admin → yard_master" badge="AUTH" />
                    <AuditRow time="09:30 AM" action="Tenant Switched" user={user.name} detail={`→ ${tenant.name}`} badge="AUTH" />
                  </div>
                </div>
              </div>
            )}

            {/* INTEGRATIONS SECTION */}
            {activeSection === 'integrations' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <SectionHeader icon={Link2} title="API & Integrations" subtitle="Connect external services and manage API access" />

                {/* API Key */}
                <div className="rounded-xl bg-slate-950/40 border border-slate-800/50 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">API Access Key</span>
                    </div>
                    <button className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors">Regenerate</button>
                  </div>
                  <div className="rounded-lg bg-slate-950 border border-slate-800/50 p-3 font-mono text-xs text-emerald-400 tracking-wider select-all">
                    ys_live_••••••••••••••••••••4f8a
                  </div>
                  <p className="mt-2 text-[10px] text-slate-500">Use this key to authenticate REST API requests. Never share publicly.</p>
                </div>

                {/* Integration Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <IntegrationCard name="Amazon Alexa+ MCP" status="Connected" description="Model Context Protocol for voice-activated yard queries" />
                  <IntegrationCard name="GST E-Way Portal" status="Connected" description="NIC E-Way Bill System (Government of India)" />
                  <IntegrationCard name="WhatsApp Business" status="Connected" description="Driver dispatch and gate clearance alerts" />
                  <IntegrationCard name="SAP EWM" status="Available" description="Warehouse management data sync" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Sub-Components ───────────────────────────────────────────────── */

const SectionHeader: React.FC<{ icon: React.ElementType; title: string; subtitle: string }> = ({ icon: Icon, title, subtitle }) => (
  <div className="pb-4 border-b border-slate-800/50">
    <h3 className="text-base font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
      <Icon className="h-5 w-5 text-cyan-400" />
      {title}
    </h3>
    <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
  </div>
);

const SettingsField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">{label}</label>
    <input
      type="text"
      defaultValue={value}
      className="w-full rounded-lg bg-slate-950/60 border border-slate-800/50 px-3 py-2.5 text-xs font-medium text-white placeholder-slate-500 outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
    />
  </div>
);

const MetricCard: React.FC<{ label: string; value: string; icon: React.ElementType; color: string }> = ({ label, value, icon: Icon, color }) => {
  const colorMap: Record<string, { text: string; bg: string; border: string }> = {
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  };
  const c = colorMap[color] || colorMap.cyan;
  return (
    <div className={`rounded-xl ${c.bg} border ${c.border} p-4 text-center`}>
      <Icon className={`h-4 w-4 mx-auto ${c.text} mb-1.5`} />
      <div className={`text-lg font-extrabold ${c.text}`}>{value}</div>
      <div className="text-[10px] font-semibold text-slate-400 mt-0.5">{label}</div>
    </div>
  );
};

const NotifToggle: React.FC<{ label: string; description: string; defaultOn: boolean }> = ({ label, description, defaultOn }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-950/40 border border-slate-800/50 px-4 py-3.5 hover:border-slate-700/60 transition-colors">
      <div>
        <div className="text-xs font-bold text-white">{label}</div>
        <div className="text-[10px] text-slate-400 mt-0.5">{description}</div>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative h-6 w-11 rounded-full transition-all duration-300 ${on ? 'bg-cyan-500 shadow-sm shadow-cyan-500/30' : 'bg-slate-700'}`}
      >
        <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
};

const ChannelCard: React.FC<{ name: string; status: string; detail: string }> = ({ name, status, detail }) => {
  const isActive = status === 'Active';
  return (
    <div className="rounded-xl bg-slate-950/40 border border-slate-800/50 p-4 hover:border-slate-700/60 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-white">{name}</span>
        <span className={`text-[10px] font-bold ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
          {isActive ? '● Active' : '○ Inactive'}
        </span>
      </div>
      <div className="text-[11px] text-slate-400">{detail}</div>
    </div>
  );
};

const AuditRow: React.FC<{ time: string; action: string; user: string; detail: string; badge: string }> = ({ time, action, user: userName, detail, badge }) => {
  const badgeColors: Record<string, string> = {
    SUCCESS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    WARNING: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    ALERT: 'bg-red-500/10 text-red-400 border-red-500/25',
    AUTH: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
  };
  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-slate-900/40 transition-colors">
      <span className="text-[10px] font-mono text-slate-500 w-16 shrink-0">{time}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-white truncate">{action}</div>
        <div className="text-[10px] text-slate-400 truncate">{detail} • by {userName}</div>
      </div>
      <span className={`shrink-0 rounded-md px-2 py-0.5 text-[9px] font-bold border ${badgeColors[badge] || badgeColors.SUCCESS}`}>
        {badge}
      </span>
    </div>
  );
};

const IntegrationCard: React.FC<{ name: string; status: string; description: string }> = ({ name, status, description }) => {
  const isConnected = status === 'Connected';
  return (
    <div className="rounded-xl bg-slate-950/40 border border-slate-800/50 p-4 hover:border-slate-700/60 transition-all group cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-bold text-white">{name}</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
          isConnected
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
            : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          {status}
        </span>
      </div>
      <div className="text-[11px] text-slate-400">{description}</div>
      {!isConnected && (
        <button className="mt-2 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
          Connect →
        </button>
      )}
    </div>
  );
};
