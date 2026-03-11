import React, { useState } from 'react';
import { LayoutDashboard, Briefcase, Users, BarChart3, Wrench, CheckCircle2, AlertTriangle, XCircle, Target, ChevronRight, Clock, Building } from 'lucide-react';
import './_group.css';

// --- Theme Constants ---
const theme = {
  bg: '#120e09',
  sidebarBg: '#0d0a07',
  cardBg: '#1e1812',
  cardBorder: '#332a1e',
  textCream: '#f0e8d8',
  textMuted: '#a89880',
  accent: '#c8901a',
  trackBg: '#2a2018',
};

// --- Mock Data ---
const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Projects', icon: Briefcase, active: false },
  { label: 'People', icon: Users, active: false },
  { label: 'Reports', icon: BarChart3, active: false },
  { label: 'Tools', icon: Wrench, active: false },
];

const KPIS = [
  { label: 'On Track', value: 8, icon: CheckCircle2 },
  { label: 'At Risk', value: 3, icon: AlertTriangle },
  { label: 'Blocked', value: 2, icon: XCircle },
  { label: 'Total Initiatives', value: 12, icon: Target },
];

const INITIATIVES = [
  { name: 'Product Launch', progress: 78 },
  { name: 'Brand Refresh', progress: 45 },
  { name: 'Digital Ops', progress: 91 },
  { name: 'Team Scale', progress: 23 },
];

const ACTION_ITEMS = [
  { task: 'Review Q2 budget variance', status: 'overdue' },
  { task: 'Approve new hire — Product', status: 'today' },
  { task: 'Sign off campaign brief', status: 'tomorrow' },
];

const DEPARTMENTS = [
  { name: 'Engineering', health: 82 },
  { name: 'Marketing', health: 64 },
  { name: 'Operations', health: 78 },
  { name: 'Finance', health: 71 },
];

// --- Components ---

function Sidebar() {
  return (
    <div
      className="w-[220px] flex-shrink-0 flex flex-col justify-between p-6 h-screen sticky top-0"
      style={{ backgroundColor: theme.sidebarBg, borderRight: `1px solid ${theme.cardBorder}` }}
    >
      <div>
        <div className="flex items-center gap-3 mb-12">
          <div
            className="w-8 h-8 rounded flex items-center justify-center font-black text-lg"
            style={{ backgroundColor: theme.accent, color: theme.bg }}
          >
            N
          </div>
          <span
            className="font-bold tracking-tight text-lg"
            style={{ color: theme.textCream, fontFamily: 'Inter' }}
          >
            Nexus Ops
          </span>
        </div>

        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 text-sm font-medium relative group"
                style={{
                  color: item.active ? theme.textCream : theme.textMuted,
                  opacity: item.active ? 1 : 0.7,
                }}
              >
                {item.active && (
                  <div
                    className="absolute left-0 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: theme.accent, boxShadow: `0 0 8px ${theme.accent}` }}
                  />
                )}
                <Icon size={18} style={{ color: item.active ? theme.accent : 'currentColor' }} />
                <span className="group-hover:text-[#f0e8d8] transition-colors">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="relative mt-8 group cursor-pointer">
        <div
          className="absolute inset-0 rounded-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 blur-2xl"
          style={{ background: `radial-gradient(circle, ${theme.accent} 0%, transparent 70%)` }}
        />
        <div
          className="relative p-5 rounded-2xl flex flex-col items-center gap-2 transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.cardBorder}`,
          }}
        >
          <div className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>
            Org Health
          </div>
          <div
            className="text-4xl font-black tracking-tighter"
            style={{ color: theme.accent, fontFamily: 'Inter', textShadow: `0 0 20px ${theme.accent}40` }}
          >
            72
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroStrip() {
  return (
    <div
      className="p-8 rounded-2xl flex justify-between items-center mb-8 relative overflow-hidden group"
      style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ boxShadow: `inset 0 0 60px ${theme.accent}0a` }}
      />
      
      <div className="relative z-10">
        <h1
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: theme.textCream, fontFamily: 'Inter' }}
        >
          Good morning, Martin.
        </h1>
        <p className="text-sm font-medium" style={{ color: theme.textMuted }}>
          Your command center is ready.
        </p>
      </div>

      <div className="relative z-10 flex items-center gap-6">
        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: theme.textMuted }}>
            System Status
          </div>
          <div className="text-sm flex items-center justify-end gap-2" style={{ color: theme.textCream }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent, boxShadow: `0 0 8px ${theme.accent}` }} />
            Optimal
          </div>
        </div>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center relative"
          style={{ border: `2px dashed ${theme.cardBorder}` }}
        >
          <div
            className="absolute inset-[-2px] rounded-full border-[2px] border-t-transparent border-l-transparent animate-[spin_4s_linear_infinite]"
            style={{ borderColor: `${theme.accent} transparent transparent transparent` }}
          />
          <span className="text-xl font-black" style={{ color: theme.accent }}>
            72
          </span>
        </div>
      </div>
    </div>
  );
}

