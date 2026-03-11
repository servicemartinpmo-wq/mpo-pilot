import React, { useState } from 'react';
import { 
  LayoutDashboard, FolderKanban, Users, BarChart3, Wrench, 
  ChevronRight, Activity, CalendarDays, CheckCircle2, 
  Clock, AlertTriangle, ArrowRight 
} from 'lucide-react';
import './_group.css';

// --- Shared Constants ---
const COLORS = {
  bg: '#faf7f2',
  sidebar: '#2d4a3e',
  sidebarText: '#f5f0e6',
  brass: '#b08d57',
  textMain: '#1a1810',
  textBody: '#6b5d4e',
  cardBg: '#ffffff',
  trackLight: '#ede8e0',
  warmBrown: '#8b6f4e', // For percentages as requested "warm brown"
};

const DATA = {
  orgName: "Nexus Operations",
  user: "Martin",
  healthScore: 72,
  kpis: [
    { label: 'On Track', value: '8', icon: CheckCircle2 },
    { label: 'At Risk', value: '3', icon: Clock },
    { label: 'Blocked', value: '2', icon: AlertTriangle },
    { label: 'Total Initiatives', value: '12', icon: Activity },
  ],
  navItems: [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Projects', icon: FolderKanban },
    { name: 'People', icon: Users },
    { name: 'Reports', icon: BarChart3 },
    { name: 'Tools', icon: Wrench },
  ],
  initiatives: [
    { name: 'Product Launch', progress: 78, status: 'On Track' },
    { name: 'Brand Refresh', progress: 45, status: 'At Risk' },
    { name: 'Digital Ops', progress: 91, status: 'On Track' },
    { name: 'Team Scale', progress: 23, status: 'Blocked' },
  ],
  actionItems: [
    { title: 'Review Q2 budget variance', timing: 'Overdue' },
    { title: 'Approve new hire — Product', timing: 'Today' },
    { title: 'Sign off campaign brief', timing: 'Tomorrow' },
  ],
  departments: [
    { name: 'Engineering', health: 82 },
    { name: 'Marketing', health: 64 },
    { name: 'Operations', health: 78 },
    { name: 'Finance', health: 71 },
  ]
};

// --- Helper Components ---

const Sidebar = ({ activeNav, setActiveNav }: { activeNav: string, setActiveNav: (n: string) => void }) => (
  <aside 
    style={{ backgroundColor: COLORS.sidebar, color: COLORS.sidebarText, borderRight: `1px solid ${COLORS.brass}` }}
    className="w-[220px] flex-shrink-0 flex flex-col justify-between"
  >
    <div>
      <div className="p-8 pb-10">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 flex items-center justify-center font-bold text-lg rounded-sm" 
            style={{ backgroundColor: COLORS.brass, color: COLORS.sidebar }}
          >
            N
          </div>
          <span className="font-semibold tracking-wide text-sm uppercase" style={{ color: COLORS.brass }}>{DATA.orgName}</span>
        </div>
      </div>

      <nav className="flex flex-col gap-4 px-4">
        {DATA.navItems.map((item) => {
          const isActive = activeNav === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveNav(item.name)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-[15px] font-medium relative group"
              style={{
                backgroundColor: isActive ? 'rgba(245, 240, 230, 0.08)' : 'transparent',
                color: isActive ? COLORS.brass : COLORS.sidebarText,
                fontFamily: "'Inter', sans-serif"
              }}
            >
              {isActive && (
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1 rounded-r-md" 
                  style={{ backgroundColor: COLORS.brass }}
                />
              )}
              <item.icon className="w-[18px] h-[18px]" />
              {item.name}
            </button>
          );
        })}
      </nav>
    </div>

    <div className="p-6 m-4 rounded-xl relative overflow-hidden" style={{ border: `1px solid ${COLORS.brass}` }}>
      {/* Background tint */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundColor: COLORS.brass }}></div>
      <div className="relative">
        <div className="text-xs uppercase tracking-wider mb-2 opacity-80 font-medium">Org Health</div>
        <div className="flex items-baseline gap-1">
          <div className="text-4xl font-extrabold" style={{ color: COLORS.brass }}>{DATA.healthScore}</div>
          <div className="text-sm opacity-80">/ 100</div>
        </div>
        <div className="w-full h-1 mt-4 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(245, 240, 230, 0.1)' }}>
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${DATA.healthScore}%`, backgroundColor: COLORS.brass }} />
        </div>
      </div>
    </div>
  </aside>
);

const HeroStrip = () => (
  <header 
    className="px-10 py-12 flex-shrink-0 flex justify-between items-start"
    style={{ backgroundColor: COLORS.bg, borderBottom: `1px solid ${COLORS.brass}` }}
  >
    <div>
      <h1 className="text-[40px] leading-tight font-[800] tracking-tight mb-2" style={{ color: COLORS.textMain }}>
        Good morning, {DATA.user}.
      </h1>
      <p className="text-xl font-normal" style={{ color: COLORS.textBody }}>
        Your command center is ready.
      </p>
    </div>
    
    <div 
      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm"
      style={{ backgroundColor: COLORS.brass, color: COLORS.sidebarText }}
    >
      <CalendarDays className="w-4 h-4" />
      <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
    </div>
  </header>
);

const KpiCard = ({ kpi }: { kpi: typeof DATA.kpis[0] }) => (
  <div 
    className="rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative bg-white flex flex-col justify-between h-[140px]"
    style={{ 
      borderTop: `2px solid ${COLORS.brass}`,
    }}
  >
    <div className="flex justify-between items-start">
      <div className="text-sm font-[600] text-gray-500 uppercase tracking-wider" style={{ color: COLORS.textBody }}>
        {kpi.label}
      </div>
      <kpi.icon className="w-5 h-5 opacity-40" style={{ color: COLORS.textBody }} />
    </div>
    <div className="text-5xl font-[800]" style={{ color: COLORS.textMain }}>
      {kpi.value}
    </div>
  </div>
);

const InitiativeRow = ({ init }: { init: typeof DATA.initiatives[0] }) => {
  return (
    <div className="group">
      <div className="flex justify-between items-end mb-3">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-lg font-[600]" style={{ color: COLORS.textMain }}>{init.name}</h3>
          <div 
            className="text-xs font-semibold px-2.5 py-1 rounded-full w-fit" 
            style={{ 
              backgroundColor: COLORS.sidebar, 
              color: COLORS.sidebarText,
              opacity: init.status === 'On Track' ? 1 : 0.85
            }}
          >
            {init.status}
          </div>
        </div>
        <div className="text-lg font-[800]" style={{ color: COLORS.brass }}>
          {init.progress}%
        </div>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.trackLight }}>
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${init.progress}%`, backgroundColor: COLORS.brass }} 
        />
      </div>
    </div>
  );
};