function KpiGrid() {
  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      {KPIS.map((kpi) => (
        <div
          key={kpi.label}
          className="p-6 rounded-xl relative group transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          style={{
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.cardBorder}`,
            borderTop: `2px solid ${theme.accent}`,
            boxShadow: `0 8px 30px rgba(0,0,0,0.5)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none"
            style={{ boxShadow: `inset 0 0 40px ${theme.accent}0f` }}
          />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
              {kpi.label}
            </span>
            <kpi.icon size={18} style={{ color: theme.accent, opacity: 0.8 }} />
          </div>
          <div
            className="text-4xl font-black tracking-tight relative z-10"
            style={{ color: theme.textCream, fontFamily: 'Inter' }}
          >
            {kpi.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-2 w-full rounded-full overflow-hidden mt-2" style={{ backgroundColor: theme.trackBg }}>
      <div
        className="h-full rounded-full relative transition-all duration-1000 ease-out"
        style={{
          width: `${progress}%`,
          backgroundColor: theme.accent,
          boxShadow: `0 0 10px ${theme.accent}80`,
        }}
      />
    </div>
  );
}

export function DarkVelvet() {
  return (
    <div className="min-h-screen flex font-sans selection:bg-[#c8901a] selection:text-[#120e09]" style={{ backgroundColor: theme.bg }}>
      <Sidebar />
      
      <main className="flex-1 p-8 h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <HeroStrip />
          <KpiGrid />

          <div className="grid grid-cols-2 gap-8">
            {/* Left Column: Initiatives */}
            <div
              className="p-6 rounded-2xl relative group flex flex-col"
              style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl"
                style={{ boxShadow: `inset 0 0 60px ${theme.accent}05` }}
              />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-lg font-bold tracking-tight" style={{ color: theme.textCream, fontFamily: 'Inter' }}>
                  Active Initiatives
                </h2>
                <button
                  className="text-xs font-semibold uppercase tracking-wider hover:opacity-100 transition-opacity flex items-center gap-1"
                  style={{ color: theme.accent, opacity: 0.8 }}
                >
                  View All <ChevronRight size={14} />
                </button>
              </div>

              <div className="space-y-6 relative z-10 flex-1">
                {INITIATIVES.map((init) => (
                  <div key={init.name} className="group/item cursor-pointer">
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-medium group-hover/item:text-[#f0e8d8] transition-colors" style={{ color: theme.textCream }}>
                        {init.name}
                      </span>
                      <span className="text-sm font-bold" style={{ color: theme.accent }}>
                        {init.progress}%
                      </span>
                    </div>
                    <ProgressBar progress={init.progress} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Actions & Depts */}
            <div className="space-y-8">
              {/* Actions */}
              <div
                className="p-6 rounded-2xl relative group"
                style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl"
                  style={{ boxShadow: `inset 0 0 60px ${theme.accent}05` }}
                />
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10 tracking-tight" style={{ color: theme.textCream, fontFamily: 'Inter' }}>
                  <Clock size={18} style={{ color: theme.accent }} />
                  Action Required
                </h2>
                <div className="space-y-3 relative z-10">
                  {ACTION_ITEMS.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer group/action"
                      style={{ backgroundColor: `${theme.bg}80`, border: `1px solid ${theme.cardBorder}` }}
                    >
                      <div className="mt-0.5">
                        {item.status === 'overdue' ? (
                          <div className="w-5 h-5 rounded flex items-center justify-center bg-red-500/10 border border-red-500/20">
                            <AlertTriangle size={12} className="text-red-500" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 transition-colors group-hover/action:bg-[#c8901a]20" style={{ borderColor: theme.accent }} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1 group-hover/action:text-[#f0e8d8] transition-colors" style={{ color: theme.textCream }}>
                          {item.task}
                        </div>
                        <div
                          className="text-[10px] uppercase tracking-widest font-bold"
                          style={{
                            color: item.status === 'overdue' ? '#ef4444' : theme.textMuted,
                          }}
                        >
                          {item.status}
                        </div>
                      </div>
                      <ChevronRight size={16} className="opacity-0 group-hover/action:opacity-100 transition-opacity mt-2" style={{ color: theme.accent }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Departments */}
              <div
                className="p-6 rounded-2xl relative group"
                style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
              >
                 <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl"
                  style={{ boxShadow: `inset 0 0 60px ${theme.accent}05` }}
                />
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10 tracking-tight" style={{ color: theme.textCream, fontFamily: 'Inter' }}>
                  <Building size={18} style={{ color: theme.accent }} />
                  Department Health
                </h2>
                <div className="space-y-5 relative z-10">
                  {DEPARTMENTS.map((dept) => (
                    <div key={dept.name} className="group/dept cursor-pointer">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium group-hover/dept:text-[#f0e8d8] transition-colors" style={{ color: theme.textMuted }}>{dept.name}</span>
                        <span className="font-bold" style={{ color: theme.textCream }}>{dept.health}</span>
                      </div>
                      <ProgressBar progress={dept.health} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${theme.sidebarBg};
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme.cardBorder};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme.textMuted};
        }
      `}} />
    </div>
  );
}

export default DarkVelvet;