const ActionItemCard = ({ action }: { action: typeof DATA.actionItems[0] }) => (
  <div 
    className="rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:-translate-y-0.5 transition-transform cursor-pointer bg-white"
    style={{ borderTop: `2px solid ${COLORS.brass}` }}
  >
    <div 
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ backgroundColor: COLORS.bg }}
    >
      <ArrowRight className="w-5 h-5" style={{ color: COLORS.brass }} />
    </div>
    <div className="flex flex-col gap-1">
      <div className="font-[600] text-base leading-snug" style={{ color: COLORS.textMain }}>{action.title}</div>
      <div 
        className="text-xs font-bold uppercase tracking-wider" 
        style={{ color: action.timing === 'Overdue' ? '#b91c1c' : COLORS.textBody }}
      >
        {action.timing}
      </div>
    </div>
  </div>
);

const DeptBar = ({ dept }: { dept: typeof DATA.departments[0] }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <span className="font-[600] text-[15px]" style={{ color: COLORS.textMain }}>{dept.name}</span>
      <span className="font-[600] text-sm" style={{ color: COLORS.warmBrown }}>{dept.health}%</span>
    </div>
    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.trackLight }}>
      <div 
        className="h-full rounded-full transition-all duration-1000" 
        style={{ width: `${dept.health}%`, backgroundColor: COLORS.brass }} 
      />
    </div>
  </div>
);

// --- Main Component ---

export function CreamBrass() {
  const [activeNav, setActiveNav] = useState('Dashboard');

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: COLORS.bg, fontFamily: "'Inter', sans-serif" }}>
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <HeroStrip />

        <div className="flex-1 overflow-auto p-10">
          <div className="max-w-[1400px] mx-auto">
            
            {/* KPI Row */}
            <div className="grid grid-cols-4 gap-6 mb-10">
              {DATA.kpis.map((kpi, idx) => (
                <KpiCard key={idx} kpi={kpi} />
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* Left Col: Initiatives */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-[800]" style={{ color: COLORS.textMain }}>Active Initiatives</h2>
                  <button className="text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: COLORS.brass }}>
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div 
                  className="rounded-2xl p-8 shadow-sm bg-white"
                  style={{ borderTop: `2px solid ${COLORS.brass}` }}
                >
                  <div className="flex flex-col gap-8">
                    {DATA.initiatives.map((init, idx) => (
                      <InitiativeRow key={idx} init={init} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Col: Actions & Depts */}
              <div className="flex flex-col gap-10">
                
                {/* Action Items */}
                <div className="flex flex-col gap-6">
                  <h2 className="text-2xl font-[800]" style={{ color: COLORS.textMain }}>Required Actions</h2>
                  <div className="flex flex-col gap-4">
                    {DATA.actionItems.map((action, idx) => (
                      <ActionItemCard key={idx} action={action} />
                    ))}
                  </div>
                </div>

                {/* Department Health */}
                <div className="flex flex-col gap-6">
                  <h2 className="text-2xl font-[800]" style={{ color: COLORS.textMain }}>Department Health</h2>
                  <div 
                    className="rounded-2xl p-8 shadow-sm bg-white"
                    style={{ borderTop: `2px solid ${COLORS.brass}` }}
                  >
                    <div className="flex flex-col gap-7">
                      {DATA.departments.map((dept, idx) => (
                        <DeptBar key={idx} dept={dept} />
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
